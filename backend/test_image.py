import face_recognition
import pickle
import os

UPLOADS_DIR = "uploads"

# Load trained encodings
with open("face_encodings.pkl", "rb") as f:
    known_encodings = pickle.load(f)

print("🔍 Testing images automatically...\n")

match_found = False

for student_folder in os.listdir(UPLOADS_DIR):
    student_path = os.path.join(UPLOADS_DIR, student_folder)

    if not os.path.isdir(student_path):
        continue

    for img_name in os.listdir(student_path):
        img_path = os.path.join(student_path, img_name)

        print(f"📷 Checking: {img_path}")

        image = face_recognition.load_image_file(img_path)
        encodings = face_recognition.face_encodings(image)

        if not encodings:
            print("⚠️ No face detected\n")
            continue

        test_encoding = encodings[0]

        for student, enc_list in known_encodings.items():
            results = face_recognition.compare_faces(enc_list, test_encoding)

            if True in results:
                print(f"✅ MATCH FOUND → {student}\n")
                match_found = True
                break

        if match_found:
            break
    if match_found:
        break

if not match_found:
    print("❌ No matching student found")
