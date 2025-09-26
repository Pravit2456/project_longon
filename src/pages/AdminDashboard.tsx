import { useState } from "react";
import {
  FiUsers,
  FiDatabase,
  FiCheckCircle,
  FiAlertTriangle,
  FiBell,
  FiMonitor,
} from "react-icons/fi";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"users" | "database" | "approve" | "monitor" | "notify" | "farmerPages" | "providerPages">("users");

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Sidebar */}
      <aside className="w-64 bg-green-700 text-white p-6 space-y-4">
        <h1 className="text-2xl font-bold mb-6">🌿 Admin</h1>
        <nav className="space-y-3">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded ${
              activeTab === "users" ? "bg-green-500" : "hover:bg-green-600"
            }`}
          >
            <FiUsers /> จัดการผู้ใช้
          </button>
          <button
            onClick={() => setActiveTab("database")}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded ${
              activeTab === "database" ? "bg-green-500" : "hover:bg-green-600"
            }`}
          >
            <FiDatabase /> ฐานข้อมูล
          </button>
          <button
            onClick={() => setActiveTab("approve")}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded ${
              activeTab === "approve" ? "bg-green-500" : "hover:bg-green-600"
            }`}
          >
            <FiCheckCircle /> อนุมัติการสมัคร
          </button>
          <button
            onClick={() => setActiveTab("monitor")}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded ${
              activeTab === "monitor" ? "bg-green-500" : "hover:bg-green-600"
            }`}
          >
            <FiAlertTriangle /> ตรวจสอบระบบ
          </button>
          <button
            onClick={() => setActiveTab("notify")}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded ${
              activeTab === "notify" ? "bg-green-500" : "hover:bg-green-600"
            }`}
          >
            <FiBell /> แจ้งเตือน
          </button>

          {/* ✅ เพิ่มเมนูจัดการหน้า */}
          <button
            onClick={() => setActiveTab("farmerPages")}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded ${
              activeTab === "farmerPages" ? "bg-green-500" : "hover:bg-green-600"
            }`}
          >
            <FiMonitor /> หน้าของเกษตรกร
          </button>
          <button
            onClick={() => setActiveTab("providerPages")}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded ${
              activeTab === "providerPages" ? "bg-green-500" : "hover:bg-green-600"
            }`}
          >
            <FiMonitor /> หน้าของผู้ให้บริการ
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Users */}
          {activeTab === "users" && (
            <div>
              <h2 className="text-xl font-semibold text-green-700 mb-4">
                👤 จัดการผู้ใช้
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>ดู/แก้ไขข้อมูลผู้ใช้</li>
                <li>ลบผู้ใช้ที่ไม่เหมาะสม</li>
                <li>ตั้งค่า Role (Farmer / Provider / Admin)</li>
              </ul>
            </div>
          )}

          {/* Database */}
          {activeTab === "database" && (
            <div>
              <h2 className="text-xl font-semibold text-green-700 mb-4">
                🗄 จัดการฐานข้อมูล
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>แก้ไขราคาปุ๋ย</li>
                <li>อัปเดตค่าบริการ</li>
                <li>จัดการตำแหน่งของกลุ่มบริการ</li>
              </ul>
            </div>
          )}

          {/* Approve */}
          {activeTab === "approve" && (
            <div>
              <h2 className="text-xl font-semibold text-green-700 mb-4">
                ✅ อนุมัติการสมัคร
              </h2>
              <p className="text-gray-700">
                ตรวจสอบผู้ใช้ใหม่ → อนุมัติหรือปฏิเสธ
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center border p-2 rounded">
                  <span>👤 นายสมชาย (Farmer)</span>
                  <div className="space-x-2">
                    <button className="bg-green-600 text-white px-3 py-1 rounded">
                      อนุมัติ
                    </button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded">
                      ปฏิเสธ
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center border p-2 rounded">
                  <span>👤 คุณสุกัญญา (Provider)</span>
                  <div className="space-x-2">
                    <button className="bg-green-600 text-white px-3 py-1 rounded">
                      อนุมัติ
                    </button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded">
                      ปฏิเสธ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Monitor */}
          {activeTab === "monitor" && (
            <div>
              <h2 className="text-xl font-semibold text-green-700 mb-4">
                🔎 ตรวจสอบระบบ
              </h2>
              <p className="text-gray-700">สถานะการทำงานของระบบ:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>ฐานข้อมูล: ✅ ปกติ</li>
                <li>API Server: ✅ ปกติ</li>
                <li>MQTT Service: ⚠️ มีปัญหา</li>
              </ul>
            </div>
          )}

          {/* Notify */}
          {activeTab === "notify" && (
            <div>
              <h2 className="text-xl font-semibold text-green-700 mb-4">
                🔔 แจ้งเตือน
              </h2>
              <p className="text-gray-700">ส่งข้อความ/แจ้งเตือนถึงผู้ใช้</p>
              <textarea
                className="w-full border rounded p-2 mt-2"
                rows={3}
                placeholder="พิมพ์ข้อความที่ต้องการแจ้ง..."
              />
              <button className="mt-3 bg-green-600 text-white px-4 py-2 rounded">
                ส่งแจ้งเตือน
              </button>
            </div>
          )}

          {/* Farmer Pages */}
          {activeTab === "farmerPages" && (
            <div>
              <h2 className="text-xl font-semibold text-green-700 mb-4">
                🌱 หน้าของเกษตรกร
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <Link to="/dashboard" className="text-green-600 underline">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/plot" className="text-green-600 underline">
                    PlotPage
                  </Link>
                </li>
                <li>
                  <Link to="/calendar" className="text-green-600 underline">
                    Calendar
                  </Link>
                </li>
                <li>
                  <Link to="/fertilizer" className="text-green-600 underline">
                    Fertilizer
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* Provider Pages */}
          {activeTab === "providerPages" && (
            <div>
              <h2 className="text-xl font-semibold text-green-700 mb-4">
                🚜 หน้าของผู้ให้บริการ
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  {/* เส้นทางใน App.tsx คือ "/severpage" (สะกดแบบนี้) */}
                  <Link to="/severpage" className="text-green-600 underline">
                    ServerPage
                  </Link>
                </li>
                <li>
                  <Link to="/calendarserver" className="text-green-600 underline">
                    CalendarServer
                  </Link>
                </li>
                <li>
                  <Link to="/profileview" className="text-green-600 underline">
                    ProfileView
                  </Link>
                </li>
                <li>
                  <Link to="/providerdetail" className="text-green-600 underline">
                    ProviderDetail
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
