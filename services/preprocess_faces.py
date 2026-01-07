import cv2
import os

# ---------------- CONFIG ----------------
INPUT_DIR = "uploads"
OUTPUT_DIR = "processed"
FACE_SIZE = (200, 200)

# Haar Cascade
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# Create output root folder
os.makedirs(OUTPUT_DIR, exist_ok=True)

print("🔍 Scanning uploads folder...")

# Loop through student folders
for student_folder in os.listdir(INPUT_DIR):
    student_path = os.path.join(INPUT_DIR, student_folder)

    if not os.path.isdir(student_path):
        continue

    print(f"\n📁 Processing student: {student_folder}")

    # Create student output folder
    output_student_dir = os.path.join(OUTPUT_DIR, student_folder)
    os.makedirs(output_student_dir, exist_ok=True)

    img_count = 0

    for file in os.listdir(student_path):
        if not file.lower().endswith((".jpg", ".png", ".jpeg")):
            continue

        img_path = os.path.join(student_path, file)
        img = cv2.imread(img_path)

        if img is None:
            print(f"❌ Cannot read {file}")
            continue

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        if len(faces) == 0:
            print(f"⚠️ No face found in {file}")
            continue

        # Take first detected face
        (x, y, w, h) = faces[0]
        face = gray[y:y+h, x:x+w]

        # Resize to 200x200
        face_resized = cv2.resize(face, FACE_SIZE)

        img_count += 1
        out_path = os.path.join(output_student_dir, f"face_{img_count}.jpg")
        cv2.imwrite(out_path, face_resized)

        print(f"✅ Saved {out_path}")

print("\n🎉 Preprocessing complete!")
