export default function AdviceToday() {
  return (
    <section >
      {/* ฝั่งข้อความ */}
      <div className="flex-1 bg-[#e0f5e0] p-6 rounded-xl space-y-3 font-sans font-semibold">
        <h3 className="flex items-center gap-2 text-green-800 font-sans text-lg">
          <span className="text-yellow-500">💡</span> คำแนะนำการปลูกวันนี้
        </h3>

        <p className="text-sm text-gray-700 leading-relaxed">
          วันนี้เหมาะสำหรับเตรียมดินและให้น้ำ 
          
          เนื่องจากอุณหภูมิสูงและมีความชื้นในอากาศ เหมาะสำหรับการลงต้นกล้าลำไย
        </p>
      </div>

      {/* ฝั่งรูปภาพ */}
      <div className="flex-shrink-0 ml-6">
        <img
          src="/images/aleart.png"
          alt="คำแนะนำ"
          className="w-[180px] h-[180px] object-cover rounded-xl"
        />
      </div>
    </section>
  );
}
