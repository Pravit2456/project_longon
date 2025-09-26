import { FiFilter, FiPlus, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

interface Plot {
  id: number;
  user_id: number;
  name: string;
  location: string;
  size: string;        // ไร่ (string → parse เป็นตัวเลขเพื่อสรุป)
  moisture: string;    // %
  tree_health: string; // ข้อความสถานะต้น
  fertilizer: string;  // %
  status: string;      // <-- จะไม่ใช้แสดงผลแล้ว
  updated: string;
  color: string;
}

export default function PlotPage() {
  const navigate = useNavigate();
  const [plots, setPlots] = useState<Plot[]>([]);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);

  // โหลด deletedIds จาก localStorage
  useEffect(() => {
    const saved = localStorage.getItem("deletedPlots");
    if (saved) setDeletedIds(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const fetchPlots = async () => {
      try {
        const res = await axios.get<Plot[]>("http://localhost:3000/api/plots", { withCredentials: true });
        setPlots(res.data.filter((plot) => !deletedIds.includes(plot.id)));
      } catch (err) {
        console.error("Error fetching plots:", err);
      }
    };
    fetchPlots();
  }, [deletedIds]);

  // ลบเฉพาะฝั่ง client + เก็บ id ลง localStorage
  const handleDelete = (id: number) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบแปลงนี้?")) return;
    setPlots((prev) => prev.filter((plot) => plot.id !== id));
    const updatedDeleted = [...deletedIds, id];
    setDeletedIds(updatedDeleted);
    localStorage.setItem("deletedPlots", JSON.stringify(updatedDeleted));
  };

  /* ===== Summary (สำหรับแถบสรุป) ===== */
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

  return (
    <div className="min-h-screen bg-[#F5F3EE] text-gray-800 font-sans font-semibold">
      <main className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">แปลงลำไยของฉัน</h2>
          <button
            onClick={() => navigate("/addnewplot")}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded shadow"
          >
            <FiPlus className="mr-2" /> เพิ่มแปลงใหม่
          </button>
        </div>

        {/* Summary Bar (ใหม่) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-sm text-gray-500">จำนวนแปลงทั้งหมด</div>
            <div className="text-2xl font-bold text-teal-700">{totalPlots.toLocaleString()} แปลง</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-sm text-gray-500">พื้นที่รวม</div>
            <div className="text-2xl font-bold text-teal-700">{totalAreaRai.toLocaleString(undefined, { maximumFractionDigits: 2 })} ไร่</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-sm text-gray-500">ความชื้นเฉลี่ย</div>
            <div className="text-2xl font-bold text-teal-700">
              {avgMoisture.toLocaleString(undefined, { maximumFractionDigits: 1 })}%
            </div>
          </div>
        </div>

        {/* Filter Bar (เอาช่องสถานะออก) */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select className="border rounded px-4 py-2 bg-white text-sm">
            <option>ตำแหน่ง</option>
          </select>
          {/* ลบ dropdown สถานะออก */}
          <select className="border rounded px-4 py-2 bg-white text-sm">
            <option>เรียงตาม</option>
            <option>อัปเดตล่าสุด</option>
            <option>เรียงตามชื่อ</option>
          </select>
          <button className="flex items-center gap-1 border px-4 py-2 rounded text-sm bg-white">
            <FiFilter /> กรอง
          </button>
        </div>

        {/* Plot Cards (เอาป้าย/สีสถานะออก) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plots.map((plot) => (
            <div
              key={plot.id}
              className="relative rounded-xl shadow bg-white p-4 border"
            >
              {/* ปุ่มลบ */}
              <button
                onClick={() => handleDelete(plot.id)}
                className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                title="ลบแปลงนี้"
              >
                <FiTrash2 />
              </button>

              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-lg">{plot.name}</h3>
                {/* ลบสถานะออก */}
              </div>

              <p className="text-sm text-gray-600 mb-2">{plot.location}</p>
              <p className="text-sm mb-4">ขนาด: {plot.size} ไร่</p>

              <div className="text-sm grid grid-cols-3 gap-2 mb-4">
                <div>
                  ความชื้น<br />
                  <strong>{plot.moisture}%</strong>
                </div>
                <div>
                  ต้น<br />
                  <strong>{plot.tree_health}</strong>
                </div>
                <div>
                  ปุ๋ย<br />
                  <strong>{plot.fertilizer}%</strong>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-right">
                อัปเดตล่าสุด: {new Date(plot.updated).toLocaleString("th-TH")}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
