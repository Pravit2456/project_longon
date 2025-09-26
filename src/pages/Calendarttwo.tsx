import { useState, useEffect, useRef } from "react";
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

  // ✨ Modal แก้ไขกิจกรรม
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editType, setEditType] = useState<EType>("fertilize");
  const [editTitle, setEditTitle] = useState("");
  const [editFert, setEditFert] = useState<number | "">("");
  const [editHarv, setEditHarv] = useState<number | "">("");
  const [editNote, setEditNote] = useState("");
  const [editDate, setEditDate] = useState<string>(""); // YYYY-MM-DD

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

  const unreadCount = notis.filter(n => !n.read).length;

  /* ---------- Calendar handlers ---------- */
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

  /* ---------- เปิดป๊อปอัพแก้ไขเมื่อคลิกรายการ “กิจกรรมเดือนนี้” ในการ์ดเล็ก ---------- */
  const openEditModal = (evt: FarmEvent) => {
    setEditId(String(evt.id));
    const t = evt.extendedProps?.etype ?? "fertilize";
    setEditType(t);
    setEditTitle((evt.title || "").toString().replace(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})\s*/u, ""));
    setEditFert(evt.extendedProps?.fertilizerKg ?? "");
    setEditHarv(evt.extendedProps?.harvestKg ?? "");
    setEditNote(evt.extendedProps?.note ?? "");
    setEditDate(ymd(evt.start as string));
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!editId) return;
    const fertNum = editType === "fertilize" ? Number(editFert || 0) : undefined;
    const harvNum = editType === "harvest" ? Number(editHarv || 0) : undefined;

    setEvents(prev =>
      prev.map(e => {
        if (String(e.id) !== editId) return e;
        const updated: FarmEvent = {
          ...e,
          start: editDate,
          title: buildTitle(editType, editTitle, fertNum, harvNum),
          extendedProps: {
            ...(e.extendedProps || {}),
            etype: editType,
            fertilizerKg: fertNum,
            harvestKg: harvNum,
            note: editNote || undefined,
          },
        };
        return updated;
      })
    );
    setEditOpen(false);
  };

  /* ---------- แสดงอีเวนต์ใต้วันที่ ---------- */
  const renderEvent = (arg: any) => (
    <div
      className="text-[10px] md:text-xs px-1 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 overflow-hidden text-ellipsis whitespace-nowrap"
      title={arg.event.title}
    >
      {arg.event.title}
    </div>
  );

  /* ---------- Render month (การ์ดเล็ก) ---------- */
  const renderMonth = (month: number) => {
    const startDate = new Date(year, month, 1);
    const mEvents = monthEvents(month).sort((a, b) =>
      new Date(a.start as string).getTime() - new Date(b.start as string).getTime()
    );

    const recs = recommendationsForMonth(month);
    const recPreview = recs.slice(0, 2);

    return (
      <div
        key={month}
        className="bg-white shadow rounded-lg p-2 hover:shadow-md hover:bg-gray-50 transition cursor-pointer flex flex-col"
        onClick={() => setSelectedMonth(month)}
        title="เปิดดูเดือนนี้"
      >
        {/* กิจกรรมเดือนนี้ */}
        {mEvents.length > 0 && (
          <div className="mb-2 p-2 bg-green-50 rounded text-xs">
            <p className="font-semibold text-red-600 mb-1">📌 กิจกรรมเดือนนี้</p>
            <ul className="list-disc pl-4 space-y-1">
              {mEvents.map((event) => (
                <li
                  key={event.id}
                  className="flex justify-between items-center hover:bg-green-100/60 rounded px-1 py-0.5 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation(); // ไม่ให้เด้งไปเปิดเดือนใหญ่
                    openEditModal(event);
                  }}
                  title="กดเพื่อแก้ไขกิจกรรมนี้"
                >
                  <span>
                    {(event.start as string).split("T")[0]} — {event.title}
                  </span>
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

        {/* ปฏิทินของเดือน (การ์ดเล็ก) */}
        <FullCalendar
          key={`${year}-${month}`}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={thLocale}
          initialDate={startDate}
          selectable
          select={handleSelect}
          dateClick={handleDateClick}
          headerToolbar={{ left: "", center: "title", right: "" }}
          events={events}
          height="auto"
          contentHeight={150}
          aspectRatio={1.1}
          eventDisplay="auto"
          eventContent={renderEvent}
          dayMaxEventRows={2}
          moreLinkClick="popover"
          dayCellClassNames={() => ["cursor-pointer", "hover:bg-gray-50"]}
          dayCellContent={(arg) => (
            <span className="text-[10px] font-medium">{arg.dayNumberText}</span>
          )}
        />
      </div>
    );
  };

  /* ---------- UI ---------- */
  // ปิดโมดัล (เดือน/เพิ่มกิจกรรม/แก้ไขกิจกรรม) เมื่อคลิกฉากหลัง
  const onBackdropMonth: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.currentTarget === e.target) setSelectedMonth(null);
  };
  const onBackdropAdd: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.currentTarget === e.target) setModalOpen(false);
  };
  const onBackdropEdit: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.currentTarget === e.target) setEditOpen(false);
  };

  return (
    <div className="p-6 bg-[#f0fdfb] min-h-screen relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <h2 className="text-xl font-semibold text-teal-700">📅 ปฏิทินลำไย ({year})</h2>
        <div className="flex items-center gap-2">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border rounded px-3 py-1 text-teal-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
            title="เลือกปี"
          >
            <option value={2024}>ปี 2567 (2024)</option>
            <option value={2025}>ปี 2568 (2025)</option>
            <option value={2026}>ปี 2569 (2026)</option>
          </select>

          <button
            onClick={() => setSelectedMonth(new Date().getMonth())}
            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100 transition-colors cursor-pointer"
            title="ไปเดือนปัจจุบัน"
          >
            เดือนนี้
          </button>

          {/* ไปหน้าจองบริการ */}
          <button
            onClick={() => navigate("/findproviders")}
            className="px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors cursor-pointer"
            title="ไปหน้าจองผู้ให้บริการ"
          >
            🛠️ จองบริการ
          </button>

          {/* กระดิ่งแจ้งเตือน */}
          <div className="relative">
            <button
              onClick={() => setPanelOpen((v) => !v)}
              className={`relative rounded-full p-2 border transition-colors cursor-pointer
                ${unreadCount > 0 ? "bg-red-600 text-white border-red-700 hover:bg-red-700" : "bg-white text-teal-700 border-gray-300 hover:bg-gray-50"}`}
              aria-label="Notifications"
              title="เปิด/ปิดการแจ้งเตือน"
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
                      className="text-sm text-emerald-700 hover:underline cursor-pointer"
                      title="ทำเป็นอ่านแล้วทั้งหมด"
                    >
                      อ่านทั้งหมด
                    </button>
                    <button
                      onClick={() => setPanelOpen(false)}
                      className="text-sm text-gray-500 hover:underline cursor-pointer"
                      title="ปิดแผงแจ้งเตือน"
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
                        <li
                          key={n.id}
                          className={`px-3 py-2 transition-colors ${n.read ? "bg-white" : "bg-red-50 hover:bg-red-100"} cursor-default`}
                        >
                          <div className="text-sm">{n.title}</div>
                          <div className="text-xs text-gray-500">
                            กำหนด: {n.dueDate} · บันทึกเมื่อ {new Date(n.createdAt).toLocaleString()}
                          </div>
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

      {/* Year grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }, (_, i) => renderMonth(i))}
      </div>

      {/* Popup เดือนใหญ่ + คำแนะนำ + ปุ่มลัด */}
      {selectedMonth !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 cursor-pointer"
          onClick={onBackdropMonth}
          title="คลิกพื้นหลังเพื่อปิด"
        >
          <div
            className="bg-white rounded-lg shadow-lg p-4 w-11/12 md:w-3/4 lg:w-2/3 max-h-[90vh] overflow-y-auto cursor-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-teal-700">
                {monthNames[selectedMonth]} / {year}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/findproviders")}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors cursor-pointer"
                  title="ไปหน้าจองผู้ให้บริการ"
                >
                  🛠️ จองบริการ
                </button>
                {monthEvents(selectedMonth).some(e => e.extendedProps?.etype === "fertilize") && (
                  <button
                    onClick={() => navigate("/fertilizer")}
                    className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors cursor-pointer"
                    title="ไปเครื่องมือคำนวณปุ๋ย"
                  >
                    🧮 คำนวณปุ๋ย
                  </button>
                )}
                <button
                  onClick={() => setSelectedMonth(null)}
                  className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors cursor-pointer"
                  title="ปิดหน้าต่าง"
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

            {/* ปฏิทินของเดือน (ป๊อปอัพใหญ่) */}
            <FullCalendar
              key={`popup-${year}-${selectedMonth}`}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale={thLocale}
              initialDate={new Date(year, selectedMonth ?? 0, 1)}
              selectable
              select={handleSelect}
              dateClick={(info) => {
                setNewEventRange({ start: info.dateStr });
                setModalOpen(true); // ✅ คลิกวันแล้วเปิดฟอร์มเพิ่มทันที
              }}
              headerToolbar={{ left: "prev,next today", center: "title" }}
              buttonText={{ prev: "◀", next: "▶", today: "วันนี้" }}
              events={events}
              height="auto"
              contentHeight={500}
              eventDisplay="auto"
              eventContent={renderEvent}
              dayMaxEventRows={3}
              moreLinkClick="popover"
              dayCellClassNames={() => ["cursor-pointer", "hover:bg-gray-50"]}
              dayCellContent={(arg) => (
                <span className="text-sm font-semibold">{arg.dayNumberText}</span>
              )}
            />
          </div>
        </div>
      )}

      {/* Modal เพิ่มกิจกรรม (สร้างใหม่) */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 cursor-pointer"
          onClick={onBackdropAdd}
          title="คลิกพื้นหลังเพื่อปิด"
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-[520px] max-w-[95vw] cursor-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-teal-700 mb-4">เพิ่มกิจกรรม</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-sm text-gray-600">ประเภทกิจกรรม</label>
                <select
                  value={etype}
                  onChange={(e) => setEtype(e.target.value as EType)}
                  className="w-full border px-3 py-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                  title="เลือกประเภทกิจกรรม"
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
                <label className="text-sm text-gray-600">ชื่อกิจกรรม</label>
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
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors cursor-pointer"
                title="ยกเลิก"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveEvent}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors cursor-pointer"
                title="บันทึกกิจกรรม"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal แก้ไขกิจกรรม */}
      {editOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 cursor-pointer"
          onClick={onBackdropEdit}
          title="คลิกพื้นหลังเพื่อปิด"
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-[560px] max-w-[95vw] cursor-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-teal-700 mb-4">แก้ไขกิจกรรม</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-1">
                <label className="text-sm text-gray-600">วันที่</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div className="col-span-1">
                <label className="text-sm text-gray-600">ประเภท</label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as EType)}
                  className="w-full border px-3 py-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
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
                <label className="text-sm text-gray-600">ชื่อกิจกรรม</label>
                <input
                  type="text"
                  placeholder={`เช่น ${defaultName(editType)}`}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              {editType === "fertilize" && (
                <div className="col-span-2">
                  <label className="text-sm text-gray-600">ปริมาณปุ๋ย (กก.)</label>
                  <input
                    type="number"
                    min={0}
                    value={editFert}
                    onChange={(e) => setEditFert(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
              )}

              {editType === "harvest" && (
                <div className="col-span-2">
                  <label className="text-sm text-gray-600">น้ำหนักผลผลิต (กก.)</label>
                  <input
                    type="number"
                    min={0}
                    value={editHarv}
                    onChange={(e) => setEditHarv(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
              )}

              <div className="col-span-2">
                <label className="text-sm text-gray-600">บันทึกเพิ่มเติม</label>
                <textarea
                  placeholder="โน้ตสั้น ๆ"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Recommendations (เดิม) ---------- */
function recommendationsForMonth(m: number) {
  const recs: string[] = [];
  if (m === 1 || m === 2) recs.push("ยังไม่มีกิจกรรมตัดแต่งกิ่งช่วงปลายฤดูหนาว แนะนำวางแผนตัดแต่งเพื่อกระตุ้นตาดอก");
  if (m >= 2 && m <= 5) recs.push("เข้าหน้าร้อน ควรรดน้ำสม่ำเสมอเพื่อลดความเครียดของต้นลำไย");
  if (recs.length === 0) recs.push("ไม่มีคำแนะนำเฉพาะ แผนงานเดือนนี้ดูครบถ้วนแล้ว ✅");
  return recs;
}
