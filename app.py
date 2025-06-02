from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from sklearn.linear_model import SGDClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
import joblib
import os

app = Flask(__name__)
# Enable CORS for requests from http://localhost:3000
CORS(app, resources={r"/predict": {"origins": ["http://localhost:3000", "https://amharic-chars-classif.vercel.app"]}})

# Load the dataset and model
hahu = np.load("hahu_datasets.npz")
images = hahu["images"]
labels = hahu["labels"]

# Initialize and train the model
label_encoder = LabelEncoder()
scaler = StandardScaler()
y_encoded = label_encoder.fit_transform(labels)
X_scaled = scaler.fit_transform(images)
sgd_clf = SGDClassifier(random_state=42)
sgd_clf.fit(X_scaled, y_encoded)

# Save the model and encoders for reuse
joblib.dump(sgd_clf, "sgd_model.pkl")
joblib.dump(label_encoder, "label_encoder.pkl")
joblib.dump(scaler, "scaler.pkl")

def preprocess_image(image):
    img = cv2.imdecode(np.frombuffer(image.read(), np.uint8), cv2.IMREAD_GRAYSCALE)
    img = cv2.resize(img, (28, 28))
    img = img / 255.0
    img_flattened = img.reshape(1, -1)
    img_scaled = scaler.transform(img_flattened)
    return img_scaled

@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    image = request.files["image"]
    try:
        processed_image = preprocess_image(image)
        prediction = sgd_clf.predict(processed_image)
        predicted_class = label_encoder.inverse_transform(prediction)[0]
        return jsonify({"predicted_class": predicted_class})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)