// src/pages/ServerPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiCalendar, FiHome, FiUser } from "react-icons/fi";
import { FaLeaf } from "react-icons/fa";

/* ---------- Types ---------- */
type JobStatus = "รอเริ่มงาน" | "กำลังดำเนินการ" | "จบงาน";
type Job = {
  id: string;
  title: string;
  location: string;
  date: string;
  price: string;
  area: string;
  status: JobStatus;
  finishedAt?: number; // เวลาเสร็จงาน (unix ms)
};

/* ---------- UI helpers ---------- */
function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`mt-6 rounded-xl border bg-white p-4 shadow-sm ${className}`}>{children}</div>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <h2 className="font-semibold mb-4">{title}</h2>
      {children}
    </Card>
  );
}

/* ---------- Notifications (localStorage) ---------- */
type ProviderNoti = {
  id: string;
  message: string;
  time: string;
  link?: string;
  type?: string;
  isUnread?: boolean;
};

const LS = {
  providerNoti: "provider_notifications",
  jobs: "provider_jobs",
};

/* ---------- LocalStorage helpers ---------- */
function lsLoad<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function lsSave<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ---------- Initial demo data (ครั้งแรกเท่านั้น) ---------- */
const seedJobs: Job[] = [
  {
    id: "j1",
    title: "จัดแปลงนา - ไร่คุณสมศักดิ์",
    location: "อำเภอเมือง, จังหวัดลำปาง",
    date: "วันที่ 15 มกราคม 2025, 08:00-12:00",
    status: "กำลังดำเนินการ",
    price: "฿2,500",
    area: "5 ไร่",
  },
  {
    id: "j2",
    title: "ตัดแต่งกิ่ง - สวนลุงคำปันทอง",
    location: "อำเภอห้างฉัตร, จังหวัดลำปาง",
    date: "วันที่ 16 มกราคม 2025, 08:00-10:00",
    status: "รอเริ่มงาน",
    price: "฿1,800",
    area: "3 ไร่",
  },
  {
    id: "j3",
    title: "เก็บเกี่ยวลำไย - สวนลุงสมปอง",
    location: "อำเภอสันกำแพง, จังหวัดเชียงใหม่",
    date: "วันที่ 18 มกราคม 2025, 07:00-11:00",
    status: "รอเริ่มงาน",
    price: "฿3,500",
    area: "6 ไร่",
  },
  {
    id: "j4",
    title: "พ่นปุ๋ย - สวนยายทอง",
    location: "อำเภอแม่ริม, จังหวัดเชียงใหม่",
    date: "วันที่ 20 มกราคม 2025, 09:00-12:00",
    status: "รอเริ่มงาน",
    price: "฿2,200",
    area: "4 ไร่",
  },
];

