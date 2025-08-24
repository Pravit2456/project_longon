// db.js (ESModule ใช้กับ import)
import mysql from "mysql2/promise";

// ✅ ใช้ createConnection แบบ async
const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",  // ✅ แก้ให้ตรงกับเครื่องคุณ
  database: "admin"
});

console.log("✅ MySQL connected (Promise-based)");

export default db;
