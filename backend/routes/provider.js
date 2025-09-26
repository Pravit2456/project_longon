const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

// ตั้งค่า multer สำหรับอัปโหลดไฟล์
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // โฟลเดอร์เก็บไฟล์
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// POST ลงทะเบียนผู้ให้บริการ
router.post(
  "/register",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "idCard", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { model, capacity, accuracy, cycleMins, speed } = req.body;

      const files = req.files;
      const photoPath = files.photo ? files.photo[0].path : "";
      const idCardPath = files.idCard ? files.idCard[0].path : "";

      // TODO: save data ลง database (MySQL/MongoDB/SQLite ฯลฯ)

      res.status(201).json({
        message: "ลงทะเบียนสำเร็จ",
        data: { model, capacity, accuracy, cycleMins, speed, photoPath, idCardPath },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  }
);

module.exports = router;
