from flask import Flask, render_template, request
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
        return str(predicted_label)
    else:
        print("None from request")
        return "ERROR!"


app.run(debug=True)

