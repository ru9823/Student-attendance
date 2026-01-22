import cv2
import os

# ---------------- CONFIG ----------------
INPUT_DIR = "uploads"
OUTPUT_DIR = "processed"
FACE_SIZE = (200, 200)

# Haar Cascade for face detection
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# Create output root folders
os.makedirs(os.path.join(OUTPUT_DIR, "student"), exist_ok=True)
os.makedirs(os.path.join(OUTPUT_DIR, "faculty"), exist_ok=True)

print("🔍 Scanning uploads folder...")

# Loop through student & faculty folders
for role in ["student", "faculty"]:
    role_input_dir = os.path.join(INPUT_DIR, role)
    role_output_dir = os.path.join(OUTPUT_DIR, role)

    if not os.path.exists(role_input_dir):
        print(f"⚠️ Folder not found: {role_input_dir}")
        continue

    print(f"\n📁 Processing {role.upper()} images...")

    # Loop through each person folder
    for person_folder in os.listdir(role_input_dir):
        person_path = os.path.join(role_input_dir, person_folder)

        if not os.path.isdir(person_path):
            continue

        print(f"\n👤 Processing: {person_folder}")

        # Create output folder
        output_person_dir = os.path.join(role_output_dir, person_folder)
        os.makedirs(output_person_dir, exist_ok=True)

        img_count = 0

        for file in os.listdir(person_path):
            if not file.lower().endswith((".jpg", ".png", ".jpeg")):
                continue

            img_path = os.path.join(person_path, file)
            img = cv2.imread(img_path)

            if img is None:
                print(f"❌ Cannot read {file}")
                continue

            # Convert to grayscale
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

            # Detect face
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
            out_path = os.path.join(output_person_dir, f"face_{img_count}.jpg")
            cv2.imwrite(out_path, face_resized)

            print(f"✅ Saved {out_path}")

print("\n🎉 Preprocessing complete!")
