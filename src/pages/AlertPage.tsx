import { FiBell } from "react-icons/fi";


const currentAlerts = [
  {
    type: "คลื่นความร้อนรุนแรง",
    severity: "รุนแรงมาก",
    message:
      "อุณหภูมิเกินกว่า 40°C เป็นพื้นที่เสี่ยงอันตราย โปรดระมัดระวังและดูแลต้นลำไยอย่างใกล้ชิด",
    time: "09:23 วันนี้",
    color: "red",
  },
  {
    type: "ฝนตกน้อยกว่าค่าเฉลี่ย",
    severity: "ระดับเฝ้าระวัง",
    message:
      "ฝนเฉลี่ยในพื้นที่ต่ำกว่าค่าปกติในช่วง 7 วัน ตรวจสอบความชื้นในดินและเตรียมแผนรดน้ำ",
    time: "07:50 วันนี้",
    color: "orange",
  },
];

const pastAlerts = [
  {
    type: "คลื่นความร้อนรุนแรง",
    severity: "รุนแรงมาก",
    time: "14 พ.ค. 67, 14:13",
    color: "red",
  },
  {
    type: "ฝนตกน้อยกว่าค่าเฉลี่ย",
    severity: "ระดับเฝ้าระวัง",
    time: "14 พ.ค. 67, 09:25",
    color: "orange",
  },
];

export default function AlertPage() {
  return (
    <div className="min-h-screen bg-[#F7FAFC] text-gray-800 pb-20">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-white shadow">
        <h1 className="text-xl font-bold text-[#5CA17E] flex items-center gap-2">
          DSS ลำไย <FiBell className="text-[#FDAA2A]" />
        </h1>
        <div className="text-sm text-gray-600">สวัสดี, เกษตรกร</div>
      </header>

      <main className="p-6 space-y-8">
        {/* Current Alerts */}
        <section>
          <h2 className="text-lg font-semibold mb-2">แจ้งเตือนปัจจุบัน <span className="text-sm bg-red-100 text-red-600 px-2 py-0.5 rounded">{currentAlerts.length} รายการ</span></h2>
          <div className="space-y-4">
            {currentAlerts.map((a, i) => (
              <div key={i} className={`border-l-4 rounded bg-white p-4 shadow ${a.color === 'red' ? 'border-red-500' : 'border-orange-400'}`}>
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold text-md text-gray-800">{a.type} <span className="text-xs text-white bg-red-400 px-2 py-0.5 rounded-full ml-2">{a.severity}</span></div>
                  <span className="text-sm text-gray-400">{a.time}</span>
                </div>
                <p className="text-sm text-gray-700">{a.message}</p>
                <div className="text-right mt-2">
                  <button className={`text-white text-sm px-4 py-1 rounded ${a.color === 'red' ? 'bg-red-500' : 'bg-orange-400'}`}>รับทราบ</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Past Alerts */}
        <section>
          <h2 className="text-gray-600 font-semibold text-sm mb-2">แจ้งเตือนที่ผ่านมา</h2>
          <div className="space-y-2">
            {pastAlerts.map((a, i) => (
              <div key={i} className="bg-white p-4 rounded shadow flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1 ${a.color === 'red' ? 'bg-red-500' : 'bg-orange-400'}`}></div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{a.type} <span className="text-xs text-red-400 ml-2">{a.severity}</span></div>
                  <div className="text-xs text-gray-400 mt-0.5">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>        
    </div>
  );
}
