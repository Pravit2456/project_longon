// src/pages/ProviderLogin.tsx
import { useNavigate } from "react-router-dom";

export default function ProviderLogin() {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 👉 ผู้ให้บริการ login เสร็จไปหน้า /ServerSetup
    navigate("/ServerSetup");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url('/images/bglongan.png')" }}
    >
      <div className="absolute inset-0 bg-green-900/30"></div>

      <div className="relative z-10 bg-white backdrop-blur-lg shadow-lg rounded-xl w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-green-800 mb-6 text-center flex items-center justify-center gap-2">
          🌱 เข้าสู่ระบบผู้ให้บริการ
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">อีเมล</label>
            <input
              type="email"
              placeholder="provider@email.com"
              className="mt-1 w-full px-4 py-2 border border-white rounded-lg bg-white/50 
                         placeholder-gray-400 text-gray-900 focus:ring-2 focus:ring-green-600 
                         focus:border-green-400 focus:outline-none shadow-sm transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
            <input
              type="password"
              placeholder="••••••••"
              className="mt-1 w-full px-4 py-2 border border-white rounded-lg bg-white/50 
                         placeholder-gray-400 text-gray-900 focus:ring-2 focus:ring-green-600 
                         focus:border-green-400 focus:outline-none shadow-sm transition"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-600 transition transform hover:scale-[1.02] shadow-md"
          >
            เข้าสู่ระบบ
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-700">
          ยังไม่มีบัญชีผู้ให้บริการ?{" "}
          <button
            onClick={() => navigate("/register2")}
            className="text-green-700 font-semibold hover:underline"
          >
            สมัครสมาชิก
          </button>
        </p>
      </div>
    </div>
  );
}
