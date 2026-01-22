import React, { useRef, useState, useEffect } from "react";
import "./App.css";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

function App() {
  const videoRef = useRef(null);

  const [images, setImages] = useState([]);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    role: "student",   // ✅ Student / Faculty
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
        role: form.role,   // ✅ Student / Faculty
      }),
    });
  };

  /* ---------- AUTO VIDEO CAPTURE ---------- */
  const autoCaptureFromVideo = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 640;
    canvas.height = 480;

    let count = 0;
    const TOTAL_IMAGES = 15; // 5 sec × 3 images

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
    }, 333);
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

    if (!form.name || !form.rollno || !form.department) {
      setMsg("Please fill required fields");
      return;
    }

    if (images.length < 15) {
      setMsg("Please wait for auto capture to finish");
      return;
    }

    try {
      // ✅ Dynamic collection
      const collectionName = form.role === "faculty" ? "faculty" : "students";

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

  /* ---------- UI ---------- */
  return (
    <div className="page">
      <div className="card">

        {/* LEFT FORM */}
        <div className="form-section">
          <h2>Registration Form</h2>

          {/* Role Dropdown */}
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
          </select>

          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
          <input name="rollno" placeholder="Roll No / Faculty ID" value={form.rollno} onChange={handleChange} />
          <input name="section" placeholder="Section" value={form.section} onChange={handleChange} />
          <input name="year" placeholder="Year" value={form.year} onChange={handleChange} />
          <input name="department" placeholder="Department" value={form.department} onChange={handleChange} />
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
