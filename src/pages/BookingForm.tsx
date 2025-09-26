import { useState } from "react";

type Booking = {
  id: string;
  slot: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
};

const LS = {
  incoming: "incoming_bookings",          // กล่องรับคำขอของผู้ให้บริการ
  providerNoti: "provider_notifications", // แจ้งเตือนฝั่งผู้ให้บริการ
};

function lsLoad<T>(k: string, fb: T): T {
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fb;
  } catch {
    return fb;
  }
}
function lsSave<T>(k: string, v: T) {
  localStorage.setItem(k, JSON.stringify(v));
}

export default function BookingForm() {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const slots = [
    { date: "2025-01-20", times: ["09:00-12:00", "13:00-16:00"] },
    { date: "2025-01-21", times: ["08:00-11:00", "14:00-17:00"] },
    { date: "2025-01-22", times: ["10:00-13:00", "15:00-18:00"] },
  ];

  const handleConfirm = () => {
    if (!selectedSlot) {
      alert("⚠️ กรุณาเลือกวันและเวลาที่ต้องการก่อน");
      return;
    }

    // === เติมแจ้งเตือน/คำขอไปฝั่งผู้ให้บริการ ===
    const bk: Booking = {
      id: `bk_${Date.now()}`,
      slot: selectedSlot,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    // 1) ใส่คำขอเข้ากล่องของผู้ให้บริการ
    const inbox = lsLoad<Booking[]>(LS.incoming, []);
    inbox.unshift(bk);
    lsSave(LS.incoming, inbox);

    // 2) แจ้งเตือนกระดิ่งผู้ให้บริการ
    const noti = lsLoad<any[]>(LS.providerNoti, []);
    noti.unshift({
      id: `nt_${Date.now()}`,
      message: `มีคนจองคิวช่วงเวลา ${selectedSlot}`,
      time: "เมื่อสักครู่",
      link: "/provider-slot", // ให้กดแล้วพาไปหน้ารับคิว
      type: "booking_request",
      isUnread: true,
    });
    lsSave(LS.providerNoti, noti);

    // 3) ยิงอีเวนต์ให้หน้า provider รีเฟรช
    window.dispatchEvent(new CustomEvent("provider-noti-updated"));
    window.dispatchEvent(new CustomEvent("incoming-booking-updated"));

    alert(`✅ ยืนยันการจองสำเร็จ!\n\nเวลาที่เลือก: ${selectedSlot}`);
  };

  return (
    <div className="p-6 bg-gradient-to-b from-green-50 to-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">📌 จองคิวบริการ</h1>

      {/* ข้อมูลผู้ให้บริการ */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4 items-center">
          <img
            src="https://i.pravatar.cc/100?img=64"
            alt="provider"
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h2 className="font-semibold">ทีมเก็บเกี่ยวมืออาชีพ</h2>
            <p className="text-green-600 font-bold">800 บาท/ไร่</p>
            <p className="text-sm text-gray-500">⭐ 4.8 | ทีมงานเชียงใหม่</p>
          </div>
        </div>
      </div>

      {/* เลือกวันและเวลา */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-semibold mb-4">เลือกวันและเวลาที่ว่าง</h3>
        <div className="space-y-4">
          {slots.map((slot, i) => (
            <div key={i}>
              <p className="font-medium mb-2">📅 {slot.date}</p>
              <div className="flex gap-3 flex-wrap">
                {slot.times.map((time, j) => {
                  const booked =
                    (slot.date === "2025-01-21" && time === "14:00-17:00") ||
                    (slot.date === "2025-01-22" && time === "10:00-13:00");

                  return (
                    <button
                      key={j}
                      disabled={booked}
                      onClick={() => setSelectedSlot(`${slot.date} ${time}`)}
                      className={`px-4 py-2 rounded border text-sm
                        ${booked
                          ? "bg-red-100 text-red-600 cursor-not-allowed"
                          : selectedSlot === `${slot.date} ${time}`
                          ? "bg-green-600 text-white border-green-700"
                          : "bg-green-100 text-green-700 hover:bg-green-200"}`}
                    >
                      {time} {booked ? "❌ จองแล้ว" : "✓ ว่าง"}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ปุ่มยืนยันการจอง */}
      <button
        onClick={handleConfirm}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg"
      >
        ✅ ยืนยันการจอง
      </button>
    </div>
  );
}
