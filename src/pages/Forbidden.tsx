export default function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-xl shadow text-center">
        <h1 className="text-2xl font-bold mb-2">403 — ไม่มีสิทธิ์เข้าถึง</h1>
        <p className="text-slate-600">บัญชีของคุณไม่มีสิทธิ์เข้าเพจนี้</p>
        <a href="/" className="inline-block mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg">กลับหน้าแรก</a>
      </div>
    </div>
  );
}
