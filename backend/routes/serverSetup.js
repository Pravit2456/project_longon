import express from "express";
import multer from "multer";
import path from "path";

let pool; // <-- เก็บ db pool จาก server.js
export function setDBPool(p) {
  pool = p;
}

const router = express.Router();

// ------------------- Multer setup -------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // ต้องมี folder uploads/ ในโปรเจกต์
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // จำกัด 5MB ต่อไฟล์
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("เฉพาะไฟล์ JPG/PNG เท่านั้น"));
  },
});

// ------------------- POST /api/server-setup -------------------
router.post(
  "/server-setup",
  upload.fields([
    { name: "photo1", maxCount: 1 },
    { name: "idCard", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (!pool) throw new Error("DB Pool ยังไม่ถูกตั้งค่า");

      const { model, capacity, accuracy, cycleMins, speed } = req.body;

      if (!model || !capacity || !accuracy || !cycleMins || !speed) {
        return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบทุกช่อง" });
      }

      const photo1Path = req.files?.photo1
        ? `/uploads/${req.files.photo1[0].filename}`
        : null;
      const idCardPath = req.files?.idCard
        ? `/uploads/${req.files.idCard[0].filename}`
        : null;

      // บันทึกลง MySQL
      const [result] = await pool.query(
        `INSERT INTO server_setup 
          (model, capacity, accuracy, cycle_mins, speed, photo1, id_card) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [model, capacity, accuracy, cycleMins, speed, photo1Path, idCardPath]
      );

      res.json({ message: "บันทึกข้อมูลสำเร็จ", id: result.insertId });
    } catch (err) {
      console.error("❌ ServerSetup Error:", err);
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
    }
  }
);

// ------------------- GET /api/server-setup -------------------
// เพิ่มเพื่อดึงข้อมูลทั้งหมด
router.get("/server-setup", async (req, res) => {
  try {
    if (!pool) throw new Error("DB Pool ยังไม่ถูกตั้งค่า");
    const [rows] = await pool.query("SELECT * FROM server_setup ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("❌ ServerSetup GET Error:", err);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลได้" });
  }
});

export default router;
