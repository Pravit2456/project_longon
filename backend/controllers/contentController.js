
// ตัวอย่าง Controller สำหรับจัดการ content
async function getAllContent(req, res) {
  // ตัวอย่างโค้ดเชื่อม DB หรือ return content แบบ dummy
  res.json({ message: 'เรียกข้อมูล content ทั้งหมด' });
}

module.exports = {
  getAllContent,
};
