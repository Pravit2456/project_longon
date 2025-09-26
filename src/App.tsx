import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import Homepage from './pages/Homepage';
import Dashboard from './pages/Dashboard';
import AlertPage from './pages/AlertPage';
import PlotPage from './pages/plotpage';
import Calendartwo from './pages/Calendarttwo';
import FertilizerPage from './pages/FertilizerPage';

import Sidebarlayout from './layouts/Sidebarlayout';
import ProviderLayout from './layouts/ProviderLayout'; 

import Settingspage from './pages/Settingpage';
import LoginPage from './pages/LoginPage';
import LoginPage2 from './pages/LoginPage2';
import RegisterPage from './pages/RegisterPage';
import RegisterPage2 from './pages/RegisterPage2'; 

import ServerPage from './pages/ServerPage'; 
import ServiceSetup from './pages/ServerSetup'; 
import CalendarServer from './pages/Calendarserver';  
import ProfilePage from './pages/ProfilePage';        
import ProfileView from './pages/ProfileView'; 
import BookingForm from './pages/BookingForm'; 

import FindProviders from './pages/FindProviders';
import ProviderDetail from './pages/ProviderDetail';       
import AddNewPlot from './pages/AddNewPlot';
import PrivateRoute from './pages/PrivateRoute';

// ✅ import หน้าใหม่
import BookingPage from './pages/BookingForm';
import SchedulePage from './pages/SchedulePage';
import ProviderSlotPage from './pages/ProviderSlotPage';
import ProfileEdit from './pages/ProfileEdit';   
import AdminDashboard from './pages/AdminDashboard';   // ✅ เพิ่ม import หน้า Admin

function App() {
  return (
    <div id="app-root" className="min-h-screen font-sans">
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
            <Route path="/findproviders" element={<FindProviders />} />
            <Route path="/booking" element={<BookingForm />} />

            {/* ✅ เพิ่ม path ใหม่ของเกษตรกร */}
            <Route path="/booking-page" element={<BookingPage />} />
            <Route path="/schedule-page" element={<SchedulePage />} />
            <Route path="/profileedit" element={<ProfileEdit />} />
          </Route>

          {/* Provider Private Pages (ไม่มี Sidebar) */}
          <Route
            element={
              <PrivateRoute>
                <ProviderLayout />
              </PrivateRoute>
            }
          >
            <Route path="/severpage" element={<ServerPage />} />
            <Route path="/calendarserver" element={<CalendarServer />} />
            <Route path="/profileview" element={<ProfileView />} />
            <Route path="/profilepage" element={<ProfilePage />} />
            <Route path="/providerdetail" element={<ProviderDetail />} />
            <Route path="/addnewplot" element={<AddNewPlot />} />

            {/* ✅ Route ใหม่สำหรับผู้ให้บริการ */}
            <Route path="/provider-slot" element={<ProviderSlotPage />} />
          </Route>

          {/* Admin Private Page */}
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          {/* Setup เฉพาะ */}
          <Route path="/serversetup" element={<ServiceSetup />} />
          <Route path="/serverpage" element={<ServerPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
