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

if (!fs.existsSync(UPLOADS)) {
  fs.mkdirSync(UPLOADS, { recursive: true });
}

// ---------------- API ----------------
app.post("/upload-base64", (req, res) => {
  try {
    const { image, name, rollno, index } = req.body;

    if (!image || !name || !rollno || index === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Missing data",
      });
    }

    // ---------- STUDENT FOLDER ----------
    const folderName = `${rollno}_${name.replace(/\s+/g, "_")}`;
    const studentDir = path.join(UPLOADS, folderName);

    if (!fs.existsSync(studentDir)) {
      fs.mkdirSync(studentDir, { recursive: true });
    }

    // ---------- SAVE IMAGE DIRECTLY ----------
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const imagePath = path.join(studentDir, `img_${index + 1}.jpg`);

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
