import os
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
import base64
from flask import Flask, render_template, request, redirect, url_for, jsonify, session, flash
import re
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv
from google.oauth2 import id_token
from google.auth.transport import requests
from utils import load_tflite_model, predict
from euriai import EuriaiClient
from werkzeug.utils import secure_filename
from bson.objectid import ObjectId
import hashlib

# Initialize Euriai Client
euriai_client = EuriaiClient(
    api_key=os.getenv("EURIAI_API_KEY"), 
    model="gpt-4.1-nano"
)

# Load the TFLite model
interpreter = load_tflite_model('saved_models/Disease_Classifier.tflite')

# Load environment variables
load_dotenv()

# MongoDB configuration
mongo_uri = os.getenv("MONGO_URI")  # Fetch the MongoDB URI from the .env file
if not mongo_uri:
    raise ValueError("MONGO_URI is not set in the .env file")

client = MongoClient(mongo_uri)  # Use the MongoDB URI from the environment variable
db = client["PlantLeafDiseaseDB"]
users_collection = db["users"]  # Collection for user data

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "your_fallback_secret")  # Secret key for Flask sessions
    
# Directory to save uploaded images temporarily
UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/submit-contact', methods=['POST'])
def submit_contact():
    try:
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
        
        # Insert into MongoDB
        result = db.contacts.insert_one(contact_data)
        
        if result.inserted_id:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({
                    "status": "success",
                    "message": "Your message has been sent successfully!"
                })
            flash('Your message has been sent successfully!', 'success')
            return redirect('/contactUs')
        else:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({
                    "status": "error",
                    "message": "Failed to save your message"
                }), 400
            flash('Failed to save your message', 'error')
            return redirect('/contactUs')

    except Exception as e:
        print(f"Contact submission failed: {str(e)}")
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({
                "status": "error",
                "message": "An error occurred while submitting your form"
            }), 500
        flash('An error occurred while submitting your form', 'error')
        return redirect('/contactUs')

    except Exception as e:
        print(f"Contact submission failed: {str(e)}")
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({
                "status": "error",
                "message": "An error occurred while submitting your form"
            }), 500
        flash('An error occurred while submitting your form', 'error')
        return redirect('/contactUs')

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        file = request.files.get('file')

        if not file or file.filename == '':
            flash("❌ No file uploaded. Please try again.", "error")
            return redirect(url_for('upload_file'))

        try:
            # Save uploaded file
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)

            # Process image
            img = Image.open(filepath).convert("RGB")
            predicted_class, confidence = predict(interpreter, img)

            # Custom message for healthy leaves
            if "healthy" in predicted_class.lower():
                remedies = "🌿 It's great to see that your plant is healthy! No issues detected — keep up the good care! 😊🌱"

            elif predicted_class == "Background_without_leaves":
                remedies = (
                    "⚠️ The uploaded image seems to be just a background without any leaf. "
                    "📸 Please upload an image containing a single clear leaf for accurate detection."
                )
            else:
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

            # Store session data
            session['filename'] = filename
            session['class_name'] = predicted_class
            session['confidence'] = confidence
            session['remedies'] = remedies

            return redirect(url_for('result'))

        except Exception as e:
            print("Error during upload:", e)
            flash("❌ Upload failed. Please try again.", "error")
            return redirect(url_for('upload_file'))

    return render_template('index.html')


@app.route('/result')
def result():
    """Render the result page."""
    # Retrieve prediction details from the session
    filename = session.get('filename')
    class_name = session.get('class_name')
    confidence = session.get('confidence')
    remedies = session.get('remedies')

    if not filename or not class_name or not confidence:
        flash("No prediction data found. Please upload an image first.", "warning")
        return redirect(url_for('upload_file'))

    # Build the image path to display in the result page
    img_path = url_for('static', filename=f'uploads/{filename}')

    return render_template(
        'result.html',
        img_path=img_path,
        class_name=class_name,
        confidence=confidence,
        remedies=remedies
    )

@app.route('/google-login', methods=['POST'])
def google_login():
    """Handle Google Sign-In token verification."""
    try:
        token = request.json.get('token')
        if not token:
            return jsonify({"status": "error", "message": "Token is missing"}), 400

        # Verify the token with Google's API
        CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)

        # Check if the token is valid
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            return jsonify({"status": "error", "message": "Invalid token issuer"}), 401

        # Extract user information
        user_email = idinfo.get('email')
        user_name = idinfo.get('name')
        google_id = idinfo.get('sub')

        # Check if the user exists in the database
        user = users_collection.find_one({"$or": [{"email": user_email}, {"google_id": google_id}]})
        
        if not user:
            # Register the user if they don't exist
            user_data = {
                "firstname": user_name.split()[0] if user_name else "",
                "lastname": " ".join(user_name.split()[1:]) if user_name else "",
                "email": user_email,
                "google_id": google_id,
                "verified": True,
                "created_at": datetime.utcnow()
            }
            users_collection.insert_one(user_data)
            message = "Account created and logged in successfully!"
        else:
            if user.get("google_id") != google_id:
                return jsonify({"status": "error", "message": "This email is already registered with a different method"}), 400
            message = "Logged in successfully!"

        # Set session
        session['user'] = {
            "email": user_email,
            "name": user_name,
            "google_id": google_id
        }
        
        return jsonify({"status": "success", "message": message})

    except ValueError as e:
        print(f"Token verification failed: {e}")
        return jsonify({"status": "error", "message": "Invalid token"}), 400
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"status": "error", "message": "Internal Server Error"}), 500

@app.route('/contactUs')
def contact_us():
    """Render the Contact Us page."""
    return render_template('/contactUs.html')

@app.route("/research_paper")
def research_paper():
    return render_template("research_paper.html")

