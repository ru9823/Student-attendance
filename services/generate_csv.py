import os
import csv
import json

# 1️⃣ Load Firestore data if you exported it, else use sample JSON
# Suppose aapne student info JSON me save kiya hai
# Example: dataset.json
with open("dataset.json", "r") as f:
    students = json.load(f)

# 2️⃣ CSV file path
csv_file = "students_dataset.csv"

# 3️⃣ Open CSV and write header
with open(csv_file, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["name", "rollno", "year", "department", "gender", "mobile", "dob", "email", "image_path"])

    # 4️⃣ Loop through each student
    for student in students:
        rollno = student.get("rollno")
        name = student.get("name")
        folder_name = f"{rollno}_{name.replace(' ', '_')}"
        folder_path = os.path.join("uploads", folder_name)

        if os.path.exists(folder_path):
            for img_file in os.listdir(folder_path):
                img_path = os.path.join(folder_path, img_file)
                writer.writerow([
                    student.get("name", ""),
                    student.get("rollno", ""),
                    student.get("year", ""),
                    student.get("department", ""),
                    student.get("gender", ""),
                    student.get("mobile", ""),
                    student.get("dob", ""),
                    student.get("email", ""),
                    img_path
                ])
        else:
            # If folder missing, still write info with empty image
            writer.writerow([
                student.get("name", ""),
                student.get("rollno", ""),
                student.get("year", ""),
                student.get("department", ""),
                student.get("gender", ""),
                student.get("mobile", ""),
                student.get("dob", ""),
                student.get("email", ""),
                ""
            ])

print(f"✅ CSV file created: {csv_file}")
