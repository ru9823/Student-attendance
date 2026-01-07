import cv2
import numpy as np
import os
from PIL import Image
import json

dataset_path = "uploads"
trainer_dir = "trainer"
trainer_file = "trainer/trainer.yml"
label_file = "labels.json"

recognizer = cv2.face.LBPHFaceRecognizer_create()
detector = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

faces = []
ids = []
label_map = {}
current_id = 0

for person in os.listdir(dataset_path):
    person_path = os.path.join(dataset_path, person)
    if not os.path.isdir(person_path):
        continue

    label_map[current_id] = person

    for image_name in os.listdir(person_path):
        image_path = os.path.join(person_path, image_name)
        img = Image.open(image_path).convert("L")
        img_np = np.array(img, "uint8")

        detected_faces = detector.detectMultiScale(img_np)
        for (x, y, w, h) in detected_faces:
            faces.append(img_np[y:y+h, x:x+w])
            ids.append(current_id)

    current_id += 1

os.makedirs(trainer_dir, exist_ok=True)
recognizer.train(faces, np.array(ids))
recognizer.save(trainer_file)

with open(label_file, "w") as f:
    json.dump(label_map, f)

print("✅ Training complete")
print("📁 Model saved as trainer/trainer.yml")
