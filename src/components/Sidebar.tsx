import { useNavigate, useLocation } from 'react-router-dom';
import { Globe2, Leaf, Calendar, Bell, Settings } from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/dashboard', label: 'แดชบอร์ด', icon: <Globe2 size={18} /> },
    { path: '/plot', label: 'แปลงของฉัน', icon: <Leaf size={18} /> },
    { path: '/calendar', label: 'ปฏิทินกิจกรรม', icon: <Calendar size={18} /> },
    { path: '/fertilizer', label: 'คำณวนปุ๋ย', icon: <Bell size={18} /> },
    { path: '/alert', label: 'แจ้งเตือน', icon: <Bell size={18} /> },
    { path: '/setting', label: 'ตั้งค่า', icon: <Settings size={18} /> },
  ];

  return (
    <aside
   className="w-64 text-white flex flex-col justify-between rounded-r-xl"
     style={{
    background: 'linear-gradient(180deg, #2D5D3B 0%, #3F7E54 40%, #5D9770 100%)'
      }}
    >

      <div>
        <div className="flex items-center gap-2 p-6 cursor-pointer hover:opacity-80"
             onClick={() => navigate('Homepage')}>
          <img
            src="images/logo.png"
            alt="DSS ลำไย"
            className="h-10 w-10 object-cover rounded-full"
          />
          <span className="text-xl font-sans">Smartsensor longan</span>
        </div>

        <nav className="flex flex-col gap-2 px-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`flex items-center gap-3 text-left py-2 px-4 rounded-xl font-sans text-sm transition ${
                isActive(item.path)
                  ? 'bg-[#4F8968] text-white'
                  : 'hover:bg-[#4F8968]/80'
              }`}
              onClick={() => navigate(item.path)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-[#25573F] p-4 text-sm rounded-tr-xl">
        <div className="mb-1 font-sans">สมชาย ลำไย</div>
        <div className="text-xs">เกษตรกร อำเภอวังชิ้น</div>
      </div>
    </aside>
  );
}