/* ---------- Job item with dynamic actions ---------- */
function JobItem({
  job,
  onPrimary,
  onSecondary,
}: {
  job: Job;
  onPrimary: (id: string) => void;
  onSecondary: (id: string) => void;
}) {
  const statusBadge =
    job.status === "กำลังดำเนินการ"
      ? "bg-emerald-100 text-emerald-700"
      : job.status === "รอเริ่มงาน"
      ? "bg-sky-100 text-sky-700"
      : "bg-slate-200 text-slate-700";

  const primaryText =
    job.status === "รอเริ่มงาน" ? "เริ่มงาน" : job.status === "กำลังดำเนินการ" ? "เสร็จสิ้นแล้ว" : "จบงานแล้ว";
  const primaryStyle =
    job.status === "รอเริ่มงาน"
      ? "bg-sky-600 hover:bg-sky-700"
      : job.status === "กำลังดำเนินการ"
      ? "bg-emerald-600 hover:bg-emerald-700"
      : "bg-slate-400 cursor-not-allowed";

  const secondaryText = job.status === "รอเริ่มงาน" ? "ดูรายละเอียด" : job.status === "กำลังดำเนินการ" ? "ติดต่อผู้จ้าง" : "รายละเอียด";
  const secondaryDisabled = job.status === "จบงาน";

  return (
    <div className="py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900">{job.title}</h3>
          <p className="text-sm text-slate-500 mt-1">{job.location}</p>
          <p className="text-sm text-slate-500 mt-1">{job.date}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusBadge}`}>{job.status}</span>

            <button
              onClick={() => (job.status === "จบงาน" ? undefined : onPrimary(job.id))}
              className={`px-3 py-1.5 rounded-md text-sm text-white font-semibold ${primaryStyle}`}
              disabled={job.status === "จบงาน"}
            >
              {primaryText}
            </button>

            <button
              onClick={() => (!secondaryDisabled ? onSecondary(job.id) : undefined)}
              className={`px-3 py-1.5 rounded-md text-sm cursor-pointer font-medium ${
                secondaryDisabled ? "bg-slate-200 text-slate-500 cursor-not-allowed" : "bg-slate-200 text-slate-800 hover:bg-slate-300"
              }`}
              disabled={secondaryDisabled}
            >
              {secondaryText}
            </button>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-emerald-700 font-semibold">{job.price}</div>
          <div className="text-sm text-slate-500">{job.area}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- History modal ---------- */
function HistoryModal({
  job,
  onClose,
  onCalendar,
  onContact,
}: {
  job: Job;
  onClose: () => void;
  onCalendar: () => void;
  onContact: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">รายละเอียดงาน (จบงาน)</h3>
          <button onClick={onClose} className="text-sm text-slate-600">ปิด</button>
        </div>
        <div className="space-y-1 text-sm">
          <div className="font-medium">{job.title}</div>
          <div className="text-slate-600">{job.location}</div>
          <div className="text-slate-600">{job.date}</div>
          <div>ขนาดพื้นที่: {job.area}</div>
          <div>ราคา: {job.price}</div>
          {job.finishedAt && (
            <div className="text-slate-500">
              เสร็จงานเมื่อ: {new Date(job.finishedAt).toLocaleString("th-TH")}
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onCalendar} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm">ดูในปฏิทินงาน</button>
          <button onClick={onContact} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-2 rounded-lg text-sm">ดูโปรไฟล์ผู้จ้าง</button>
        </div>
      </div>
    </div>
  );
}

export default function ServerPage() {
  const navigate = useNavigate();

  /* ---------- Notifications ---------- */
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ProviderNoti[]>(() => lsLoad<ProviderNoti[]>(LS.providerNoti, []));
  useEffect(() => {
    const handler = () => setItems(lsLoad<ProviderNoti[]>(LS.providerNoti, []));
    window.addEventListener("provider-noti-updated", handler);
    return () => window.removeEventListener("provider-noti-updated", handler);
  }, []);
  // migration link
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS.providerNoti);
      if (!raw) return;
      const arr = JSON.parse(raw) as Array<any>;
      let changed = false;
      const fixed = arr.map((n) => {
        if (n && typeof n === "object" && typeof n.link === "string" && n.link.includes("/serverpage/provider-slot")) {
          changed = true;
          return { ...n, link: "/provider-slot" };
        }
        return n;
      });
      if (changed) {
        localStorage.setItem(LS.providerNoti, JSON.stringify(fixed));
        setItems(fixed);
      }
    } catch {}
  }, []);
  const unreadCount = useMemo(() => items.filter((n) => n.isUnread).length, [items]);

  const onClickNoti = (idx: number) => {
    if (idx < 0 || idx >= items.length) return;
    const copy = [...items];
    copy[idx] = { ...copy[idx], isUnread: false };
    lsSave(LS.providerNoti, copy);
    setItems(copy);
    setOpen(false);
    let dest = copy[idx].link && copy[idx].link.trim() ? copy[idx].link! : "/provider-slot";
    if (dest.includes("/serverpage/provider-slot")) dest = "/provider-slot";
    navigate(dest);
  };

  /* ---------- Jobs (persist) ---------- */
  const [jobs, setJobs] = useState<Job[]>(() => {
    const existing = lsLoad<Job[]>(LS.jobs, []);
    if (existing.length > 0) return existing;
    lsSave(LS.jobs, seedJobs);
    return seedJobs;
  });
  useEffect(() => {
    lsSave(LS.jobs, jobs);
  }, [jobs]);

  // เปลี่ยนสถานะตาม workflow
  const handlePrimary = (id: string) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id !== id) return j;
        if (j.status === "รอเริ่มงาน") return { ...j, status: "กำลังดำเนินการ" };
        if (j.status === "กำลังดำเนินการ") return { ...j, status: "จบงาน", finishedAt: Date.now() };
        return j;
      })
    );
  };

  // ปุ่มรอง: นำทางตามสถานะ
  const handleSecondary = (id: string) => {
    const job = jobs.find((x) => x.id === id);
    if (!job) return;
    if (job.status === "รอเริ่มงาน") {
      navigate("/provider-slot"); // ไปดู/ยืนยันคิว
    } else if (job.status === "กำลังดำเนินการ") {
      navigate("/profileview"); // ติดต่อผู้จ้าง
    } else {
      setHistoryOpen(job); // จบงานแล้ว เปิด modal รายละเอียด
    }
  };

  // แบ่งกลุ่มเพื่อแสดง
  const currentJobs = jobs.filter((j) => j.status === "รอเริ่มงาน" || j.status === "กำลังดำเนินการ");
  const waitingJobs = jobs.filter((j) => j.status === "รอเริ่มงาน");

  // ---------- ประวัติการรับงาน ----------
  const history = useMemo(
    () =>
      jobs
        .filter((j) => j.status === "จบงาน")
        .sort((a, b) => (b.finishedAt || 0) - (a.finishedAt || 0)),
    [jobs]
  );
  const [historyOpen, setHistoryOpen] = useState<Job | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 font-sans font-semibold">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-sans">
            <div className="h-8 w-8 rounded-md bg-emerald-600 grid place-items-center text-white">
              <FaLeaf />
            </div>
            <span>ลองกันเซอร์วิส</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <button className="flex items-center gap-2 text-emerald-600 cursor-pointer hover:opacity-80" onClick={() => navigate("/dashboard")}>
              <FiHome /> แดชบอร์ด
            </button>
            <button className="flex items-center gap-2 cursor-pointer hover:opacity-80" onClick={() => navigate("/calendarserver")}>
              <FiCalendar /> ปฏิทินงาน
            </button>
            <button className="flex items-center gap-2 cursor-pointer hover:opacity-80" onClick={() => navigate("/profileview")}>
              <FiUser /> โปรไฟล์
            </button>
          </nav>

          {/* กระดิ่ง + avatar */}
          <div className="flex items-center gap-4 relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="relative p-2 rounded-full hover:bg-slate-100 cursor-pointer"
              aria-label="notifications"
            >
              <FiBell className="h-5 w-5" />
              {unreadCount > 0 && (
                <>
                  <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <span className="absolute -bottom-1.5 -right-1 rounded bg-rose-500 text-white text-[10px] px-1 leading-4">
                    {unreadCount}
                  </span>
                </>
              )}
            </button>

            <button onClick={() => navigate("/profileview")} className="flex items-center gap-2 hover:opacity-80 cursor-pointer">
              <img alt="avatar" src="https://i.pravatar.cc/40?img=68" className="h-8 w-8 rounded-full" />
              <span className="hidden sm:block text-sm text-slate-700 font-medium">สมชาย ใจดี</span>
            </button>

            {/* Dropdown แจ้งเตือน */}
            {open && (
              <div className="absolute right-0 top-12 w-96 bg-white border rounded-lg shadow-lg z-50">
                <div className="p-3 font-semibold border-b flex items-center justify-between">
                  <span>การแจ้งเตือน</span>
                  {items.length > 0 && (
                    <button
                      onClick={() => {
                        const cleared = items.map((n) => ({ ...n, isUnread: false }));
                        lsSave(LS.providerNoti, cleared);
                        setItems(cleared);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      ทำเครื่องหมายว่าอ่านแล้วทั้งหมด
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y">
                  {items.length === 0 ? (
                    <div className="p-4 text-sm text-slate-400">ยังไม่มีการแจ้งเตือน</div>
                  ) : (
                    items.map((n, i) => (
                      <button
                        key={n.id}
                        onClick={() => onClickNoti(i)}
                        className={`w-full text-left p-3 rounded-md transition ${n.isUnread ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-50"}`}
                      >
                        <p className="text-sm font-medium">{n.message}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* งานปัจจุบัน */}
        <Section title="งานปัจจุบัน">
          <div className="divide-y">
            {currentJobs.length === 0 ? (
              <div className="text-sm text-slate-500">ยังไม่มีงานปัจจุบัน</div>
            ) : (
              currentJobs.map((j) => (
                <JobItem key={j.id} job={j} onPrimary={handlePrimary} onSecondary={handleSecondary} />
              ))
            )}
          </div>
        </Section>

        {/* งานที่รอดำเนินการ */}
        <Section title="งานที่รอดำเนินการ">
          <div className="divide-y">
            {waitingJobs.length === 0 ? (
              <div className="text-sm text-slate-500">ไม่มีงานรอเริ่ม</div>
            ) : (
              waitingJobs.map((j) => (
                <JobItem key={j.id} job={j} onPrimary={handlePrimary} onSecondary={handleSecondary} />
              ))
            )}
          </div>
        </Section>

        {/* ประวัติการรับงาน */}
        <Section title="ประวัติการรับงาน (จบงานแล้ว)">
          {history.length === 0 ? (
            <div className="text-sm text-slate-500">ยังไม่มีประวัติการจบงาน</div>
          ) : (
            <ul className="divide-y">
              {history.map((h) => (
                <li key={h.id} className="py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900">{h.title}</div>
                    <div className="text-sm text-slate-600">{h.location}</div>
                    <div className="text-xs text-slate-500">
                      เสร็จงานเมื่อ: {new Date(h.finishedAt || 0).toLocaleString("th-TH")}
                    </div>
                  </div>
                  <button
                    onClick={() => setHistoryOpen(h)}
                    className="px-3 py-1.5 rounded-md text-sm bg-slate-200 text-slate-800 hover:bg-slate-300"
                  >
                    ดูรายละเอียด
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </main>

      {/* Modal รายละเอียดประวัติ */}
      {historyOpen && (
        <HistoryModal
          job={historyOpen}
          onClose={() => setHistoryOpen(null)}
          onCalendar={() => navigate("/calendarserver")}
          onContact={() => navigate("/profileview")}
        />
      )}
    </div>
  );
}
