import os
import base64
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, jsonify, session, flash
from bson.objectid import ObjectId
from google.oauth2 import id_token
from google.auth.transport import requests
from euriai import EuriaiClient
from PIL import Image
from pymongo import MongoClient
from logger import get_logger

# Initialize logger
logger = get_logger(__name__)

# Local imports
from utils import (
    load_tflite_model, 
    predict, 
    save_uploaded_file, 
    generate_remedies,
    validate_email, 
    validate_password, 
    validate_phone,
    hash_password
)

# Initialize Euriai Client
try:
    euriai_client = EuriaiClient(
        api_key=os.getenv("EURIAI_API_KEY"), 
        model="gpt-4.1-nano"
    )
    logger.info("Euriai client initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Euriai client: {str(e)}", exc_info=True)
    raise

# Load the TFLite model
try:
    interpreter = load_tflite_model('saved_models/Disease_Classifier.tflite')
    logger.info("TFLite model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load TFLite model: {str(e)}", exc_info=True)
    raise

# Flask application setup
app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "your_fallback_secret")
logger.info("Flask application initialized")

# File upload configuration
UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
logger.info(f"Upload folder configured at: {UPLOAD_FOLDER}")

# MongoDB configuration
try:
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        raise ValueError("MONGO_URI is not set in the .env file")
    
    client = MongoClient(mongo_uri)
    db = client["PlantLeafDiseaseDB"]
    users_collection = db["users"]
    feedback_collection = db["feedback"]
    logger.info("MongoDB connection established successfully")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {str(e)}", exc_info=True)
    raise

# =============================================================================
# Main Application Routes
# =============================================================================

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    """Handle file upload and disease prediction."""
    try:
        if request.method == 'POST':
            logger.info("Received file upload request")
            file = request.files.get('file')

            if not file:
                logger.warning("No file part in the request")
                flash("❌ No file selected. Please try again.", "error")
                return redirect(url_for('upload_file'))

            # Save uploaded file using utility function
            filepath = save_uploaded_file(file, app.config['UPLOAD_FOLDER'])
            if not filepath:
                logger.error("Failed to save uploaded file")
                flash("❌ Invalid file. Please try again.", "error")
                return redirect(url_for('upload_file'))

            logger.info(f"File saved successfully at: {filepath}")

            # Process image
            try:
                img = Image.open(filepath).convert("RGB")
                predicted_class, confidence = predict(interpreter, img)
                logger.info(f"Prediction completed - Class: {predicted_class}, Confidence: {confidence}%")
            except Exception as e:
                logger.error(f"Image processing failed: {str(e)}", exc_info=True)
                flash("❌ Error processing your image. Please try again.", "error")
                return redirect(url_for('upload_file'))

            # Get remedies
            remedies = generate_remedies(predicted_class)
            if not remedies:
                logger.info("No predefined remedies found, querying Euriai")
                try:
                    euriai_prompt = (
                        f"Detected plant disease: '{predicted_class}'. "
                        f"Write a complete, friendly guide in markdown style (with emojis) explaining:\n"
                        f"1. What the disease is 🦠\n"
                        f"2. How to cure it 💊\n"
                        f"3. Prevention methods 🛡️\n"
                        f"4. Ayurvedic or natural remedies 🌿\n"
                        f"Use structured points, be simple and encouraging. "
                        f"Conclude the guide with a short positive message and 'End of guide.'"
                    )

                    euriai_response = euriai_client.generate_completion(
                        prompt=euriai_prompt,
                        temperature=0.7,
                        max_tokens=700
                    )
                    remedies = euriai_response['choices'][0]['message']['content']
                    logger.debug("Successfully generated remedies from Euriai")
                except Exception as e:
                    logger.error(f"Failed to generate remedies from Euriai: {str(e)}", exc_info=True)
                    remedies = "Could not generate remedies at this time. Please try again later."

            # Store session data
            session['filename'] = os.path.basename(filepath)
            session['class_name'] = predicted_class
            session['confidence'] = confidence
            session['remedies'] = remedies
            logger.debug("Session data stored successfully")

            return redirect(url_for('result'))

        logger.debug("Rendering upload page")
        return render_template('index.html')

    except Exception as e:
        logger.error(f"Unexpected error in upload_file route: {str(e)}", exc_info=True)
        flash("❌ An unexpected error occurred. Please try again.", "error")
        return redirect(url_for('upload_file'))

