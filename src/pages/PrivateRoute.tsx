import { Navigate } from "react-router-dom";
import { useUser } from "./UserContext";

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { userId, loading } = useUser();

  if (loading) {
    // รอโหลดสถานะ userId ก่อน
    return <div>กำลังโหลด...</div>;
  }

  if (!userId) {
    // ถ้ายังไม่ล็อกอินให้ไปหน้า login
    return <Navigate to="/login" replace />;
  }

  // ล็อกอินแล้ว แสดง children ได้เลย
  return <>{children}</>;
}
