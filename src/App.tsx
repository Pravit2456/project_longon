import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import Homepage from './pages/Homepage';
import Dashboard from './pages/Dashboard';
import AlertPage from './pages/AlertPage';
import PlotPage from './pages/plotpage';
import Calendartwo from './pages/Calendartwo';
import FertilizerPage from './pages/FertilizerPage';
import Sidebarlayout from './layouts/Sidebarlayout';
import ProviderLayout from './layouts/ProviderLayout'; // ✅ import เพิ่ม
import Settingspage from './pages/Settingpage';
import LoginPage from './pages/LoginPage';
import LoginPage2 from './pages/LoginPage2';
import RegisterPage from './pages/RegisterPage';
import RegisterPage2 from './pages/RegisterPage2'; 
import ServerPage from './pages/SeverPage'; 
import ServiceSetup from './pages/ServerSetup'; 
import CalendarServer from './pages/CalendarServer';  
import ProfilePage from './pages/ProfilePage';        
import ProfileView from './pages/ProfileView';        

import PrivateRoute from './pages/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* หน้าแรก */}
        <Route path="/" element={<LandingPage />} />

        {/* หน้า Public */}
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login2" element={<LoginPage2 />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register2" element={<RegisterPage2 />} />

        {/* Farmer Private Pages (มี Sidebar) */}
        <Route
          element={
            <PrivateRoute>
              <Sidebarlayout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/plot" element={<PlotPage />} />
          <Route path="/calendar" element={<Calendartwo />} />
          <Route path="/fertilizer" element={<FertilizerPage />} />
          <Route path="/alert" element={<AlertPage />} />
          <Route path="/setting" element={<Settingspage />} />
          
        </Route>

        {/* Provider Private Pages (ไม่มี Sidebar) */}
        <Route
          element={
            <PrivateRoute>
              <ProviderLayout /> {/* ✅ ใช้ layout นี้แทน */}
            </PrivateRoute>
          }
        >
          <Route path="/severpage" element={<ServerPage />} />
          <Route path="/calendarserver" element={<CalendarServer />} />
          <Route path="/profileview" element={<ProfileView />} />
          <Route path="/profilepage" element={<ProfilePage />} />
        </Route>

        {/* Setup เฉพาะ */}
        <Route path="/serversetup" element={<ServiceSetup />} />
      </Routes>
    </Router>
  );
}

export default App;
