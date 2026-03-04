import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Phone,
  Bell,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  Heart,
  Calendar,
  FileText,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ role, isOpen, onClose }) => {
  const { logout } = useAuth();
  const location = useLocation();

  const managerNavItems = [
    { path: '/manager/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/manager/patients', icon: Users, label: 'Patients' },
    { path: '/manager/caretakers', icon: Phone, label: 'Caretakers' },
    { path: '/manager/alerts', icon: Bell, label: 'Alerts' },
    { path: '/manager/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/manager/communications', icon: MessageSquare, label: 'Communications' },
    { path: '/manager/settings', icon: Settings, label: 'Settings' },
  ];

  const caretakerNavItems = [
    { path: '/caretaker/home', icon: LayoutDashboard, label: 'Home' },
    { path: '/caretaker/patients', icon: Users, label: 'Patients' },
    { path: '/caretaker/history', icon: FileText, label: 'History' },
    { path: '/caretaker/profile', icon: Settings, label: 'Profile' },
  ];

  const customerNavItems = [
    { path: '/customer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/customer/medications', icon: Calendar, label: 'Medications' },
    { path: '/customer/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/customer/journal', icon: FileText, label: 'Journal' },
    { path: '/customer/more', icon: Settings, label: 'More' },
  ];

  const navItems = role === 'manager' ? managerNavItems :
    role === 'caretaker' ? caretakerNavItems :
      customerNavItems;

  return (
    <>
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 h-full flex flex-col transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-sky-400 to-teal-500 rounded-xl">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-800">CareConnect</h1>
              <p className="text-xs text-gray-500 capitalize">{role} Portal</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-700">
            <LogOut className="w-5 h-5 rotate-180" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        onClose();
                      }
                    }}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                        ? 'bg-sky-500 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
