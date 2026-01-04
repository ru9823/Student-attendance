const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: "15mb" }));

// ---------------- FOLDERS ----------------
const UPLOADS = path.join(__dirname, "uploads");
const TEMP = path.join(__dirname, "temp");

if (!fs.existsSync(UPLOADS)) fs.mkdirSync(UPLOADS);
if (!fs.existsSync(TEMP)) fs.mkdirSync(TEMP);

// ---------------- API ----------------
app.post("/upload-base64", async (req, res) => {
  try {
    const { image, name, rollno, index } = req.body;

    if (!image || !name || !rollno) {
      return res.status(400).json({ status: "error", message: "Missing data" });
    }

    // student folder
    const folderName = `${rollno}_${name.replace(/\s+/g, "_")}`;
    const studentDir = path.join(UPLOADS, folderName);
    if (!fs.existsSync(studentDir)) fs.mkdirSync(studentDir, { recursive: true });

    // ---------- TEMP RAW IMAGE ----------
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const tempInput = path.join(TEMP, `${Date.now()}_raw.png`);
    fs.writeFileSync(tempInput, base64Data, "base64");

    // ---------- FINAL FACE IMAGE ----------
    const outputPath = path.join(studentDir, `${index + 1}.jpg`);

    // call python face crop script
    exec(
      `python process_face.py "${tempInput}" "${outputPath}"`,
      (error) => {
        fs.unlinkSync(tempInput); // delete temp file

        if (error) {
          console.error(error);
          return res.status(500).json({
            status: "error",
            message: "Face not detected",
          });
        }

        console.log("Saved face image:", outputPath);
        res.json({ status: "success", saved: outputPath });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ---------------- SERVER ----------------
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
