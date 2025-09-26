export default function SchedulePage() {
  const schedule = {
    จันทร์: { free: "09:00-17:00", booked: [{ time: "10:00-12:00", name: "คุณสมชาย" }] },
    อังคาร: null,
    พุธ: { free: "09:00-12:00", booked: [] },
    พฤหัสบดี: null,
    ศุกร์: { free: "13:00-18:00", booked: [{ time: "14:00-15:00", name: "คุณสมหญิง" }] },
    เสาร์: null,
    อาทิตย์: null,
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-xl font-bold mb-6">📅 ตารางเวลา</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(schedule).map(([day, info]) => (
          <div key={day} className="bg-white shadow rounded-lg p-4">
            <h3 className="font-semibold mb-2">{day}</h3>
            {info ? (
              <>
                <p className="text-green-600 mb-2">เวลาว่าง: {info.free}</p>
                {info.booked.length > 0 ? (
                  info.booked.map((b, i) => (
                    <div key={i} className="bg-red-100 text-red-700 rounded p-2 flex justify-between items-center mb-2">
                      <span>{b.time} – {b.name}</span>
                      <button className="bg-red-500 text-white px-2 py-1 rounded">ติดต่อ</button>
                    </div>
                  ))
                ) : (
                  <p className="text-green-500">✔ ว่างทั้งหมด</p>
                )}
              </>
            ) : (
              <p className="text-gray-400">ไม่มีเวลาว่าง</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
