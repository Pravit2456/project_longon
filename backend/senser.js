import express from "express";
import fetch from "node-fetch";
const router = express.Router();

router.get("/latest", async (req, res) => {
  try {
    const response = await fetch("THINGSPEAK_API_URL");
    const data = await response.json();
    res.json({
      temperature: data.field1,
      humidity: data.field2,
      pm25: data.field3,
      timestamp: data.created_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Cannot fetch sensor data" });
  }
});

export default router;
