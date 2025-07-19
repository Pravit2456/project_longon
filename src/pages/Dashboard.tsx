import Card from "../components/Card";
import Calendar from "../components/Calendar";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#F4F6EC] flex">
      {/* Main content */}
      <main className="flex-1 p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#1E3A2E]">สวัสดีคุณสมชาย 👋</h1>
            <p className="text-sm text-gray-600">
              แปลงปลูกชื่อ “สวนลำไย บ้านวังชิ้น” พื้นที่ 12 ไร่ ใกล้ลำห้วยแคววัง
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card title="อุณหภูมิ" value="32°C" />
          <Card title="ความชื้น" value="74%" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card
            title="ข้อแนะนำวันนี้ (El Niño)"
            list={[
              "รดน้ำลำไยเพิ่มเพื่อรักษา",
              "ควบคุมน้ำในดินเพื่อหลีกเลี่ยงอาการแห้งตาย",
              "ติดตามอุณหภูมิ-ความชื้นใกล้ชิด",
            ]}
            bg="bg-[#E6F4F1]"
          />
          <Card
            title="แจ้งเตือนสำคัญ"
            list={[
              "สัปดาห์นี้ร้อน: อุณหภูมิสูงกว่า 35°C",
              "สภาพแห้งต่อเนื่อง (El Niño)",
            ]}
          />
          <Card
            title="แนวโน้มการเตรียมต้นไต"
            list={[
              "การเติบโตดีเยี่ยม",
              "การออกดอก/ให้ผล",
            ]}
          />
        </div>

        {/* ใช้งานปฏิทินจริง */}
        <div className="mt-6">
          <Calendar />
        </div>
      </main>
    </div>
  );
}
