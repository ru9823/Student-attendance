import React, { useRef, useState, useEffect } from "react";
import "./App.css";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

function App() {
  const videoRef = useRef(null);

  const [images, setImages] = useState([]);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    rollno: "",
    section: "",
    year: "",
    department: "",
    gender: "",
    mobile: "",
    dob: "",
    email: "",
  });

  /* ---------- Direction logic (optional UI) ---------- */
  const directions = ["Front", "Up", "Down", "Left", "Right"];
  const directionSymbols = {
    Front: "●",
    Up: "⬆️",
    Down: "⬇️",
    Left: "⬅️",
    Right: "➡️",
  };
  const currentDirection = directions[Math.min(images.length, 4)] || "Front";
  /* -------------------------------------------------- */

  /* ---------- Stop camera on unmount ---------- */
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  /* ---------- Form change ---------- */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ---------- Send image to backend ---------- */
  const sendToBackend = async (imgData, index) => {
    await fetch("http://localhost:5000/upload-base64", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: imgData,
        name: form.name,
        rollno: form.rollno,
        index: index,
      }),
    });
  };

  /* ---------- AUTO VIDEO CAPTURE (MAIN LOGIC) ---------- */
  const autoCaptureFromVideo = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 640;
    canvas.height = 480;

    let count = 0;
    const TOTAL_IMAGES = 15; // 5 sec × 3 images

    setMsg("🎥 Auto capturing images from video...");

    const interval = setInterval(async () => {
      if (count >= TOTAL_IMAGES) {
        clearInterval(interval);
        setMsg("✅ Auto capture completed");
        return;
      }

      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imgData = canvas.toDataURL("image/png");

      await sendToBackend(imgData, count);
      setImages((prev) => [...prev, imgData]);

      count++;
    }, 333); // ~3 images per second
  };

  /* ---------- Start Camera ---------- */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setMsg("🎥 Camera started");

      // Auto capture after short delay
      setTimeout(() => {
        autoCaptureFromVideo();
      }, 500);
    } catch {
      setMsg("❌ Camera access denied");
    }
  };

  /* ---------- Submit student info ---------- */
  const submit = async (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.rollno ||
      !form.section ||
      !form.year ||
      !form.department
    ) {
      setMsg("Please fill all required fields");
      return;
    }

    if (images.length < 15) {
      setMsg("Please wait for auto capture to finish");
      return;
    }

    try {
      await addDoc(collection(db, "students"), {
        ...form,
        imagesCount: images.length,
        createdAt: new Date().toISOString(),
      });

      setMsg("✅ Student registered successfully");

      setImages([]);
      setForm({
        name: "",
        rollno: "",
        section: "",
        year: "",
        department: "",
        gender: "",
        mobile: "",
        dob: "",
        email: "",
      });
    } catch {
      setMsg("❌ Error saving data");
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="page">
      <div className="card">

        {/* LEFT FORM */}
        <div className="form-section">
          <h2>Student Registration</h2>

          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
          <input name="rollno" placeholder="Roll No" value={form.rollno} onChange={handleChange} />

          <select name="section" value={form.section} onChange={handleChange}>
            <option value="">Select Section</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>

          <select name="year" value={form.year} onChange={handleChange}>
            <option value="">Select Year</option>
            <option value="1st Year">I Year</option>
            <option value="2nd Year">II Year</option>
            <option value="3rd Year">III Year</option>
            <option value="Final Year">IV Year</option>
          </select>

          <select name="department" value={form.department} onChange={handleChange}>
            <option value="">Select Department</option>
            <option value="Computer Science and Engineering">Computer Science and Engineering</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Computer Science and Engineering DS">Computer Science and Engineering DS</option>
            <option value="Civil Engineering">Civil Engineering</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Electronics and Telecommunication Engineering">
              Electronics and Telecommunication Engineering
            </option>
          </select>

          <input name="gender" placeholder="Gender" value={form.gender} onChange={handleChange} />
          <input name="mobile" placeholder="Mobile" value={form.mobile} onChange={handleChange} />
          <input type="date" name="dob" value={form.dob} onChange={handleChange} />
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />

          <button className="submit-btn" onClick={submit}>
            Submit
          </button>

          <div className="status">{msg}</div>
        </div>

        {/* RIGHT CAMERA */}
        <div className="camera-section">
          <div className="camera-box">
            <video ref={videoRef} autoPlay playsInline />
            <div className="face-circle"></div>

            <div className="direction-guide">
              <span>{directionSymbols[currentDirection]}</span>
              {currentDirection}
            </div>
          </div>

          <div className="camera-buttons">
            <button onClick={startCamera}>Start Camera</button>
          </div>

          <div className="preview-row">
            {images.map((img, i) => (
              <img key={i} src={img} alt={`preview-${i}`} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
