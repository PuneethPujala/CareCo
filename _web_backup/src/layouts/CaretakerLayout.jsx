import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from '../components/common/BottomNav';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../context/AuthContext';

const CaretakerLayout = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-emerald-50">
      {/* Top Navbar */}
      <Navbar
        title="Caretaker Portal"
        showUserMenu={true}
        showNotifications={true}
      />

      {/* Main Content */}
      <main className="pb-32 min-h-screen">
        <div className="p-4">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav role="caretaker" />
    </div>
  );
};

export default CaretakerLayout;
