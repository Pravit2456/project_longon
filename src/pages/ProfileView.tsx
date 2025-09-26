// src/pages/ProfileView.tsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { FiBell } from "react-icons/fi";
import type { UserProfile } from "./ProfilePage";

const ProfileView: React.FC = () => {
  const location = useLocation();
  const [user, setUser] = useState<UserProfile | null>(
    (location.state as { user: UserProfile })?.user || null
  );
  const [loading, setLoading] = useState(!user);

  useEffect(() => {
    if (!user) {
      // ✅ mock ข้อมูลจำลอง
      const mockUser: UserProfile = {
        id: 1,
        username: "provider1",
        email: "provider@example.com",
        first_name: "สมชาย",
        last_name: "ใจดี",
        phone: "0812345678",
        birthday: "1990-01-01",
        address: "123 หมู่บ้านลำไย ต.ห้วยยาบ อ.เมือง จ.ลำพูน",
        profile_image: "/images/default-profile.png",
        preferences: {
          language: "ไทย",
          email_notifications: true,
          sms_notifications: false,
          product_updates: true,
          security: false,
          partner_info: true,
        },
      };

      setTimeout(() => {
        setUser(mockUser);
        setLoading(false);
      }, 500); // จำลองดีเลย์
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">⏳ กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">❌ ไม่พบข้อมูลผู้ใช้</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans font-semibold">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b shadow-sm">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
            <span className="font-semibold">Smart Sensor Longan</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-slate-100">
              <FiBell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-rose-500" />
            </button>
          </div>
        </div>
      </header>

      {/* Profile Info */}
      <div className="flex justify-center py-10 px-4">
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4 border-b pb-4">
            <img
              src={user.profile_image || "/images/default-profile.png"}
              alt="profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500"
            />
            <div>
              <h2 className="text-xl font-semibold">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>

          {/* Personal Info */}
          <div>
            <h2 className="font-semibold text-lg mb-3 border-l-4 border-emerald-500 pl-2">
              ข้อมูลส่วนตัว
            </h2>
            <div className="space-y-2 text-gray-700">
              <p><span className="font-medium">ชื่อ:</span> {user.first_name}</p>
              <p><span className="font-medium">นามสกุล:</span> {user.last_name}</p>
              <p><span className="font-medium">เบอร์โทร:</span> {user.phone || "-"}</p>
              <p><span className="font-medium">วันเกิด:</span> {user.birthday || "-"}</p>
              <p><span className="font-medium">ที่อยู่:</span> {user.address || "-"}</p>
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h2 className="font-semibold text-lg mb-3 border-l-4 border-emerald-500 pl-2">
              การตั้งค่า
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li>
                🌐 <span className="font-medium">ภาษา:</span> {user.preferences?.language || "ไทย"}
              </li>
              {[
                ["email_notifications", "แจ้งเตือนอีเมล"],
                ["sms_notifications", "แจ้งเตือน SMS"],
                ["product_updates", "ข่าวสารสินค้าใหม่"],
                ["security", "การตลาด"],
                ["partner_info", "พันธมิตร"],
              ].map(([key, label]) => (
                <li
                  key={key}
                  className={`flex items-center gap-2 ${
                    user.preferences?.[key as keyof typeof user.preferences]
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {user.preferences?.[key as keyof typeof user.preferences]
                    ? <FaCheckCircle />
                    : <FaTimesCircle />}
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* ปุ่มแก้ไข */}
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
