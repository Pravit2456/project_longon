import _, { useState } from "react";
import { FiUpload, FiLock } from "react-icons/fi";
import { FaLeaf } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // ⬅️ เพิ่ม

export default function ServiceSetup() {
  const [model, setModel] = useState("");
  const [capacity, setCapacity] = useState("");
  const [accuracy, setAccuracy] = useState("90");
  const [cycleMins, setCycleMins] = useState("15");
  const [speed, setSpeed] = useState("2.5");

  const navigate = useNavigate(); // ⬅️ เพิ่ม

  const handleSave = () => {
    // TODO: ใส่ logic บันทึกข้อมูลจริง ๆ ที่นี่ (call API/validate ฯลฯ)
    // สมมุติบันทึกสำเร็จ → ไปหน้าอื่น
    navigate("/server"); // <-- เปลี่ยน path ตามที่ต้องการ
  };

  return (
    <div className="min-h-screen bg-[#eef5ec]">
      {/* top spacer bar (ให้ฟีลเหมือนมีแถบหัวด้านบน) */}
      <div className="h-14 bg-white/70 border-b border-[#d9eadf]" />

      <main className="max-w-5xl mx-auto px-6 py-6">
        {/* Title */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm border border-[#d9eadf]">
            <div className="h-8 w-8 rounded-lg grid place-items-center bg-emerald-600 text-white">
              <FaLeaf />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#2f6b4f]">
              ลงทะเบียนสำหรับผู้ให้บริการ <span className="ml-1">👋</span>
            </h1>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            เติมข้อมูลให้ครบเพื่อเริ่มรับงานได้เลย
          </p>
        </div>

        {/* Card: กรอกข้อมูลอุปกรณ์ */}
        <section className="bg-white rounded-2xl shadow-sm border border-[#dbeee2] p-5 mb-6">
          <h2 className="font-semibold text-slate-800 mb-4">
            <span className="mr-2">🧩</span>กรอกข้อมูลอุปกรณ์
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* แถว 1 */}
            <div className="col-span-1 md:col-span-1">
              <label className="block text-sm text-slate-600 mb-1">รุ่นโดรน</label>
              <div className="relative">
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-9 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">{`เลือกอุปกรณ์`}</option>
                  <option>DJI Agras T30</option>
                  <option>DJI Agras T40</option>
                  <option>อื่น ๆ</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  ▾
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">ความจุถังน้ำ</label>
              <div className="flex">
                <input
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="40"
                  className="w-full rounded-l-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <span className="inline-flex items-center rounded-r-lg border border-l-0 border-slate-300 px-3 text-sm text-slate-500">
                  ลิตร
                </span>
              </div>
            </div>

            {/* แถว 2 */}
            <div>
              <label className="block text-sm text-slate-600 mb-1">ความแม่นยำในการพ่น</label>
              <div className="flex">
                <input
                  value={accuracy}
                  onChange={(e) => setAccuracy(e.target.value)}
                  className="w-full rounded-l-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <span className="inline-flex items-center rounded-r-lg border border-l-0 border-slate-300 px-3 text-sm text-slate-500">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">ระยะเวลาต่อรอบ</label>
              <div className="flex">
                <input
                  value={cycleMins}
                  onChange={(e) => setCycleMins(e.target.value)}
                  className="w-full rounded-l-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <span className="inline-flex items-center rounded-r-lg border border-l-0 border-slate-300 px-3 text-sm text-slate-500">
                  นาที
                </span>
              </div>
            </div>

            {/* แถว 3 */}
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-600 mb-1">ความเร็วในการพ่น</label>
              <div className="flex max-w-sm">
                <input
                  value={speed}
                  onChange={(e) => setSpeed(e.target.value)}
                  className="w-full rounded-l-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <span className="inline-flex items-center rounded-r-lg border border-l-0 border-slate-300 px-3 text-sm text-slate-500">
                  ไร่/นาที
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Card: เอกสารยืนยันตัวตน */}
        <section className="bg-white rounded-2xl shadow-sm border border-[#dbeee2] p-5 mb-6">
          <h2 className="font-semibold text-slate-800 mb-4">
            <span className="mr-2">📄</span>เอกสารยืนยันตัวตน
          </h2>

          <div className="space-y-5">
            {/* รูปถ่าย 1 นิ้ว */}
            <div>
              <p className="text-sm text-slate-600 mb-1">รูปถ่าย 1 นิ้ว</p>
              <p className="text-xs text-slate-500 mb-2">JPG, PNG ไม่เกิน 5MB</p>
              <Dropzone label="คลิกเพื่ออัปโหลด หรือวางไฟล์ไว้บริเวณนี้" />
            </div>

            {/* สำเนาบัตรประชาชน */}
            <div>
              <p className="text-sm text-slate-600 mb-1">สำเนาบัตรประชาชน</p>
              <p className="text-xs text-slate-500 mb-2">PDF, JPG, PNG ไม่เกิน 10MB</p>
              <Dropzone icon="edit" label="คลิกเพื่ออัปโหลด หรือวางไฟล์ไว้บริเวณนี้" />
            </div>
          </div>
        </section>

        {/* ปุ่มบันทึกตรงกลาง */}
        <div className="pb-10 flex justify-center">
          <button
            onClick={handleSave} // ⬅️ เพิ่ม
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#009966] px-8 py-3 text-white font-medium shadow-sm hover:bg-[#008255] active:bg-[#006644] border border-emerald-700/30"
          >
            <FiLock className="text-lg" />
            บันทึกข้อมูล
          </button>
        </div>
      </main>
    </div>
  );
}

/* ----------------- components ----------------- */

function Dropzone({ label, icon }: { label: string; icon?: "edit" }) {
  return (
    <label className="block">
      <input type="file" className="hidden" />
      <div className="grid place-items-center h-40 rounded-xl border-2 border-dashed border-slate-300 bg-[#f7fbf8] hover:border-emerald-400 transition">
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <div className="h-10 w-10 rounded-full grid place-items-center bg-emerald-100 text-emerald-700">
            {icon === "edit" ? <span className="text-lg">✏️</span> : <FiUpload />}
          </div>
          <p className="text-sm">{label}</p>
        </div>
      </div>
    </label>
  );
}
