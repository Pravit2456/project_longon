import { useEffect, useState } from "react";

type SensorData = {
  temperature: string; // °C
  humidity: string;    // %RH
  pm25: string;        // µg/m³
  timestamp: string;
};

type AlertItem = {
  type: string;
  severity: "ระดับเฝ้าระวัง" | "รุนแรง" | "รุนแรงมาก";
  message: string;
  time: string; // แสดงผลสวย ๆ
  color: "orange" | "red";
  signature: string; // ไว้กันซ้ำ
};

const STORAGE_KEYS = {
  current: "alerts_current",
  past: "alerts_past",
};

const THRESHOLDS = {
  heatRuleTemp: 30, // °C
  heatRuleRH: 30,   // %
  extremeHeat: 40,  // °C
  pmThai: 37.5,     // เกินมาตรฐานไทย (24 ชม.)
  pmUnhealthy: 55.5 // ไม่ดีมากสำหรับทุกคน
};

function fmtTime(d = new Date()) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const hhmm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const today = new Date();
  if (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  ) {
    return `${hhmm} วันนี้`;
  }
  return d.toLocaleString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function loadAlerts(key: string): AlertItem[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as AlertItem[]) : [];
  } catch {
    return [];
  }
}
function saveAlerts(key: string, arr: AlertItem[]) {
  localStorage.setItem(key, JSON.stringify(arr));
}

function notifyBrowser(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  const send = () => new Notification(title, { body });
  if (Notification.permission === "granted") {
    send();
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") send();
    });
  }
}

// กันซ้ำแบบง่ายด้วย signature
function isDuplicate(items: AlertItem[], signature: string) {
  return items.some((it) => it.signature === signature);
}

function evaluateAlerts(s: SensorData): AlertItem[] {
  const t = Number(s.temperature);
  const rh = Number(s.humidity);
  const pm = Number(s.pm25);

  const out: AlertItem[] = [];
  const nowStr = fmtTime(new Date());

  if (!Number.isNaN(t) && !Number.isNaN(rh)) {
    if (t >= THRESHOLDS.extremeHeat) {
      out.push({
        type: "คลื่นความร้อนรุนแรง",
        severity: "รุนแรงมาก",
        message:
          `อุณหภูมิ ${t.toFixed(1)}°C สูงมาก เสี่ยงความเสียหายต่อแรงงาน/อุปกรณ์ ควรพักงานกลางแจ้งและดูแลสวนอย่างใกล้ชิด`,
        time: nowStr,
        color: "red",
        signature: "extremeHeat",
      });
    }
    if (t >= THRESHOLDS.heatRuleTemp && rh <= THRESHOLDS.heatRuleRH) {
      out.push({
        type: "สภาวะเสี่ยงไฟป่า",
        severity: "รุนแรง",
        message:
          `อุณหภูมิ ${t.toFixed(1)}°C และความชื้น ${rh.toFixed(0)}% ต่ำ เสี่ยงไฟลามเร็ว งดการเผาและเตรียมอุปกรณ์ความปลอดภัย`,
        time: nowStr,
        color: "red",
        signature: "fireRiskSimple",
      });
    }
  }

  if (!Number.isNaN(pm)) {
    if (pm > THRESHOLDS.pmUnhealthy) {
      out.push({
        type: "มลพิษ PM2.5 สูงมาก",
        severity: "รุนแรง",
        message:
          `PM2.5 = ${pm.toFixed(1)} µg/m³ สูงมาก ควรใส่หน้ากาก N95 และลดกิจกรรมนอกอาคาร`,
        time: nowStr,
        color: "red",
        signature: "pmVeryHigh",
      });
    } else if (pm > THRESHOLDS.pmThai) {
      out.push({
        type: "มลพิษ PM2.5 เกินมาตรฐาน",
        severity: "ระดับเฝ้าระวัง",
        message:
          `PM2.5 = ${pm.toFixed(1)} µg/m³ เกินมาตรฐานไทย (37.5) เฝ้าระวังสุขภาพและลดเวลางานกลางแจ้ง`,
        time: nowStr,
        color: "orange",
        signature: "pmOverThaiStd",
      });
    }
  }

  return out;
}

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
        const json = (await res.json()) as SensorData;
        setData(json);

        // ประเมินและสร้างแจ้งเตือน
        const alerts = evaluateAlerts(json);
        if (alerts.length > 0) {
          const current = loadAlerts(STORAGE_KEYS.current);
          const toAdd: AlertItem[] = [];
          for (const a of alerts) {
            if (!isDuplicate(current, a.signature)) {
              toAdd.push(a);
              notifyBrowser(a.type, a.message);
            }
          }
          if (toAdd.length > 0) {
            const updated = [...toAdd, ...current].slice(0, 100);
            saveAlerts(STORAGE_KEYS.current, updated);
            // แจ้งหน้าอื่นให้อัปเดต UI ทันที
            window.dispatchEvent(new CustomEvent("alerts-updated"));
          }
        }
      } catch (err) {
        console.error("Failed to fetch sensor data:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // ทุก 1 นาที
    return () => clearInterval(interval);
  }, []);

  // === UI เดิม (ไม่เปลี่ยน) ===
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded shadow text-center">
        <p className="text-sm text-gray-600">อุณหภูมิ</p>
        <p className="text-2xl font-semibold">
          {data.temperature !== "--" ? `${data.temperature}°C` : "--"}
        </p>
      </div>
      <div className="bg-white p-4 rounded shadow text-center">
        <p className="text-sm text-gray-600">ความชื้น</p>
        <p className="text-2xl font-semibold">
          {data.humidity !== "--" ? `${data.humidity}%` : "--"}
        </p>
      </div>
      <div className="bg-white p-4 rounded shadow text-center">
        <p className="text-sm text-gray-600">PM2.5</p>
        <p className="text-2xl font-semibold">{data.pm25}</p>
      </div>
    </div>
  );
}
