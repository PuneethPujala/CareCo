import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Plus, 
  Bell, 
  User
} from 'lucide-react';

const BottomNavBar = ({ role }) => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: role === 'caretaker' ? '/caretaker/home' : '/customer/dashboard' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Plus, label: 'Actions', path: '/actions', isCenter: true },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg bg-white rounded-full shadow-lg flex justify-around items-center h-16 px-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        const isCenter = item.isCenter;
        
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-2 rounded-full text-gray-400 transition-all duration-300
                ${isCenter ? '-translate-y-6 w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg' : 'w-12 h-12'}
                ${isActive && !isCenter ? 'text-purple-600 bg-purple-50/50' : ''}
                ${isActive && isCenter ? 'scale-110' : ''}
                hover:text-purple-600 hover:bg-purple-50/50`
            }
          >
            <Icon className={`w-6 h-6 ${isCenter ? '' : 'mb-1'}`} strokeWidth={isCenter ? 2.5 : 2} />
            {!isCenter && <span className="text-xs">{item.label}</span>}
          </NavLink>
        );
      })}
    </div>
  );
};

export default BottomNavBar;
