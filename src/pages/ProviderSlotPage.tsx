// src/pages/ProviderSlotPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiClock, FiCalendar, FiTrash2, FiCheckCircle, FiBell } from "react-icons/fi";

type Slot = { date: string; start: string; end: string; isBooked?: boolean };
type BookingStatus = "pending" | "accepted" | "rejected";
type Booking = { id: string; slot: string; status: BookingStatus; createdAt: string };
type ProviderNoti = { id: string; message: string; time: string; link?: string; type?: string; isUnread?: boolean };

type AlertItem = {
  type: string;
  message?: string;
  time: string;
  signature: string;
};

const LS_KEYS = {
  providerSlots: "provider_slots",
  incoming: "incoming_bookings",
  farmerAlerts: "alerts_current",
  providerNoti: "provider_notifications",
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

const STATUS_TH: Record<BookingStatus, string> = {
  pending: "รอยืนยัน",
  accepted: "ยืนยันแล้ว",
  rejected: "ปฏิเสธแล้ว",
};

const BC_NAME = "booking-sync";

function pushProviderNoti(message: string, type: string = "booking", link?: string) {
  const list = load<ProviderNoti[]>(LS_KEYS.providerNoti, []);
  const now = new Date();
  list.unshift({
    id: "noti_" + now.getTime(),
    message,
    time: now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) + " วันนี้",
    type,
    isUnread: true,
    link,
  });
  save(LS_KEYS.providerNoti, list);
  window.dispatchEvent(new CustomEvent("provider-noti-updated"));
  try {
    const bc = new BroadcastChannel(BC_NAME);
    bc.postMessage({ type: "provider-noti-updated" });
    bc.close();
  } catch {}
}

function formatThaiDate(iso: string) {
  try {
    const [y, m, d] = iso.split("-").map((v) => parseInt(v, 10));
    const dt = new Date(y, m - 1, d);
    const buddhistYear = dt.getFullYear() + 543;
    const monthShort = dt.toLocaleDateString("th-TH", { month: "short" });
    return `${dt.getDate()} ${monthShort} ${buddhistYear}`;
  } catch {
    return iso;
  }
}

