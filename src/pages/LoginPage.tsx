// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type LoginResponse = {
  user?: any;
  token?: string;          // ถ้าแบ็กเอนด์ส่ง JWT กลับมา
  message?: string;
};

export default function Login() {
  const navigate = useNavigate();

  // 👉 ตั้งค่า API จาก .env ถ้าไม่มีก็ fallback เป็น origin เดิม
  const API_URL =
    import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || window.location.origin;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      // ✅ เรียกแบ็กเอนด์: รองรับ cookie-session และ JWT
      const res = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ถ้าแบ็กเอนด์ใช้ cookie-session ต้องมี credentials: "include"
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      let data: LoginResponse | undefined;
      try {
        data = await res.json();
      } catch {
        /* กรณีแบ็กเอนด์ไม่ส่ง JSON กลับมา */
      }

      if (!res.ok) {
        throw new Error(data?.message || `เข้าสู่ระบบไม่สำเร็จ (${res.status})`);
      }

      // ✅ เก็บ token ถ้ามี (กรณี JWT)
      if (data?.token) {
        localStorage.setItem("token", data.token);
      }

      // ✅ เก็บข้อมูลผู้ใช้ไว้ใช้ต่อ
      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // 👉 ไปหน้า dashboard (ปรับเส้นทางได้)
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err?.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url('/images/bglongan.png')" }}
    >
      <div className="absolute inset-0 bg-green-900/30"></div>

      <div className="relative z-10 bg-white/90 backdrop-blur-lg shadow-lg rounded-xl w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-green-800 mb-6 text-center flex items-center justify-center gap-2">
          🌱 เข้าสู่ระบบ
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-white/50 
                         placeholder-gray-400 text-gray-900 focus:ring-2 focus:ring-green-600 
                         focus:border-green-400 focus:outline-none shadow-sm transition"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-white/50 
                           placeholder-gray-400 text-gray-900 focus:ring-2 focus:ring-green-600 
                           focus:border-green-400 focus:outline-none shadow-sm transition pr-12"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute inset-y-0 right-0 px-3 text-sm text-green-700/80 hover:text-green-900"
                aria-label={showPwd ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                tabIndex={-1}
              >
                {showPwd ? "ซ่อน" : "แสดง"}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-600 transition transform hover:scale-[1.02] shadow-md disabled:opacity-50"
            aria-busy={loading}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-700">
          ยังไม่มีบัญชี?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-green-700 font-semibold hover:underline"
          >
            สมัครสมาชิก
          </button>
        </p>
      </div>
    </div>
  );
}
