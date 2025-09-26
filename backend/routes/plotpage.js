// src/routes/plotpage.js
import express from "express";
const router = express.Router();

let db; // จะถูกเซ็ตจาก server.js
export function setDBPool(pool) {
  db = pool;
}

// ====== POST /api/plots/add ======
router.post("/add", async (req, res) => {
  try {
    const {
      user_id,
      name,
      location,
      size,
      moisture,
      tree_health,
      fertilizer,
      status,
      updated,
      color,
    } = req.body;

    if (!user_id || !name) {
      return res.status(400).json({ success: false, message: "ข้อมูล user_id หรือ name ไม่ครบ" });
    }

    const validStatuses = ["ปกติ", "เฝ้าระวัง"];
    const plotStatus = validStatuses.includes(status) ? status : null;
    if (!plotStatus) {
      return res.status(400).json({ success: false, message: `status ต้องเป็น 'ปกติ' หรือ 'เฝ้าระวัง', ได้ '${status}'` });
    }

    let updatedDate;
    if (updated && !isNaN(Date.parse(updated))) {
      updatedDate = updated.slice(0, 10);
    } else if (!updated) {
      updatedDate = new Date().toISOString().slice(0, 10);
    } else {
      return res.status(400).json({ success: false, message: `วันที่ updated ไม่ถูกต้อง: '${updated}'` });
    }

    const sizeNum = Number(size);
    const moistureNum = Number(moisture);
    const treeNum = Number(tree_health);
    const fertilizerNum = Number(fertilizer);

    if ([sizeNum, moistureNum, treeNum, fertilizerNum].some(isNaN)) {
      return res.status(400).json({ success: false, message: "size, moisture, tree_health, fertilizer ต้องเป็นตัวเลข" });
    }

    const sql = `
      INSERT INTO plots
      (user_id, name, location, size, moisture, tree_health, fertilizer, status, updated, color)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      Number(user_id),
      name,
      location || "",
      sizeNum,
      moistureNum,
      treeNum,
      fertilizerNum,
      plotStatus,
      updatedDate,
      color || (plotStatus === "ปกติ" ? "green" : "orange"),
    ];

    await db.execute(sql, values);
    res.json({ success: true, message: "เพิ่มแปลงใหม่สำเร็จ!" });
  } catch (err) {
    console.error("DB Error (POST /add):", err);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการบันทึกลงฐานข้อมูล",
      error: err.message,
    });
  }
});

// ====== GET /api/plots ======
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM plots ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("DB Error (GET /):", err);
    res.status(500).json({
      success: false,
      message: "โหลดข้อมูลไม่สำเร็จ",
      error: err.message,
    });
  }
});

// ====== DELETE /api/plots/:id ======
// ====== DELETE /api/plots/:id ======
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("ลบแปลง id:", id);

    const [result] = await db.execute("DELETE FROM plots WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      // ❌ เดิม return res.status(404)...
      // ✅ แก้ให้ return success false แต่ไม่ส่ง error 404
      return res.json({ success: false, message: "ไม่พบแปลงนี้", id });
    }

    res.json({ success: true, message: "ลบแปลงสำเร็จ", id });
  } catch (err) {
    console.error("DB Error (DELETE /:id):", err);
    res.status(500).json({
      success: false,
      message: "ไม่สามารถลบข้อมูลได้",
      error: err.message,
    });
  }
});



export default router;