export default function ProviderSlotPage() {
  const navigate = useNavigate();

  const [slots, setSlots] = useState<Slot[]>(() => {
    const raw = load<any[]>(LS_KEYS.providerSlots, []);
    if (raw.length && raw[0]?.day && !raw[0]?.date) {
      const migrated: Slot[] = raw.map((s) => ({
        date: new Date().toISOString().slice(0, 10),
        start: s.start,
        end: s.end,
        isBooked: s.isBooked ?? false,
      }));
      save(LS_KEYS.providerSlots, migrated);
      return migrated;
    }
    return raw as Slot[];
  });

  const [incoming, setIncoming] = useState<Booking[]>(() => load<Booking[]>(LS_KEYS.incoming, []));
  const [noti, setNoti] = useState<ProviderNoti[]>(() => load<ProviderNoti[]>(LS_KEYS.providerNoti, []));

  // ===== อินพุตแบบ "เริ่ม/สิ้นสุด" =====
  const todayISO = new Date().toISOString().slice(0, 10);
  const [startDateISO, setStartDateISO] = useState<string>(todayISO);
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endDateISO, setEndDateISO] = useState<string>(todayISO);
  const [endTime, setEndTime] = useState<string>("17:00");

  useEffect(() => {
    save(LS_KEYS.providerSlots, slots);
  }, [slots]);

  useEffect(() => {
    save(LS_KEYS.incoming, incoming);
    window.dispatchEvent(new CustomEvent("incoming-booking-updated"));
  }, [incoming]);

  useEffect(() => {
    const onNotiUpdated = () => setNoti(load<ProviderNoti[]>(LS_KEYS.providerNoti, []));
    const onIncomingUpdated = () => setIncoming(load<Booking[]>(LS_KEYS.incoming, []));

    window.addEventListener("provider-noti-updated", onNotiUpdated);
    window.addEventListener("incoming-booking-updated", onIncomingUpdated);

    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_KEYS.providerNoti) onNotiUpdated();
      if (e.key === LS_KEYS.incoming) onIncomingUpdated();
    };
    window.addEventListener("storage", onStorage);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(BC_NAME);
      bc.onmessage = (ev) => {
        if (ev?.data?.type === "provider-noti-updated") onNotiUpdated();
        if (ev?.data?.type === "incoming-booking-updated") onIncomingUpdated();
      };
    } catch {}

    return () => {
      window.removeEventListener("provider-noti-updated", onNotiUpdated);
      window.removeEventListener("incoming-booking-updated", onIncomingUpdated);
      window.removeEventListener("storage", onStorage);
      if (bc) bc.close();
    };
  }, []);

  // ===== สร้างคิวหลายวันในครั้งเดียว =====
  const addRangeSlots = () => {
    if (!startDateISO || !endDateISO) return;
    const startDate = new Date(startDateISO + "T00:00:00");
    const endDate = new Date(endDateISO + "T00:00:00");
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return;

    // ถ้า end < start ไม่ให้ทำ
    if (endDate.getTime() < startDate.getTime()) return;

    // ถ้าเวลาเริ่ม >= เวลาสิ้นสุด ให้ยกเลิก (คุมง่าย ๆ)
    if (startTime >= endTime) return;

    const days: string[] = [];
    const d = new Date(startDate);
    while (d.getTime() <= endDate.getTime()) {
      const iso = new Date(d).toISOString().slice(0, 10);
      days.push(iso);
      d.setDate(d.getDate() + 1);
    }

    const newSlots: Slot[] = days.map((date) => ({
      date,
      start: startTime,
      end: endTime,
      isBooked: false,
    }));

    setSlots((prev) => {
      const next = [...prev, ...newSlots];
      save(LS_KEYS.providerSlots, next);
      return next;
    });
  };

  const deleteSlot = (index: number) => {
    setSlots((prev) => {
      const next = prev.filter((_, i) => i !== index);
      save(LS_KEYS.providerSlots, next);
      return next;
    });
  };

  const bookSlot = (index: number) => {
    setSlots((prev) => {
      const next = prev.map((s, i) => (i === index ? { ...s, isBooked: true } : s));
      save(LS_KEYS.providerSlots, next);
      return next;
    });
  };

  const acceptBooking = (bkId: string, slotText: string) => {
    setIncoming((prev) => {
      const next: Booking[] = prev.map((b): Booking => (b.id === bkId ? { ...b, status: "accepted" } : b));
      save(LS_KEYS.incoming, next);
      return next;
    });
    window.dispatchEvent(new CustomEvent("incoming-booking-updated"));
    try {
      const bc = new BroadcastChannel(BC_NAME);
      bc.postMessage({ type: "incoming-booking-updated" });
      bc.close();
    } catch {}

    const farmerAlerts = load<AlertItem[]>(LS_KEYS.farmerAlerts, []);
    farmerAlerts.unshift({
      type: "ผู้ให้บริการยืนยันแล้ว",
      message: `ผู้ให้บริการยืนยันรับงานช่วงเวลา ${slotText} แล้ว`,
      time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) + " วันนี้",
      signature: `accepted_${bkId}`,
    });
    save(LS_KEYS.farmerAlerts, farmerAlerts);
    window.dispatchEvent(new CustomEvent("alerts-updated"));

    pushProviderNoti(`คุณยืนยันรับงานช่วง ${slotText} แล้ว`, "booking:accepted", "/serverpage");

    setSlots((prev) => {
      const i = prev.findIndex((s) => !s.isBooked);
      if (i === -1) return prev;
      const next = [...prev];
      next[i] = { ...next[i], isBooked: true };
      save(LS_KEYS.providerSlots, next);
      return next;
    });

    navigate("/serverpage");
  };

  const rejectBooking = (bkId: string, slotText: string) => {
    setIncoming((prev) => {
      const next: Booking[] = prev.map((b): Booking => (b.id === bkId ? { ...b, status: "rejected" } : b));
      save(LS_KEYS.incoming, next);
      return next;
    });
    window.dispatchEvent(new CustomEvent("incoming-booking-updated"));
    try {
      const bc = new BroadcastChannel(BC_NAME);
      bc.postMessage({ type: "incoming-booking-updated" });
      bc.close();
    } catch {}

    const farmerAlerts = load<AlertItem[]>(LS_KEYS.farmerAlerts, []);
    farmerAlerts.unshift({
      type: "ผู้ให้บริการปฏิเสธคิว",
      message: `คิวช่วงเวลา ${slotText} ถูกปฏิเสธ โปรดเลือกคิวใหม่หรือผู้ให้บริการรายอื่น`,
      time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) + " วันนี้",
      signature: `rejected_${bkId}`,
    });
    save(LS_KEYS.farmerAlerts, farmerAlerts);
    window.dispatchEvent(new CustomEvent("alerts-updated"));

    pushProviderNoti(`คุณปฏิเสธคิวช่วง ${slotText}`, "booking:rejected");
  };

  const pendingList = incoming.filter((b) => b.status === "pending");

  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
            <FiCalendar className="text-blue-600" /> ลงคิวเวลาว่างผู้ให้บริการ
          </h2>
          <button
            onClick={() => navigate("/serverpage")}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-1.5 text-sm cursor-pointer"
          >
            กลับหน้าหลัก
          </button>
        </div>

        {/* แจ้งเตือน + คำขอเข้ามา */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-gray-700 flex items-center gap-2">
                <FiBell /> การแจ้งเตือนล่าสุด
              </h3>
              {noti.length > 0 && (
                <button
                  onClick={() => {
                    const cleared = noti.map((n) => ({ ...n, isUnread: false }));
                    save(LS_KEYS.providerNoti, cleared);
                    setNoti(cleared);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  ทำเครื่องหมายว่าอ่านแล้วทั้งหมด
                </button>
              )}
            </div>
            {noti.length === 0 ? (
              <div className="text-sm text-gray-400">ยังไม่มีการแจ้งเตือน</div>
            ) : (
              <ul className="divide-y max-h-64 overflow-y-auto pr-1">
                {noti.map((n) => (
                  <li key={n.id} className="py-2.5 flex items-center justify-between">
                    <div className="pr-3 min-w-0">
                      <p className="text-sm font-medium truncate">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                    </div>
                    {n.isUnread && <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="font-semibold text-lg mb-4 text-gray-700">📩 คำขอจองคิวที่เข้ามา</h3>
            {pendingList.length === 0 ? (
              <div className="text-sm text-gray-400">ยังไม่มีคำขอใหม่</div>
            ) : (
              <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {pendingList.map((bk) => (
                  <li key={bk.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div className="text-sm">
                      <div className="font-medium">ช่วงเวลา: {bk.slot}</div>
                      <div className="text-gray-500">
                        สถานะ: <span className="text-orange-600">{STATUS_TH["pending"]}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptBooking(bk.id, bk.slot)}
                        className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm cursor-pointer"
                      >
                        รับงาน
                      </button>
                      <button
                        onClick={() => rejectBooking(bk.id, bk.slot)}
                        className="px-3 py-1.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-700 text-sm cursor-pointer"
                      >
                        ปฏิเสธ
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ===== เริ่ม/สิ้นสุด (ช่วงหลายวัน ครั้งเดียวลงได้เลย) ===== */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <h3 className="font-semibold text-lg mb-4 text-gray-700">กำหนดช่วงวันที่และเวลา</h3>

          {/* แถว "เริ่ม" */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">เริ่ม</label>
              <input
                type="date"
                value={startDateISO}
                onChange={(e) => setStartDateISO(e.target.value)}
                className="w-full rounded-full bg-gray-100 px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 hover:bg-gray-200 cursor-pointer"
              />
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-medium text-gray-600 mb-1">&nbsp;</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-full bg-gray-100 px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 hover:bg-gray-200 cursor-pointer"
              />
            </div>
          </div>

          {/* แถว "สิ้นสุด" */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">สิ้นสุด</label>
              <input
                type="date"
                value={endDateISO}
                onChange={(e) => setEndDateISO(e.target.value)}
                className="w-full rounded-full bg-gray-100 px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 hover:bg-gray-200 cursor-pointer"
              />
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-medium text-gray-600 mb-1">&nbsp;</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-full bg-gray-100 px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 hover:bg-gray-200 cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={addRangeSlots}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition shadow-md cursor-pointer"
          >
            ➕ เพิ่มคิวเวลาว่าง (สร้างทุกวันในช่วงนี้)
          </button>
        </div>

        {/* ===== รายการเวลาว่าง ===== */}
        {slots.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg text-gray-700">📅 เวลาว่างทั้งหมด</h3>
              <span className="text-xs text-gray-500">รวม {slots.length} รายการ</span>
            </div>

            <ul className="divide-y divide-gray-200 max-h-72 overflow-y-auto pr-1">
              {slots.map((s, i) => (
                <li
                  key={`${s.date}-${s.start}-${s.end}-${i}`}
                  className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 rounded-lg transition"
                >
                  <div className="flex items-center gap-3">
                    <FiClock className="text-blue-500" />
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-900 text-sm font-medium hover:bg-gray-200 cursor-default">
                        {formatThaiDate(s.date)}
                      </span>
                      <span className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-900 text-sm font-medium hover:bg-gray-200 cursor-default">
                        {s.start}
                      </span>
                      <span className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-900 text-sm font-medium hover:bg-gray-200 cursor-default">
                        {s.end}
                      </span>
                    </div>
                  </div>

                  {s.isBooked ? (
                    <span className="flex items-center gap-1 text-red-500 font-medium">
                      <FiCheckCircle /> ถูกจองแล้ว
                    </span>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => bookSlot(i)}
                        className="text-green-600 hover:text-green-800 font-medium cursor-pointer"
                        title="จองช่องเวลานี้"
                      >
                        จอง
                      </button>
                      <button
                        onClick={() => deleteSlot(i)}
                        className="text-red-500 hover:text-red-700 transition cursor-pointer"
                        title="ลบช่องเวลานี้"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center text-gray-400 mt-16 text-lg">📭 ยังไม่มีเวลาว่างที่บันทึกไว้</div>
        )}
      </div>
    </div>
  );
}
