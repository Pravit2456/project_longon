import { FiFilter, FiPlus, FiTrash2, FiMapPin, FiLayers, FiDroplet } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

/* ========= Types ========= */
interface Plot {
  id: number;
  user_id: number;
  name: string;
  location: string;
  size: string;       // รองรับทั้ง "3" หรือ "3 ไร่"
  moisture: string;   // "45" หรือ "45%"
  tree_health: string;
  fertilizer: string; // "30" หรือ "30%"
  status: string;     // ไม่ใช้แล้ว แต่คง type ไว้
  updated: string;
  color: string;      // ใช้ทำแถบสีซ้ายการ์ด
}

type SensorData = {
  temperature: string;
  humidity: string;
  pm25: string;
  timestamp: string;
};

export default function PlotPage() {
  const navigate = useNavigate();

  /* ====== แปลง ====== */
  const [plots, setPlots] = useState<Plot[]>([]);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("deletedPlots");
    if (saved) setDeletedIds(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const fetchPlots = async () => {
      try {
        const res = await axios.get<Plot[]>("http://localhost:3000/api/plots", {
          withCredentials: true,
        });
        setPlots(res.data.filter((plot) => !deletedIds.includes(plot.id)));
      } catch (err) {
        console.error("Error fetching plots:", err);
      }
    };
    fetchPlots();
  }, [deletedIds]);

  const handleDelete = (id: number) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบแปลงนี้?")) return;
    setPlots((prev) => prev.filter((plot) => plot.id !== id));
    const updatedDeleted = [...deletedIds, id];
    setDeletedIds(updatedDeleted);
    localStorage.setItem("deletedPlots", JSON.stringify(updatedDeleted));
  };

  /* ====== Summary ====== */
  const totalPlots = plots.length;

  const totalAreaRai = useMemo(() => {
    return plots.reduce((sum, p) => {
      const n = parseFloat((p.size || "").toString().replace(/[^0-9.]/g, ""));
      return sum + (isNaN(n) ? 0 : n);
    }, 0);
  }, [plots]);

  const avgMoisture = useMemo(() => {
    if (plots.length === 0) return 0;
    const s = plots.reduce((sum, p) => {
      const n = parseFloat((p.moisture || "").toString().replace(/[^0-9.]/g, ""));
      return sum + (isNaN(n) ? 0 : n);
    }, 0);
    return s / plots.length;
  }, [plots]);

  /* ====== Sensor ====== */
  const [sensor, setSensor] = useState<SensorData>({
    temperature: "--",
    humidity: "--",
    pm25: "--",
    timestamp: "",
  });
  const [sensorErr, setSensorErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/sensor/latest");
        const json = await res.json();
        if (!alive) return;
        setSensor(json);
        setSensorErr(null);
      } catch (err) {
        console.error("Failed to fetch sensor data:", err);
        if (!alive) return;
        setSensorErr("ดึงข้อมูลเซนเซอร์ไม่สำเร็จ");
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60_000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F3EE] text-gray-800 font-sans font-semibold">
      <main className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-green-900">แปลงลำไยของฉัน</h2>
          <button
            onClick={() => navigate("/addnewplot")}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 active:scale-[0.99] transition"
          >
            <FiPlus /> เพิ่มแปลงใหม่
          </button>
        </div>

        {/* Sensor Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-green-200 text-center">
            <p className="text-xs text-gray-500">อุณหภูมิ</p>
            <p className="mt-1 text-3xl font-extrabold text-green-700">{sensor.temperature}°C</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-green-200 text-center">
            <p className="text-xs text-gray-500">ความชื้น</p>
            <p className="mt-1 text-3xl font-extrabold text-green-700">{sensor.humidity}%</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-green-200 text-center">
            <p className="text-xs text-gray-500">PM2.5</p>
            <p className="mt-1 text-3xl font-extrabold text-green-700">{sensor.pm25}</p>
          </div>
        </div>
        <div className="mb-6 flex justify-end">
          {sensorErr ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-rose-50 text-rose-600 border border-rose-200">
              {sensorErr}
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
              อัปเดตล่าสุด: {sensor.timestamp ? new Date(sensor.timestamp).toLocaleString("th-TH") : "—"}
            </span>
          )}
        </div>

        {/* Filter Bar (ตำแหน่งแปลง) */}
        <div className="bg-white border-2 border-emerald-500/60 rounded-xl p-4 shadow-sm mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-700">
                <FiMapPin />
              </span>
              <select className="border rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option>ตำแหน่ง</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-700">
                <FiLayers />
              </span>
              <select className="border rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option>เรียงตาม</option>
                <option>อัปเดตล่าสุด</option>
                <option>เรียงตามชื่อ</option>
              </select>
            </div>

            <button className="ml-auto md:ml-0 inline-flex items-center gap-2 border border-emerald-400 text-emerald-700 px-4 py-2 rounded-lg text-sm bg-emerald-50 hover:bg-emerald-100 transition">
              <FiFilter /> กรอง
            </button>
          </div>
        </div>

        {/* Summary Bar: ใต้ตำแหน่งแปลง + กรอบเขียว + ไอคอน */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl p-4 bg-white shadow-sm border-2 border-emerald-500/70">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <FiLayers />
              </span>
              จำนวนแปลงทั้งหมด
            </div>
            <div className="text-3xl font-extrabold text-emerald-700 tracking-tight">
              {totalPlots.toLocaleString()} <span className="text-base font-semibold">แปลง</span>
            </div>
          </div>

          <div className="rounded-xl p-4 bg-white shadow-sm border-2 border-emerald-500/70">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <FiMapPin />
              </span>
              พื้นที่รวม
            </div>
            <div className="text-3xl font-extrabold text-emerald-700 tracking-tight">
              {totalAreaRai.toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
              <span className="text-base font-semibold">ไร่</span>
            </div>
          </div>

          <div className="rounded-xl p-4 bg-white shadow-sm border-2 border-emerald-500/70">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <FiDroplet />
              </span>
              ความชื้นเฉลี่ย
            </div>
            <div className="text-3xl font-extrabold text-emerald-700 tracking-tight">
              {avgMoisture.toLocaleString(undefined, { maximumFractionDigits: 1 })}%
            </div>
          </div>
        </div>

        {/* Plot Cards */}
        {plots.length === 0 ? (
          <div className="bg-white border border-dashed border-emerald-400 rounded-xl p-10 text-center text-emerald-700">
            ยังไม่มีแปลงที่จะแสดง
            <div className="mt-3">
              <button
                onClick={() => navigate("/addnewplot")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700 transition"
              >
                <FiPlus /> เพิ่มแปลงแรกของคุณ
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plots.map((plot) => {
              const leftStripe = (plot.color || "#10B981"); // emerald-500 fallback
              const sizeText = `${(plot.size || "").toString().replace(/\s*ไร่$/,"")} ไร่`;
              const moistureText = `${(plot.moisture || "").toString().replace(/\s*%$/,"")}%`;
              const fertText = `${(plot.fertilizer || "").toString().replace(/\s*%$/,"")}%`;

              return (
                <div
                  key={plot.id}
                  className="relative rounded-xl shadow-sm bg-white border hover:shadow-md transition"
                  style={{ borderLeft: `8px solid ${leftStripe}` }}
                >
                  {/* ปุ่มลบ */}
                  <button
                    onClick={() => handleDelete(plot.id)}
                    className="absolute top-3 right-3 text-red-500/80 hover:text-red-600"
                    title="ลบแปลงนี้"
                  >
                    <FiTrash2 />
                  </button>

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-lg text-gray-900 leading-tight">{plot.name}</h3>
                    </div>

                    <p className="inline-flex items-center gap-1 text-xs text-gray-600 mb-2">
                      <FiMapPin /> {plot.location}
                    </p>

                    <div className="grid grid-cols-3 gap-2 mt-3 mb-4 text-sm">
                      <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 px-3 py-2 text-emerald-800">
                        <div className="text-[11px] text-emerald-600">ขนาด</div>
                        <div className="font-bold">{sizeText}</div>
                      </div>
                      <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 px-3 py-2 text-emerald-800">
                        <div className="text-[11px] text-emerald-600">ความชื้น</div>
                        <div className="font-bold">{moistureText}</div>
                      </div>
                      <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 px-3 py-2 text-emerald-800">
                        <div className="text-[11px] text-emerald-600">ปุ๋ย</div>
                        <div className="font-bold">{fertText}</div>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-400 text-right">
                      อัปเดตล่าสุด: {new Date(plot.updated).toLocaleString("th-TH")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
