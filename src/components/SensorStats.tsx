import {
  Sun,
  CloudRain,
  Cloud,
} from "lucide-react"; 

const sensorData = [
  { icon: <Sun className="text-yellow-500 w-8 h-8" />, value: "32°C", label: "อุณหภูมิ" },
  { icon: <CloudRain className="text-blue-500 w-8 h-8" />, value: "78%", label: "ความชื้น" },
  { icon: <Cloud className="text-gray-400 w-8 h-8" />, value: "2 µm", label: "ฝุ่น" },
  
];

export default function SensorStats() {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {sensorData.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-6 shadow hover:shadow-md transition flex flex-col items-center text-center"
        >
          <div className="mb-2">{item.icon}</div>
          <div className="text-2xl font-semibold text-green-800">{item.value}</div>
          <div className="text-sm text-gray-500">{item.label}</div>
        </div>
      ))}
    </section>
  );
}
