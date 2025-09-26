import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { UserProvider } from './pages/UserContext'; // ✅ import UserProvider
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UserProvider> {/* ✅ ครอบ App ด้วย UserProvider */}
      <App />
    </UserProvider>
  </React.StrictMode>
);
