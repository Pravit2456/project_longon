// src/pages/FindProviders.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell } from "react-icons/fi";

/* ========= Types ========= */
type Provider = {
  id: number;
  name: string;
  service: string;
  workers: string;
  available: string;
  location: string;
  price: string; // e.g. "฿650/ไร่"
  rating: number;
  reviews: number;
  avatar: string;
};

type BookingStatus = "รอยืนยัน" | "ยืนยันแล้ว" | "ยกเลิก";

type Booking = {
  id: string;
  providerId: number;
  providerName: string;
  price: string;
  bookedAt: number; // timestamp
  status: BookingStatus;
  note?: string;
  areaRai?: number; // ขนาดพื้นที่ (ไร่)
  startDate?: string; // YYYY-MM-DD
};

/* ==== inbox/notification types สำหรับฝั่งผู้ให้บริการ (LS shared) ==== */
type ProviderInboxItem = {
  id: string;
  slot: string; // ข้อความช่วงเวลา
  status: "pending" | "accepted" | "rejected";
  createdAt: string; // ISO
};

type ProviderNoti = {
  id: string;
  message: string;
  time: string; // เช่น "22:15 วันนี้"
  link?: string;
  type?: string;
  isUnread?: boolean;
};

/* ==== แจ้งเตือนฝั่งเกษตรกร (ที่ผู้ให้บริการเขียนให้) ==== */
type AlertItem = {
  type: string;
  severity: "ระดับเฝ้าระวัง" | "รุนแรง" | "รุนแรงมาก";
  message?: string;
  time: string;     // string แสดงเวลา เช่น "22:15 วันนี้"
  color: "orange" | "red";
  signature: string; // accepted_<id> / rejected_<id>
};

/* ========= Mock providers ========= */
const providers: Provider[] = [
  {
    id: 1,
    name: "บริษัท เกษตรกรรมลำไยใหม่",
    service: "✂️ ตัดแต่งต้น",
    workers: "แรงงาน 8 คน • โดรน 2 ลำ",
    available: "ว่าง: 18 ม.ค. 2025",
    location: "เชียงใหม่, สันทราย",
    price: "฿650/ไร่",
    rating: 4.9,
    reviews: 89,
    avatar: "https://i.pravatar.cc/100?img=12",
  },
  {
    id: 2,
    name: "ลุงสมชาย เกษตรอินทรีย์",
    service: "🌱 บำรุงต้น",
    workers: "แรงงาน 5 คน",
    available: "ว่าง: 12 ม.ค. 2025",
    location: "ลำปาง, เมือง",
    price: "฿450/ไร่",
    rating: 4.9,
    reviews: 55,
    avatar: "https://i.pravatar.cc/100?img=33",
  },
  {
    id: 3,
    name: "ทีมเก็บเกี่ยวมืออาชีพ",
    service: "🌾 เก็บเกี่ยวผลผลิต",
    workers: "แรงงาน 12 คน • เครื่องจักร",
    available: "ว่าง: 10 ม.ค. 2025",
    location: "เชียงใหม่, ดอยสะเก็ด",
    price: "฿800/ไร่",
    rating: 4.7,
    reviews: 156,
    avatar: "https://i.pravatar.cc/100?img=45",
  },
  {
    id: 4,
    name: "คุณนภัส เกษตรธรรมชาติ",
    service: "✂️ ตัดแต่งต้น",
    workers: "แรงงาน 6 คน",
    available: "ว่าง: 20 ม.ค. 2025",
    location: "ลำพูน, บ้านโฮ่ง",
    price: "฿550/ไร่",
    rating: 4.6,
    reviews: 57,
    avatar: "https://i.pravatar.cc/100?img=25",
  },
  {
    id: 5,
    name: "กลุ่มเกษตรกรสหกรณ์",
    service: "🌱 บำรุงต้น",
    workers: "แรงงาน 10 คน • โดรน 3 ลำ",
    available: "ว่าง: 14 ม.ค. 2025",
    location: "เชียงใหม่, หางดง",
    price: "฿600/ไร่",
    rating: 4.8,
    reviews: 203,
    avatar: "https://i.pravatar.cc/100?img=8",
  },
];

/* ========= Persistent storage helpers ========= */
const BOOKINGS_KEY = "bookingHistory";

/** ประวัติการจองของฝั่งเกษตรกร */
function loadBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    return raw ? (JSON.parse(raw) as Booking[]) : [];
  } catch {
    return [];
  }
}
function saveBookings(items: Booking[]) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(items));
}

