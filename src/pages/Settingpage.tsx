import { useState, useEffect } from "react";
import axios from "axios";

interface ProfileData {
  username: string;
  email: string;
  phone?: string;
  address?: string;
  role?: string;
  unit_temp?: string;
  unit_humidity?: string;
  max_temp_alert?: number | null;
  min_humidity_alert?: number | null;
  language?: string;
  notification_method?: string;
  profile_image?: string;
  message?: string;
  error?: string;
}

export default function SettingPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("user");
  const [unitTemp, setUnitTemp] = useState("C");
  const [unitHumidity, setUnitHumidity] = useState("%");
  const [maxTempAlert, setMaxTempAlert] = useState<string>(""); // เก็บเป็น string เพื่อให้ input รับค่าว่างได้
  const [minHumidityAlert, setMinHumidityAlert] = useState<string>("");
  const [language, setLanguage] = useState("th");
  const [notificationMethod, setNotificationMethod] = useState("email");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageURL, setProfileImageURL] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axios.get<ProfileData>("/api/profile");
        const data = res.data;

        setUsername(data.username || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        setRole(data.role || "user");
        setUnitTemp(data.unit_temp || "C");
        setUnitHumidity(data.unit_humidity || "%");
        setMaxTempAlert(data.max_temp_alert !== undefined && data.max_temp_alert !== null ? String(data.max_temp_alert) : "");
        setMinHumidityAlert(data.min_humidity_alert !== undefined && data.min_humidity_alert !== null ? String(data.min_humidity_alert) : "");
        setLanguage(data.language || "th");
        setNotificationMethod(data.notification_method || "email");

        if (data.profile_image) {
          setProfileImageURL(`/uploads/${data.profile_image}`);
        } else {
          setProfileImageURL(null);
        }
      } catch (error) {
        console.error("Fetch profile failed:", error);
      }
    }
    fetchProfile();
  }, []);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setProfileImageURL(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("address", address);
      formData.append("role", role);
      formData.append("unit_temp", unitTemp);
      formData.append("unit_humidity", unitHumidity);

      // ส่งค่าถ้าไม่ว่าง
      if (maxTempAlert.trim() !== "") {
        formData.append("max_temp_alert", maxTempAlert);
      } else {
        formData.append("max_temp_alert", ""); // หรือไม่ส่งก็ได้ แล้วแต่ backend รองรับยังไง
      }

      if (minHumidityAlert.trim() !== "") {
        formData.append("min_humidity_alert", minHumidityAlert);
      } else {
        formData.append("min_humidity_alert", "");
      }

      formData.append("language", language);
      formData.append("notification_method", notificationMethod);

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const res = await axios.put<ProfileData>("/api/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert(res.data.message || "อัปเดตโปรไฟล์สำเร็จ");
    } catch (error: any) {
      console.error("Update profile failed:", error.response || error);
      alert(
        error.response?.data?.error ||
          "เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์"
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-gray-50 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center">ตั้งค่าบัญชีผู้ใช้</h2>

      {/* รูปโปรไฟล์ */}
      <div className="flex justify-center mb-6">
        <label className="relative cursor-pointer group">
          <input
            type="file"
            accept="image/*"
            onChange={handleProfileImageChange}
            className="hidden"
          />
          <div className="w-32 h-32 rounded-full border border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400 group-hover:brightness-90 transition-all">
            {profileImageURL ? (
              <img
                src={profileImageURL}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm text-center px-2">เลือกรูปโปรไฟล์</span>
            )}
          </div>
        </label>
      </div>

      {/* ฟอร์มข้อมูล */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">ชื่อผู้ใช้</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">อีเมล</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">เบอร์โทร</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">ที่อยู่</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">สิทธิ์การใช้งาน</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">หน่วยอุณหภูมิ</label>
          <select
            value={unitTemp}
            onChange={(e) => setUnitTemp(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="C">เซลเซียส (°C)</option>
            <option value="F">ฟาเรนไฮต์ (°F)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">หน่วยความชื้น</label>
          <select
            value={unitHumidity}
            onChange={(e) => setUnitHumidity(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="%">เปอร์เซ็นต์ (%)</option>
            <option value="g/m3">กรัม/ลูกบาศก์เมตร (g/m³)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">ค่าขีดจำกัดอุณหภูมิสูงสุดแจ้งเตือน</label>
          <input
            type="number"
            value={maxTempAlert}
            onChange={(e) => setMaxTempAlert(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="เช่น 35"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">ค่าขีดจำกัดความชื้นต่ำสุดแจ้งเตือน</label>
          <input
            type="number"
            value={minHumidityAlert}
            onChange={(e) => setMinHumidityAlert(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="เช่น 20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">ภาษา</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="th">ไทย</option>
            <option value="en">อังกฤษ</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">วิธีการแจ้งเตือน</label>
          <select
            value={notificationMethod}
            onChange={(e) => setNotificationMethod(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="email">อีเมล</option>
            <option value="sms">SMS</option>
            <option value="none">ไม่แจ้งเตือน</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md mt-4"
        >
          บันทึกการเปลี่ยนแปลง
        </button>
      </div>
    </div>
  );
}
