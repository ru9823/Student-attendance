import cv2
import os
import time

def capture_video_frames():
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    student_id = input("Enter Student ID: ")
    folder_path = f"TrainingImage/{student_id}"
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)

    cam = cv2.VideoCapture(0)
    
    # Timing variables
    start_time = time.time()
    duration = 5  # Total seconds
    images_per_second = 3
    total_captured = 0
    last_recorded_second = -1 
    images_in_this_second = 0

    print(f"--- Starting 5-second capture ({images_per_second} pics/sec) ---")

    while True:
        ret, frame = cam.read()
        if not ret: break

        elapsed_time = int(time.time() - start_time)
        
        # Stop after 5 seconds
        if elapsed_time >= duration:
            break

        # Check if we are in a new second or still in the current one
        if elapsed_time > last_recorded_second:
            last_recorded_second = elapsed_time
            images_in_this_second = 0 # Reset mini-counter for the new second

        # Capture logic: if we haven't hit 3 images for the current second
        if images_in_this_second < images_per_second:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, 1.3, 5)

            for (x, y, w, h) in faces:
                if images_in_this_second < images_per_second:
                    total_captured += 1
                    images_in_this_second += 1
                    
                    img_name = f"{folder_path}/img_{total_captured}.jpg"
                    face_img = gray[y:y+h, x:x+w]
                    cv2.imwrite(img_name, face_img)
                    print(f"Saved: {img_name} at second {elapsed_time}")

        # Visual feedback on screen
        cv2.putText(frame, f"Time: {elapsed_time}s | Captured: {total_captured}", (30, 50), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        cv2.imshow("Video Recording", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cam.release()
    cv2.destroyAllWindows()
    print("Capture complete.")

if __name__ == "__main__":
    capture_video_frames()