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

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Use environment variables for sensitive data
app.secret_key = os.getenv("SECRET_KEY", "your_fallback_secret")  # Secret key for Flask sessions
# MONGO_URI = os.getenv("MONGO_URI", "your_fallback_mongo_uri")  # MongoDB URI from environment variable
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

# Load the TFLite model and allocate tensors
def load_tflite_model(model_path):
    """Load the TensorFlow Lite model."""
    interpreter = tf.lite.Interpreter(model_path=model_path)
    interpreter.allocate_tensors()
    return interpreter

# Load the TFLite model
interpreter = load_tflite_model('saved_models/Disease_Classifier.tflite')

# Class names for predictions
class_names = [
    'Apple Black Rot', 'Apple Scab', 'Blueberry Healthy', 'Cedar Apple', 'Cherry Healthy', 'Cherry Powdery Mildew',
    'Corn (maize) Cercospora leaf spot', 'Corn (maize) Healthy', 'Corn (maize) Northern Leaf Blight', 'Corn (maize) Rust',
    'Grape Black Measles', 'Grape Black Rot', 'Grape Healthy', 'Grape Leaf Blight', 'Healthy Apple', 'Orange Black Spot',
    'Orange Canker', 'Orange Fresh', 'Orange Grenning', 'Orange Haunglongbing', 'Peach Bacterial Spot', 'Peach Healthy',
    'Pepper Bell Bacterial Spot', 'Pepper Bell Healthy', 'Potato Early Blight', 'Potato Healthy', 'Potato Late Blight',
    'Raspberry Healthy', 'Rice Bacterial Blight', 'Rice Blast', 'Rice Brownspot', 'Rice Tungro', 'Soybean Healthy',
    'Squash Powdery Mildew', 'Strawberry Healthy', 'Strawberry Leaf Scorch', 'Sugarcane Healthy', 'Sugarcane Mosaic',
    'Sugarcane RedRot', 'Sugarcane Rust', 'Sugarcane Yellow', 'Tomato Bacterial Spot', 'Tomato Early Blight', 'Tomato Healthy',
    'Tomato Late Blight', 'Tomato Leaf Mold', 'Tomato Mosaic Virus', 'Tomato Septoria Leaf Spot', 'Tomato Spider Mites',
    'Tomato Target Spot', 'Tomato Yellow Leaf Curl Virus'
]

def predict(interpreter, img):
    """Predict the class of the given image using the TFLite model."""
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    img = img.resize((128, 128))  # Resize image to match model input size
    img_array = np.expand_dims(np.array(img), axis=0).astype(np.float32)

    interpreter.set_tensor(input_details[0]['index'], img_array)
    interpreter.invoke()
    output_data = interpreter.get_tensor(output_details[0]['index'])
    print(f"Model Output: {output_data}")  # Debug: Log the model output

    predicted_class = class_names[np.argmax(output_data[0])]
    confidence = round(100 * np.max(output_data[0]), 2)
    print(f"Predicted Class: {predicted_class}, Confidence: {confidence}")  # Debug: Log the prediction
    return predicted_class, confidence

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        file = request.files.get('file')
        if not file:
            return jsonify({"status": "error", "message": "No file uploaded"}), 400
        try:
            img = Image.open(BytesIO(file.read()))
            predicted_class, confidence = predict(interpreter, img)

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

@app.route("/research_paper.html")
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