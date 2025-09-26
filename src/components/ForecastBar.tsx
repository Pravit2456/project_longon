import { useRef } from "react";
import { Calendar, ChevronLeft, ChevronRight, CloudRain, Sun, Leaf, Snowflake, Cloud } from "lucide-react";

const forecastMonths = [
  { month: "ก.ย.", status: "ฝนตกมาก", icon: <CloudRain className="text-green-600 w-6 h-6" /> },
  { month: "ต.ค.", status: "อากาศปลอดโปร่ง", icon: <Sun className="text-yellow-500 w-6 h-6" /> },
  { month: "พ.ย.", status: "เหมาะสำหรับปลูก", icon: <Leaf className="text-green-500 w-6 h-6" /> },
  { month: "ธ.ค.", status: "อากาศเย็น", icon: <Snowflake className="text-blue-500 w-6 h-6" /> },
  { month: "ม.ค.", status: "อากาศดี", icon: <Sun className="text-yellow-500 w-6 h-6" /> },
  { month: "ก.พ.", status: "ร้อน-เย็นสลับ", icon: <Cloud className="text-teal-500 w-6 h-6" /> },
    { month: "ก.ย.", status: "ฝนตกมาก", icon: <CloudRain className="text-green-600 w-6 h-6" /> },
  { month: "ต.ค.", status: "อากาศปลอดโปร่ง", icon: <Sun className="text-yellow-500 w-6 h-6" /> },
  { month: "พ.ย.", status: "เหมาะสำหรับปลูก", icon: <Leaf className="text-green-500 w-6 h-6" /> },
  { month: "ธ.ค.", status: "อากาศเย็น", icon: <Snowflake className="text-blue-500 w-6 h-6" /> },
  { month: "ม.ค.", status: "อากาศดี", icon: <Sun className="text-yellow-500 w-6 h-6" /> },
  { month: "ก.พ.", status: "ร้อน-เย็นสลับ", icon: <Cloud className="text-teal-500 w-6 h-6" /> },
];

export default function ForecastBar() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -150 : 150,
        behavior: "smooth",
      });
    }
  };


  return (
    <section className="px-4 py-3 font-sans font-semibold">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
          <Calendar className="w-5 h-5" /> พยากรณ์ฤดูปลูก (ก.ย. – ก.พ.)
        </h3>
        <div className="flex gap-2">
          <button onClick={() => scroll("left")} className="p-1 rounded-full bg-white shadow hover:bg-green-100">
            <ChevronLeft className="w-5 h-5 text-green-800" />
          </button>
          <button onClick={() => scroll("right")} className="p-1 rounded-full bg-white shadow hover:bg-green-100">
            <ChevronRight className="w-5 h-5 text-green-800" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide snap-x scroll-smooth"
      >
        {forecastMonths.map((item, index) => (
          <div
            key={index}
            className="min-w-[120px] snap-center text-center px-5 py-5 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-center gap-2"
          >
            {item.icon}
            <div className="font-bold text-sm">{item.month}</div>
            <div className="text-xs text-gray-600">{item.status}</div>
          </div>
        ))}
      </div>
    </section>
  );
}