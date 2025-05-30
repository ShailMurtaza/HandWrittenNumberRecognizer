from flask import Flask, render_template, request, jsonify
import base64
import numpy as np
import cv2
import tensorflow as tf
import os
import logging


log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
model = tf.keras.models.load_model("Model/handwritten.keras")
app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")

def predict_number(image):
    image = image.reshape(1, 28, 28, 1)
    input_image = image.reshape(1, 28, 28, 1)
    prediction = model.predict(input_image)
    predicted_label = np.argmax(prediction)
    return predicted_label

@app.route("/predict_written", methods=["POST"])
def predict_written():
    data = request.json
    if data:
        image = data["image"]
        img_array = np.array(image, dtype=np.float32)
        img_array /= 255.0
        predicted_label = predict_number(img_array)
        img_str = get_image(img_array)
        return jsonify({"result": str(predicted_label), "image": img_str})
    else:
        print("None from request")
        return "ERROR!"


@app.route("/predict_image", methods=["POST"])
def predict_image():
    file = request.files['image']
    file_bytes = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_GRAYSCALE)
    img = cv2.resize(img, (28, 28), interpolation=cv2.INTER_AREA)
    denoised = cv2.fastNlMeansDenoising(img, h=10)
    img_thresh = cv2.adaptiveThreshold(
        denoised,
        maxValue=255,
        adaptiveMethod=cv2.ADAPTIVE_THRESH_MEAN_C,  # or cv2.ADAPTIVE_THRESH_GAUSSIAN_C
        thresholdType=cv2.THRESH_BINARY_INV,
        blockSize=11,
        C=5
    )

    img_array = img_thresh.astype(np.float32) / 255.0
    predicted_label = predict_number(img_array)
    img_str = get_image(img_array)
    return jsonify({"result": str(predicted_label), "image": img_str})


def get_image(image_array):
    image_array = (image_array * 255.0).astype(np.uint8)
    success, buffer = cv2.imencode('.png', image_array)
    if not success:
        raise ValueError("Image encoding failed.")

    img_str = base64.b64encode(buffer).decode()
    return img_str


app.run(host="0.0.0.0", port=5000, debug=True)

