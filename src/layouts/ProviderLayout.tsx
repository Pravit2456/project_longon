import { Outlet } from "react-router-dom";

type ProviderLayoutProps = {
  children?: React.ReactNode; // ✅ ทำให้ children เป็น optional
};

export default function ProviderLayout({ children }: ProviderLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-6">
        {/* ถ้ามี children จาก props ใช้ children ถ้าไม่มีก็ใช้ <Outlet /> */}
        {children || <Outlet />}
      </main>
    </div>
  );
}
