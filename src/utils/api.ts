// src/utils/api.ts
const BASE_URL = "http://localhost:3000";

export async function api(path: string, init: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include", // ⭐ สำคัญสำหรับ cookie
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    ...init,
  });
  // พยายามอ่าน body เป็น JSON ถ้าเป็นไปได้ (กันเคส 204)
  let data: any = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    const msg = data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const getMe = () => api("/api/users/me", { method: "GET" });
export const postLogin = (payload: any) =>
  api("/api/users/login", { method: "POST", body: JSON.stringify(payload) });
export const postLogout = () => api("/api/users/logout", { method: "POST" });
