import React from 'react';
import { Heart, Bell, Search, User, LogOut, Settings, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Badge from './Badge';

const Navbar = ({ title, showUserMenu = true, showNotifications = true, onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 md:space-x-4">
          {/* Hamburger Menu - Visible on Mobile */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-br from-sky-400 to-teal-500 rounded-xl hidden md:block">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 hidden md:block">CareConnect</h1>
          </div>
          {title && (
            <div className="h-6 w-px bg-gray-300 hidden md:block"></div>
          )}
          {title && (
            <h2 className="text-lg font-semibold text-gray-700 truncate max-w-[150px] md:max-w-none">{title}</h2>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          {/* Notifications */}
          {showNotifications && (
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <Badge
                variant="error"
                size="xs"
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center p-0"
              >
                3
              </Badge>
            </button>
          )}

          {/* User Menu */}
          {showUserMenu && user && (
            <div className="relative group">
              <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-2">
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <div className="border-t border-gray-200 my-2"></div>
                  <button
                    onClick={logout}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
