Here’s a professional and attractive `README.md` template for your **Plant Leaf Disease Detection and Cure Recommendations** project. It's styled with clear sections, markdown formatting, and useful instructions to engage visitors and help them set up the project easily:

---

# 🌿 Plant Leaf Disease Detection and Cure Recommendations

A Deep Learning-based web application that identifies plant leaf diseases from images and suggests cures including prevention tips, Ayurvedic remedies, and recommended medicines.

---

## 📸 Demo

🖼️ Upload a plant leaf image → 🔍 Get disease prediction → 💊 View cure suggestions
**[Live Demo](#)** (Add your deployed link here)

---

## 🚀 Features

* 🔬 Detects multiple plant leaf diseases with high accuracy.
* 🌱 Covers major crops: Tomato, Potato, Apple, Strawberry, etc.
* 🧠 Uses Transfer Learning (EfficientNet, MobileNet, etc.)
* 💊 Recommends cures, including:

  * Prevention tips
  * Ayurvedic/natural remedies
  * English medicines/pesticides
* 💾 MongoDB integration for storing contact queries.
* 🌐 Clean, responsive UI with HTML, CSS, and JS.

---

## 🗂️ Project Structure

```
Plant-Leaf-Disease-Detection/
├── frontend/                # Web UI (HTML/CSS/JS)
├── backend/                 # Flask API for predictions
│   ├── app.py               # Main Flask app
│   ├── model/               # Saved model files (.h5 or TFLite)
├── Notebooks/              # Jupyter notebooks for training
├── Disease_Info/           # HTML pages with disease cures
├── requirements.txt
└── README.md
```

---

## ⚙️ Installation Guide

### 🔧 Prerequisites

* Python 3.7+
* pip
* MongoDB
* Flask
* (Optional) Virtualenv

### 🖥️ Backend Setup

```bash
git clone https://github.com/YourUsername/Plant-Leaf-Disease-Detection.git
cd Plant-Leaf-Disease-Detection/backend
pip install -r ../requirements.txt
```

### ▶️ Run Flask Server

```bash
python app.py
```

Make sure MongoDB is running locally or update your `.env` with remote URI.

### 🌐 Frontend Setup

* Navigate to `frontend/` folder.
* Open `index.html` in browser or deploy using GitHub Pages/Netlify.

---

## 🧪 Model Training (Optional)

Inside `Notebooks/` you’ll find:

* Dataset loading and preprocessing
* Training with class weights and tuning
* Model evaluation and export

Use EfficientNetB4, MobileNetV3, etc., for best performance.

---

## 🌿 Sample Classes Covered

* Tomato — Early Blight, Late Blight, Healthy
* Apple — Scab, Black Rot, Cedar Rust
* Potato — Late Blight, Early Blight, Healthy

> See [`Disease_Info/`](./Disease_Info/) for detailed disease cures.

---

## 📬 Contact Form Integration

All user queries are saved in:

* MongoDB Database: `PlantLeafDiseaseDB`
* Collection: `contacts`

Update `app.py` with your Mongo URI or environment credentials in `.env`.

---

## 🧑‍💻 Contributors

* 👨‍🔬 **Aditya Yadav** — [GitHub](https://github.com/Adi3042), [LinkedIn](https://www.linkedin.com/in/datascientist-aditya/)
* 👨‍🔬 **Adnan Riyaz** — [GitHub](https://github.com/adnandata7), [LinkedIn](https://www.linkedin.com/in/datascientist-adnan)

---

## 📄 License

This project is licensed under the MIT License.

---

## ⭐ Support & Feedback

If you like this project, leave a ⭐ on GitHub!
For feedback or issues, create a [GitHub issue](https://github.com/YourUsername/Plant-Leaf-Disease-Detection/issues).