@app.route('/aboutUs')
def about_us():
    """Render the About Us page."""
    return render_template('aboutus.html')

@app.route('/faq')
def faq():
    """Render the FAQ page."""
    return render_template('faq.html')

@app.route('/privacy-policy')
def privacy_policy():
    """Render the Privacy Policy page."""
    return render_template('privacy-policy.html')

@app.route('/terms')
def terms():
    """Render the Terms and Conditions page."""
    return render_template('terms.html')

@app.route('/disease_info')
def disease_info():
    """Render the Disease Info page."""
    return render_template('disease_info.html')

@app.route('/login')
def login():
    """Render the Login page."""
    google_client_id = os.getenv("GOOGLE_CLIENT_ID")
    # Check if the request is for registration (has hash)
    is_register = request.args.get('register') or '#register' in request.referrer if request.referrer else False
    return render_template("login.html", 
                         google_client_id=google_client_id,
                         is_register=is_register)

@app.route('/login', methods=['POST'])
def login_val():
    """Validate login credentials."""
    try:
        print("-" * 20, "Logging In User", "-" * 20)
        print(f"Content-Type: {request.content_type}")  # Log the Content-Type
        print(f"Raw Data: {request.data}")  # Log the raw request data

        if request.content_type != 'application/json':
            return jsonify({"status": "error", "message": "Content-Type must be application/json"}), 415

        data = request.json
        print(f"Parsed JSON Data: {data}")  # Log the parsed JSON data

        username = data.get("username")
        password = data.get("password")

        # Check if the user exists in the database
        user = users_collection.find_one({"username": username, "password": password})
        
        if user:
            session['user'] = username  # Set session when login is successful
            return jsonify({"status": "success", "message": "Login successful!"})
        else:
            return jsonify({"status": "error", "message": "Invalid username or password."}), 401

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"status": "error", "message": "Internal Server Error"}), 500

@app.route('/register', methods=['POST'])
def register():
    """Handle user registration."""
    try:
        if not request.is_json:
            return jsonify({"status": "error", "message": "Content-Type must be application/json"}), 415

        data = request.get_json()
        firstname = data.get("firstname", "").strip()
        lastname = data.get("lastname", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "").strip()
        confirmpassword = data.get("confirmpassword", "").strip()
        mobileno = data.get("mobileno", "").strip()

        # Validate the input fields
        if not all([firstname, email, password, confirmpassword, mobileno]):
            return jsonify({"status": "error", "message": "All fields are required."}), 400

        # Name validation
        if len(firstname) < 2:
            return jsonify({"status": "error", "message": "First name must be at least 2 characters long."}), 400

        # Email validation
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            return jsonify({"status": "error", "message": "Invalid email format."}), 400

        # Password validation
        if len(password) < 8:
            return jsonify({"status": "error", "message": "Password must be at least 8 characters long."}), 400
        if not re.search(r"[A-Za-z]", password) or not re.search(r"\d", password):
            return jsonify({"status": "error", "message": "Password must contain both letters and numbers."}), 400

        # Confirm password
        if password != confirmpassword:
            return jsonify({"status": "error", "message": "Passwords do not match."}), 400

        # Mobile number validation
        if not re.match(r"^[0-9]{10,15}$", mobileno):
            return jsonify({"status": "error", "message": "Invalid mobile number (10-15 digits required)."}), 400

        # Check if the user already exists
        if users_collection.find_one({"email": email}):
            return jsonify({"status": "error", "message": "Email already registered."}), 400

        # Hash password (use bcrypt in production)
        hashed_password = hashlib.sha256(password.encode()).hexdigest()

        # Insert the new user into the database
        users_collection.insert_one({
            "firstname": firstname,
            "lastname": lastname,
            "email": email,
            "password": hashed_password,
            "mobileno": mobileno,
            "verified": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })

        return jsonify({
            "status": "success", 
            "message": "Registration successful! You can now login."
        })

    except Exception as e:
        print(f"Error during registration: {e}")
        return jsonify({
            "status": "error", 
            "message": "Internal Server Error"
        }), 500
    

@app.route('/check-session')
def check_session():
    """Check if user has an active session"""
    if 'user' in session:
        return jsonify({'logged_in': True})
    return jsonify({'logged_in': False})

@app.route('/logout')
def logout():
    """Clear user session"""
    session.pop('user', None)
    return redirect(url_for('upload_file'))

feedback_collection = db["feedback"]

@app.route('/submit-feedback', methods=['POST'])
def submit_feedback():
    try:
        data = request.json
        
        # Prepare feedback document
        feedback_data = {
            "feedback": data.get('feedback', ''),
            "rating": data.get('rating', None),
            "pageUrl": data.get('pageUrl', ''),
            "timestamp": datetime.utcnow(),
            "user_agent": request.headers.get('User-Agent', ''),
            "ip_address": request.remote_addr
        }
        
        # Insert into MongoDB
        feedback_collection.insert_one(feedback_data)
        
        return jsonify({
            'status': 'success',
            'message': 'Feedback submitted successfully'
        })
        
    except Exception as e:
        print(f"Error submitting feedback: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to submit feedback'
        }), 500

@app.route('/ask-plantguard', methods=['POST'])
def ask_plantguard():
    try:
        data = request.json
        question = data.get('question', '')
        
        # Enhanced prompt with model information
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
        
        return jsonify({
            'status': 'success',
            'answer': answer
        })
        
    except Exception as e:
        print(f"Error in PlantGuard chatbot: {e}")
        return jsonify({
            'status': 'error',
            'answer': "I'm having trouble processing your request. Please try again later."
        }), 500
    
if __name__ == '__main__':
    app.run(debug=True)