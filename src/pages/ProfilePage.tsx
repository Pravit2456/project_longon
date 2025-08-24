import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaLeaf } from "react-icons/fa";
import { FiBell, FiHome } from "react-icons/fi";

/* ===== Type ===== */
type ProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthday: string;
  address: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  language: string;
  emailNotification: boolean;
  smsNotification: boolean;
  newProduct: boolean;
  marketing: boolean;
  partner: boolean;
};

const ProfilePage: React.FC = () => {
  const [formData, setFormData] = useState<ProfileData>({
    firstName: "สมชาย",
    lastName: "ใจดี",
    email: "somchai@example.com",
    phone: "089-123-4567",
    birthday: "1990-05-15",
    address: "123 ถนนสุขใจ แขวงคลองสาน เขตคลองสาน กรุงเทพมหานคร 10110",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    language: "ไทย",
    emailNotification: true,
    smsNotification: true,
    newProduct: false,
    marketing: true,
    partner: false,
  });

  /* Handle input */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox" && "checked" in e.target) {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("บันทึกข้อมูล:", formData);
    alert("บันทึกข้อมูลสำเร็จ!");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ✅ Navbar */}
      <header className="sticky top-0 z-30 bg-white border-b">
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
            <Link to="/severpage" className="hover:text-slate-900 flex items-center gap-1">
              <FiHome /> แดชบอร์ด
            </Link>
            <Link to="/calendarserver" className="hover:text-slate-900">ปฏิทินงาน</Link>
            <Link to="/devices" className="hover:text-slate-900">อุปกรณ์</Link>
            <Link to="/pricing" className="hover:text-slate-900">ราคา</Link>
            <Link to="/profilepage" className="text-emerald-600 font-semibold">
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

      {/* ✅ Profile Form */}
      <div className="flex justify-center py-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6 space-y-6"
        >
          {/* Profile Picture */}
          <div className="flex items-center gap-4">
            <img
              src="https://randomuser.me/api/portraits/women/44.jpg"
              alt="profile"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <button
                type="button"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                อัปโหลดรูปใหม่
              </button>
              <p className="text-xs text-gray-500 mt-1">
                อัปโหลดไฟล์ภาพ .PNG, .JPG ขนาดไม่เกิน 5MB
              </p>
            </div>
          </div>

          {/* Personal Info */}
          <div>
            <h2 className="font-semibold text-lg mb-2">ข้อมูลส่วนตัว</h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="ชื่อ"
                className="border p-2 rounded-md w-full"
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="นามสกุล"
                className="border p-2 rounded-md w-full"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="อีเมล"
                className="border p-2 rounded-md w-full"
              />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="เบอร์โทร"
                className="border p-2 rounded-md w-full"
              />
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                className="border p-2 rounded-md w-full"
              />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="ที่อยู่"
                className="border p-2 rounded-md w-full col-span-2"
              />
            </div>
          </div>

          {/* Security */}
          <div>
            <h2 className="font-semibold text-lg mb-2">ความปลอดภัย</h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="รหัสผ่านปัจจุบัน"
                className="border p-2 rounded-md w-full"
              />
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="รหัสผ่านใหม่"
                className="border p-2 rounded-md w-full"
              />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="ยืนยันรหัสผ่านใหม่"
                className="border p-2 rounded-md w-full"
              />
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h2 className="font-semibold text-lg mb-2">การตั้งค่า</h2>
            <div className="space-y-3">
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="border p-2 rounded-md"
              >
                <option value="ไทย">ไทย</option>
                <option value="English">English</option>
              </select>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="emailNotification"
                  checked={formData.emailNotification}
                  onChange={handleChange}
                />
                การแจ้งเตือนอีเมล
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="smsNotification"
                  checked={formData.smsNotification}
                  onChange={handleChange}
                />
                การแจ้งเตือน SMS
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="newProduct"
                  checked={formData.newProduct}
                  onChange={handleChange}
                />
                รับข้อมูลผลิตภัณฑ์ใหม่
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="marketing"
                  checked={formData.marketing}
                  onChange={handleChange}
                />
                ความปลอดภัย
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="partner"
                  checked={formData.partner}
                  onChange={handleChange}
                />
                ข้อมูลของพันธมิตรธุรกิจ
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button
              type="button"
              className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;