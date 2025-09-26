// src/pages/ProfilePage.tsx
import React, { useState, useEffect } from "react";
import { FiBell } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

// --- Type ของ UserProfile ---
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  birthday?: string;
  address?: string;
  profile_image?: string;
  preferences: {
    language: string;
    email_notifications: boolean;
    sms_notifications: boolean;
    product_updates: boolean;
    security: boolean;
    partner_info: boolean;
  };
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  profileFile?: File | null;
}

// --- Component ---
const ProfilePage: React.FC = () => {
  const navigate = useNavigate();

  // ✅ ใช้ mock data แทน API
  const [formData, setFormData] = useState<UserProfile>({
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
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    profileFile: null,
  });

  const [previewUrl, setPreviewUrl] = useState("/images/default-profile.png");

  useEffect(() => {
    setPreviewUrl(formData.profile_image || "/images/default-profile.png");
  }, []);

  // --- Handle Change ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value, checked } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        preferences: { ...prev.preferences, [name]: checked },
      }));
    } else if (type === "file") {
      const file = (e.target as HTMLInputElement).files?.[0] ?? null;
      setFormData((prev) => ({ ...prev, profileFile: file }));
      if (file) setPreviewUrl(URL.createObjectURL(file));
    } else if (name === "language") {
      setFormData((prev) => ({
        ...prev,
        preferences: { ...prev.preferences, language: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // --- Handle Submit (mock) ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      return alert("รหัสผ่านใหม่ไม่ตรงกัน");
    }

    alert("อัปเดตข้อมูลสำเร็จ");
    // ✅ ส่งข้อมูลไปหน้า ProfileView ผ่าน state
    navigate("/profileview", { state: { user: formData } });
  };

  // --- JSX ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans font-semibold">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
            <span className="font-medium">Smart Sensor Longan</span>
          </div>
          <div className="flex items-center gap-4">
            <FiBell className="h-5 w-5" />
          </div>
        </div>
      </header>

      <div className="flex justify-center py-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6 space-y-6"
        >
          {/* รูปโปรไฟล์ */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <img
                src={previewUrl}
                alt="Profile"
                className="h-28 w-28 rounded-full object-cover border"
              />
              <input
                type="file"
                name="profileFile"
                accept="image/*"
                onChange={handleChange}
                className="absolute inset-0 opacity-0 cursor-pointer rounded-full"
              />
            </div>
          </div>

          {/* ข้อมูลส่วนตัว */}
          <div>
            <h2 className="font-semibold text-lg mb-2">ข้อมูลส่วนตัว</h2>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" name="username" value={formData.username} readOnly className="border p-2 rounded-md w-full bg-gray-100" />
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="border p-2 rounded-md w-full" />
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="border p-2 rounded-md w-full" />
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="border p-2 rounded-md w-full" />
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="border p-2 rounded-md w-full" />
              <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} className="border p-2 rounded-md w-full" />
              <input type="text" name="address" value={formData.address} onChange={handleChange} className="border p-2 rounded-md w-full col-span-2" />
              <input type="password" name="currentPassword" placeholder="รหัสผ่านปัจจุบัน" value={formData.currentPassword} onChange={handleChange} className="border p-2 rounded-md w-full" />
              <input type="password" name="newPassword" placeholder="รหัสผ่านใหม่" value={formData.newPassword} onChange={handleChange} className="border p-2 rounded-md w-full" />
              <input type="password" name="confirmPassword" placeholder="ยืนยันรหัสผ่านใหม่" value={formData.confirmPassword} onChange={handleChange} className="border p-2 rounded-md w-full" />
            </div>
          </div>

          {/* การตั้งค่า */}
          <div>
            <h2 className="font-semibold text-lg mb-2">การตั้งค่า</h2>
            <div className="space-y-3">
              <select name="language" value={formData.preferences.language} onChange={handleChange} className="border p-2 rounded-md">
                <option value="ไทย">ไทย</option>
                <option value="English">English</option>
              </select>
              {(
                ["email_notifications","sms_notifications","product_updates","security","partner_info"] as const
              ).map((field) => (
                <label key={field} className="flex items-center gap-2">
                  <input type="checkbox" name={field} checked={formData.preferences[field]} onChange={handleChange} />
                  {{
                    email_notifications: "แจ้งเตือนอีเมล",
                    sms_notifications: "แจ้งเตือน SMS",
                    product_updates: "ข่าวสารสินค้าใหม่",
                    security: "การตลาด",
                    partner_info: "พันธมิตร",
                  }[field]}
                </label>
              ))}
            </div>
          </div>

          {/* ปุ่มบันทึก */}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100">ยกเลิก</button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">บันทึก</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
