import React from "react";
import { Link } from "react-router-dom";
import { FaLeaf, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { FiBell } from "react-icons/fi";

const ProfileView: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ✅ Navbar */}
      <header className="sticky top-0 z-30 bg-white border-b shadow-sm">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 font-sans">
            <div className="h-8 w-8 rounded-md bg-emerald-600 grid place-items-center text-white">
              <FaLeaf />
            </div>
            <span className="font-semibold">Smart Sensor longan</span>
          </div>

          {/* Menu */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <Link to="/severpage" className="hover:text-slate-900">
              แดชบอร์ด
            </Link>
            <Link to="/calendarserver" className="hover:text-slate-900">
              ปฏิทินงาน
            </Link>
            <Link to="/devices" className="hover:text-slate-900">
              อุปกรณ์
            </Link>
            <Link to="/pricing" className="hover:text-slate-900">
              ราคา
            </Link>
            <Link
              to="/profile"
              className="text-emerald-600 font-semibold border-b-2 border-emerald-600 pb-1"
            >
              โปรไฟล์
            </Link>
          </nav>

          {/* Notification */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-slate-100">
              <FiBell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-rose-500" />
            </button>
          </div>
        </div>
      </header>

      {/* ✅ Profile Info */}
      <div className="flex justify-center py-10 px-4">
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4 border-b pb-4">
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500"
            />
            <div>
              <h2 className="text-xl font-semibold">สมชาย ใจดี</h2>
              <p className="text-gray-500">somchai@example.com</p>
            </div>
          </div>

          {/* Personal Info */}
          <div>
            <h2 className="font-semibold text-lg mb-3 border-l-4 border-emerald-500 pl-2">
              ข้อมูลส่วนตัว
            </h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-medium">ชื่อ-นามสกุล:</span> สมชาย ใจดี
              </p>
              <p>
                <span className="font-medium">เบอร์โทร:</span> 089-123-4567
              </p>
              <p>
                <span className="font-medium">วันเกิด:</span> 1990-05-15
              </p>
              <p>
                <span className="font-medium">ที่อยู่:</span> 123 ถนนสุขใจ แขวงคลองสาน เขตคลองสาน กรุงเทพมหานคร 10110
              </p>
            </div>
          </div>

          {/* Security */}
          <div>
            <h2 className="font-semibold text-lg mb-3 border-l-4 border-emerald-500 pl-2">
              ความปลอดภัย
            </h2>
            <p className="text-gray-700">•••••••• (รหัสผ่านถูกซ่อน)</p>
          </div>

          {/* Preferences */}
          <div>
            <h2 className="font-semibold text-lg mb-3 border-l-4 border-emerald-500 pl-2">
              การตั้งค่า
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li>🌐 <span className="font-medium">ภาษา:</span> ไทย</li>
              <li className="flex items-center gap-2 text-green-600">
                <FaCheckCircle /> การแจ้งเตือนอีเมล
              </li>
              <li className="flex items-center gap-2 text-green-600">
                <FaCheckCircle /> การแจ้งเตือน SMS
              </li>
              <li className="flex items-center gap-2 text-red-500">
                <FaTimesCircle /> รับข้อมูลผลิตภัณฑ์ใหม่
              </li>
              <li className="flex items-center gap-2 text-green-600">
                <FaCheckCircle /> ความปลอดภัย
              </li>
              <li className="flex items-center gap-2 text-red-500">
                <FaTimesCircle /> ข้อมูลของพันธมิตรธุรกิจ
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <Link
              to="/profilepage"
              className="px-5 py-2 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700 transition"
            >
              แก้ไขโปรไฟล์
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;