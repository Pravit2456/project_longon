// src/pages/PrivateRoute.tsx
import type { ReactNode } from "react"; // ✅ ใช้ import type

interface Props {
  children: ReactNode;
}

export default function PrivateRoute({ children }: Props) {
  // ชั่วคราว: ไม่ตรวจสอบ login
  return <>{children}</>;
}
