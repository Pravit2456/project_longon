// backend/routes/users.js
import express from "express";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const router = express.Router();
router.use(express.json());
router.use(cookieParser());

// ===== DB Config =====
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "1234",
  database: "admin",
};
const pool = mysql.createPool(dbConfig);

// ===== JWT Secret =====
const JWT_SECRET = "your-secret-key";

// ===== Middleware ตรวจ token =====
export async function authenticate(req, res, next) {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      return res.status(401).json({ message: "ไม่มี token หรือ token หมดอายุ" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token ไม่ถูกต้องหรือหมดอายุ" });
  }
}

// ===== REGISTER =====
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ" });
  }

  try {
    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้แล้ว" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      "INSERT INTO users (username, email, password, created_at, role) VALUES (?, ?, ?, NOW(), 'farmer')",
      [username, email, hashedPassword]
    );

    return res.status(201).json({ message: "ลงทะเบียนสำเร็จ", userId: result.insertId });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ message: "ไม่สามารถลงทะเบียนได้" });
  }
});

// ===== LOGIN =====
router.post("/login", async (req, res) => {
  const { username, email, password } = req.body;

  if (!password || password.trim() === "" || (!username && !email)) {
    return res.status(400).json({ message: "กรุณากรอกชื่อผู้ใช้หรืออีเมล และรหัสผ่าน" });
  }

  try {
    let query = "";
    let params = [];

    if (username) {
      query = "SELECT * FROM users WHERE username = ?";
      params = [username];
    } else if (email) {
      query = "SELECT * FROM users WHERE email = ?";
      params = [email];
    }

    const [users] = await pool.execute(query, params);

    if (!users || users.length === 0) {
      return res.status(401).json({ message: "ไม่พบผู้ใช้" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // เขียน token ลง cookie (ฝั่ง client JS อ่านไม่ได้)
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      // secure: true, // เปิดเมื่อรันบน HTTPS
      maxAge: 60 * 60 * 1000,
    });

    // ส่งข้อมูล user (ไม่รวม password) + token ให้ client ด้วย (ถ้าจะใช้)
    const { password: _, ...userWithoutPassword } = user;
    return res
      .status(200)
      .json({ message: "เข้าสู่ระบบสำเร็จ", user: userWithoutPassword, token });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" });
  }
});

// ===== ME (ข้อมูลผู้ใช้ปัจจุบัน) =====
// ใช้สำหรับให้ Frontend ดึง "ความจริง" ทุกครั้ง (PrivateRoute จะเรียก endpoint นี้)
router.get("/me", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.execute(
      "SELECT id, username, email, role, created_at FROM users WHERE id = ?",
      [userId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("Me Error:", err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
});

// ===== PROFILE แบบเดิม (ถ้า Frontend ยังเรียก /profile2 อยู่) =====
router.get("/profile2", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.execute(
      `SELECT id, username, email, role, created_at
       FROM users
       WHERE id = ?`,
      [userId]
    );

    if (!rows || rows.length === 0) return res.status(404).json({ message: "ไม่พบผู้ใช้" });

    return res.json(rows[0]);
  } catch (err) {
    console.error("Get profile error:", err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
});

// ===== LOGOUT =====
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    // secure: true, // เปิดเมื่อรันบน HTTPS
  });
  return res.json({ message: "ออกจากระบบแล้ว" });
});

export default router;
