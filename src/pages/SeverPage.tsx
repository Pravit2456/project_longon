import React from "react";
import { Link } from "react-router-dom";
import {
  FiBell, FiCalendar, FiClock, FiMapPin,
  FiTag, FiTool, FiTrendingUp, FiHome,
  FiClipboard, FiSettings, FiUser
} from "react-icons/fi";
import { FaLeaf } from "react-icons/fa";

type Stat = { label: string; value: string; icon: React.ReactNode; wrap: string; valueCls?: string };
type Job = {
  title: string;
  location: string;
  date: string;
  status: "กำลังดำเนินการ" | "รอเริ่มงาน";
  price: string;
  area: string;
  primary: { text: string; intent: "green" | "blue" };
  secondary: { text: string };
};
type Equip = { name: string; desc: string; status: "พร้อมใช้งาน" | "ต้องซ่อม"; tone: "green" | "yellow" };
type Notice = { title: string; desc: string; tone: "blue" | "green" | "orange" };

// ==== ข้อมูลเหมือนเดิม ====
const stats: Stat[] = [
  { label: "สถานะปัจจุบัน", value: "พร้อมรับงาน", icon: <FiHome />, wrap: "bg-emerald-50 text-emerald-700" },
  { label: "งานรอดำเนินการ", value: "5", icon: <FiClipboard />, wrap: "bg-sky-50 text-sky-700" },
  { label: "รายได้เดือนนี้", value: "฿12,500", icon: <FiTrendingUp />, wrap: "bg-amber-50 text-amber-700", valueCls: "tabular-nums" },
  { label: "คะแนนรีวิว", value: "4.8", icon: <FaLeaf />, wrap: "bg-orange-50 text-orange-700" },
];

const jobs: Job[] = [
  {
    title: "จัดแปลงนา - ไร่คุณสมศักดิ์",
    location: "อำเภอเมือง, จังหวัดลำปาง",
    date: "วันที่ 15 มกราคม 2025, 08:00-12:00",
    status: "กำลังดำเนินการ",
    price: "฿2,500",
    area: "5 ไร่",
    primary: { text: "ยืนยันเวลา", intent: "green" },
    secondary: { text: "ติดต่อผู้จ้าง" },
  },
  {
    title: "ตัดแต่งกิ่ง - สวนลุงคำปันทอง",
    location: "อำเภอห้างฉัตร, จังหวัดลำปาง",
    date: "วันที่ 16 มกราคม 2025, 08:00-10:00",
    status: "รอเริ่มงาน",
    price: "฿1,800",
    area: "3 ไร่",
    primary: { text: "เริ่มงาน", intent: "blue" },
    secondary: { text: "ดูรายละเอียด" },
  },
];

const equips: Equip[] = [
  { name: "DJI Agras T30", desc: "โดรนรุ่น T30 30 ลิตร", status: "พร้อมใช้งาน", tone: "green" },
  { name: "เครื่องตัดแต่งกิ่ง", desc: "Stihl HT 103", status: "ต้องซ่อม", tone: "yellow" },
];

const notices: Notice[] = [
  { title: "งานเก็บเกี่ยวรอคิว", desc: "สวนลุงคำปันทอง – 18 ม.ค. 2025", tone: "blue" },
  { title: "งานเสร็จสิ้น", desc: "ได้รับแล้ว ฿2,000 แล้ว", tone: "green" },
  { title: "รีวิวใหม่", desc: "คุณสมชายให้ 5 ดาว", tone: "orange" },
];

