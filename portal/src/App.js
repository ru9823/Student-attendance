import React, { useRef, useState, useEffect } from "react";
import "./App.css";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

function App() {
  const videoRef = useRef(null);

  const [images, setImages] = useState([]);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    role: "student",
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

  /* ---------- Send image to backend ---------- */
  const sendToBackend = async (imgData, index) => {
    await fetch("http://localhost:5000/upload-base64", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: imgData,
        name: form.name,
        rollno: form.rollno || "NA",
        index: index,
        role: form.role,
      }),
    });
  };

  /* ---------- Auto capture from video ---------- */
/* ---------- Auto capture from video ---------- */
const autoCaptureFromVideo = async () => {
  if (!videoRef.current) return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 640;
  canvas.height = 480;

  let count = 0;
  const TOTAL_IMAGES = 35; // 5 images/sec × 7 sec

  setMsg("🎥 Auto capturing images...");

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
  }, 200); // 5 images per second
};


  /* ---------- Start Camera ---------- */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setMsg("🎥 Camera started");

      setTimeout(() => {
        autoCaptureFromVideo();
      }, 500);
    } catch {
      setMsg("❌ Camera access denied");
    }
  };

  /* ---------- Submit info ---------- */
  const submit = async (e) => {
    e.preventDefault();

    try {
      const collectionName = form.role === "student" ? "students" : "faculty";

      await addDoc(collection(db, collectionName), {
        ...form,
        imagesCount: images.length,
        createdAt: new Date().toISOString(),
      });

      setMsg("✅ Registration successful");

      setImages([]);
      setForm({
        role: "student",
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

  return (
    <div className="page">
      <div className="card">

        {/* LEFT FORM */}
        <div className="form-section">
          <h2>Registration Form</h2>

          {/* ROLE DROPDOWN */}
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
          </select>

          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />

          {form.role === "student" && (
            <input name="rollno" placeholder="Roll No" value={form.rollno} onChange={handleChange} />
          )}

          {/* Department */}
          <select name="department" value={form.department} onChange={handleChange}>
            <option value="">Select Department</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ENTC">ENTC</option>
            <option value="EE">EE</option>
            <option value="CIVIL">CIVIL</option>
          </select>

          {/* Section */}
          <select name="section" value={form.section} onChange={handleChange}>
            <option value="">Select Section</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>

          {/* Year */}
          <select name="year" value={form.year} onChange={handleChange}>
            <option value="">Select Year</option>
            <option value="1st">I Year</option>
            <option value="2nd">II Year</option>
            <option value="3rd">III Year</option>
            <option value="4th">IV Year</option>
          </select>

          {form.role === "student" && (
            <>
              {/* Gender */}
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>

              <input type="date" name="dob" value={form.dob} onChange={handleChange} />
              <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
              <input name="mobile" placeholder="Mobile" value={form.mobile} onChange={handleChange} />
            </>
          )}

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
