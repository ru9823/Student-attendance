const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ---------------- FOLDERS ----------------
const UPLOADS = path.join(__dirname, "uploads");
const FRONT_DIR = path.join(UPLOADS, "front");

if (!fs.existsSync(UPLOADS)) fs.mkdirSync(UPLOADS);
if (!fs.existsSync(FRONT_DIR)) fs.mkdirSync(FRONT_DIR);

// ---------------- API ----------------
app.post("/upload-base64", (req, res) => {
  try {
    const { image, name, rollno, direction } = req.body;

    if (!image || !name || !rollno) {
      return res.status(400).json({ status: "error", message: "Missing data" });
    }

    // Student folder
    const folderName = `${rollno}_${name.replace(/\s+/g, "_")}`;
    const studentDir = path.join(UPLOADS, folderName);

    if (!fs.existsSync(studentDir)) {
      fs.mkdirSync(studentDir, { recursive: true });
    }

    // Remove base64 header (png / jpg / jpeg)
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    // File name
    const fileName = `${Date.now()}_${direction || "image"}.png`;
    const filePath = path.join(studentDir, fileName);

    // Save image
    fs.writeFileSync(filePath, base64Data, "base64");

    // Save FRONT image separately
    if (direction === "Front") {
      const frontPath = path.join(FRONT_DIR, `${folderName}.png`);
      fs.writeFileSync(frontPath, base64Data, "base64");
    }

    console.log("Image saved:", filePath);

    res.json({
      status: "success",
      saved: fileName,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ---------------- SERVER ----------------
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});

