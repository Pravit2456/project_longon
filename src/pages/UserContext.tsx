import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";



type UserContextType = {
  userId: number | null;
  setUserId: (id: number | null) => void;
  loading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // เรียก backend ตรวจสอบ session หรือ cookie
    fetch("http://localhost:3000/api/users/me", {
      credentials: "include",
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUserId(data.userId);
        } else {
          setUserId(null);
        }
      })
      .catch(() => setUserId(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div>กำลังโหลดข้อมูลผู้ใช้...</div>;
  }

  return (
    <UserContext.Provider value={{ userId, setUserId, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser ต้องอยู่ใน UserProvider");
  return context;
};