@app.route('/result')
def result():
    """Render the result page with prediction details."""
    try:
        logger.info("Accessing result page")
        filename = session.get('filename')
        class_name = session.get('class_name')
        confidence = session.get('confidence')
        remedies = session.get('remedies')

        if not all([filename, class_name, confidence]):
            logger.warning("Incomplete session data for result page")
            flash("No prediction data found. Please upload an image first.", "warning")
            return redirect(url_for('upload_file'))

        img_path = url_for('static', filename=f'uploads/{filename}')
        logger.debug(f"Image path: {img_path}")

        return render_template(
            'result.html',
            img_path=img_path,
            class_name=class_name,
            confidence=confidence,
            remedies=remedies
        )
    except Exception as e:
        logger.error(f"Error rendering result page: {str(e)}", exc_info=True)
        flash("An error occurred while loading results.", "error")
        return redirect(url_for('upload_file'))

# =============================================================================
# Authentication Routes
# =============================================================================

@app.route('/google-login', methods=['POST'])
def google_login():
    """Handle Google Sign-In token verification."""
    try:
        logger.info("Google login attempt")
        token = request.json.get('token')
        if not token:
            logger.warning("Missing Google token")
            return jsonify({"status": "error", "message": "Token is missing"}), 400

        # Verify the token with Google's API
        CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)

        # Check token validity
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            logger.warning("Invalid token issuer")
            return jsonify({"status": "error", "message": "Invalid token issuer"}), 401

        # Extract user information
        user_email = idinfo.get('email')
        user_name = idinfo.get('name')
        google_id = idinfo.get('sub')
        logger.debug(f"Google user info - Email: {user_email}, Name: {user_name}")

        # Check if user exists
        user = users_collection.find_one({"$or": [{"email": user_email}, {"google_id": google_id}]})
        
        if not user:
            # Register new user
            user_data = {
                "firstname": user_name.split()[0] if user_name else "",
                "lastname": " ".join(user_name.split()[1:]) if user_name else "",
                "email": user_email,
                "google_id": google_id,
                "verified": True,
                "created_at": datetime.utcnow()
            }
            users_collection.insert_one(user_data)
            logger.info(f"New user registered via Google: {user_email}")
            message = "Account created and logged in successfully!"
        else:
            if user.get("google_id") != google_id:
                logger.warning(f"Email {user_email} already registered with different method")
                return jsonify({"status": "error", "message": "This email is already registered with a different method"}), 400
            logger.info(f"User logged in via Google: {user_email}")
            message = "Logged in successfully!"

        # Set session
        session['user'] = {
            "email": user_email,
            "name": user_name,
            "google_id": google_id
        }
        logger.debug("Session set for Google user")
        
        return jsonify({"status": "success", "message": message})

    except ValueError as e:
        logger.error(f"Google token verification failed: {str(e)}", exc_info=True)
        return jsonify({"status": "error", "message": "Invalid token"}), 400
    except Exception as e:
        logger.error(f"Google login error: {str(e)}", exc_info=True)
        return jsonify({"status": "error", "message": "Internal Server Error"}), 500

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Handle user login."""
    try:
        if request.method == 'POST':
            logger.info("Login attempt")
            if request.content_type != 'application/json':
                logger.warning("Invalid content type for login")
                return jsonify({"status": "error", "message": "Content-Type must be application/json"}), 415

            data = request.json
            username = data.get("username")
            password = data.get("password")
            logger.debug(f"Login attempt for username: {username}")

            # Hash the password before checking
            hashed_password = hash_password(password)
            user = users_collection.find_one({"username": username, "password": hashed_password})
            
            if user:
                session['user'] = username
                logger.info(f"User logged in successfully: {username}")
                return jsonify({"status": "success", "message": "Login successful!"})
            
            logger.warning(f"Failed login attempt for username: {username}")
            return jsonify({"status": "error", "message": "Invalid username or password."}), 401

        # GET request handling
        google_client_id = os.getenv("GOOGLE_CLIENT_ID")
        is_register = request.args.get('register') or '#register' in request.referrer if request.referrer else False
        logger.debug("Rendering login page")
        return render_template("login.html", 
                            google_client_id=google_client_id,
                            is_register=is_register)

    except Exception as e:
        logger.error(f"Login route error: {str(e)}", exc_info=True)
        return jsonify({"status": "error", "message": "Internal Server Error"}), 500

@app.route('/register', methods=['POST'])
def register():
    """Handle user registration."""
    try:
        logger.info("Registration attempt")
        if not request.is_json:
            logger.warning("Invalid content type for registration")
            return jsonify({"status": "error", "message": "Content-Type must be application/json"}), 415

        data = request.get_json()
        firstname = data.get("firstname", "").strip()
        lastname = data.get("lastname", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "").strip()
        confirmpassword = data.get("confirmpassword", "").strip()
        mobileno = data.get("mobileno", "").strip()
        logger.debug(f"Registration attempt for email: {email}")

        # Validation
        if not all([firstname, email, password, confirmpassword, mobileno]):
            logger.warning("Missing required fields in registration")
            return jsonify({"status": "error", "message": "All fields are required."}), 400

        if len(firstname) < 2:
            logger.warning("First name too short")
            return jsonify({"status": "error", "message": "First name must be at least 2 characters long."}), 400

        if not validate_email(email):
            logger.warning(f"Invalid email format: {email}")
            return jsonify({"status": "error", "message": "Invalid email format."}), 400

        if not validate_password(password):
            logger.warning("Weak password provided")
            return jsonify({
                "status": "error", 
                "message": "Password must be at least 8 characters long and contain both letters and numbers."
            }), 400

        if password != confirmpassword:
            logger.warning("Password mismatch in registration")
            return jsonify({"status": "error", "message": "Passwords do not match."}), 400

        if not validate_phone(mobileno):
            logger.warning(f"Invalid phone number: {mobileno}")
            return jsonify({"status": "error", "message": "Invalid mobile number (10-15 digits required)."}), 400

        # Check existing user
        if users_collection.find_one({"email": email}):
            logger.warning(f"Email already registered: {email}")
            return jsonify({"status": "error", "message": "Email already registered."}), 400

        # Create new user
        users_collection.insert_one({
            "firstname": firstname,
            "lastname": lastname,
            "email": email,
            "password": hash_password(password),
            "mobileno": mobileno,
            "verified": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        logger.info(f"New user registered: {email}")

        return jsonify({
            "status": "success", 
            "message": "Registration successful! You can now login."
        })

    except Exception as e:
        logger.error(f"Registration error: {str(e)}", exc_info=True)
        return jsonify({"status": "error", "message": "Internal Server Error"}), 500

@app.route('/logout')
def logout():
    """Clear user session."""
    try:
        username = session.get('user', {}).get('email') or session.get('user')
        session.pop('user', None)
        logger.info(f"User logged out: {username}")
        return redirect(url_for('upload_file'))
    except Exception as e:
        logger.error(f"Logout error: {str(e)}", exc_info=True)
        return redirect(url_for('upload_file'))

@app.route('/check-session')
def check_session():
    """Check if user has an active session."""
    try:
        is_logged_in = 'user' in session
        logger.debug(f"Session check - Logged in: {is_logged_in}")
        return jsonify({'logged_in': is_logged_in})
    except Exception as e:
        logger.error(f"Session check error: {str(e)}", exc_info=True)
        return jsonify({'logged_in': False})

# =============================================================================
# Feedback and Contact Routes
# =============================================================================

@app.route('/submit-feedback', methods=['POST'])
def submit_feedback():
    """Handle feedback submission."""
    try:
        logger.info("Feedback submission received")
        data = request.json
        
        feedback_data = {
            "feedback": data.get('feedback', ''),
            "rating": data.get('rating', None),
            "pageUrl": data.get('pageUrl', ''),
            "timestamp": datetime.utcnow(),
            "user_agent": request.headers.get('User-Agent', ''),
            "ip_address": request.remote_addr
        }
        
        feedback_collection.insert_one(feedback_data)
        logger.info("Feedback saved successfully")
        
        return jsonify({
            'status': 'success',
            'message': 'Feedback submitted successfully'
        })
        
    except Exception as e:
        logger.error(f"Feedback submission error: {str(e)}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': 'Failed to submit feedback'
        }), 500

@app.route('/submit-contact', methods=['POST'])
def submit_contact():
    """Handle contact form submission."""
    try:
        logger.info("Contact form submission received")
        contact_data = {
            "name": request.form.get('name').strip(),
            "phone": request.form.get('phone').strip(),
            "email": request.form.get('email').strip().lower(),
            "subject": request.form.get('subject', 'No Subject').strip(),
            "message": request.form.get('message').strip(),
            "status": "unread",
            "created_at": datetime.utcnow(),
            "ip_address": request.remote_addr
        }
        logger.debug(f"Contact data: {contact_data}")
        
        result = db.contacts.insert_one(contact_data)
        
        if result.inserted_id:
            logger.info("Contact form saved successfully")
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({
                    "status": "success",
                    "message": "Your message has been sent successfully!"
                })
            flash('Your message has been sent successfully!', 'success')
            return redirect('/contactUs')
        
        logger.error("Failed to save contact form")
        return jsonify({
            "status": "error",
            "message": "Failed to save your message"
        }), 400

    except Exception as e:
        logger.error(f"Contact submission error: {str(e)}", exc_info=True)
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({
                "status": "error",
                "message": "An error occurred while submitting your form"
            }), 500
        flash('An error occurred while submitting your form', 'error')
        return redirect('/contactUs')

# =============================================================================
# Chatbot Route
# =============================================================================

@app.route('/ask-plantguard', methods=['POST'])
def ask_plantguard():
    """Handle chatbot queries."""
    try:
        data = request.json
        question = data.get('question', '')
        logger.info(f"PlantGuard question received: {question}")
        
        enhanced_prompt = f"""
        You are PlantGuard, an AI assistant for a plant disease detection system. 
        Here are key details about the system:
        - Model: MobileNetV2
        - Dataset: PlantVillage (61,486 images)
        - Accuracy: 99.39%
        - Training time: 2.5 hours
        
        User question: "{question}"
        
        Provide a helpful, concise answer in markdown format. Focus on:
        - Explaining plant disease detection
        - How to use the system
        - Technical details when asked
        - Being friendly and professional
        
        If question is unrelated, politely guide back to plant topics.
        Keep responses under 5 sentences when possible.
        Use **bold** for emphasis and *italic* for special notes.
        """
        
        euriai_response = euriai_client.generate_completion(
            prompt=enhanced_prompt,
            temperature=0.7,
            max_tokens=300
        )
        
        answer = euriai_response['choices'][0]['message']['content']
        logger.debug(f"PlantGuard response: {answer}")
        
        return jsonify({
            'status': 'success',
            'answer': answer
        })
        
    except Exception as e:
        logger.error(f"PlantGuard error: {str(e)}", exc_info=True)
        return jsonify({
            'status': 'error',
            'answer': "I'm having trouble processing your request. Please try again later."
        }), 500

# =============================================================================
# Static Page Routes
# =============================================================================

@app.route('/contactUs')
def contact_us():
    """Render the Contact Us page."""
    logger.debug("Rendering contact us page")
    return render_template('/contactUs.html')

@app.route("/research_paper")
def research_paper():
    """Render the Research Paper page."""
    logger.debug("Rendering research paper page")
    return render_template("research_paper.html")

@app.route('/aboutUs')
def about_us():
    """Render the About Us page."""
    logger.debug("Rendering about us page")
    return render_template('aboutus.html')

@app.route('/faq')
def faq():
    """Render the FAQ page."""
    logger.debug("Rendering FAQ page")
    return render_template('faq.html')

@app.route('/privacy-policy')
def privacy_policy():
    """Render the Privacy Policy page."""
    logger.debug("Rendering privacy policy page")
    return render_template('privacy-policy.html')

@app.route('/terms')
def terms():
    """Render the Terms and Conditions page."""
    logger.debug("Rendering terms page")
    return render_template('terms.html')

@app.route('/disease_info')
def disease_info():
    """Render the Disease Info page."""
    logger.debug("Rendering disease info page")
    return render_template('disease_info.html')

# =============================================================================
# Main Application Entry
# =============================================================================

if __name__ == '__main__':
    try:
        logger.info("Starting Flask application")
        app.run(debug=True)
    except Exception as e:
        logger.critical(f"Failed to start application: {str(e)}", exc_info=True)
        raise