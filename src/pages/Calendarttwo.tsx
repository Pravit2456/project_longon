import { useState, useEffect, useMemo, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import thLocale from "@fullcalendar/core/locales/th";
import { useNavigate } from "react-router-dom";
import type { EventInput } from "@fullcalendar/core";

/* ================== Types ================== */
type EType = "plant" | "prune" | "fertilize" | "water" | "harvest" | "spray";

type FarmEvent = EventInput & {
  extendedProps?: {
    etype: EType;
    fertilizerKg?: number;
    harvestKg?: number;
    note?: string;
  };
};

type NotiItem = {
  id: string;
  eventId?: string;
  title: string;
  dueDate: string;     // YYYY-MM-DD
  createdAt: number;   // ts
  read: boolean;
};

/* ================== Storage Keys ================== */
const STORAGE_EVT = "calendarEvents_v2";
const STORAGE_NOTI = "calendarNotifications_v1";

/* ================== Mock data (ครั้งแรก) ================== */
const initialEvents: FarmEvent[] = [
  { id: "1", title: "🌱 ปลูกลำไย", start: "2025-01-07", extendedProps: { etype: "plant" } },
  { id: "2", title: "✂️ ตัดแต่งกิ่ง", start: "2025-02-10", extendedProps: { etype: "prune" } },
  { id: "3", title: "🍂 ใส่ปุ๋ย 50 กก.", start: "2025-03-14", extendedProps: { etype: "fertilize", fertilizerKg: 50 } },
  { id: "4", title: "💧 รดน้ำต้นไม้", start: "2025-05-20", extendedProps: { etype: "water" } },
  { id: "5", title: "🌾 เก็บเกี่ยวลำไย 1200 กก.", start: "2025-10-05", extendedProps: { etype: "harvest", harvestKg: 1200 } },
];

/* ================== Small utils ================== */
const monthNames = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];

const emojiOf = (t: EType) =>
  t === "plant" ? "🌱" :
  t === "prune" ? "✂️" :
  t === "fertilize" ? "🍂" :
  t === "water" ? "💧" :
  t === "harvest" ? "🌾" : "🚁";

const defaultName = (t: EType) =>
  t === "plant" ? "ปลูกลำไย" :
  t === "prune" ? "ตัดแต่งกิ่ง" :
  t === "fertilize" ? "ใส่ปุ๋ย" :
  t === "water" ? "รดน้ำต้นไม้" :
  t === "harvest" ? "เก็บเกี่ยวลำไย" : "พ่นโดรน";

const buildTitle = (t: EType, base: string, fert?: number, hv?: number) => {
  const prefix = emojiOf(t);
  if (t === "fertilize" && fert) return `${prefix} ${base || "ใส่ปุ๋ย"} ${fert} กก.`;
  if (t === "harvest" && hv) return `${prefix} ${base || "เก็บเกี่ยวลำไย"} ${hv} กก.`;
  return `${prefix} ${base || defaultName(t)}`;
};

