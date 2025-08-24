import jwt from "jsonwebtoken";

// ควรเก็บ SECRET_KEY ใน .env แล้วโหลดผ่าน process.env
const SECRET_KEY = "your-secret-key";

export default function authenticate(req, res, next) {
  let token;

  // เช็ค Authorization header แบบ Bearer token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // ถ้าไม่มี token จาก header ให้เช็ค cookie token
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  console.log("Token in authenticate middleware:", token); // เพิ่ม log เพื่อตรวจสอบ

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // ใส่ข้อมูล user ใน req เพื่อใช้ต่อ
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}
