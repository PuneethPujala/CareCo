import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  FileText,
  MessageSquare,
  Settings,
  Calendar,
  MoreHorizontal
} from 'lucide-react';

const BottomNav = ({ role }) => {
  const location = useLocation();

  const caretakerNavItems = [
    { path: '/caretaker/home', icon: Home, label: 'Home' },
    { path: '/caretaker/patients', icon: Users, label: 'Patients' },
    { path: '/caretaker/history', icon: FileText, label: 'History' },
    { path: '/caretaker/profile', icon: Settings, label: 'Profile' },
  ];

  const customerNavItems = [
    { path: '/customer/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/customer/medications', icon: Calendar, label: 'Meds' },
    { path: '/customer/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/customer/journal', icon: FileText, label: 'Journal' },
    { path: '/customer/more', icon: MoreHorizontal, label: 'More' },
  ];

  const navItems = role === 'caretaker' ? caretakerNavItems : customerNavItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-gray-100 z-50">
      <div className="flex justify-around items-center py-2 safe-area-bottom">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const isHome = item.label === 'Home' || item.label === 'Dashboard';

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center space-y-1 px-4 py-1.5 rounded-xl transition-all duration-200 min-w-[60px] ${isActive
                ? isHome
                  ? 'bg-gradient-to-r from-sky-500 to-teal-500 text-white shadow-lg transform scale-105'
                  : 'bg-sky-50 text-sky-600'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? (isHome ? 'text-white' : 'text-sky-600') : 'text-gray-400'}`} />
              <span className={`text-[10px] font-medium ${isActive ? (isHome ? 'text-white' : 'text-sky-600') : 'text-gray-400'}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
