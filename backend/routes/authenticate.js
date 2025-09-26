import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "default-secret-key";

function getToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) return authHeader.split(" ")[1];
  if (req.cookies?.token) return req.cookies.token;
  return null;
}

export default function authenticate(req, res, next) {
  const token = getToken(req);
  console.log("Cookies:", req.cookies);
  console.log("Authorization header:", req.headers.authorization);
  console.log("Token in authenticate middleware:", token);

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);

    if (err.name === "TokenExpiredError") {
      return res.status(403).json({ error: "Token expired" });
    }

    return res.status(403).json({ error: "Invalid token" });
  }
}
