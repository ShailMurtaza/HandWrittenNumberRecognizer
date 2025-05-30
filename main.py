from flask import Flask, render_template, request, jsonify
import base64
from PIL import Image
from io import BytesIO
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


@app.route("/predict_written", methods=["POST"])
def predict_written():
    data = request.json
    if data:
        image = data["image"]
        image_array = np.array(image, dtype=np.float32)
        image_array /= 255.0
        input_image = image_array.reshape(1, 28, 28, 1)
        prediction = model.predict(input_image)
        predicted_label = np.argmax(prediction)
        img_str = get_image(image_array)
        return jsonify({"result": str(predicted_label), "image": img_str})
    else:
        print("None from request")
        return "ERROR!"


def get_image(image_array):
    image_array *= 255.0
    image_array = image_array.astype(np.uint8)
    pil_img = Image.fromarray(image_array, mode='L')  # 'L' for grayscale

    # Save image to a buffer
    buffer = BytesIO()
    pil_img.save(buffer, format="PNG")
    img_str = base64.b64encode(buffer.getvalue()).decode()
    return img_str


app.run(host="0.0.0.0", port=5000, debug=True)

