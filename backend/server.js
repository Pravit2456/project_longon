import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/users.js";
import profileRoutes from "./routes/profile.js";
import calendarRoutes from "./routes/calendar.js";
import authenticate from "./routes/authenticate.js";
import fertilizerRoutes from "./routes/fertilizer.js";

import plotsRoutes, { setDBPool } from "./routes/plotpage.js";  // ต้อง export setDBPool จาก plotpage.js

import mysql from "mysql2/promise";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "1234",
  database: "dss_longan",
};

let pool;
async function initDB() {
  try {
    pool = await mysql.createPool(dbConfig);
    console.log("✅ Database pool created");

    // ส่ง pool ไปให้ plotpage.js ใช้
    setDBPool(pool);
  } catch (err) {
    console.error("❌ DB Connection Error:", err);
    process.exit(1);
  }
}

await initDB();  // รอให้ DB พร้อมก่อนให้ server เริ่มทำงาน

// Routes
app.use("/api/plots", plotsRoutes);

app.use("/api/fertilizer", (req, res, next) => {
  console.log(`🌱 [${req.method}] ${req.originalUrl} - From: ${req.ip}`);
  next();
}, authenticate, fertilizerRoutes);

app.use("/uploads", express.static("uploads"));

app.use("/api/users", (req, res, next) => {
  console.log(`📡 [${req.method}] ${req.originalUrl} - From: ${req.ip}`);
  next();
}, userRoutes);

app.use("/api/profile", (req, res, next) => {
  console.log(`👤 [${req.method}] ${req.originalUrl} - From: ${req.ip}`);
  next();
}, authenticate, profileRoutes);

app.use("/api/calendar", (req, res, next) => {
  console.log(`📅 [${req.method}] ${req.originalUrl}`);
  next();
}, authenticate, calendarRoutes);

// Not Found
app.use((req, res) => {
  res.status(404).json({ message: "ไม่พบเส้นทางที่เรียกใช้งาน" });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack || err);
  res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
