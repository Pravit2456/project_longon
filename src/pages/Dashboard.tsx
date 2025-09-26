import { useEffect, useState } from "react";

type SensorData = {
  temperature: string;
  humidity: string;
  pm25: string;
  timestamp: string;
};

export default function DashboardData() {
  const [data, setData] = useState<SensorData>({
    temperature: "--",
    humidity: "--",
    pm25: "--",
    timestamp: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/sensor/latest");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch sensor data:", err);
      }
    };

    fetchData();

    // อัปเดตทุก 1 นาที
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded shadow text-center">
        <p className="text-sm text-gray-600">อุณหภูมิ</p>
        <p className="text-2xl font-semibold">{data.temperature}°C</p>
      </div>
      <div className="bg-white p-4 rounded shadow text-center">
        <p className="text-sm text-gray-600">ความชื้น</p>
        <p className="text-2xl font-semibold">{data.humidity}%</p>
      </div>
      <div className="bg-white p-4 rounded shadow text-center">
        <p className="text-sm text-gray-600">PM2.5</p>
        <p className="text-2xl font-semibold">{data.pm25}</p>
      </div>
    </div>
  );
}