const ymd = (d: Date | string) => {
  const dt = typeof d === "string" ? new Date(d) : d;
  const y = dt.getFullYear();
  const m = `${dt.getMonth() + 1}`.padStart(2, "0");
  const day = `${dt.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/* ================== Robust localStorage hook ================== */
function useLocalStorageState<T>(key: string, fallback: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          const next = JSON.parse(e.newValue) as T;
          setState(next);
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  const setAndPersist = (updater: T | ((prev: T) => T)) => {
    setState((prev) => {
      const next = typeof updater === "function" ? (updater as any)(prev) : updater;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  return [state, setAndPersist] as const;
}

export default function Calendartwo() {
  const [year, setYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const [events, setEvents] = useLocalStorageState<FarmEvent[]>(STORAGE_EVT, initialEvents);
  const [notis, setNotis]   = useLocalStorageState<NotiItem[]>(STORAGE_NOTI, []);

  const [panelOpen, setPanelOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [newEventRange, setNewEventRange] = useState<{ start: string; end?: string } | null>(null);
  const [etype, setEtype] = useState<EType>("fertilize");
  const [titleText, setTitleText] = useState("");
  const [fertilizerKg, setFertilizerKg] = useState<number | "">("");
  const [harvestKg, setHarvestKg] = useState<number | "">("");
  const [note, setNote] = useState("");

  const navigate = useNavigate();
  const intervalRef = useRef<number | null>(null);

  /* ---------- Notification engine (check every 60s) ---------- */
  useEffect(() => {
    const tick = () => {
      const today = ymd(new Date());
      const todays = events.filter(e => ymd(e.start as string) === today);
      if (todays.length === 0) return;

      const existKey = (n: NotiItem) => `${n.eventId}-${n.dueDate}`;
      const existing = new Set(notis.map(existKey));

      const newOnes: NotiItem[] = [];
      todays.forEach(e => {
        const key = `${e.id}-${today}`;
        if (!existing.has(key)) {
          newOnes.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            eventId: e.id?.toString(),
            title: `วันนี้: ${e.title}`,
            dueDate: today,
            createdAt: Date.now(),
            read: false,
          });
        }
      });
      if (newOnes.length > 0) {
        setNotis(prev => [...newOnes, ...prev]);
      }
    };

    tick();
    intervalRef.current = window.setInterval(tick, 60_000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [events, notis, setNotis]);

  /* ---------- Derived values ---------- */
  const monthEvents = (m: number) =>
    events.filter(e => {
      const d = new Date(e.start as string);
      return d.getFullYear() === year && d.getMonth() === m;
    });

  const sumFertilizerKg = useMemo(
    () => events.reduce((acc, e) => {
      const d = new Date(e.start as string);
      if (d.getFullYear() !== year) return acc;
      return acc + (e.extendedProps?.fertilizerKg || 0);
    }, 0),
    [events, year]
  );

  const sumHarvestKg = useMemo(
    () => events.reduce((acc, e) => {
      const d = new Date(e.start as string);
      if (d.getFullYear() !== year) return acc;
      return acc + (e.extendedProps?.harvestKg || 0);
    }, 0),
    [events, year]
  );


  const unreadCount = notis.filter(n => !n.read).length;

  /* ---------- Calendar handlers (persist ทันที) ---------- */
  const handleDateClick = (info: any) => {
    setNewEventRange({ start: info.dateStr });
    setModalOpen(true);
  };

  const handleSelect = (info: any) => {
    setNewEventRange({ start: info.startStr, end: info.endStr });
    setModalOpen(true);
  };

  const handleSaveEvent = () => {
    if (!newEventRange) return;

    const fertNum = etype === "fertilize" ? Number(fertilizerKg || 0) : undefined;
    const harvNum = etype === "harvest" ? Number(harvestKg || 0) : undefined;

    const newEvent: FarmEvent = {
      id: Date.now().toString(),
      title: buildTitle(etype, titleText, fertNum, harvNum),
      ...newEventRange,
      extendedProps: {
        etype,
        fertilizerKg: fertNum,
        harvestKg: harvNum,
        note: note || undefined,
      },
    };

    setEvents(prev => [...prev, newEvent]);

    setTitleText("");
    setFertilizerKg("");
    setHarvestKg("");
    setNote("");
    setEtype("fertilize");
    setModalOpen(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  /* ---------- Recommendations ---------- */
  const recommendationsForMonth = (m: number) => {
    const list = monthEvents(m);
    const hasFert = list.some(e => e.extendedProps?.etype === "fertilize");
    const hasPrune = list.some(e => e.extendedProps?.etype === "prune");
    const hasWater = list.some(e => e.extendedProps?.etype === "water");
    const recs: string[] = [];

    if (!hasPrune && (m === 1 || m === 2)) {
      recs.push("ยังไม่มีกิจกรรมตัดแต่งกิ่งช่วงปลายฤดูหนาว แนะนำวางแผนตัดแต่งเพื่อกระตุ้นตาดอก");
    }
    if (!hasFert) {
      recs.push("เดือนนี้ยังไม่มีการใส่ปุ๋ย แนะนำตรวจสภาพต้น/ดิน และคำนวณปริมาณปุ๋ยที่เหมาะสม");
    }
    if (!hasWater && (m >= 2 && m <= 5)) {
      recs.push("เข้าหน้าร้อน ควรรดน้ำสม่ำเสมอเพื่อลดความเครียดของต้นลำไย");
    }
    if (list.some(e => e.extendedProps?.etype === "harvest")) {
      recs.push("มีการเก็บเกี่ยวแล้ว แนะนำบันทึกผลผลิตและวิเคราะห์ต้นทุนรอบที่ผ่านมา");
    }
    if (recs.length === 0) recs.push("ไม่มีคำแนะนำเฉพาะ แผนงานเดือนนี้ดูครบถ้วนแล้ว ✅");
    return recs;
  };

  /* ---------- Render month (เพิ่มบล็อกคำแนะนำย่อ) ---------- */
  const renderMonth = (month: number) => {
    const startDate = new Date(year, month, 1);
    const mEvents = monthEvents(month).sort((a, b) =>
      new Date(a.start as string).getTime() - new Date(b.start as string).getTime()
    );

    // คำแนะนำแบบย่อ (โชว์ 1–2 บรรทัด)
    const recs = recommendationsForMonth(month);
    const recPreview = recs.slice(0, 2);

    return (
      <div
        key={month}
        className="bg-white shadow rounded-lg p-2 hover:shadow-md transition flex flex-col"
        onClick={() => setSelectedMonth(month)}
      >
        {/* กิจกรรมเดือนนี้ */}
        {mEvents.length > 0 && (
          <div className="mb-2 p-2 bg-green-50 rounded text-xs">
            <p className="font-semibold text-red-600 mb-1">📌 กิจกรรมเดือนนี้</p>
            <ul className="list-disc pl-4 space-y-1">
              {mEvents.map((event) => (
                <li key={event.id} className="flex justify-between items-center">
                  <span>
                    {(event.start as string).split("T")[0]} — {event.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEvent(event.id as string);
                    }}
                    className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded hover:bg-red-600"
                  >
                    ลบ
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 🧭 คำแนะนำประจำเดือน (ย่อ) */}
        {recPreview.length > 0 && (
          <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs">
            <p className="font-semibold text-amber-800 mb-1">🧭 คำแนะนำ</p>
            <ul className="list-disc pl-4 space-y-1">
              {recPreview.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
            {recs.length > recPreview.length && (
              <div className="mt-1 text-[11px] text-amber-700">…ดูทั้งหมดเมื่อเปิดเดือนนี้</div>
            )}
          </div>
        )}

        {/* ปฏิทินของเดือน */}
        <FullCalendar
          key={`${year}-${month}`}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={thLocale}
          initialDate={startDate}
          selectable={true}
          select={handleSelect}
          dateClick={handleDateClick}
          headerToolbar={{ left: "", center: "title", right: "" }}
          events={events}
          height="auto"
          contentHeight={150}
          aspectRatio={1.1}
          eventDisplay="none"
          dayCellContent={(arg) => (
            <span className="text-[10px] font-medium">{arg.dayNumberText}</span>
          )}
        />
      </div>
    );
  };

  /* ---------- UI ---------- */
  return (
    <div className="p-6 bg-[#f0fdfb] min-h-screen relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <h2 className="text-xl font-semibold text-teal-700">📅 ปฏิทินลำไย ({year})</h2>
        <div className="flex items-center gap-2">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border rounded px-3 py-1 text-teal-700 bg-white"
          >
            <option value={2024}>ปี 2567 (2024)</option>
            <option value={2025}>ปี 2568 (2025)</option>
            <option value={2026}>ปี 2569 (2026)</option>
          </select>

          {/* ไปหน้าจองบริการ */}
          <button
            onClick={() => navigate("/findproviders")}
            className="px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            🛠️ จองบริการ
          </button>

          {/* กระดิ่งแจ้งเตือน */}
          <div className="relative">
            <button
              onClick={() => setPanelOpen((v) => !v)}
              className={`relative rounded-full p-2 border transition
                ${unreadCount > 0 ? "bg-red-600 text-white border-red-700" : "bg-white text-teal-700 border-gray-300"}`}
              aria-label="Notifications"
            >
              <span className="text-lg">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-white text-red-600 border border-red-600 rounded-full px-1.5">
                  {unreadCount}
                </span>
              )}
            </button>

            {panelOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                <div className="flex items-center justify-between px-3 py-2 border-b">
                  <div className="font-semibold">การแจ้งเตือน</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNotis(prev => prev.map(n => ({ ...n, read: true })))}
                      className="text-sm text-emerald-700 hover:underline"
                    >
                      อ่านทั้งหมด
                    </button>
                    <button
                      onClick={() => setPanelOpen(false)}
                      className="text-sm text-gray-500 hover:underline"
                    >
                      ปิด
                    </button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notis.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">ยังไม่มีแจ้งเตือน</div>
                  ) : (
                    <ul className="divide-y">
                      {notis.map(n => (
                        <li key={n.id} className={`px-3 py-2 ${n.read ? "bg-white" : "bg-red-50"}`}>
                          <div className="text-sm">{n.title}</div>
                          <div className="text-xs text-gray-500">
                            กำหนด: {n.dueDate} · บันทึกเมื่อ {new Date(n.createdAt).toLocaleString()}
                          </div>
                          {!n.read && (
                            <div className="mt-1">
                              <button
                                onClick={() => setNotis(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                                className="text-xs text-emerald-700 hover:underline"
                              >
                                ทำเป็นอ่านแล้ว
                              </button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-sm text-gray-500">สรุปเก็บเกี่ยวทั้งปี</div>
          <div className="text-2xl font-bold text-teal-700">{sumHarvestKg.toLocaleString()} กก.</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-sm text-gray-500">สรุปใช้ปุ๋ยทั้งปี</div>
          <div className="text-2xl font-bold text-teal-700">{sumFertilizerKg.toLocaleString()} กก.</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-sm text-gray-500">บันทึกกิจกรรมปีนี้</div>
          <div className="text-2xl font-bold text-teal-700">
            {events.filter(e => new Date(e.start as string).getFullYear() === year).length} รายการ
          </div>
        </div>
      </div>

      {/* Year grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }, (_, i) => renderMonth(i))}
      </div>

      {/* Popup เดือนใหญ่ + คำแนะนำ + ปุ่มลัด */}
      {selectedMonth !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 w-11/12 md:w-3/4 lg:w-2/3 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-teal-700">
                {monthNames[selectedMonth]} / {year}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/services")}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                >
                  🛠️ จองบริการ
                </button>
                {monthEvents(selectedMonth).some(e => e.extendedProps?.etype === "fertilize") && (
                  <button
                    onClick={() => navigate("/fertilizer")}
                    className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    🧮 คำนวณปุ๋ย
                  </button>
                )}
                <button
                  onClick={() => setSelectedMonth(null)}
                  className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  ปิด
                </button>
              </div>
            </div>

            {/* คำแนะนำ */}
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded">
              <div className="font-semibold text-amber-800 mb-1">🧭 คำแนะนำประจำเดือน</div>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {recommendationsForMonth(selectedMonth).map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>

            <FullCalendar
              key={`popup-${year}-${selectedMonth}`}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale={thLocale}
              initialDate={new Date(year, selectedMonth ?? 0, 1)}
              selectable={true}
              select={handleSelect}
              dateClick={handleDateClick}
              headerToolbar={{ left: "prev,next today", center: "title" }}
              buttonText={{ prev: "◀", next: "▶", today: "วันนี้" }}
              events={events}
              height="auto"
              contentHeight={500}
              eventDisplay="none"
              dayCellContent={(arg) => (
                <span className="text-sm font-semibold">{arg.dayNumberText}</span>
              )}
            />
          </div>
        </div>
      )}

      {/* Modal เพิ่มกิจกรรม */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[520px] max-w-[95vw]">
            <h3 className="text-lg font-bold text-teal-700 mb-4">เพิ่มกิจกรรม</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-sm text-gray-600">ประเภทกิจกรรม</label>
                <select
                  value={etype}
                  onChange={(e) => setEtype(e.target.value as EType)}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="plant">ปลูก</option>
                  <option value="prune">ตัดแต่งกิ่ง</option>
                  <option value="fertilize">ใส่ปุ๋ย</option>
                  <option value="water">รดน้ำ</option>
                  <option value="harvest">เก็บเกี่ยว</option>
                  <option value="spray">พ่นโดรน</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-sm text-gray-600">ชื่อกิจกรรม (ไม่ใส่ก็ได้)</label>
                <input
                  type="text"
                  placeholder={`เช่น ${defaultName(etype)}`}
                  value={titleText}
                  onChange={(e) => setTitleText(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              {etype === "fertilize" && (
                <div className="col-span-2">
                  <label className="text-sm text-gray-600">ปริมาณปุ๋ย (กก.)</label>
                  <input
                    type="number"
                    min={0}
                    value={fertilizerKg}
                    onChange={(e) => setFertilizerKg(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
              )}

              {etype === "harvest" && (
                <div className="col-span-2">
                  <label className="text-sm text-gray-600">น้ำหนักผลผลิต (กก.)</label>
                  <input
                    type="number"
                    min={0}
                    value={harvestKg}
                    onChange={(e) => setHarvestKg(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
              )}

              <div className="col-span-2">
                <label className="text-sm text-gray-600">บันทึกเพิ่มเติม</label>
                <textarea
                  placeholder="โน้ตสั้น ๆ"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveEvent}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                บันทึก
              </button>
            </div>

            <div className="mt-3 text-right">
              <button
                onClick={() => navigate("/services")}
                className="text-emerald-700 underline underline-offset-4"
              >
                ต้องการผู้ช่วย? จองบริการเลย →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
