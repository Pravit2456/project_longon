import express from "express";
import db from "../db.js";
import authenticate from "./authenticate.js";

const router = express.Router();

// POST /api/fertilizer — เพิ่มข้อมูลปุ๋ย
router.post("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { fertilizer_type, amount, date, note } = req.body;

    if (!fertilizer_type || !amount || !date) {
      return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    await db.execute(
      `INSERT INTO fertilizer_logs (user_id, fertilizer_type, amount, date, note)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, fertilizer_type, amount, date, note || null]
    );

    res.json({ message: "บันทึกข้อมูลเรียบร้อย" });
  } catch (error) {
    console.error("Error inserting fertilizer log:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
  }
});

// GET /api/fertilizer — ดึงข้อมูลประวัติ
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.execute(
      `SELECT id, fertilizer_type, amount, date, note, created_at
       FROM fertilizer_logs
       WHERE user_id = ?
       ORDER BY date DESC`,
      [userId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error fetching fertilizer logs:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
});

// PUT /api/fertilizer/:id — แก้ไขข้อมูลปุ๋ย
router.put("/:id", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;
    const { fertilizer_type, amount, date, note } = req.body;

    if (!fertilizer_type || !amount || !date) {
      return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    const [result] = await db.execute(
      `UPDATE fertilizer_logs
       SET fertilizer_type = ?, amount = ?, date = ?, note = ?
       WHERE id = ? AND user_id = ?`,
      [fertilizer_type, amount, date, note || null, id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "ไม่พบข้อมูลที่จะแก้ไข" });
    }

    res.json({ message: "แก้ไขข้อมูลเรียบร้อย" });
  } catch (error) {
    console.error("Error updating fertilizer log:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการแก้ไขข้อมูล" });
  }
});

// DELETE /api/fertilizer/:id — ลบข้อมูลปุ๋ย
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;

    const [result] = await db.execute(
      `DELETE FROM fertilizer_logs WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "ไม่พบข้อมูลที่จะแก้ไข" });
    }

    res.json({ message: "ลบข้อมูลเรียบร้อย" });
  } catch (error) {
    console.error("Error deleting fertilizer log:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบข้อมูล" });
  }
});

export default router;
