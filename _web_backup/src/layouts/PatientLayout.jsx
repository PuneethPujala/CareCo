import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from '../components/common/BottomNav';
import { Home, Phone, Pill, User } from 'lucide-react';

const PatientLayout = () => {
  const navItems = [
    { path: '/patient/dashboard', icon: Home, label: 'Home' },
    { path: '/patient/calls', icon: Phone, label: 'Calls' },
    { path: '/patient/medications', icon: Pill, label: 'Medications' },
    { path: '/patient/profile', icon: User, label: 'Profile' },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 pb-20">
      <Outlet />
      <BottomNav items={navItems} />
    </div>
  );
};

export default PatientLayout;
