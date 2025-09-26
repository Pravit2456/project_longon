import express from "express";
import db from "../db.js"; // connection mysql2/promise
import authenticate from "./authenticate.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// ===== Multer config =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    if (!req.user) return cb(new Error("ไม่ได้รับอนุญาต"), null);
    const ext = path.extname(file.originalname);
    cb(null, `profile_${req.user.id}${ext}`);
  },
});
const upload = multer({ storage });

// ===== GET profile =====
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const [results] = await db.execute(
      `SELECT u.username, u.email,
              up.first_name, up.last_name,
              up.phone, up.address, up.profile_image, up.role,
              up.unit_temp, up.unit_humidity,
              up.max_temp_alert, up.min_humidity_alert,
              up.language, up.notification_method,
              up.birthday, up.emailNotification, up.smsNotification,
              up.newProduct, up.marketing, up.partner
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.id = ?`,
      [userId]
    );

    if (results.length === 0) return res.status(404).json({ error: "ไม่พบผู้ใช้" });
    res.json(results[0]);
  } catch (err) {
    console.error("GET /profile2 failed:", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์" });
  }
});

// ===== PUT update profile =====
router.put(
  "/",
  authenticate,
  upload.single("profileImage"), // multer middleware
  async (req, res) => {
    try {
      const userId = req.user.id;
      const body = req.body;

      const profileImage = req.file ? req.file.filename : null;

      // ฟังก์ชันช่วยแปลงค่า boolean/number
      const parseBool = (val) => val === "true" || val === true || val === 1 || val === "1";
      const parseNum = (val) => (val ? Number(val) : null);

      const first_name = body.first_name || "";
      const last_name = body.last_name || "";
      const phone = body.phone || null;
      const address = body.address || null;
      const role = body.role || "user";
      const unit_temp = body.unit_temp || "C";
      const unit_humidity = body.unit_humidity || "%";
      const max_temp_alert = parseNum(body.max_temp_alert);
      const min_humidity_alert = parseNum(body.min_humidity_alert);
      const language = body.language || "th";
      const notification_method = body.notification_method || "email";
      const birthday = body.birthday || null;
      const emailNotification = parseBool(body.emailNotification);
      const smsNotification = parseBool(body.smsNotification);
      const newProduct = parseBool(body.newProduct);
      const marketing = parseBool(body.marketing);
      const partner = parseBool(body.partner);

      // ถ้า profileImage เป็น null ให้ไม่อัปเดตรูป
      const imageUpdateQuery = profileImage ? ", profile_image=VALUES(profile_image)" : "";

      await db.execute(
        `INSERT INTO user_profiles (
          user_id, first_name, last_name, phone, address, profile_image, role,
          unit_temp, unit_humidity, max_temp_alert, min_humidity_alert,
          language, notification_method, birthday,
          emailNotification, smsNotification, newProduct, marketing, partner
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          first_name=VALUES(first_name),
          last_name=VALUES(last_name),
          phone=VALUES(phone),
          address=VALUES(address)
          ${profileImage ? ", profile_image=VALUES(profile_image)" : ""},
          role=VALUES(role),
          unit_temp=VALUES(unit_temp),
          unit_humidity=VALUES(unit_humidity),
          max_temp_alert=VALUES(max_temp_alert),
          min_humidity_alert=VALUES(min_humidity_alert),
          language=VALUES(language),
          notification_method=VALUES(notification_method),
          birthday=VALUES(birthday),
          emailNotification=VALUES(emailNotification),
          smsNotification=VALUES(smsNotification),
          newProduct=VALUES(newProduct),
          marketing=VALUES(marketing),
          partner=VALUES(partner)`,
        [
          userId,
          first_name,
          last_name,
          phone,
          address,
          profileImage || null,
          role,
          unit_temp,
          unit_humidity,
          max_temp_alert,
          min_humidity_alert,
          language,
          notification_method,
          birthday,
          emailNotification,
          smsNotification,
          newProduct,
          marketing,
          partner,
        ]
      );

      // ดึงข้อมูลล่าสุด
      const [results] = await db.execute(
        `SELECT u.username, u.email,
                up.first_name, up.last_name,
                up.phone, up.address, up.profile_image, up.role,
                up.unit_temp, up.unit_humidity,
                up.max_temp_alert, up.min_humidity_alert,
                up.language, up.notification_method,
                up.birthday, up.emailNotification, up.smsNotification,
                up.newProduct, up.marketing, up.partner
         FROM users u
         LEFT JOIN user_profiles up ON u.id = up.user_id
         WHERE u.id = ?`,
        [userId]
      );

      res.json({ message: "อัปเดตโปรไฟล์สำเร็จ", profile: results[0] });
    } catch (error) {
      console.error("PUT /profile2 failed:", error);
      res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์" });
    }
  }
);

export default router;
