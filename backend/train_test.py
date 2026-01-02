import os
import face_recognition
import pickle

# Absolute path
dataset_path = r"C:\Users\user\OneDrive\Desktop\student dataset\student registraion\backend\uploads"

# Safety check
if not os.path.exists(dataset_path):
    print("❌ Uploads folder not found! Current folder:", os.getcwd())
    exit()

encodings = {}
for student_folder in os.listdir(dataset_path):
    folder_path = os.path.join(dataset_path, student_folder)
    encodings[student_folder] = []
    for img_file in os.listdir(folder_path):
        img_path = os.path.join(folder_path, img_file)
        img = face_recognition.load_image_file(img_path)
        faces = face_recognition.face_encodings(img)
        if faces:
            encodings[student_folder].append(faces[0])

# Save encodings
with open("face_encodings.pkl", "wb") as f:
    pickle.dump(encodings, f)

print("✅ Training done, encodings saved to face_encodings.pkl")
