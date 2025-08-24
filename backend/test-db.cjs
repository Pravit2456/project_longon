console.log(__dirname);

const db = require("./db.cjs");
 // หรือ "./db" ขึ้นกับที่อยู่ไฟล์ test-db.cjs 
// ✅ ชี้ไปยังตำแหน่งที่ถูกต้อง

db.query("SELECT * FROM users", (err, results) => {
  if (err) {
    console.error("❌ Query error:", err.message);
  } else {
    console.log("✅ Query results:", results);
  }

  db.end(); // ปิดการเชื่อมต่อหลังจบงาน
});
