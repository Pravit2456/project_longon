import express from "express";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "1234",
  database: "admin",
};

const pool = mysql.createPool(dbConfig);
const JWT_SECRET = "your-secret-key"; // ควรใช้ process.env.JWT_SECRET จริงๆ

// Middleware: เช็ค Content-Type สำหรับ POST ที่เป็น application/json
router.use((req, res, next) => {
  if (
    req.method === "POST" &&
    req.headers["content-type"] &&
    !req.headers["content-type"].includes("application/json")
  ) {
    return res.status(400).json({ message: "Content-Type ต้องเป็น application/json" });
  }
  next();
});

// Middleware: ตรวจสอบ token และ decode user info
async function authenticate(req, res, next) {
  const token =
    req.cookies?.token ||
    (req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);
  if (!token) return res.status(401).json({ message: "ไม่มี token หรือ token หมดอายุ" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token ไม่ถูกต้องหรือหมดอายุ" });
  }
}

// REGISTER
router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body; // เพิ่ม role
  if (!username || !email || !password || !role) {
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

    await pool.execute(
      "INSERT INTO users (username, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())",
      [username, email, hashedPassword, role]
    );

    res.status(200).json({ message: "ลงทะเบียนสำเร็จ" });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "ไม่สามารถลงทะเบียนได้" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { username, email, password } = req.body;
  if ((!username && !email) || !password) {
    return res.status(400).json({ message: "กรุณากรอกชื่อผู้ใช้หรืออีเมลและรหัสผ่าน" });
  }

  try {
    const identifier = username || email;
    const field = username ? "username" : "email";

    const [users] = await pool.execute(
      `SELECT * FROM users WHERE ${field} = ?`,
      [identifier]
    );

    if (!users || users.length === 0) {
      return res.status(401).json({ message: "ไม่พบผู้ใช้" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });
    }

    // ใส่ role ลงใน token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000, // 1 ชั่วโมง
    });

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: "เข้าสู่ระบบสำเร็จ",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "ไม่สามารถเข้าสู่ระบบได้" });
  }
});

// GET current logged-in user info
router.get("/me", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.execute(
      "SELECT id, username, email, role FROM users WHERE id = ?",
      [userId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
});

export default router;
