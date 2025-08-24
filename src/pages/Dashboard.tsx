import { useUser } from "./UserContext"; // ✅ ดึง userId จาก context
import Calendar from "../components/Calendar";

export default function Dashboard() {
  const { userId } = useUser();

  return (
    <div className="min-h-screen bg-[#F4F6EC] flex">
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-[#1E3A2E]">
            สวัสดีผู้ใช้หมายเลข {userId} 👋
          </h1>
          <p className="text-sm text-gray-600">
            แปลงลำไย “สวนลำไย บ้านวังชิ้น” อำเภอสบจู อำเภอวังชิ้น
            พื้นที่ 12 ไร่ ใกล้ลำห้วยแคววัง
          </p>
        </div>

        {/* สรุปอุณหภูมิ / ความชื้น */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center justify-center border-b-4 border-[#1BC5BD]">
            <p className="text-gray-600 text-sm">อุณหภูมิ</p>
            <p className="text-3xl font-bold text-[#1E3A2E]">32°C</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center justify-center border-b-4 border-[#1BC5BD]">
            <p className="text-gray-600 text-sm">ความชื้น</p>
            <p className="text-3xl font-bold text-[#1E3A2E]">74%</p>
          </div>
        </div>

        {/* ข้อแนะนำ + ปฏิทิน */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#E6F4F1] rounded-xl shadow p-4 md:col-span-2">
            <h2 className="text-md font-semibold text-[#1E3A2E] mb-3">
              ข้อแนะนำวันนี้ (El Niño)
            </h2>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>รดน้ำลำไยเพิ่มเพื่อรักษา</li>
              <li>ควบคุมน้ำในดินเพื่อหลีกเลี่ยงอาการแห้งตาย</li>
              <li>ติดตามอุณหภูมิ-ความชื้นใกล้ชิด</li>
            </ul>
            <p className="text-xs text-orange-600 mt-2">
              • ระวังสภาพอากาศร้อนผิดปกติ (El Niño) วันนี้
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-md font-semibold text-[#1E3A2E] mb-3">ปฏิทิน</h2>
            <Calendar />
          </div>
        </div>

        {/* แจ้งเตือน + แนวโน้ม */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#FFF1E7] rounded-xl shadow p-4">
            <h2 className="text-md font-semibold text-[#CC4B00] mb-3">
              แจ้งเตือนสำคัญ
            </h2>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>คลื่นความร้อน: อุณหภูมิสูงกว่า 35°C</li>
              <li>ฝนตกน้อยผิดปกติ (El Niño)</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow p-4 md:col-span-2">
            <h2 className="text-md font-semibold text-[#1E3A2E] mb-3">
              แนวโน้มการเจริญเติบโต
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <p>การเติบโตดีเด่น</p>
              <p>การออกดอก/ติดผล</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
