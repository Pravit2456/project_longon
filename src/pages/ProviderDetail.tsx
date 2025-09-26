import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const providers = [
  {
    name: "นายสมชาย ใจดี",
    fertilizer: "5 กก./ไร่",
    area: 10,
    workers: 3,
    time: 4,
    total: 5000,
  },
  {
    name: "นายประเสริฐ มั่นคง",
    fertilizer: "7 กก./ไร่",
    area: 15,
    workers: 5,
    time: 6,
    total: 7500,
  },
  {
    name: "นางสาวสุดา เที่ยวทาง",
    fertilizer: "6 กก./ไร่",
    area: 12,
    workers: 4,
    time: 5,
    total: 6200,
  },
];

export default function ProviderDetail() {
  const [select1, setSelect1] = useState("นายสมชาย ใจดี");
  const [select2, setSelect2] = useState("นายประเสริฐ มั่นคง");
  const [select3, setSelect3] = useState("นางสาวสุดา เที่ยวทาง");
  const [task, setTask] = useState("ตัดแต่งกิ่ง");

  const p1 = providers.find((p) => p.name === select1)!;
  const p2 = providers.find((p) => p.name === select2)!;
  const p3 = providers.find((p) => p.name === select3)!;

  // ✅ หาผู้ให้บริการที่เสร็จไวที่สุดและถูกที่สุด
  const fastest = [...providers].sort((a, b) => a.time - b.time)[0];
  const cheapest = [...providers].sort((a, b) => a.total - b.total)[0];

  // ✅ กราฟเปรียบเทียบ
  const compareData = [
    { name: "สมชาย", workers: p1.workers, time: p1.time, cost: p1.total },
    { name: "ประเสริฐ", workers: p2.workers, time: p2.time, cost: p2.total },
    { name: "สุดา", workers: p3.workers, time: p3.time, cost: p3.total },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Profile */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex items-center gap-4">
        <img
          src="https://i.pravatar.cc/100?img=55"
          alt="provider"
          className="w-20 h-20 rounded-full"
        />
        <div>
          <h2 className="text-xl font-bold">นายสมชาย ใจดี</h2>
          <p>📞 089-123-4567</p>
          <p>📧 somchai@email.com</p>
          <p>📍 ลำพูน, เมืองลำพูน</p>
        </div>
      </div>

      {/* Dropdown เลือกประเภทงาน */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <label className="block mb-2 font-semibold">เลือกประเภทงาน</label>
        <select
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="border rounded p-2"
        >
          <option>ตัดแต่งกิ่ง</option>
          <option>ให้ปุ๋ย</option>
          <option>เก็บผล</option>
        </select>
      </div>

      {/* เปรียบเทียบ */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="font-semibold mb-4">เปรียบเทียบผู้ให้บริการ</h3>

        {/* dropdown เลือกผู้ให้บริการ */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <select
            value={select1}
            onChange={(e) => setSelect1(e.target.value)}
            className="border rounded p-2"
          >
            {providers.map((p) => (
              <option key={p.name}>{p.name}</option>
            ))}
          </select>
          <select
            value={select2}
            onChange={(e) => setSelect2(e.target.value)}
            className="border rounded p-2"
          >
            {providers.map((p) => (
              <option key={p.name}>{p.name}</option>
            ))}
          </select>
          <select
            value={select3}
            onChange={(e) => setSelect3(e.target.value)}
            className="border rounded p-2"
          >
            {providers.map((p) => (
              <option key={p.name}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* ตารางเปรียบเทียบ */}
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">รายการ</th>
              <th className="p-2">{p1.name.split(" ")[0]}</th>
              <th className="p-2">{p2.name.split(" ")[0]}</th>
              <th className="p-2">{p3.name.split(" ")[0]}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2">ปริมาณปุ๋ย/ฮอร์โมน</td>
              <td className="p-2">{p1.fertilizer}</td>
              <td className="p-2">{p2.fertilizer}</td>
              <td className="p-2">{p3.fertilizer}</td>
            </tr>
            <tr>
              <td className="p-2">ขนาดพื้นที่ (ไร่)</td>
              <td className="p-2">{p1.area}</td>
              <td className="p-2">{p2.area}</td>
              <td className="p-2">{p3.area}</td>
            </tr>
            <tr>
              <td className="p-2">จำนวนแรงงาน</td>
              <td className="p-2">{p1.workers}</td>
              <td className="p-2">{p2.workers}</td>
              <td className="p-2">{p3.workers}</td>
            </tr>
            <tr>
              <td className="p-2">ระยะเวลา (ชม.)</td>
              <td className="p-2">{p1.time}</td>
              <td className="p-2">{p2.time}</td>
              <td className="p-2">{p3.time}</td>
            </tr>
            <tr>
              <td className="p-2 font-semibold">ต้นทุนรวม</td>
              <td className="p-2 text-green-600">฿{p1.total}</td>
              <td className="p-2 text-blue-600">฿{p2.total}</td>
              <td className="p-2 text-purple-600">฿{p3.total}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ✅ คำแนะนำ */}
      <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-2">คำแนะนำจากระบบ</h3>
        <p>⚡ งานเสร็จไวที่สุด: <strong>{fastest.name}</strong> ({fastest.time} ชม.)</p>
        <p>💰 ราคาถูกที่สุด: <strong>{cheapest.name}</strong> (฿{cheapest.total})</p>
      </div>
{/* ✅ กราฟเปรียบเทียบแนวนอน */}
<div className="bg-white p-4 rounded-lg shadow mb-6">
  <h3 className="font-semibold mb-4">กราฟเปรียบเทียบ (แนวนอน)</h3>
  <BarChart
    layout="vertical"
    width={600}
    height={300}
    data={compareData}
    margin={{ left: 50 }}
  >
    <XAxis type="number" />
    <YAxis dataKey="name" type="category" />
    <Tooltip />
    <Legend />
    <Bar dataKey="workers" fill="#22c55e" name="แรงงาน (คน)" />
    <Bar dataKey="time" fill="#3b82f6" name="เวลา (ชม.)" />
    <Bar dataKey="cost" fill="#f97316" name="ค่าใช้จ่าย (บาท)" />
  </BarChart>
</div>

      {/* CTA */}
      <div className="flex gap-4">
        <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded">
          จองบริการ
        </button>
        <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded">
          ติดต่อผู้ให้บริการ
        </button>
      </div>
    </div>
  );
}
