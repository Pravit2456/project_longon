import { Thermometer, Droplet, CloudRain } from "lucide-react";

export default function SensorPreview() {
  return (
    <div className="grid md:grid-cols-2 gap-6 items-center rounded-2xl bg-white shadow p-6 md:p-8 font-sans font-semibold">
      {/* ข้อมูลเซ็นเซอร์ฝั่งซ้าย */}
      <div className="space-y-4">
        <h2 className="flex items-center gap-2 text-green-800 font-semibold text-lg">
          <span className="bg-green-100 p-2 rounded-full">
            <Thermometer className="text-green-600 w-5 h-5" />
          </span>
          แดชบอร์ดเซนเซอร์ (ตัวอย่าง)
        </h2>

        <p className="text-sm text-gray-600">
          ตรวจสอบข้อมูลจริงจากไร่ของคุณแบบเรียลไทม์
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Thermometer className="text-green-500 w-6 h-6" />
            <div>
              <div className="text-xs text-gray-500">อุณหภูมิ</div>
              <div className="text-lg font-semibold text-green-800">32°C</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Droplet className="text-blue-500 w-6 h-6" />
            <div>
              <div className="text-xs text-gray-500">ความชื้น</div>
              <div className="text-lg font-semibold text-green-800">45%</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CloudRain className="text-indigo-500 w-6 h-6" />
            <div>
              <div className="text-xs text-gray-500">น้ำฝนวันนี้</div>
              <div className="text-lg font-semibold text-green-800">2 mm</div>
            </div>
          </div>
        </div>

        <button className="mt-4 bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 flex items-center gap-2 w-max">
          → ไปยังแดชบอร์ดจริง
        </button>
      </div>

      {/* รูปภาพฝั่งขวา */}
      <img
        src="/images/sensor.png"
        alt="ข้อมูลเซ็นเซอร์"
        className="w-full max-w-[300px] h-[200px] object-cover rounded-xl" />
    </div>
  );
}
