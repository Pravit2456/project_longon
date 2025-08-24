const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');  // ถ้าต้องการเพิ่มความปลอดภัย

const dbConfig = {
  host: 'localhost',
  user: 'root',       
  password: '1234',   
  database: 'admin',  
};

async function registerUser(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบ' });
  }

  try {
    // เข้ารหัสรหัสผ่านก่อนเก็บ (แนะนำ)
    const hashedPassword = await bcrypt.hash(password, 10);

    const db = await mysql.createConnection(dbConfig);

    await db.execute(
      'INSERT INTO users (username, email, password, created_at) VALUES (?, ?, ?, NOW())',
      [username, email, hashedPassword]
    );

    await db.end();

    res.status(200).json({ message: 'ลงทะเบียนสำเร็จ' });
  } catch (error) {
    console.error('❌ Register Error:', error.message);
    res.status(500).json({ message: 'ไม่สามารถลงทะเบียนได้' });
  }
}

module.exports = {
  registerUser,
};
