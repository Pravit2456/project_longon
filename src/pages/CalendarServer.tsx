import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiBell, FiHome, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FaLeaf } from "react-icons/fa";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
} from "date-fns";
import { th } from "date-fns/locale/th";

/* ===== Types ===== */
type Event = {
  id: number;
  title: string;
  date: string;
  time: string;
  status: "กำลังดำเนินการ" | "เสร็จสิ้น" | "เริ่มงาน" | "กำลังจัดเตรียม";
};

const CalendarServer: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");
  const [events, setEvents] = useState<Event[]>([
    { id: 1, title: "ตรวจสอบแผน A", date: "2024-01-02", time: "09:00", status: "กำลังดำเนินการ" },
    { id: 2, title: "วางแผนป้องกัน", date: "2024-01-04", time: "14:00", status: "กำลังดำเนินการ" },
    { id: 3, title: "เก็บเกี่ยวแปลง B", date: "2024-01-05", time: "08:00", status: "เสร็จสิ้น" },
  ]);

  // modal state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState<Event>({
    id: Date.now(),
    title: "",
    date: "",
    time: "09:00",
    status: "กำลังดำเนินการ",
  });

  /* สีของ event */
  const statusColors: Record<Event["status"], string> = {
    "กำลังดำเนินการ": "bg-orange-50 text-orange-600 border-orange-200",
    "เสร็จสิ้น": "bg-green-50 text-green-600 border-green-200",
    "เริ่มงาน": "bg-blue-50 text-blue-600 border-blue-200",
    "กำลังจัดเตรียม": "bg-yellow-50 text-yellow-600 border-yellow-200",
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const rows: React.ReactNode[] = [];
  let days: React.ReactNode[] = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const dateStr = format(day, "yyyy-MM-dd");
      const dayEvents = events.filter((e) => e.date === dateStr);

      days.push(
        <div
          key={day.toString()}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest(".event-box")) return;
            setSelectedDate(dateStr);
            setEditingEvent(null);
            setNewEvent({ id: Date.now(), title: "", date: dateStr, time: "09:00", status: "กำลังดำเนินการ" });
          }}
          className={`border border-gray-200 p-2 min-h-[100px] rounded-md cursor-pointer ${
            isSameMonth(day, monthStart) ? "bg-white hover:bg-gray-50" : "bg-gray-50 text-gray-400"
          }`}
        >
          <span
            className={`font-semibold text-sm ${
              isToday(day) ? "text-emerald-600" : "text-gray-700"
            }`}
          >
            {format(day, "d")}
          </span>
          <div className="space-y-1 mt-1">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className={`event-box text-xs p-1.5 rounded-md border cursor-pointer ${statusColors[event.status]}`}
                onClick={() => {
                  setEditingEvent(event);
                  setSelectedDate(event.date);
                  setNewEvent(event);
                }}
              >
                <div className="font-medium">{event.title}</div>
                <div className="text-[11px] text-gray-500">{event.time}</div>
              </div>
            ))}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div key={day.toString()} className="grid grid-cols-7 gap-2 mb-2">
        {days}
      </div>
    );
    days = [];
  }

  /* Save / Delete Event */
  const handleSaveEvent = () => {
    if (editingEvent) {
      setEvents(events.map((e) => (e.id === editingEvent.id ? newEvent : e)));
    } else {
      setEvents([...events, { ...newEvent, id: Date.now() }]);
    }
    setSelectedDate(null);
    setEditingEvent(null);
  };

  const handleDeleteEvent = () => {
    if (editingEvent) {
      setEvents(events.filter((e) => e.id !== editingEvent.id));
      setEditingEvent(null);
      setSelectedDate(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-sans">
            <div className="h-8 w-8 rounded-md bg-emerald-600 grid place-items-center text-white">
              <FaLeaf />
            </div>
            <span>Smart Sensor longan</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <Link to="/severpage" className="hover:text-slate-900">
              <FiHome /> แดชบอร์ด
            </Link>
            <button className="text-emerald-600 font-semibold">ปฏิทินงาน</button>
            <a className="hover:text-slate-900" href="#">อุปกรณ์</a>
            <a className="hover:text-slate-900" href="#">ราคา</a>
            <Link to="/profileview" className="hover:text-slate-900">
              โปรไฟล์
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-slate-100">
              <FiBell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-rose-500" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex p-6 max-w-7xl mx-auto gap-6">
        <div className="flex-1">
          {/* Calendar header bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 rounded hover:bg-gray-100">
                <FiChevronLeft />
              </button>
              <h2 className="text-lg font-semibold">
                {format(currentMonth, "MMMM yyyy", { locale: th })}
              </h2>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 rounded hover:bg-gray-100">
                <FiChevronRight />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentMonth(new Date())} className="text-emerald-600 text-sm font-medium">
                วันนี้
              </button>
              <button
                onClick={() => setView("month")}
                className={`flex items-center gap-1 px-3 py-1 border rounded-md text-sm ${
                  view === "month" ? "bg-blue-500 text-white" : "hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                📅 เดือน
              </button>
              <button
                onClick={() => setView("week")}
                className={`flex items-center gap-1 px-3 py-1 border rounded-md text-sm ${
                  view === "week" ? "bg-blue-500 text-white" : "hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                📆 สัปดาห์
              </button>
              <button
                onClick={() => {
                  setSelectedDate(format(new Date(), "yyyy-MM-dd"));
                  setEditingEvent(null);
                  setNewEvent({ id: Date.now(), title: "", date: format(new Date(), "yyyy-MM-dd"), time: "09:00", status: "กำลังดำเนินการ" });
                }}
                className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700"
              >
                ➕ เพิ่มกิจกรรม
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-4 mb-4 text-sm">
            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-400"></span> กำลังดำเนินการ</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> เสร็จสิ้น</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span> เริ่มงาน</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-400"></span> กำลังจัดเตรียม</div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 text-center font-medium mb-2">
            <div>อา</div><div>จ</div><div>อ</div><div>พ</div><div>พฤ</div><div>ศ</div><div>ส</div>
          </div>

          {rows}
        </div>

        {/* Sidebar */}
        <div className="w-64 space-y-6">
          <div className="border border-gray-200 rounded-md p-3 bg-white shadow-sm">
            <h3 className="font-semibold mb-2">รายละเอียดกิจกรรม</h3>
            <p className="text-sm text-gray-500">คลิกวันที่เพื่อเพิ่ม หรือคลิกกิจกรรมเพื่อแก้ไข/ลบ</p>
          </div>

          <div className="border border-gray-200 rounded-md p-3 bg-white shadow-sm">
            <h3 className="font-semibold mb-2">สถิติรายเดือน</h3>
            <div className="text-gray-400 text-sm">[กราฟหรือข้อมูลสถิติ]</div>
          </div>

          <div className="border border-gray-200 rounded-md p-3 bg-white shadow-sm space-y-2">
            <h3 className="font-semibold mb-2">การดำเนินการด่วน</h3>
            <button className="w-full bg-blue-500 text-white py-1.5 rounded-md">🔔 ตั้งเตือน</button>
            <button className="w-full bg-green-500 text-white py-1.5 rounded-md">📤 ส่งออกรายงาน</button>
            <button className="w-full bg-orange-500 text-white py-1.5 rounded-md">📂 จัดเก็บข้อมูล</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {editingEvent ? "แก้ไขกิจกรรม" : "เพิ่มกิจกรรม"} - {format(new Date(selectedDate), "d MMM yyyy", { locale: th })}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm">ชื่อกิจกรรม</label>
                <input
                  type="text"
                  className="w-full border rounded-md p-2 text-sm"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm">เวลา</label>
                <input
                  type="time"
                  className="w-full border rounded-md p-2 text-sm"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm">สถานะ</label>
                <select
                  className="w-full border rounded-md p-2 text-sm"
                  value={newEvent.status}
                  onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value as Event["status"] })}
                >
                  <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                  <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                  <option value="เริ่มงาน">เริ่มงาน</option>
                  <option value="กำลังจัดเตรียม">กำลังจัดเตรียม</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              {editingEvent && (
                <button onClick={handleDeleteEvent} className="px-4 py-2 bg-red-500 text-white rounded-md">
                  ลบกิจกรรม
                </button>
              )}
              <div className="flex gap-2 ml-auto">
                <button onClick={() => { setSelectedDate(null); setEditingEvent(null); }} className="px-4 py-2 border rounded-md">
                  ยกเลิก
                </button>
                <button onClick={handleSaveEvent} className="px-4 py-2 bg-emerald-600 text-white rounded-md">
                  {editingEvent ? "บันทึกการแก้ไข" : "บันทึก"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarServer;