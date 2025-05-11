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

# Load the Keras .h5 model
def load_keras_model(model_path):
    return load_model(model_path)

# Predict function using the Keras model
def predict(model, img, class_names):
    img = img.resize((128, 128))
    img_array = np.expand_dims(np.array(img) / 255.0, axis=0)

    predictions = model.predict(img_array)
    predicted_class = class_names[np.argmax(predictions[0])]
    confidence = round(100 * np.max(predictions[0]), 2)
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