// pages/ProfileEdit.tsx
import { useNavigate } from "react-router-dom";
import {
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaThermometerHalf,
  FaTint,
  FaEnvelope,
} from "react-icons/fa";
import { useEffect, useState } from "react";

export default function ProfileEdit() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [number, setNumber] = useState("");

  // ✅ โหลดข้อมูลจาก localStorage ตอนเปิดหน้า
  useEffect(() => {
    setName(localStorage.getItem("name") || "อภิชาติ สุวรรณดี");
    setEmail(localStorage.getItem("email") || "apichat@email.com");
    setPhone(localStorage.getItem("phone") || "081-234-5678");
    setAddress(localStorage.getItem("address") || "เชียงใหม่,ไทย");
    setNumber(localStorage.getItem("number") || "30");
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F5F7ED] p-8">
      <main className="flex-1 max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="flex items-center gap-6 mb-6">
          <img
            src="https://i.pravatar.cc/120"
            alt="avatar"
            className="w-24 h-24 rounded-full border-4 border-green-200 shadow"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
            <p className="text-gray-500">{email}</p>
          </div>
        </div>

        {/* ข้อมูลส่วนตัว */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-green-700 mb-2">
            ข้อมูลส่วนตัว
          </h3>
          <div className="space-y-2 text-gray-700">
            <p className="flex items-center gap-2">
              <FaPhoneAlt className="text-red-500" /> เบอร์โทร: {phone}
            </p>
            <p className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-red-500" /> ที่อยู่: {address}
            </p>
          </div>
        </div>

        {/* การตั้งค่า */}
        <div>
          <h3 className="text-lg font-semibold text-green-700 mb-2">
            การตั้งค่า
          </h3>
          <div className="space-y-2 text-gray-700">
            <p className="flex items-center gap-2">
              <FaThermometerHalf className="text-orange-500" /> แจ้งเตือนอุณหภูมิเกิน {number}°C
            </p>
            <p className="flex items-center gap-2">
              <FaTint className="text-blue-500" /> แจ้งเตือนความชื้นต่ำกว่า {number}%
            </p>
            <p className="flex items-center gap-2">
              <FaEnvelope className="text-green-600" /> การแจ้งเตือน: Email
            </p>
          </div>
        </div>

        {/* ปุ่มไปแก้ไข */}
        <div className="mt-8 text-right">
          <button
            onClick={() => navigate("/setting")}
            className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
          >
            แก้ไขโปรไฟล์
          </button>
        </div>
      </main>
    </div>
  );
}
