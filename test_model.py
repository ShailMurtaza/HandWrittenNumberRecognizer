import tensorflow as tf
import cv2
import numpy as np

model = tf.keras.models.load_model("handwritten.keras")
print("Modal loaded")

# mnist = tf.keras.datasets.mnist
# (x_train, y_train), (x_test, y_test) = mnist.load_data()
# 
# loss, accuracy = model.evaluate(x_test, y_test)
# print(loss, accuracy)
# 
# input("ENTER")
img = cv2.imread("2.bmp")[:,:,0]
img = np.array([img])
print("Image Loaded")

pr = model.predict(img)
print(np.argmax(pr))

