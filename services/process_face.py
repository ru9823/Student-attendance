import cv2
import sys

input_path = sys.argv[1]
output_path = sys.argv[2]

img = cv2.imread(input_path)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

faces = face_cascade.detectMultiScale(gray, 1.3, 5)

if len(faces) == 0:
    raise Exception("No face detected")

x, y, w, h = faces[0]
face = img[y:y+h, x:x+w]
face = cv2.resize(face, (200, 200))

cv2.imwrite(output_path, face)
