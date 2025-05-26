import re
import os
import numpy as np
from pymongo import MongoClient
from pymongo.server_api import ServerApi
import tensorflow as tf
from PIL import Image
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import hashlib
from logger import get_logger

# Initialize logger
logger = get_logger(__name__)

# Load environment variables
load_dotenv()

# Disease classification labels
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

def connect_to_mongodb(uri):
    """Connect to MongoDB with the given URI."""
    try:
        logger.info(f"Attempting to connect to MongoDB at: {uri}")
        client = MongoClient(uri, server_api=ServerApi('1'))
        
        # Test the connection
        client.admin.command('ping')
        logger.info("Successfully connected to MongoDB and verified connection")
        
        return client
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}", exc_info=True)
        raise ConnectionError(f"Could not connect to MongoDB: {str(e)}")

def load_tflite_model(model_path):
    """Load and initialize a TFLite model."""
    try:
        if not os.path.exists(model_path):
            logger.error(f"Model file not found at path: {model_path}")
            raise FileNotFoundError(f"Model file not found at path: {model_path}")
            
        logger.info(f"Loading TFLite model from: {model_path}")
        interpreter = tf.lite.Interpreter(model_path=model_path)
        interpreter.allocate_tensors()
        
        # Log model input/output details
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        logger.debug(f"Model loaded successfully. Input details: {input_details}, Output details: {output_details}")
        
        return interpreter
    except Exception as e:
        logger.error(f"Error loading TFLite model: {str(e)}", exc_info=True)
        raise RuntimeError(f"Failed to load model: {str(e)}")

def predict(interpreter, img):
    """Run prediction on an image using the TFLite model."""
    try:
        logger.debug("Starting image prediction process")
        
        # Get model details
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        logger.debug(f"Model input details: {input_details}")
        
        # Preprocess image
        logger.debug("Resizing and preprocessing image")
        img = img.resize((128, 128))
        img_array = np.expand_dims(np.array(img), axis=0).astype(np.float32)
        
        # Run inference
        logger.debug("Running model inference")
        interpreter.set_tensor(input_details[0]['index'], img_array)
        interpreter.invoke()
        output_data = interpreter.get_tensor(output_details[0]['index'])
        
        # Process results
        predicted_class = class_names[np.argmax(output_data[0])]
        confidence = round(100 * np.max(output_data[0]), 2)
        
        logger.info(f"Prediction completed - Class: {predicted_class}, Confidence: {confidence}%")
        logger.debug(f"Full prediction output: {output_data[0]}")
        
        return predicted_class, confidence
    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}", exc_info=True)
        raise RuntimeError(f"Prediction error: {str(e)}")

def save_uploaded_file(file, upload_folder):
    """Save uploaded file to the specified folder and return its path."""
    try:
        if not file or file.filename == '':
            logger.warning("No file provided or empty filename")
            return None

        # Secure filename and create directory if needed
        filename = secure_filename(file.filename)
        os.makedirs(upload_folder, exist_ok=True)
        filepath = os.path.join(upload_folder, filename)
        
        logger.debug(f"Saving file to: {filepath}")
        file.save(filepath)
        
        # Verify file was saved
        if not os.path.exists(filepath):
            logger.error(f"File save verification failed for: {filepath}")
            return None
            
        logger.info(f"File saved successfully: {filepath} (Size: {os.path.getsize(filepath)} bytes)")
        return filepath
    except Exception as e:
        logger.error(f"Failed to save uploaded file: {str(e)}", exc_info=True)
        return None

def generate_remedies(predicted_class):
    """Generate appropriate remedies based on the predicted class."""
    try:
        logger.debug(f"Generating remedies for predicted class: {predicted_class}")
        
        if "healthy" in predicted_class.lower():
            message = "🌿 It's great to see that your plant is healthy! No issues detected — keep up the good care! 😊🌱"
            logger.info("Healthy plant detected")
            return message
        elif predicted_class == "Background_without_leaves":
            message = (
                "⚠️ The uploaded image seems to be just a background without any leaf. "
                "📸 Please upload an image containing a single clear leaf for accurate detection."
            )
            logger.warning("Background image detected instead of leaf")
            return message
            
        logger.debug("No predefined remedies found, will query database")
        return None
    except Exception as e:
        logger.error(f"Error generating remedies: {str(e)}", exc_info=True)
        raise RuntimeError(f"Remedy generation error: {str(e)}")

def validate_email(email):
    """Validate email format."""
    try:
        logger.debug(f"Validating email: {email}")
        is_valid = re.match(r"[^@]+@[^@]+\.[^@]+", email)
        if not is_valid:
            logger.warning(f"Invalid email format: {email}")
        return bool(is_valid)
    except Exception as e:
        logger.error(f"Email validation error: {str(e)}", exc_info=True)
        return False

def validate_password(password):
    """Validate password strength."""
    try:
        logger.debug("Validating password strength")
        has_letter = bool(re.search(r"[A-Za-z]", password))
        has_digit = bool(re.search(r"\d", password))
        is_length_valid = len(password) >= 8
        
        if not all([has_letter, has_digit, is_length_valid]):
            logger.warning(
                f"Password validation failed - "
                f"Length: {'OK' if is_length_valid else 'Too short'}, "
                f"Letters: {'OK' if has_letter else 'Missing'}, "
                f"Digits: {'OK' if has_digit else 'Missing'}"
            )
        return all([has_letter, has_digit, is_length_valid])
    except Exception as e:
        logger.error(f"Password validation error: {str(e)}", exc_info=True)
        return False

def validate_phone(phone):
    """Validate phone number format."""
    try:
        logger.debug(f"Validating phone number: {phone}")
        is_valid = re.match(r"^[0-9]{10,15}$", phone)
        if not is_valid:
            logger.warning(f"Invalid phone number format: {phone}")
        return bool(is_valid)
    except Exception as e:
        logger.error(f"Phone validation error: {str(e)}", exc_info=True)
        return False

def hash_password(password):
    """Hash password using SHA-256 (use bcrypt in production)."""
    try:
        logger.debug("Hashing password")
        hashed = hashlib.sha256(password.encode()).hexdigest()
        logger.debug("Password hashed successfully")
        return hashed
    except Exception as e:
        logger.error(f"Password hashing failed: {str(e)}", exc_info=True)
        raise RuntimeError(f"Password hashing error: {str(e)}")