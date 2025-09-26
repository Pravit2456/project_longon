// server.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mysql from "mysql2/promise";

import userRoutes from "./routes/users.js";
import profileRoutes from "./routes/profile.js";
import profile2Router from "./routes/profile2.js";
import calendarRoutes from "./routes/calendar.js";
import fertilizerRoutes from "./routes/fertilizer.js";
import providerCalendarRouter from "./routes/ProviderCalendar.js";
import plotsRoutes, { setDBPool as setPlotsDBPool } from "./routes/plotpage.js";
import authenticate from "./routes/authenticate.js";
import serverSetupRoutes, { setDBPool as setServerSetupDBPool } from "./routes/serverSetup.js";

const app = express();

// ===== Middleware =====
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// ===== DB Pool =====
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "1234",
  database: "admin",
  waitForConnections: true,
  connectionLimit: 10,
};

let pool;

// ===== Init DB =====
async function initDB() {
  try {
    pool = await mysql.createPool(dbConfig);
    console.log("✅ Database pool created");

    // ส่ง pool ไปให้ router
    setPlotsDBPool(pool);
    setServerSetupDBPool(pool);
  } catch (err) {
    console.error("❌ DB Connection Error:", err);
    process.exit(1);
  }
}

// เรียก initDB ก่อนเริ่ม server
await initDB();

// ===== Logger middleware =====
app.use((req, res, next) => {
  console.log(`🌐 [${req.method}] ${req.originalUrl} - From: ${req.ip}`);
  next();
});

// ===== Routes =====
app.use("/api/plots", plotsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", authenticate, profileRoutes);
app.use("/api/profile2", profile2Router);
app.use("/api/calendar", authenticate, calendarRoutes);
app.use("/api/fertilizer", authenticate, fertilizerRoutes);
app.use("/api/provider-calendar", providerCalendarRouter);
app.use("/api/serverSetup", serverSetupRoutes);

// ===== Sensor latest route =====
app.get("/api/sensor/latest", async (req, res) => {
  try {
    const THINGSPEAK_API_URL =
      "https://api.thingspeak.com/channels/3032431/feeds.json?api_key=83GPY0UD7O1C1S6W&results=1";
    const response = await fetch(THINGSPEAK_API_URL);
    const json = await response.json();
    const latest = json.feeds[0];

    res.json({
      temperature: latest.field1 ?? "--",
      humidity: latest.field2 ?? "--",
      pm25: latest.field3 ?? "--",
      timestamp: latest.created_at ?? "",
    });
  } catch (err) {
    console.error("❌ Failed to fetch sensor data:", err);
    res.status(500).json({ error: "Cannot fetch sensor data" });
  }
});

// ===== 404 handler =====
app.use((req, res) => {
  res.status(404).json({ message: "ไม่พบเส้นทางที่เรียกใช้งาน" });
});

// ===== Error handler =====
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack || err);
  res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
});

// ===== Start server =====
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
