import { useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="bg-gradient-to-r from-green-800 to-green-400 p-4 rounded-b-xl  shadow font-sans font-semibold">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* โลโก้ + ชื่อ */}
        <div className="flex items-center gap-2">
          <img
            src="images/logo.png"
            alt="SmartSensor Logo"
            className="h-10 w-10 object-cover rounded-full bg-white"
          />
          <span className="text-xl md:text-2xl font-semibold text-white tracking-tight">
            smartsensor <span className="text-white">longan</span>
          </span>
        </div>

        {/* ปุ่ม */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-full shadow px-4 py-2 transition"
        >
          <Leaf className="w-4 h-4" />
          เริ่มต้นใช้งาน
        </button>
      </div>
    </header>
  );
}
