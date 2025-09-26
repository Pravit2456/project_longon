import { createContext, useState, useContext } from "react";
import type { ReactNode } from "react";
import type { UserProfile } from "./types"; // type ของ UserProfile

interface UserContextType {
  userId: number | null;
  setUserId: (id: number | null) => void;
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  return (
    <UserContext.Provider value={{ userId, setUserId, user, setUser, loading, setLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};