// ==== ServerPage ====
export default function ServerPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-sans">
            <div className="h-8 w-8 rounded-md bg-emerald-600 grid place-items-center text-white">
              <FaLeaf />
            </div>
            <span>ลองกันเซอร์วิส</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            {/* Navbar ใช้ Link ไปหน้าอื่น */}
            <Link className="flex items-center gap-2 text-emerald-600" to="/dashboard"><FiHome /> แดชบอร์ด</Link>
            <Link className="flex items-center gap-2 hover:text-slate-900" to="/calendarserver"><FiCalendar /> ปฏิทินงาน</Link>
            <Link className="flex items-center gap-2 hover:text-slate-900" to="/devices"><FiTool /> อุปกรณ์</Link>
            <Link className="flex items-center gap-2 hover:text-slate-900" to="/pricing"><FiTag /> ราคา</Link>
            <Link className="flex items-center gap-2 hover:text-slate-900" to="/profileview"><FiSettings /> โปรไฟล์</Link>
          </nav>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-slate-100">
              <FiBell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-rose-500" />
            </button>
            <div className="flex items-center gap-2">
              <img alt="avatar" src="https://i.pravatar.cc/40?img=68" className="h-8 w-8 rounded-full"/>
              <span className="hidden sm:flex items-center gap-1 text-sm text-slate-700"><FiUser /> สมชาย ใจดี</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s) => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Current jobs */}
        <Section title="งานปัจจุบัน">
          <div className="divide-y">
            {jobs.map((j) => <JobItem key={j.title} {...j} />)}
          </div>
        </Section>

        {/* Equipment + Notices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Section title="สถานะอุปกรณ์">
            <div className="space-y-3">{equips.map((e) => <EquipmentItem key={e.name} {...e} />)}</div>
          </Section>

          <Section title="การแจ้งเตือน">
            <div className="space-y-3">{notices.map((n, i) => <NoticeItem key={i} {...n} />)}</div>
          </Section>
        </div>
      </main>
    </div>
  );
}

// ==== Components ====
function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`mt-6 rounded-xl border bg-white p-4 shadow-sm ${className}`}>{children}</div>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <Card><h2 className="font-semibold mb-4">{title}</h2>{children}</Card>;
}

function StatCard({ label, value, icon, wrap, valueCls }: Stat) {
  return (
    <div className={`rounded-xl border p-4 shadow-sm flex items-center gap-3 ${wrap} border-current/20`}>
      <div className="h-10 w-10 grid place-items-center rounded-lg bg-white/70">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs opacity-80">{label}</p>
        <p className={`text-lg font-semibold truncate ${valueCls ?? ""}`}>{value}</p>
      </div>
    </div>
  );
}

function Badge({ tone, children }: { tone: "green" | "blue" | "gray"; children: React.ReactNode }) {
  const tones: Record<string, string> = {
    green: "bg-emerald-100 text-emerald-700",
    blue: "bg-sky-100 text-sky-700",
    gray: "bg-slate-200 text-slate-700",
  };
  return <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

function JobItem(j: Job) {
  return (
    <div className="py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900">{j.title}</h3>
          <p className="text-sm text-slate-500 flex items-center gap-2 mt-1"><FiMapPin className="shrink-0"/> {j.location}</p>
          <p className="text-sm text-slate-500 flex items-center gap-2 mt-1"><FiClock className="shrink-0"/> {j.date}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone={j.status === "กำลังดำเนินการ" ? "green" : "blue"}>{j.status}</Badge>
            <Link
              to="/calendar"
              className={`px-3 py-1.5 rounded-md text-sm text-white ${
                j.primary.intent === "green" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-sky-600 hover:bg-sky-700"
              }`}
            >{j.primary.text}</Link>
            <Link to="/dashboard" className="px-3 py-1.5 rounded-md text-sm bg-slate-200 text-slate-800 hover:bg-slate-300">{j.secondary.text}</Link>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-emerald-700 font-semibold">{j.price}</div>
          <div className="text-sm text-slate-500">{j.area}</div>
        </div>
      </div>
    </div>
  );
}

function EquipmentItem(e: Equip) {
  const tone = e.tone === "green" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700";
  return (
    <div className="rounded-lg border p-3 flex items-center justify-between">
      <div>
        <p className="font-medium">{e.name}</p>
        <p className="text-sm text-slate-500">{e.desc}</p>
      </div>
      <Link to="/plot" className={`px-3 py-1 rounded-full text-xs font-medium ${tone}`}>{e.status}</Link>
    </div>
  );
}

function NoticeItem(n: Notice) {
  const tone: Record<Notice["tone"], string> = {
    blue: "bg-sky-50 border-sky-100",
    green: "bg-emerald-50 border-emerald-100",
    orange: "bg-orange-50 border-orange-100",
  };
  return (
    <Link to="/alert" className={`rounded-lg border p-3 block ${tone[n.tone]}`}>
      <p className="font-medium">{n.title}</p>
      <p className="text-sm text-slate-600">{n.desc}</p>
    </Link>
  );
}
