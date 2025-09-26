import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterPage2() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, role: "provider" }), // ✅ provider
      });

      if (response.ok) {
        navigate("/login2"); // ไป login ผู้ให้บริการ
      } else {
        const error = await response.json();
        alert("เกิดข้อผิดพลาด: " + error.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/images/bglongan.png')", // ✅ พื้นหลังสวนลำไย
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-green-900/30"></div>

      {/* Card */}
      <div className="relative z-10 bg-white shadow-xl rounded-xl w-full max-w-md p-8 border border-green-200">
        <h1 className="text-3xl font-bold text-green-800 mb-6 text-center">
          🌿 สมัครสมาชิก (ผู้ให้บริการ)
        </h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">ชื่อผู้ใช้</label>
            <input
              type="text"
              placeholder="ชื่อของคุณ"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-white
                         placeholder-gray-400 text-gray-900
                         focus:ring-2 focus:ring-green-600 focus:border-green-400
                         focus:outline-none shadow-sm transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">อีเมล</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-white
                         placeholder-gray-400 text-gray-900
                         focus:ring-2 focus:ring-green-600 focus:border-green-400
                         focus:outline-none shadow-sm transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-white
                         placeholder-gray-400 text-gray-900
                         focus:ring-2 focus:ring-green-600 focus:border-green-400
                         focus:outline-none shadow-sm transition"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-600 transition transform hover:scale-[1.02] shadow-md"
          >
            สมัครสมาชิก
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-700">
          มีบัญชีอยู่แล้ว?{" "}
          <button
            onClick={() => navigate("/login2")}
            className="text-green-700 font-semibold hover:underline"
          >
            เข้าสู่ระบบ
          </button>
        </p>
      </div>
    </div>
  );
}
