const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: "25mb" }));

// ---------------- FOLDERS ----------------
const UPLOADS = path.join(__dirname, "uploads");
const STUDENT = path.join(UPLOADS, "student");
const FACULTY = path.join(UPLOADS, "faculty");

if (!fs.existsSync(STUDENT)) fs.mkdirSync(STUDENT, { recursive: true });
if (!fs.existsSync(FACULTY)) fs.mkdirSync(FACULTY, { recursive: true });

// ---------------- API ----------------
app.post("/upload-base64", (req, res) => {
  try {
    const { image, name, rollno, index, role } = req.body;

    if (!image || !name || !rollno || index === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Missing data",
      });
    }

    // ✅ SELECT BASE FOLDER
    const BASE = role === "faculty" ? FACULTY : STUDENT;

    // ---------- PERSON FOLDER ----------
    const folderName = `${rollno}_${name.replace(/\s+/g, "_")}`;
    const personDir = path.join(BASE, folderName);

    if (!fs.existsSync(personDir)) {
      fs.mkdirSync(personDir, { recursive: true });
    }

    // ---------- SAVE IMAGE ----------
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const imagePath = path.join(personDir, `img_${index + 1}.jpg`);

    fs.writeFileSync(imagePath, base64Data, "base64");

    console.log("✅ Saved:", imagePath);
    return res.json({ status: "success" });

  } catch (err) {
    console.error("❌ Error:", err);
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
});

// ---------------- SERVER ----------------
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
