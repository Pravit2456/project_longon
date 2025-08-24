import { useState, useEffect } from "react";
import axios from "axios";

interface FertilizerRecord {
  id: number;
  fertilizer_type: string;
  amount: number;
  date: string;
  note?: string;
  created_at: string;
}

export default function FertilizerPage() {
  const [form, setForm] = useState({
    type: "สูตร 15-15-15",
    amount: "30",
    date: "",
    note: ""
  });

  const [history, setHistory] = useState<FertilizerRecord[]>([]);
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const res = await axios.get<FertilizerRecord[]>(
        "http://localhost:3000/api/fertilizer",
        { withCredentials: true }
      );
      setHistory(res.data);
    } catch (error) {
      console.error("Failed to fetch fertilizer history", error);
    }
  }

  async function handleSave() {
    if (!form.type || !form.amount || !form.date) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    try {
      await axios.post(
        "http://localhost:3000/api/fertilizer",
        {
          fertilizer_type: form.type,
          amount: Number(form.amount),
          date: form.date,
          note: form.note,
        },
        { withCredentials: true }
      );
      alert("บันทึกข้อมูลเรียบร้อย");
      setForm({ type: "สูตร 15-15-15", amount: "30", date: "", note: "" });
      fetchHistory();
    } catch (error) {
      console.error("Failed to save fertilizer record", error);
      alert("บันทึกข้อมูลไม่สำเร็จ");
    }
  }

  function handleEdit(item: FertilizerRecord) {
    setForm({
      type: item.fertilizer_type,
      amount: item.amount.toString(),
      date: item.date,
      note: item.note || ""
    });
    setEditId(item.id);
  }

  async function handleDelete(id: number) {
    if (!confirm("ต้องการลบข้อมูลนี้จริงหรือไม่?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/fertilizer/${id}`, {
        withCredentials: true,
      });
      alert("ลบข้อมูลเรียบร้อย");
      if (editId === id) {
        setEditId(null);
        setForm({ type: "สูตร 15-15-15", amount: "30", date: "", note: "" });
      }
      fetchHistory();
    } catch (error) {
      console.error("Failed to delete fertilizer record", error);
      alert("ลบข้อมูลไม่สำเร็จ");
    }
  }

  async function handleUpdate() {
    if (!form.type || !form.amount || !form.date || editId === null) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    try {
      await axios.put(
        `http://localhost:3000/api/fertilizer/${editId}`,
        {
          fertilizer_type: form.type,
          amount: Number(form.amount),
          date: form.date,
          note: form.note,
        },
        { withCredentials: true }
      );
      alert("แก้ไขข้อมูลเรียบร้อย");
      setEditId(null);
      setForm({ type: "สูตร 15-15-15", amount: "30", date: "", note: "" });
      fetchHistory();
    } catch (error) {
      console.error("Failed to update fertilizer record", error);
      alert("แก้ไขข้อมูลไม่สำเร็จ");
    }
  }

  const isEditing = editId !== null;

  return (
    <div className="min-h-screen bg-[#F3F6EF] text-gray-800 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-[#3A6E3A]">DSS ลำไย</h1>
        <div className="text-sm">คำแนะนำปุ๋ย</div>
      </header>

      <div className="mb-4">
        <select className="border px-4 py-2 rounded shadow text-sm">
          <option>แปลง 1 - โซนเหนือ</option>
          <option>แปลง 2 - โซนใต้</option>
          <option>แปลง 3 - โซนอีสาน</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-2">สภาพดินปัจจุบัน</h2>
          <ul className="text-sm space-y-1">
            <li>ความชื้น: <strong>38%</strong></li>
            <li>pH: <strong>5.8</strong></li>
            <li>ธาตุอาหาร: <strong>N ต่ำ, P ต่ำ, K สูง</strong></li>
          </ul>
        </div>

        <div className="bg-[#E8F6F0] rounded shadow p-4">
          <h2 className="font-semibold mb-2">คำแนะนำปุ๋ยโดย AI</h2>
          <ul className="text-sm space-y-1">
            <li>ชนิดปุ๋ย: <strong>สูตร 15-15-15</strong></li>
            <li>ปริมาณ: <strong>30 กก./ไร่</strong></li>
            <li>รอบเวลา: ทุก 30 วัน (ครั้งล่าสุดคือ 25 เม.ย. 2568)</li>
          </ul>
          <button className="mt-2 text-xs underline text-green-700">
            ตรวจสอบแผนการให้ปุ๋ยฤดูถัดไปเพื่อผลผลิตที่ดีขึ้น
          </button>
        </div>
      </div>

      <div className="bg-[#FBF8F4] border rounded shadow p-6 mb-6">
        <h2 className="font-semibold mb-4">
          {isEditing ? "แก้ไขข้อมูลการให้ปุ๋ย" : "บันทึกการให้ปุ๋ย"}
        </h2>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm mb-1">ชนิดปุ๋ย</label>
            <select
              className="w-full border px-3 py-2 rounded text-sm"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option>สูตร 15-15-15</option>
              <option>สูตร 16-20-0</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">ปริมาณ (กก.)</label>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded text-sm"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">วันที่ให้ปุ๋ย</label>
            <input
              type="date"
              className="w-full border px-3 py-2 rounded text-sm"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">หมายเหตุ</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded text-sm"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>
        </div>
        <button
          className="bg-[#8D7B57] text-white px-4 py-2 rounded text-sm mt-2"
          onClick={isEditing ? handleUpdate : handleSave}
        >
          {isEditing ? "อัปเดตข้อมูล" : "บันทึกข้อมูล"}
        </button>
        {isEditing && (
          <button
            className="ml-2 px-4 py-2 rounded border text-sm"
            onClick={() => {
              setEditId(null);
              setForm({ type: "สูตร 15-15-15", amount: "30", date: "", note: "" });
            }}
          >
            ยกเลิก
          </button>
        )}
      </div>

      <div className="bg-[#E9F1E7] rounded shadow p-4">
        <h2 className="font-semibold mb-4">ประวัติการให้ปุ๋ย</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="py-2">วันที่</th>
              <th>ชนิดปุ๋ย</th>
              <th>ปริมาณ (กก.)</th>
              <th>หมายเหตุ</th>
              <th className="text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id} className="border-b text-gray-700">
                <td className="py-2">{new Date(item.date).toLocaleDateString("th-TH")}</td>
                <td>{item.fertilizer_type}</td>
                <td>{item.amount}</td>
                <td>{item.note}</td>
                <td className="text-center space-x-2">
                  <button
                    className="text-blue-600 underline text-xs"
                    onClick={() => handleEdit(item)}
                  >
                    แก้ไข
                  </button>
                  <button
                    className="text-red-600 underline text-xs"
                    onClick={() => handleDelete(item.id)}
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="text-center text-xs text-gray-400 mt-6">
        © 2025 DSS ลำไย Smart Farming
      </footer>
    </div>
  );
}
