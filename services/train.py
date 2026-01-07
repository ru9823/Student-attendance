import cv2
import numpy as np
import os
from PIL import Image

# Paths
dataset_path = "processed"
trainer_dir = "trainer"
trainer_file = "trainer/trainer.yml"
label_file = "labels.txt"

# Create LBPH recognizer
recognizer = cv2.face.LBPHFaceRecognizer_create()

# Haar Cascade for face detection
detector = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

faces = []
ids = []
current_id = 0

label_lines = []   # store text labels only

# Loop through each person folder
for person in os.listdir(dataset_path):
    person_path = os.path.join(dataset_path, person)

    if not os.path.isdir(person_path):
        continue

    # Extract rollno and name from folder name
    parts = person.split("_")
    rollno = parts[0]
    name = " ".join(parts[1:])

    # ✅ required label format
    label_lines.append(f"Name={name},Rollno={rollno}")

    # Loop through images
    for image_name in os.listdir(person_path):
        image_path = os.path.join(person_path, image_name)

        try:
            img = Image.open(image_path).convert("L")
        except:
            continue

        img_np = np.array(img, "uint8")

        faces_detected = detector.detectMultiScale(
            img_np,
            scaleFactor=1.2,
            minNeighbors=5
        )

        for (x, y, w, h) in faces_detected:
            faces.append(img_np[y:y+h, x:x+w])
            ids.append(current_id)

    current_id += 1

# Create trainer directory if not exists
os.makedirs(trainer_dir, exist_ok=True)

# Train and save model
recognizer.train(faces, np.array(ids))
recognizer.save(trainer_file)

# ✅ Write labels.txt in ARRAY/LIST STYLE
with open(label_file, "w", encoding="utf-8") as f:
    f.write("[\n")
    for i, line in enumerate(label_lines):
        if i < len(label_lines) - 1:
            f.write(f'  "{line}",\n')
        else:
            f.write(f'  "{line}"\n')
    f.write("]")

print("✅ Training complete")
print("📁 Model saved as trainer/trainer.yml")
print("🗂️ Labels saved as labels.txt")
