import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/api/users/register", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role: "farmer" }) // ✅ เพิ่ม role
      });

      if (response.ok) {
        navigate('/login'); // ไปหน้า login ของเกษตรกร
      } else {
        const error = await response.json();
        alert('เกิดข้อผิดพลาด: ' + error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">สมัครสมาชิก (เกษตรกร)</h2>
        <input
          type="text"
          placeholder="ชื่อผู้ใช้"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded"
          required
        />
        <input
          type="email"
          placeholder="อีเมล"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded"
          required
        />
        <input
          type="password"
          placeholder="รหัสผ่าน"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded"
          required
        />
        <button type="submit" className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800">
          สมัครสมาชิก
        </button>
        <p className="text-center text-sm mt-4">
          มีบัญชีแล้ว? <span className="text-green-700 cursor-pointer" onClick={() => navigate('/login')}>เข้าสู่ระบบ</span>
        </p>
      </form>
    </div>
  );
}
