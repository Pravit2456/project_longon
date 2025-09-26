import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// type สำหรับประวัติการใส่ปุ๋ย
interface FertilizerHistory {
  id: number;
  fertilizer_type: string;
  amount: number;
  price: number;
  date: string;
  note: string;
  created_at: string;
}

export default function FertilizerPage() {
  const [form, setForm] = useState({
    fertilizer_type: "สูตร 15-15-15",
    amount: 30,
    price: 20,
    date: "",
    note: "",
  });

  const [history, setHistory] = useState<FertilizerHistory[]>([]);
  const navigate = useNavigate();

  // ✅ โหลดจาก localStorage ครั้งแรก
  useEffect(() => {
    const saved = localStorage.getItem("fertilizerHistory");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  // ✅ ฟังก์ชันบันทึก
  const handleSave = () => {
    if (!form.date) return alert("กรุณาเลือกวันที่");

    const newEntry: FertilizerHistory = {
      id: Date.now(),
      fertilizer_type: form.fertilizer_type,
      amount: form.amount,
      price: form.price,
      date: form.date,
      note: form.note,
      created_at: new Date().toLocaleString("th-TH"),
    };

    // อัปเดต state
    const updated = [newEntry, ...history];
    setHistory(updated);

    // อัปเดต localStorage ทันที
    localStorage.setItem("fertilizerHistory", JSON.stringify(updated));

    alert(
      `✅ บันทึกสำเร็จ (ค่าใช้จ่ายรวม ${(form.amount * form.price).toLocaleString()} บาท)`
    );
  };

  // ✅ ฟังก์ชันลบ
  const handleDelete = (id: number) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?")) return;
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem("fertilizerHistory", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#F4F6EF] text-gray-800 p-6 space-y-6">
      <div className="flex justify-between items-center">
        <select className="border border-gray-300 px-4 py-2 rounded-lg shadow text-sm">
          <option>แปลง 1 - โซนเหนือ</option>
        </select>
      </div>

      {/* ฟอร์มปุ๋ย */}
      <div className="bg-[#FBF8F4] border border-[#E3D9CA] rounded-2xl shadow p-6">
        <h2 className="font-semibold mb-4">คำนวณปริมาณและบันทึกการใส่ปุ๋ย</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm mb-1">ชนิดปุ๋ย</label>
            <select
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm"
              value={form.fertilizer_type}
              onChange={(e) =>
                setForm({ ...form, fertilizer_type: e.target.value })
              }
            >
              <option>สูตร 15-15-15</option>
              <option>สูตร 16-20-0</option>
              <option>ยูเรีย</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">ปริมาณ (กก.)</label>
            <input
              type="number"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <label className="block text-sm mb-1">ราคาปุ๋ย (บาท/กก.)</label>
            <input
              type="number"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <label className="block text-sm mb-1">วันที่ให้ปุ๋ย</label>
            <input
              type="date"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">หมายเหตุ</label>
            <input
              type="text"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm mb-4">
          💰 ค่าใช้จ่ายรวม:{" "}
          <strong className="text-green-700">
            {(form.amount * form.price).toLocaleString()} บาท
          </strong>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-2 rounded-xl text-white font-medium flex items-center justify-center shadow-md"
          style={{
            background: "linear-gradient(90deg, #5E7E3E 0%, #B5925A 100%)",
            boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
          }}
        >
          <span className="mr-2 text-lg">🧮</span> บันทึกข้อมูล
        </button>
      </div>

      {/* ประวัติ */}
      <div className="bg-[#E6F1E7] rounded-2xl shadow p-4 border border-[#C5D8C5]">
        <h2 className="font-semibold mb-4">ประวัติการใส่ปุ๋ย</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 border-b border-gray-300">
              <th className="py-2">วันที่</th>
              <th>ชนิดปุ๋ย</th>
              <th>ปริมาณ (กก.)</th>
              <th>ราคา/กก.</th>
              <th>ค่าใช้จ่ายรวม</th>
              <th>หมายเหตุ</th>
              <th>บันทึกเมื่อ</th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-300 text-gray-700"
              >
                <td className="py-2">{item.date}</td>
                <td>{item.fertilizer_type}</td>
                <td>{item.amount}</td>
                <td>{item.price}</td>
                <td className="text-green-700 font-semibold">
                  {(item.amount * item.price).toLocaleString()}
                </td>
                <td>{item.note}</td>
                <td>{item.created_at}</td>
                <td>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ปุ่มย้อนกลับ */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-gray-700 shadow"
        >
          ⬅ ย้อนกลับ
        </button>
      </div>
    </div>
  );
}
