import express from "express";
import db from "../db.js"; // สมมติ db เป็น mysql2/promise connection pool

const router = express.Router();

// GET กิจกรรมทั้งหมด
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM calendar_events");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลกิจกรรม" });
  }
});

// GET กิจกรรมของ user ตาม userId
router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const [rows] = await db.query("SELECT * FROM calendar_events WHERE user_id = ?", [userId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลกิจกรรมของผู้ใช้" });
  }
});

// POST เพิ่มกิจกรรมใหม่
router.post("/", async (req, res) => {
  const { user_id, title, activity_date } = req.body;
  if (!user_id || !title || !activity_date) {
    return res.status(400).json({ message: "ข้อมูลไม่ครบ" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO calendar_events (user_id, title, activity_date) VALUES (?, ?, ?)",
      [user_id, title, activity_date]
    );
    // result.insertId เป็น id ของแถวที่เพิ่ม
    res.status(201).json({ message: "บันทึกสำเร็จ", insertId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มกิจกรรม" });
  }
});

export default router;
