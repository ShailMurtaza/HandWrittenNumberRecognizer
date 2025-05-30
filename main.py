from flask import Flask, render_template, request
import numpy as np
import cv2


app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/predict_written", methods=["POST"])
def predict_written():
    data = request.json
    if data:
        image = data["image"]
        image_array = np.array(image, dtype=np.uint8)
        print(image_array)
    else:
        print("None from request")
        return "ERROR!"
    return "1"


app.run(debug=True)
