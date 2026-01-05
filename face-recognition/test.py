import cv2
import json

recognizer = cv2.face.LBPHFaceRecognizer_create()
recognizer.read("trainer/trainer.yml")

with open("labels.json", "r") as f:
    labels = json.load(f)

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

img = cv2.imread(
    r"C:\Users\user\OneDrive\Desktop\student dataset\student registration\face-recognition\test.jpg"
)
if img is None:
    print("❌ test.jpg ")
    exit()
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

faces = face_cascade.detectMultiScale(gray)

for (x, y, w, h) in faces:
    id_, confidence = recognizer.predict(gray[y:y+h, x:x+w])
    name = labels[str(id_)]

    print("Matched:", name, "Confidence:", confidence)

    cv2.rectangle(img, (x, y), (x+w, y+h), (0, 255, 0), 2)
    cv2.putText(img, name, (x, y-10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0,255,0), 2)

cv2.imshow("Result", img)
cv2.waitKey(0)
cv2.destroyAllWindows()