/* ==== คีย์และ helper ที่ใช้ข้ามหน้า (ต้องตรงกับ ProviderSlotPage) ==== */
const LS_KEYS = {
  providerSlots: "provider_slots",
  incoming: "incoming_bookings",
  farmerAlerts: "alerts_current",
  providerNoti: "provider_notifications",
};

// สำหรับกระดิ่งฝั่งเกษตรกร (จำจำนวนที่อ่านแล้ว)
const FARMER_ALERTS_READ_COUNT = "alerts_read_count";

// ช่องทาง broadcast ข้ามแท็บ/เส้นทาง
const BC_NAME = "booking-sync";

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

/* ========= Utils ========= */
const getYear = (b: Booking) =>
  (b.startDate ? new Date(b.startDate) : new Date(b.bookedAt)).getFullYear();

const groupByYear = (items: Booking[]) =>
  items.reduce<Record<string, Booking[]>>((acc, b) => {
    const y = String(getYear(b));
    (acc[y] ||= []).push(b);
    return acc;
  }, {});

/* ==== format เวลา สำหรับข้อความแจ้งเตือน ==== */
function formatThaiTime(ts: number) {
  return new Date(ts).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
function makeSlotText(fromDate?: string) {
  if (fromDate) return `วันที่ ${fromDate}`;
  return `จองเมื่อเวลา ${formatThaiTime(Date.now())}`;
}

/* ========= Component ========= */
export default function FindProviders() {
  const navigate = useNavigate();

  // booking form (inline)
  const [formOpenId, setFormOpenId] = useState<number | null>(null);
  const [formArea, setFormArea] = useState<string>("");
  const [formDate, setFormDate] = useState<string>("");
  const [formNote, setFormNote] = useState<string>("");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [openYear, setOpenYear] = useState<string | null>(null); // accordion ปี
  const [showAllYear, setShowAllYear] = useState<string | null>(null); // modal

  // ค้นหา/กรอง provider
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("ทั้งหมด");

  // 🔔 กระดิ่งฝั่งเกษตรกร
  const [alerts, setAlerts] = useState<AlertItem[]>(() => lsLoad<AlertItem[]>(LS_KEYS.farmerAlerts, []));
  const [bellOpen, setBellOpen] = useState(false);
  const unreadCount = useMemo(() => {
    const readCount = Number(localStorage.getItem(FARMER_ALERTS_READ_COUNT) || "0");
    return Math.max(0, alerts.length - readCount);
  }, [alerts]);

  // ประเภทบริการ (จากข้อมูลจริง)
  const serviceOptions = useMemo(() => {
    const set = new Set<string>();
    providers.forEach((p) => set.add(p.service));
    return ["ทั้งหมด", ...Array.from(set)];
  }, []);

  useEffect(() => {
    setBookings(loadBookings());
  }, []);

  // newest first
  const sortedBookings = useMemo(
    () => [...bookings].sort((a, b) => b.bookedAt - a.bookedAt),
    [bookings]
  );
  const grouped = useMemo(() => {
    const g = groupByYear(sortedBookings);
    if (!openYear) {
      const newest = Object.keys(g).sort((a, b) => Number(b) - Number(a))[0];
      if (newest) setOpenYear(newest);
    }
    return g;
  }, [sortedBookings, openYear]);

  // ฟิลเตอร์ provider ตาม search + serviceFilter
  const providersToRender = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return providers.filter((p) => {
      const matchSearch =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.service.toLowerCase().includes(q);
      const matchService =
        serviceFilter === "ทั้งหมด" || p.service === serviceFilter;
      return matchSearch && matchService;
    });
  }, [searchTerm, serviceFilter]);

  // ==== sync แจ้งเตือนเกษตรกรแบบทันที ====
  useEffect(() => {
    const onAlertsUpdated = () => setAlerts(lsLoad<AlertItem[]>(LS_KEYS.farmerAlerts, []));
    window.addEventListener("alerts-updated", onAlertsUpdated);

    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_KEYS.farmerAlerts) onAlertsUpdated();
    };
    window.addEventListener("storage", onStorage);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(BC_NAME);
      bc.onmessage = (ev) => {
        if (ev?.data?.type === "alerts-updated") onAlertsUpdated();
      };
    } catch {}

    return () => {
      window.removeEventListener("alerts-updated", onAlertsUpdated);
      window.removeEventListener("storage", onStorage);
      if (bc) bc.close();
    };
  }, []);

  const openForm = (providerId: number) => {
    setFormOpenId(providerId);
    setFormArea("");
    setFormDate("");
    setFormNote("");
  };

  /** ✅ สร้างการจอง:
   *  - บันทึกประวัติฝั่งผู้ใช้
   *  - ส่งคำขอไปยังผู้ให้บริการ (incoming_bookings)
   *  - กระตุ้น provider ให้รีเฟรชผ่าน CustomEvent + BroadcastChannel
   *  - ทำกระดิ่งผู้ให้บริการ (optional)
   */
  const createBooking = (p: Provider) => {
    const areaRai = formArea ? Number(formArea) : undefined;

    // 1) ประวัติฝั่งผู้ใช้
    const booking: Booking = {
      id: crypto.randomUUID(),
      providerId: p.id,
      providerName: p.name,
      price: p.price,
      bookedAt: Date.now(),
      status: "รอยืนยัน",
      areaRai,
      startDate: formDate || undefined,
      note: formNote || undefined,
    };
    const nextHistory = [booking, ...bookings];
    setBookings(nextHistory);
    saveBookings(nextHistory);

    // 2) ส่งเข้ากล่องคำขอของ "ผู้ให้บริการ"
    const inbox = lsLoad<ProviderInboxItem[]>(LS_KEYS.incoming, []);
    const newInboxItem: ProviderInboxItem = {
      id: booking.id,
      slot: makeSlotText(booking.startDate),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    const nextInbox = [newInboxItem, ...inbox];
    lsSave(LS_KEYS.incoming, nextInbox);

    // แจ้งหน้า ProviderSlotPage (ถ้าอยู่ route อื่นในหน้าเดียวกัน)
    window.dispatchEvent(new CustomEvent("incoming-booking-updated"));

    // แจ้งต่างแท็บ/ต่าง route แบบ real-time
    try {
      const bc = new BroadcastChannel(BC_NAME);
      bc.postMessage({ type: "incoming-booking-updated" });
      bc.close();
    } catch {}

    // 3) (optional) กระดิ่งฝั่งผู้ให้บริการ
    const noti = lsLoad<ProviderNoti[]>(LS_KEYS.providerNoti, []);
    const newNoti: ProviderNoti = {
      id: "noti_" + booking.id,
      message: `มีคำขอจองใหม่ • ${makeSlotText(booking.startDate)}`,
      time: `${formatThaiTime(Date.now())} วันนี้`,
      type: "booking",
      isUnread: true,
      link: "/provider-slot",
    };
    lsSave(LS_KEYS.providerNoti, [newNoti, ...noti]);
    window.dispatchEvent(new CustomEvent("provider-noti-updated"));
    try {
      const bc2 = new BroadcastChannel(BC_NAME);
      bc2.postMessage({ type: "provider-noti-updated" });
      bc2.close();
    } catch {}

    // ปิดฟอร์ม
    setFormOpenId(null);
  };

  const cancelBooking = (id: string) => {
    const next = bookings.map((b) =>
      b.id === id ? { ...b, status: "ยกเลิก" as BookingStatus } : b
    );
    setBookings(next);
    saveBookings(next);
  };

  const deleteBooking = (id: string) => {
    const next = bookings.filter((b) => b.id !== id);
    setBookings(next);
    saveBookings(next);
  };

  const clearAll = () => {
    setBookings([]);
    saveBookings([]);
  };

  // ทำเครื่องหมายว่าอ่านแล้วทั้งหมดที่กระดิ่งตอนเปิด
  const markAlertsRead = () => {
    localStorage.setItem(FARMER_ALERTS_READ_COUNT, String(alerts.length));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-6 md:flex-row md:items-end md:justify-between">
        <h1 className="text-xl font-bold">หาผู้ให้บริการ</h1>

        <div className="flex items-center gap-3">
          {/* 🔔 กระดิ่งแจ้งเตือนฝั่งเกษตรกร */}
          <div className="relative">
            <button
              onClick={() => {
                const next = !bellOpen;
                setBellOpen(next);
                if (next) markAlertsRead();
              }}
              className="relative p-2 rounded-full hover:bg-white border bg-white shadow-sm"
              aria-label="การแจ้งเตือน"
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

            {bellOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-white border rounded-lg shadow-lg z-50">
                <div className="p-3 font-semibold border-b">การแจ้งเตือน</div>
                <div className="max-h-80 overflow-y-auto divide-y">
                  {alerts.length === 0 ? (
                    <div className="p-4 text-sm text-slate-400">ยังไม่มีการแจ้งเตือน</div>
                  ) : (
                    alerts.map((n) => (
                      <div key={n.signature} className="w-full text-left p-3">
                        <p className="text-sm font-medium">{n.message || n.type}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* แถบค้นหา + dropdown บริการ */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อ/บริการ/ตำแหน่ง เช่น 'สมชาย' หรือ 'เชียงใหม่'"
                className="pl-9 pr-9 py-2 text-sm border rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
                >
                  ล้าง
                </button>
              )}
            </div>

            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="text-sm border rounded-xl px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {serviceOptions.map((op) => (
                <option key={op} value={op}>
                  {op === "ทั้งหมด" ? "บริการทั้งหมด" : op}
                </option>
              ))}
            </select>

            {/* เรียงตาม (placeholder) */}
            <div className="flex items-center gap-2">
              <span className="text-sm">เรียงตาม:</span>
              <select className="border rounded-xl px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>พื้นที่บริการใกล้ที่สุด</option>
                <option>ประหยัดที่สุด</option>
                <option>ว่างบริการ</option>
                <option>เริ่มงานได้เร็ว</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Layout: providers + booking history sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Providers Grid */}
        <div className="xl:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providersToRender.length === 0 ? (
              <div className="col-span-full">
                <div className="flex items-center justify-center p-6 bg-white rounded-xl border">
                  <span className="text-gray-500 text-sm">
                    ไม่พบผู้ให้บริการที่ตรงกับคำค้น/ตัวกรอง
                  </span>
                </div>
              </div>
            ) : (
              providersToRender.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl shadow hover:shadow-md transition p-4 flex flex-col justify-between border"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-12 h-12 rounded-full ring-2 ring-gray-100"
                      />
                      <div>
                        <h2 className="font-semibold">{p.name}</h2>
                        <p className="text-sm text-green-700">{p.service}</p>
                      </div>
                    </div>

                    <div className="space-y-1 text-sm">
                      <p>{p.workers}</p>
                      <p className="text-gray-600">{p.available}</p>
                      <p className="text-gray-600">📍 {p.location}</p>
                      <p className="font-bold text-green-600 mt-2">{p.price}</p>
                      <p className="text-yellow-700">
                        ⭐ {p.rating} <span className="text-gray-500">({p.reviews} รีวิว)</span>
                      </p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => navigate("/providerdetail")}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm"
                    >
                      ดูรายละเอียด
                    </button>
                    <button
                      onClick={() => openForm(p.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm"
                    >
                      จองบริการ
                    </button>
                  </div>

                  {/* Inline booking form */}
                  {formOpenId === p.id && (
                    <div className="mt-3 border rounded-lg p-3 bg-gray-50">
                      <h3 className="font-medium mb-2">บันทึกการจอง</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-1">
                          <label className="text-xs text-gray-600">พื้นที่ (ไร่)</label>
                          <input
                            type="number"
                            min={0}
                            step="0.1"
                            value={formArea}
                            onChange={(e) => setFormArea(e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="เช่น 5"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="text-xs text-gray-600">วันที่เริ่มงาน</label>
                          <input
                            type="date"
                            value={formDate}
                            onChange={(e) => setFormDate(e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs text-gray-600">หมายเหตุ</label>
                          <input
                            type="text"
                            value={formNote}
                            onChange={(e) => setFormNote(e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => createBooking(p)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm"
                        >
                          บันทึกการจอง
                        </button>
                        <button
                          onClick={() => setFormOpenId(null)}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg text-sm"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Booking History Sidebar */}
        <aside className="xl:col-span-1">
          <div className="bg-white rounded-xl shadow p-4 sticky top-4 max-h-[calc(100vh-2rem)] overflow-auto border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">
                ประวัติการจองคิว{" "}
                <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                  {sortedBookings.length}
                </span>
              </h2>
              {sortedBookings.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-red-600 hover:underline"
                >
                  ลบทั้งหมด
                </button>
              )}
            </div>

            {sortedBookings.length === 0 ? (
              <p className="text-sm text-gray-500">ยังไม่มีประวัติการจอง</p>
            ) : (
              <div className="space-y-3">
                {Object.keys(grouped)
                  .sort((a, b) => Number(b) - Number(a))
                  .map((year) => {
                    const items = grouped[year]!;
                    const preview = items.slice(0, 3);
                    const isOpen = openYear === year;

                    return (
                      <div key={year} className="border rounded-lg">
                        <button
                          onClick={() => setOpenYear(isOpen ? null : year)}
                          className="w-full flex items-center justify-between px-3 py-2"
                        >
                          <span className="font-medium">{year}</span>
                          <span className="text-xs text-gray-500">
                            {items.length} รายการ
                          </span>
                        </button>

                        {isOpen && (
                          <div className="px-3 pb-3 space-y-2">
                            {preview.map((b) => (
                              <div
                                key={b.id}
                                className="border rounded p-3 hover:bg-gray-50"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="font-medium">
                                    {b.providerName}
                                  </div>
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded ${
                                      b.status === "ยกเลิก"
                                        ? "bg-red-100 text-red-700"
                                        : b.status === "ยืนยันแล้ว"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-yellow-100 text-yellow-700"
                                    }`}
                                  >
                                    {b.status}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  ราคา: {b.price}
                                  {b.areaRai ? ` • พื้นที่ ${b.areaRai} ไร่` : ""}
                                  {b.startDate ? ` • เริ่ม ${b.startDate}` : ""}
                                </div>
                                {b.note && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    หมายเหตุ: {b.note}
                                  </div>
                                )}
                                <div className="text-xs text-gray-400 mt-1">
                                  บันทึกเมื่อ:{" "}
                                  {new Date(b.bookedAt).toLocaleString("th-TH")}
                                </div>

                                <div className="flex gap-2 mt-2">
                                  {b.status !== "ยกเลิก" && (
                                    <button
                                      onClick={() => cancelBooking(b.id)}
                                      className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded"
                                    >
                                      ยกเลิก
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteBooking(b.id)}
                                    className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                                  >
                                    ลบ
                                  </button>
                                </div>
                              </div>
                            ))}

                            {items.length > 3 && (
                              <button
                                onClick={() => setShowAllYear(year)}
                                className="w-full text-xs mt-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 rounded"
                              >
                                ดูทั้งหมด {items.length} รายการของปี {year}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Modal: รายการทั้งหมดของปี */}
      {showAllYear && (
        <AllBookingsModal
          year={showAllYear}
          items={grouped[showAllYear] || []}
          onClose={() => setShowAllYear(null)}
          onCancel={cancelBooking}
          onDelete={deleteBooking}
        />
      )}
    </div>
  );
}

/* ========= Child: All bookings modal with search + tabs + pagination ========= */
function AllBookingsModal({
  year,
  items,
  onClose,
  onCancel,
  onDelete,
}: {
  year: string;
  items: Booking[];
  onClose: () => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"ทั้งหมด" | BookingStatus>("ทั้งหมด");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = useMemo(() => {
    let list = items;
    if (tab !== "ทั้งหมด") list = list.filter((b) => b.status === tab);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.providerName.toLowerCase().includes(s) ||
          (b.note || "").toLowerCase().includes(s)
      );
    }
    return list.sort((a, b) => b.bookedAt - a.bookedAt);
  }, [items, q, tab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [q, tab, items]);

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">รายการทั้งหมดของปี {year}</h3>
          <button onClick={onClose} className="text-sm text-gray-600">
            ปิด
          </button>
        </div>

        <div className="flex gap-2 mb-3">
          {["ทั้งหมด", "รอยืนยัน", "ยืนยันแล้ว", "ยกเลิก"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t === "ทั้งหมด" ? "ทั้งหมด" : (t as BookingStatus))}
              className={`text-sm px-3 py-1 rounded ${
                tab === t ? "bg-green-600 text-white" : "bg-gray-100"
              }`}
            >
              {t}
            </button>
          ))}
          <input
            placeholder="ค้นหาชื่อผู้ให้บริการ/หมายเหตุ"
            className="flex-1 border rounded px-2 py-1 text-sm"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-auto">
          {pageItems.map((b) => (
            <div key={b.id} className="border rounded p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">{b.providerName}</div>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    b.status === "ยกเลิก"
                      ? "bg-red-100 text-red-700"
                      : b.status === "ยืนยันแล้ว"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {b.status}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                ราคา: {b.price}
                {b.areaRai ? ` • พื้นที่ ${b.areaRai} ไร่` : ""}
                {b.startDate ? ` • เริ่ม ${b.startDate}` : ""}
              </div>
              {b.note && (
                <div className="text-xs text-gray-500 mt-1">หมายเหตุ: {b.note}</div>
              )}
              <div className="text-xs text-gray-400 mt-1">
                บันทึกเมื่อ: {new Date(b.bookedAt).toLocaleString("th-TH")}
              </div>

              <div className="flex gap-2 mt-2">
                {b.status !== "ยกเลิก" && (
                  <button
                    onClick={() => onCancel(b.id)}
                    className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded"
                  >
                    ยกเลิก
                  </button>
                )}
                <button
                  onClick={() => onDelete(b.id)}
                  className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-500">
            {filtered.length} รายการ • หน้า {page}/{totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 text-sm rounded bg-gray-100 disabled:opacity-50"
            >
              ก่อนหน้า
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 text-sm rounded bg-gray-100 disabled:opacity-50"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
