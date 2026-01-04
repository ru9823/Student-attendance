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

  /* ---------- Direction logic ---------- */
  const directions = ["Front", "Up", "Down", "Left", "Right"];
  const directionSymbols = {
    Front: "●",
    Up: "⬆️",
    Down: "⬇️",
    Left: "⬅️",
    Right: "➡️",
  };
  const currentDirection = directions[images.length] || "Front";
  /* ----------------------------------- */

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ---------- Start Camera ---------- */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setMsg("");
    } catch {
      setMsg("❌ Camera access denied");
    }
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

  /* ---------- Capture image ---------- */
  const capture = async () => {
    if (!videoRef.current?.videoWidth) {
      setMsg("Camera not ready");
      return;
    }

    if (images.length >= 5) {
      setMsg("5 images already captured");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

    const imgData = canvas.toDataURL("image/png");
    await sendToBackend(imgData, images.length);

    setImages((prev) => [...prev, imgData]);
    setMsg("");
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

    if (images.length !== 5) {
      setMsg("Please capture all 5 images");
      return;
    }

    try {
      await addDoc(collection(db, "students"), {
        ...form,
        imagesCount: 5,
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
            <option value="Computer Science and Engineering">
              Computer Science and Engineering
            </option>
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

          <button
            className="submit-btn"
            onClick={submit}
            disabled={images.length !== 5}
          >
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
            <button onClick={capture}>
              Capture ({images.length}/5)
            </button>
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
