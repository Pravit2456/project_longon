// src/pages/StartPage.tsx
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
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

    // นำทางไปหน้าแรกของแต่ละบทบาท
    if (role === "farmer") {
      navigate("/dashboard");
    } else {
      // หมายเหตุ: เส้นทางในโปรเจกต์ของคุณสะกดว่า "/severpage"
      navigate("/severpage");
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center px-8 py-16 font-sans font-semibold">
      <h1 className="text-3xl md:text-4xl font-bold text-green-900 mb-12 text-center">
        ยินดีต้อนรับสู่แพลตฟอร์มวางแผนการเกษตร
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-20 max-w-6xl">
        {/* เกษตรกรทั่วไป */}
        <div className="flex flex-col items-center">
          <img
            src="/images/landing1.png"
            alt="เกษตรกร"
            className="w-96 h-96 object-cover rounded-2xl shadow-lg"
          />
          {/* ปุ่มเดิม: ถ้าจะไปหน้าล็อกอินจริง */}
          {/* <button
            onClick={() => navigate("/login")}
            className="mt-6 px-8 py-3 text-lg bg-white rounded-full text-gray-800 font-semibold shadow hover:bg-gray-100"
          >
            ลงชื่อเข้าใช้งานสำหรับเกษตรกร
          </button> */}

          {/* โหมดทดลอง: เข้าใช้งานได้ทันที */}
          <button
            onClick={() => quickLogin("farmer")}
            className="mt-6 px-8 py-3 text-lg bg-white rounded-full text-gray-800 font-semibold shadow hover:bg-gray-100"
          >
            ลงชื่อเข้าใช้งานสำหรับเกษตรกร
          </button>
        </div>

        {/* ผู้ให้บริการ */}
        <div className="flex flex-col items-center">
          <img
            src="/images/landing2.png"
            alt="ผู้ให้บริการ"
            className="w-96 h-96 object-cover rounded-2xl shadow-lg"
          />
          {/* ปุ่มเดิม: ถ้าจะไปหน้าล็อกอินจริง */}
          {/* <button
            onClick={() => navigate("/login2")}
            className="mt-6 px-8 py-3 text-lg bg-white rounded-full text-gray-800 font-semibold shadow hover:bg-gray-100"
          >
            ลงชื่อเข้าใช้งานสำหรับผู้ให้บริการ
          </button> */}

          {/* โหมดทดลอง: เข้าใช้งานได้ทันที */}
          <button
            onClick={() => quickLogin("provider")}
            className="mt-6 px-8 py-3 text-lg bg-white rounded-full text-gray-800 font-semibold shadow hover:bg-gray-100"
          >
            ลงชื่อเข้าใช้งานสำหรับผู้ให้บริการ
          </button>
        </div>
      </div>
    </div>
  );
}
