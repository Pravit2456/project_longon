// src/pages/StartPage.tsx
import { useNavigate } from "react-router-dom";

export default function StartPage() {
  const navigate = useNavigate();

  const quickLogin = (role: "farmer" | "provider") => {
    // ✅ โหมดทดลอง: เซ็ตสถานะล็อกอินให้ผ่าน PrivateRoute
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("role", role);
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: "demo",
        username: role === "farmer" ? "demo_farmer" : "demo_provider",
        role,
      })
    );

    // ✅ ไปหน้าเริ่มต้นตามบทบาท
    if (role === "farmer") {
      navigate("/dashboard", { replace: true });
    } else {
      // ✅ แก้สะกดเป็น /serverpage ให้ตรงกับเส้นทางจริง
      navigate("/serverpage", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center px-8 py-16 font-sans font-semibold">
      <h1 className="text-3xl md:text-4xl font-bold text-green-900 mb-12 text-center">
        ยินดีต้อนรับสู่แพลตฟอร์มวางแผนการเกษตร
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-20 max-w-6xl">
        {/* เกษตรกร */}
        <div className="flex flex-col items-center">
          <img
            src="/images/landing1.png"
            alt="เกษตรกร"
            className="w-96 h-96 object-cover rounded-2xl shadow-lg"
          />

          {/* ไปหน้า Login จริง (ไม่ตั้งค่า auth ที่นี่) */}
          <button
            onClick={() => navigate("/login", { state: { role: "farmer" } })}
            className="mt-6 px-8 py-3 text-lg bg-white rounded-full text-gray-800 font-semibold shadow hover:bg-gray-100"
          >
            ลงชื่อเข้าใช้งานสำหรับเกษตรกร
          </button>

          {/* ปุ่มทดลองใช้ทันที */}
          <button
            onClick={() => quickLogin("farmer")}
            className="mt-3 text-sm text-green-700 underline underline-offset-4 hover:text-green-800"
          >
         </button>
        </div>

        {/* ผู้ให้บริการ */}
        <div className="flex flex-col items-center">
          <img
            src="/images/landing2.png"
            alt="ผู้ให้บริการ"
            className="w-96 h-96 object-cover rounded-2xl shadow-lg"
          />

          {/* ไปหน้า Login สำหรับผู้ให้บริการ */}
          <button
            onClick={() => navigate("/login2", { state: { role: "provider" } })}
            className="mt-6 px-8 py-3 text-lg bg-white rounded-full text-gray-800 font-semibold shadow hover:bg-gray-100"
          >
            ลงชื่อเข้าใช้งานสำหรับผู้ให้บริการ
          </button>

          {/* ปุ่มทดลองใช้ทันที */}
          <button
            onClick={() => quickLogin("provider")}
            className="mt-3 text-sm text-green-700 underline underline-offset-4 hover:text-green-800"
          >
          </button>
        </div>
      </div>
    </div>
  );
}
