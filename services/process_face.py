import cv2
import sys
import os

# arguments from Node
input_image = sys.argv[1]
output_image = sys.argv[2]

# load image
img = cv2.imread(input_image)
if img is None:
    sys.exit(1)

gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# face detector
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

faces = face_cascade.detectMultiScale(gray, 1.3, 5)

if len(faces) == 0:
    sys.exit(1)

# take first detected face
(x, y, w, h) = faces[0]
face = gray[y:y+h, x:x+w]

# save face image exactly where Node told
cv2.imwrite(output_image, face)

sys.exit(0)
