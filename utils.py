import re
from pymongo import MongoClient
from pymongo.server_api import ServerApi
import tensorflow as tf
import numpy as np
from tensorflow.keras.models import load_model


def connect_to_mongodb(uri):
    try:
        client = MongoClient(uri, server_api=ServerApi('1'))
        print("Connected to MongoDB successfully!")
        return client
    except Exception as e:
        print(f"An error occurred: {e}")
        return None
    
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

# Load the TFLite model and allocate tensors
def load_tflite_model(model_path):
    interpreter = tf.lite.Interpreter(model_path=model_path)
    interpreter.allocate_tensors()
    return interpreter

def predict(interpreter, img):
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    img = img.resize((128, 128))  # Resize image to match model input size
    img_array = np.expand_dims(np.array(img), axis=0).astype(np.float32)

    interpreter.set_tensor(input_details[0]['index'], img_array)
    interpreter.invoke()
    output_data = interpreter.get_tensor(output_details[0]['index'])

    predicted_class = class_names[np.argmax(output_data[0])]
    confidence = round(100 * np.max(output_data[0]), 2)
    return predicted_class, confidence

def validate_signup_form(username, password, confirmpassword, mobileno, countrycode):
    if len(username) < 4:
        return "Username must be at least 4 characters long."

    if len(password) < 8 or not re.search(r'[A-Za-z]', password) or not re.search(r'\d', password) or not re.search(r'[^\w\s]', password):
        return "Password must be at least 8 characters long, with 1 letter, 1 digit, and 1 symbol."

    if password != confirmpassword:
        return "Passwords do not match."

    if countrycode == "+91" and len(mobileno) != 10:
        return "Mobile number for India must be 10 digits."
    elif countrycode == "+1" and len(mobileno) != 10:
        return "Mobile number for US must be 10 digits."
    elif countrycode == "+44" and len(mobileno) != 11:
        return "Mobile number for UK must be 11 digits."

    return None