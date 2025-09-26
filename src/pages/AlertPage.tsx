import { useEffect, useState } from "react";
import { FiBell } from "react-icons/fi";

/* ========= Types (ตัด severity ออก) ========= */
type AlertItem = {
  type: string;
  message?: string;
  time: string;
  color: "orange" | "red";
  signature: string;
};

const STORAGE_KEYS = {
  current: "alerts_current",
  past: "alerts_past",
};

/* ========= ตัวอย่าง (ไม่มี severity) ========= */
const SAMPLE_CURRENT: AlertItem[] = [
  {
    type: "คลื่นความร้อนรุนแรง",
    message: "อุณหภูมิเกิน 40°C โปรดดูแลระบบน้ำและเฝ้าระวังการคายน้ำของต้น",
    time: "09:23 วันนี้",
    color: "red",
    signature: "sample_extreme_heat",
  },
  {
    type: "ฝนตกน้อยกว่าค่าเฉลี่ย",
    message: "7 วันที่ผ่านมา ฝนต่ำกว่าปกติ ตรวจสอบความชื้นดินและวางแผนรดน้ำ",
    time: "07:50 วันนี้",
    color: "orange",
    signature: "sample_low_rain",
  },
];

const SAMPLE_PAST: AlertItem[] = [
  {
    type: "ลมกระโชกแรง",
    time: "14 พ.ค. 67, 14:13",
    color: "orange",
    signature: "sample_past_wind",
  },
  {
    type: "แจ้งเตือนอุณหภูมิสูง",
    time: "14 พ.ค. 67, 09:25",
    color: "red",
    signature: "sample_past_heat",
  },
];

/* ========= Storage helpers ========= */
function loadAlerts(key: string): AlertItem[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const arr = JSON.parse(raw) as any[];
    // เผื่อข้อมูลเก่ายังมี severity → map ทิ้ง
    return (arr || []).map((a) => ({
      type: a.type,
      message: a.message,
      time: a.time,
      color: a.color === "red" ? "red" : "orange",
      signature: a.signature,
    })) as AlertItem[];
  } catch {
    return [];
  }
}
function saveAlerts(key: string, arr: AlertItem[]) {
  localStorage.setItem(key, JSON.stringify(arr));
}

export default function AlertPage() {
  const [currentAlerts, setCurrentAlerts] = useState<AlertItem[]>([]);
  const [pastAlerts, setPastAlerts] = useState<AlertItem[]>([]);

  const refresh = () => {
    const curr = loadAlerts(STORAGE_KEYS.current);
    const past = loadAlerts(STORAGE_KEYS.past);
    setCurrentAlerts(curr.length ? curr : SAMPLE_CURRENT);
    setPastAlerts(past.length ? past : SAMPLE_PAST);
  };

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("alerts-updated", handler);
    return () => window.removeEventListener("alerts-updated", handler);
  }, []);

  const acknowledge = (idx: number) => {
    // ถ้าใน storage ว่าง แปลว่าใช้ SAMPLE → ไม่เขียนทับ storage
    const inStorage = !!localStorage.getItem(STORAGE_KEYS.current);
    if (!inStorage) return;

    const curr = loadAlerts(STORAGE_KEYS.current);
    if (idx < 0 || idx >= curr.length) return;

    const ack = curr.splice(idx, 1)[0];
    const past = [ack, ...loadAlerts(STORAGE_KEYS.past)].slice(0, 300);
    saveAlerts(STORAGE_KEYS.current, curr);
    saveAlerts(STORAGE_KEYS.past, past);
    setCurrentAlerts(curr);
    setPastAlerts(past);
  };

  const acknowledgeAll = () => {
    const inStorage = !!localStorage.getItem(STORAGE_KEYS.current);
    if (!inStorage) return;

    const curr = loadAlerts(STORAGE_KEYS.current);
    const past = [...curr, ...loadAlerts(STORAGE_KEYS.past)].slice(0, 300);
    saveAlerts(STORAGE_KEYS.current, []);
    saveAlerts(STORAGE_KEYS.past, past);
    setCurrentAlerts([]);
    setPastAlerts(past);
  };

  const clearHistory = () => {
    saveAlerts(STORAGE_KEYS.past, []);
    setPastAlerts([]);
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA] text-gray-800 pb-10 font-sans font-semibold">
      {/* Header */}
      <header className="px-5 py-3 flex justify-between items-center bg-white/80 backdrop-blur border-b">
        <h1 className="text-lg sm:text-xl font-bold text-[#2f6b4f] flex items-center gap-2">
          <span className="inline-grid place-items-center w-8 h-8 rounded-full bg-[#FFECD6]">
            <FiBell className="text-[#F59E0B]" />
          </span>
          การแจ้งเตือน
        </h1>
        <div className="text-xs sm:text-sm text-gray-600"></div>
      </header>

      <main className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {/* Current Alerts */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h2 className="font-semibold">
              แจ้งเตือนปัจจุบัน{" "}
              <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded">
                {currentAlerts.length} รายการ
              </span>
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={acknowledgeAll}
                className="text-xs px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                disabled={currentAlerts.length === 0}
              >
                รับทราบทั้งหมด
              </button>
            </div>
          </div>

          {/* list + scroll */}
          <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto custom-scroll">
            {currentAlerts.length === 0 ? (
              <div className="text-sm text-gray-400">ไม่มีแจ้งเตือนใหม่</div>
            ) : (
              currentAlerts.map((a, i) => (
                <div
                  key={`${a.signature}-${i}`}
                  className={`border rounded-xl p-4 shadow-sm hover:shadow transition
                    ${a.color === "red" ? "border-red-300/70 bg-red-50/40" : "border-orange-300/70 bg-orange-50/40"}`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900">{a.type}</div>
                      {a.message && (
                        <p className="text-sm text-gray-700 mt-1">{a.message}</p>
                      )}
                      <div className="text-xs text-gray-400 mt-1">{a.time}</div>
                    </div>
                    <button
                      onClick={() => acknowledge(i)}
                      className={`shrink-0 text-xs px-3 py-1.5 rounded text-white
                        ${a.color === "red" ? "bg-rose-500 hover:bg-rose-600" : "bg-amber-500 hover:bg-amber-600"}`}
                    >
                      รับทราบ
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Past Alerts */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">ประวัติแจ้งเตือน</h2>
            <button
              onClick={clearHistory}
              className="text-xs px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
              disabled={pastAlerts.length === 0}
            >
              ล้างประวัติ
            </button>
          </div>

          <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto custom-scroll">
            {pastAlerts.length === 0 ? (
              <div className="text-sm text-gray-400">ยังไม่มีประวัติ</div>
            ) : (
              pastAlerts.map((a, i) => (
                <div
                  key={`${a.signature}-past-${i}`}
                  className="bg-white border rounded-lg p-3 flex items-start gap-3 hover:bg-gray-50"
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full mt-2 ${
                      a.color === "red" ? "bg-rose-500" : "bg-amber-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900">{a.type}</div>
                    {a.message && (
                      <div className="text-xs text-gray-600 mt-0.5">{a.message}</div>
                    )}
                    <div className="text-xs text-gray-400 mt-0.5">{a.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Tailwind utility: สไตล์ scrollbar เบา ๆ */}
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(0,0,0,0.15);
          border-radius: 999px;
          border: 3px solid transparent;
          background-clip: content-box;
        }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}
