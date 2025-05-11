import os
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
import base64
from flask import Flask, render_template, request, redirect, url_for, jsonify, session, flash
from register import handle_register
import re
from pymongo import MongoClient
from dotenv import load_dotenv
from google.oauth2 import id_token
from google.auth.transport import requests
from utils import load_keras_model, predict

# Load the Keras model (.h5)
model = load_keras_model('saved_models/Plant_Disease_MobileNetV2_tuning.h5')

# Class names (should match your training labels exactly)
class_names = [
    'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
    'Background_without_leaves', 'Blueberry___healthy', 'Cherry___Powdery_mildew', 'Cherry___healthy',
    'Corn___Cercospora_leaf_spot Gray_leaf_spot', 'Corn___Common_rust', 'Corn___Northern_Leaf_Blight',
    'Corn___healthy', 'Grape___Black_rot', 'Grape___Esca_(Black_Measles)',
    'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape___healthy',
    'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot', 'Peach___healthy',
    'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy', 'Potato___Early_blight',
    'Potato___Late_blight', 'Potato___healthy', 'Raspberry___healthy', 'Soybean___healthy',
    'Squash___Powdery_mildew', 'Strawberry___Leaf_scorch', 'Strawberry___healthy',
    'Tomato___Bacterial_spot', 'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy'
]

# Load environment variables
load_dotenv()
app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "your_fallback_secret")  # Secret key for Flask sessions
MONGO_URI = "mongodb+srv://admin:root@cluster0.1wwnm.mongodb.net/PlantLeafDiseaseDB?retryWrites=true&w=majority&appName=Cluster0"  # Replace with your MongoDB URI

try:
    # Connect to MongoDB Atlas
    client = MongoClient(MONGO_URI)
    # Ping the database to verify the connection
    client.admin.command('ping')
    print("Successfully connected to MongoDB Atlas!")
except Exception as e:
    print(f"Failed to connect to MongoDB Atlas: {e}")
    raise

db = client['Plants']
users_collection = db['users']


@app.route('/test-db')
def test_db():
    try:
        # Insert a test document
        users_collection.insert_one({"test": "connection successful"})
        return "Database connection successful!"
    except Exception as e:
        return f"An error occurred: {e}"

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        file = request.files.get('file')
        if not file:
            return jsonify({"status": "error", "message": "No file uploaded"}), 400
        try:
            img = Image.open(BytesIO(file.read()))
            predicted_class, confidence = predict(model, img, class_names)

            img_data = BytesIO()
            img.save(img_data, format='PNG')
            img_data.seek(0)
            img_base64 = base64.b64encode(img_data.getvalue()).decode('utf-8')

            return jsonify({
                "status": "success",
                "img_data": img_base64,
                "class_name": predicted_class,
                "confidence": confidence
            })
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    return render_template('index.html')

@app.route('/google-login', methods=['POST'])
def google_login():
    """Handle Google Sign-In token verification."""
    try:
        token = request.json.get('token')
        if not token:
            return jsonify({"status": "error", "message": "Token is missing"}), 400

        # Verify the token with Google's API
        CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")  # Ensure this is set in your .env file
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)

        # Check if the token is valid
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            return jsonify({"status": "error", "message": "Invalid token issuer"}), 401

        # Extract user information
        user_email = idinfo.get('email')
        user_name = idinfo.get('name')

        # Check if the user exists in the database
        user = users_collection.find_one({"email": user_email})
        if not user:
            # Register the user if they don't exist
            users_collection.insert_one({
                "firstname": user_name.split()[0],
                "lastname": " ".join(user_name.split()[1:]),
                "email": user_email,
                "google_id": idinfo.get('sub')
            })

        # Log the user in by setting the session
        session['user'] = user_email
        return jsonify({"status": "success", "message": "Google Sign-In successful!"})

    except ValueError as e:
        print(f"Token verification failed: {e}")
        return jsonify({"status": "error", "message": "Invalid token"}), 400
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"status": "error", "message": "Internal Server Error"}), 500


# Helper Function: Validate Form Fields
def validate_signup_form(username, password, confirmpassword, mobileno, countrycode):
    """Validate the signup form fields."""
    print("-"*20, "Validating Signup Form Fields", "-"*20)
    # Username: At least 4 characters
    if len(username) < 4:
        return "Username must be at least 4 characters long."

    # Password: At least 8 characters with 1 symbol, 1 digit, 1 alphabet
    if len(password) < 8 or not re.search(r'[A-Za-z]', password) or not re.search(r'\d', password) or not re.search(r'[^\w\s]', password):
        return "Password must be at least 8 characters long, with 1 letter, 1 digit, and 1 symbol."

    # Confirm Password
    if password != confirmpassword:
        return "Passwords do not match."

    # Mobile Number Validation by Country
    if countrycode == "+91" and len(mobileno) != 10:  # India
        return "Mobile number for India must be 10 digits."
    elif countrycode == "+1" and len(mobileno) != 10:  # US
        return "Mobile number for US must be 10 digits."
    elif countrycode == "+44" and len(mobileno) != 11:  # UK
        return "Mobile number for UK must be 11 digits."

    # All validations passed
    return None

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

@app.route('/login')
def login():
    """Render the Login page."""
    google_client_id = os.getenv("GOOGLE_CLIENT_ID")
    return render_template("login.html", google_client_id=google_client_id)

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
        if request.content_type != 'application/json':
            return jsonify({"status": "error", "message": "Content-Type must be application/json"}), 415

        data = request.json
        firstname = data.get("firstname")
        lastname = data.get("lastname")
        email = data.get("email")
        password = data.get("password")  # Hash this password before storing
        mobileno = data.get("mobileno")

        # Validate the input fields
        if not firstname or not email or not password or not mobileno:
            return jsonify({"status": "error", "message": "All fields are required."}), 400

        # Check if the user already exists
        if users_collection.find_one({"email": email}):
            return jsonify({"status": "error", "message": "Email already registered."}), 400

        # Insert the new user into the database
        users_collection.insert_one({
            "firstname": firstname,
            "lastname": lastname,
            "email": email,
            "password": password,  # Use a hashed password in production
            "mobileno": mobileno
        })

        return jsonify({"status": "success", "message": "Registration successful!"})
    except Exception as e:
        print(f"Error during registration: {e}")
        return jsonify({"status": "error", "message": "Internal Server Error"}), 500
    
@app.route('/result')
def result():
    """Render the result page."""
    # Retrieve prediction details from the session
    img_data = session.get('img_data')
    class_name = session.get('class_name')
    confidence = session.get('confidence')

    if not img_data or not class_name or not confidence:
        flash("No prediction data found. Please upload an image first.", "warning")
        return redirect(url_for('upload_file'))

    return render_template(
        'result.html',
        img_data=img_data,
        class_name=class_name,
        confidence=confidence
    )


if __name__ == '__main__':
    app.run(debug=True)