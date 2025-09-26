// pages/SettingPage.tsx
import { useState } from "react";
export default function SettingPage() {
  const [name, setName] = useState("อภิชาติ สุวรรณดี");
  const [email, setEmail] = useState("apichat@email.com");
  const [phone, setPhone] = useState("081-234-5678");
  const [address, setAddress] = useState("เชียงใหม่,ไทย");
  const [number, setNumber] = useState("30")
  return (
    
    <div className="flex min-h-screen">
      <main className="flex-1  bg-[#F5F7ED] p-8">
        <h1 className="text-2xl font-semibold text-[#1E3A2E] mb-2">การตั้งค่าผู้ใช้</h1>
        <p className="text-sm text-gray-600 mb-6">ปรับแต่งข้อมูลของคุณเพื่อประสบการณ์ที่ดีที่สุด</p>

        {/* กล่องข้อมูลผู้ใช้ */}
        <div className=" bg-white rounded-xl shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="flex gap-4 items-center">
            <img src="https://i.pravatar.cc/80" alt="avatar" className="w-16 h-16 rounded-full" />
            <div>
              <p className="font-semibold">อภิชาติ สุวรรณดี</p>
              <p className="text-sm text-gray-500">ผู้ใช้งาน</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 ">
            <div>
              <label className="block text-sm mb-1 text-gray-700">ชื่อ-นามสกุล</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="border rounded-lg shadow p-2 input-style"/>
              
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-700">อีเมล</label>
              <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded-lg shadow p-2 input-style" />
            </div>
            <div>
              <label className="block text-sm text-gray-700">เบอร์โทรศัพท์</label>
              <input 
              type="phone" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border rounded-lg shadow p-2 input-style"/>
            </div>
            <div>
              <label className="block text-sm text-gray-700">ตำแหน่งที่ตั้ง</label>
              <input 
              type="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="border rounded-lg shadow p-2 input-style"/>
            </div>
          </div>
        </div>
                {/* กล่องภาษา */}
        <div className=" bg-white rounded-xl shadow p-6 mb-6">
          <label className="text-sm text-gray-700 block mb-2">ภาษา (Language)</label>
          <div className="flex gap-4">
            <button className="px-4 py-1 border rounded bg-[#EDF1E5] text-sm">TH</button>
            <button className="px-4 py-1 border rounded bg-[#EDF1E5] text-sm">EN</button>
          </div>
        </div>
        {/* กล่องการตั้งค่าตัวตรวจวัด */}
        <div className=" bg-white rounded-xl shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="text-sm text-gray-700 block mb-2">หน่วยอุณหภูมิ</label>
            <select className="border rounded-lg shadow p-2 input-style">
              <option>°C (เซลเซียส)</option>
              <option>°F (ฟาเรนไฮต์)</option>
            </select>
            <label className="text-sm text-gray-700 block mt-4">อุณหภูมิสูงสุดที่แจ้งเตือน</label>
            <input type="number" 
                  value={number} 
                  onChange={(e) => setNumber(e.target.value)}
                  className="border rounded-lg shadow p-2 input-style" />
          </div>
          <div>
            <label className="text-sm text-gray-700 block mb-2">หน่วยความชื้น</label>
            <select className="border rounded-lg shadow p-2 input-style">
              <option>% (เปอร์เซ็นต์)</option>
            </select>
            <label className="text-sm text-gray-700 block mt-4">ความชื้นต่ำสุดที่แจ้งเตือน</label>
            <input type="number" 
            value={number}
            onChange={(e) => setNumber(e.target.value)} 
            className="border rounded-lg shadow p-2 input-style" />
          </div>
        </div>

        {/* กล่องการแจ้งเตือน */}
        <div className=" bg-white rounded-xl shadow p-6 mb-6">
          <label className="text-sm text-gray-700 block mb-4">การแจ้งเตือน</label>
          <div className="flex gap-6 text-sm">
            <label><input type="radio" name="alert" defaultChecked className="mr-1" /> Email</label>
            <label><input type="radio" name="alert" className="mr-1" /> SMS</label>
            <label><input type="radio" name="alert" className="mr-1" /> ไม่มีการแจ้งเตือน</label>
          </div>
        </div>

        <button className=" bg-green-700 text-white px-6 py-2 rounded shadow hover:bg-green-800">
          บันทึกการเปลี่ยนแปลง
        </button>
      </main>
    </div>
  );
}
