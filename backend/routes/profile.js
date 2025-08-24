import express from "express";
import db from "../db.js"; // สมมุติ db เป็น mysql2/promise connection pool
import authenticate from "./authenticate.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// ตั้งค่า multer สำหรับเก็บไฟล์ในโฟลเดอร์ uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    console.log("multer filename middleware - req.user:", req.user);
    if (!req.user) {
      const err = new Error("Unauthorized: no user in request");
      console.error(err);
      return cb(err, null);
    }
    const ext = path.extname(file.originalname);
    cb(null, `profile_${req.user.id}${ext}`);
  },
});
const upload = multer({ storage });

// ดึงข้อมูล profile (เพิ่มฟิลด์ใหม่)
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const sql = `
      SELECT u.username, u.email,
             up.phone, up.address, up.profile_image, up.role,
             up.unit_temp, up.unit_humidity,
             up.max_temp_alert, up.min_humidity_alert,
             up.language, up.notification_method
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = ?
    `;
    const [results] = await db.execute(sql, [userId]);
    if (results.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(results[0]);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// อัปเดต profile พร้อมอัปโหลดรูปภาพ (รองรับฟิลด์ใหม่)
router.put("/", authenticate, (req, res, next) => {
  upload.single("profileImage")(req, res, (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log("PUT /api/profile - req.body:", req.body);
    console.log("PUT /api/profile - req.file:", req.file);

    const userId = req.user.id;
    const {
      username,
      email,
      phone,
      address,
      role,
      unit_temp,
      unit_humidity,
      max_temp_alert,
      min_humidity_alert,
      language,
      notification_method
    } = req.body;

    if (!username || !email) {
      return res.status(400).json({ error: "กรุณากรอก username และ email ให้ครบ" });
    }

    let profileImageFilename = req.file ? req.file.filename : null;

    // อัปเดต users table
    try {
      await db.execute("UPDATE users SET username = ?, email = ? WHERE id = ?", [username, email, userId]);
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "อีเมลนี้ถูกใช้งานแล้ว" });
      }
      console.error("Update user failed:", err);
      return res.status(500).json({ error: "Update user failed" });
    }

    // อัปเดต user_profiles table (รวมฟิลด์ใหม่)
    try {
      await db.execute(
        `INSERT INTO user_profiles (
           user_id, phone, address, profile_image, role,
           unit_temp, unit_humidity, max_temp_alert, min_humidity_alert,
           language, notification_method
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           phone = VALUES(phone),
           address = VALUES(address),
           profile_image = VALUES(profile_image),
           role = VALUES(role),
           unit_temp = VALUES(unit_temp),
           unit_humidity = VALUES(unit_humidity),
           max_temp_alert = VALUES(max_temp_alert),
           min_humidity_alert = VALUES(min_humidity_alert),
           language = VALUES(language),
           notification_method = VALUES(notification_method)
        `,
        [
          userId, phone, address, profileImageFilename, role || "user",
          unit_temp, unit_humidity, max_temp_alert, min_humidity_alert,
          language, notification_method
        ]
      );

      // ดึงข้อมูลล่าสุดกลับไปให้ frontend
      const [results] = await db.execute(
        `SELECT u.username, u.email,
                up.phone, up.address, up.profile_image, up.role,
                up.unit_temp, up.unit_humidity,
                up.max_temp_alert, up.min_humidity_alert,
                up.language, up.notification_method
         FROM users u
         LEFT JOIN user_profiles up ON u.id = up.user_id
         WHERE u.id = ?`,
        [userId]
      );

      res.json({ message: "Profile updated successfully", profile: results[0] });
    } catch (err) {
      console.error("Update profile failed:", err);
      res.status(500).json({ error: "Update profile failed" });
    }
  } catch (error) {
    console.error("Unexpected error in PUT /api/profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
