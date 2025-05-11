import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from PIL import Image
from flask import Flask, request, jsonify, render_template
import base64
from io import BytesIO

# Initialize Flask app
app = Flask(__name__)

# Load the trained .h5 model
model = load_model('saved_models/Plant_Disease_MobileNetV2_tuning.h5')

# Define image size (used during training)
IMAGE_SIZE = 128

# Define class names used during training (must match exactly)
class_names = [
    'Apple___Apple_scab',
    'Apple___Black_rot',
    'Apple___Cedar_apple_rust',
    'Apple___healthy',
    'Background_without_leaves',
    'Blueberry___healthy',
    'Cherry___Powdery_mildew',
    'Cherry___healthy',
    'Corn___Cercospora_leaf_spot Gray_leaf_spot',
    'Corn___Common_rust',
    'Corn___Northern_Leaf_Blight',
    'Corn___healthy',
    'Grape___Black_rot',
    'Grape___Esca_(Black_Measles)',
    'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
    'Grape___healthy',
    'Orange___Haunglongbing_(Citrus_greening)',
    'Peach___Bacterial_spot',
    'Peach___healthy',
    'Pepper,_bell___Bacterial_spot',
    'Pepper,_bell___healthy',
    'Potato___Early_blight',
    'Potato___Late_blight',
    'Potato___healthy',
    'Raspberry___healthy',
    'Soybean___healthy',
    'Squash___Powdery_mildew',
    'Strawberry___Leaf_scorch',
    'Strawberry___healthy',
    'Tomato___Bacterial_spot',
    'Tomato___Early_blight',
    'Tomato___Late_blight',
    'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot',
    'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy'
]

# Prediction function
def predict(img):
    """
    Predict the class of a given image using the trained model.
    """
    try:
        # Resize the image to match the input size of the model
        img = img.resize((IMAGE_SIZE, IMAGE_SIZE))
        
        # Convert the image to a NumPy array and normalize pixel values
        img_array = tf.keras.preprocessing.image.img_to_array(img)
        img_array = tf.expand_dims(img_array, 0)  # Add batch dimension
        # img_array = img_array / 255.0  # Normalize pixel values to [0, 1]

        # Make predictions
        predictions = model.predict(img_array)
        predicted_class = class_names[np.argmax(predictions[0])]
        confidence = round(100 * np.max(predictions[0]), 2)
        return predicted_class, confidence
    except Exception as e:
        print(f"Error during prediction: {e}")
        return None, None
    

# Flask route
@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        file = request.files.get('file')
        if not file:
            return jsonify({"status": "error", "message": "No file uploaded"}), 400
        try:
            img = Image.open(BytesIO(file.read())).convert('RGB')
            predicted_class, confidence = predict(img)

            # Convert image to base64
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

if __name__ == '__main__':
    app.run(debug=True)
