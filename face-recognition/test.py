import cv2
import json

# Paths (same as train.py)
trainer_file = "trainer/trainer.yml"
label_file = "labels.json"

# Load trained model
recognizer = cv2.face.LBPHFaceRecognizer_create()
recognizer.read(trainer_file)

# Load labels
with open(label_file, "r") as f:
    label_map = json.load(f)

labels = {int(k): v for k, v in label_map.items()}

# Load face detector
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# Start webcam
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("❌ Camera not opening")
    exit()

print("🎥 Live camera started (Press Q to quit)")

while True:
    ret, frame = cap.read()
    if not ret:
        print("❌ Failed to grab frame")
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.2,
        minNeighbors=5
    )

    for (x, y, w, h) in faces:
        face = gray[y:y+h, x:x+w]

        id_, confidence = recognizer.predict(face)
        name = labels.get(id_, "Unknown")

        # Confidence threshold
        if confidence > 80:
            name = "Unknown"

        # Draw box
        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)

        # Show name
        cv2.putText(
            frame,
            f"{name} ({round(confidence, 2)})",
            (x, y-10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.9,
            (0, 255, 0),
            2
        )

    cv2.imshow("Live Face Recognition", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
