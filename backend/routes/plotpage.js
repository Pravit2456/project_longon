import express from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";

const plotsRouter = express.Router();

let pool; // ตัวแปรเก็บ pool จากภายนอก

export function setDBPool(dbPool) {
  pool = dbPool;
}

function authenticateToken(req, res, next) {
  if (!req.cookies) {
    console.error("No cookies found in request");
    return res.status(401).json({ message: "Unauthorized - no cookies" });
  }

  const token = req.cookies.token;
  console.log("Token from cookie:", token);

  if (!token) {
    console.error("No token cookie found");
    return res.status(401).json({ message: "Unauthorized - no token" });
  }

  try {
    const user = jwt.verify(token, process.env.SECRET_KEY || "your-secret-key");
    console.log("Decoded JWT payload:", user);
    if (!user || !user.id) {
      console.error("Invalid token payload:", user);
      return res.status(403).json({ message: "Forbidden - invalid token payload" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("JWT verify error:", err);
    return res.status(403).json({ message: "Forbidden - token verification failed" });
  }
}

// Middleware สำหรับ validate input POST และ PUT
const validatePlot = [
  body("name").trim().notEmpty().withMessage("ชื่อแปลงต้องไม่ว่าง"),
  body("location").trim().notEmpty().withMessage("สถานที่ต้องไม่ว่าง"),
  body("size").trim().notEmpty().withMessage("ขนาดต้องไม่ว่าง"),
  body("moisture").trim().notEmpty().withMessage("ความชื้นต้องไม่ว่าง"),
  body("treeHealth").trim().notEmpty().withMessage("สุขภาพต้นไม้ต้องไม่ว่าง"),
  body("fertilizer").trim().notEmpty().withMessage("ปริมาณปุ๋ยต้องไม่ว่าง"),
  body("status").isIn(["ปกติ", "เฝ้าระวัง"]).withMessage("สถานะต้องเป็น 'ปกติ' หรือ 'เฝ้าระวัง'"),
  body("updated").trim().notEmpty().withMessage("วันที่อัปเดตต้องไม่ว่าง"),
  body("color").isIn(["green", "orange"]).withMessage("สีต้องเป็น 'green' หรือ 'orange'"),
];

// Middleware ตรวจสอบผล validation
function checkValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

plotsRouter.use(authenticateToken);

// GET แปลงของ user
plotsRouter.get("/", async (req, res) => {
  if (!pool) {
    console.error("Database pool not initialized");
    return res.status(500).json({ message: "DB not initialized" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM plots WHERE user_id = ?", [req.user.id]);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching plots:", error);
    res.status(500).json({ message: "Error fetching plots", error: error.message });
  }
});

// POST เพิ่มแปลงใหม่ พร้อม validate input
plotsRouter.post("/", validatePlot, checkValidation, async (req, res) => {
  if (!pool) {
    console.error("Database pool not initialized");
    return res.status(500).json({ message: "DB not initialized" });
  }

  const { name, location, size, moisture, treeHealth, fertilizer, status, updated, color } = req.body;

  try {
    await pool.query(
      `INSERT INTO plots 
      (user_id, name, location, size, moisture, tree_health, fertilizer, status, updated, color) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, name, location, size, moisture, treeHealth, fertilizer, status, updated, color]
    );
    res.status(201).json({ message: "Plot added" });
  } catch (error) {
    console.error("Error adding plot:", error);
    res.status(500).json({ message: "Error adding plot", error: error.message });
  }
});

// PUT อัปเดตแปลง พร้อม validate input
plotsRouter.put("/:id", validatePlot, checkValidation, async (req, res) => {
  if (!pool) {
    console.error("Database pool not initialized");
    return res.status(500).json({ message: "DB not initialized" });
  }

  const plotId = req.params.id;
  const { name, location, size, moisture, treeHealth, fertilizer, status, updated, color } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM plots WHERE id = ? AND user_id = ?", [plotId, req.user.id]);
    if (rows.length === 0) {
      console.warn(`Plot not found: id=${plotId}, user_id=${req.user.id}`);
      return res.status(404).json({ message: "Plot not found" });
    }

    await pool.query(
      `UPDATE plots SET 
      name=?, location=?, size=?, moisture=?, tree_health=?, fertilizer=?, status=?, updated=?, color=? 
      WHERE id=?`,
      [name, location, size, moisture, treeHealth, fertilizer, status, updated, color, plotId]
    );
    res.json({ message: "Plot updated" });
  } catch (error) {
    console.error("Error updating plot:", error);
    res.status(500).json({ message: "Error updating plot", error: error.message });
  }
});

// DELETE ลบแปลง
plotsRouter.delete("/:id", async (req, res) => {
  if (!pool) {
    console.error("Database pool not initialized");
    return res.status(500).json({ message: "DB not initialized" });
  }

  const plotId = req.params.id;

  try {
    const [rows] = await pool.query("SELECT * FROM plots WHERE id = ? AND user_id = ?", [plotId, req.user.id]);
    if (rows.length === 0) {
      console.warn(`Plot not found: id=${plotId}, user_id=${req.user.id}`);
      return res.status(404).json({ message: "Plot not found" });
    }

    const [result] = await pool.query("DELETE FROM plots WHERE id = ?", [plotId]);
    if (result.affectedRows === 0) {
      console.error("Delete operation did not affect any rows");
      return res.status(500).json({ message: "Failed to delete plot" });
    }

    res.json({ message: "Plot deleted" });
  } catch (error) {
    console.error("Error deleting plot:", error);
    res.status(500).json({ message: "Error deleting plot", error: error.message });
  }
});

export default plotsRouter;
