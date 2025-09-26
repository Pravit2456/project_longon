// routes/providerCalendar.ts
import express from "express";
import db from "../db.js"; // mysql2/promise connection pool

const router = express.Router();

// GET กิจกรรมทั้งหมดของผู้ให้บริการ
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM provider_calendar_events");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลกิจกรรม" });
  }
});

// GET กิจกรรมของ provider ตาม providerId
router.get("/:providerId", async (req, res) => {
  const providerId = req.params.providerId;
  try {
    const [rows] = await db.query(
      "SELECT * FROM provider_calendar_events WHERE provider_id = ?",
      [providerId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลกิจกรรมของผู้ให้บริการ" });
  }
});

// POST เพิ่มกิจกรรมใหม่
router.post("/", async (req, res) => {
  const { provider_id, title, activity_date } = req.body;
  if (!provider_id || !title || !activity_date) {
    return res.status(400).json({ message: "ข้อมูลไม่ครบ" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO provider_calendar_events (provider_id, title, activity_date) VALUES (?, ?, ?)",
      [provider_id, title, activity_date]
    );

    res.status(201).json({ message: "บันทึกสำเร็จ", insertId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มกิจกรรม" });
  }
});

export default router;
