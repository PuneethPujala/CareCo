import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { Calendar, Phone, Pill, Clock, Heart, Activity, Flame, Check } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  // Mock data for patient
  const todaysMedications = [
    { name: 'Metformin', time: '08:00 AM', taken: true },
    { name: 'Lisinopril', time: '08:00 AM', taken: true },
    { name: 'Aspirin', time: '12:00 PM', taken: false },
    { name: 'Vitamin D', time: '06:00 PM', taken: false },
  ];

  const upcomingCalls = [
    { time: '06:00 PM', type: 'Evening Check-in', caretaker: 'Sarah Johnson' }
  ];

  const adherenceRate = Math.round((todaysMedications.filter(m => m.taken).length / todaysMedications.length) * 100);
  const streakDays = 12;

  return (
    <div className="min-h-screen p-4 space-y-6 pb-24">
      {/* Header with Fire Streak */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={user?.avatar || 'https://ui-avatars.com/api/?name=User&background=random'}
              alt="Profile"
              className="w-12 h-12 rounded-full border-2 border-white shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Hi, {user?.name?.split(' ')[0] || 'Friend'}!</h1>
            <p className="text-sm text-gray-500">Let's stay healthy today</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 bg-orange-100 px-3 py-1.5 rounded-full border border-orange-200">
          <Flame className="w-5 h-5 text-orange-500 fill-current animate-pulse" />
          <span className="font-bold text-orange-700">{streakDays}</span>
        </div>
      </div>

      {/* Main Focus Card (Medication) */}
      <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 transform translate-x-1/2 -translate-y-1/2">
          <div className="w-32 h-32 bg-indigo-500 rounded-full opacity-50"></div>
        </div>

        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-1">2 meds left</h2>
          <p className="text-indigo-200 mb-6">Keep your streak alive!</p>

          <div className="w-full bg-indigo-900/30 rounded-full h-4 mb-4 backdrop-blur-sm">
            <div className="bg-white h-4 rounded-full shadow-sm transition-all duration-500" style={{ width: `${adherenceRate}%` }}></div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex items-center justify-between border border-white/10">
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded-lg p-2">
                <Pill className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="font-bold">Aspirin</p>
                <p className="text-sm text-indigo-200">12:00 PM • With Food</p>
              </div>
            </div>
            <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold shadow-sm active:scale-95 transition-transform">
              Take
            </button>
          </div>
        </div>
      </div>

      {/* "Reorder" style Grid */}
      <h3 className="font-bold text-gray-900 text-lg">My Health</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-2 active:scale-95 transition-transform cursor-pointer">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
            <Heart className="w-7 h-7 fill-current" />
          </div>
          <span className="font-bold text-gray-800">Log Vitals</span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-2 active:scale-95 transition-transform cursor-pointer">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
            <Activity className="w-7 h-7" />
          </div>
          <span className="font-bold text-gray-800">Check Mood</span>
        </div>
      </div>

      {/* Upcoming Events List */}
      <h3 className="font-bold text-gray-900 text-lg">Up Next</h3>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {upcomingCalls.map((call, idx) => (
          <div key={idx} className="p-4 flex items-center space-x-4 border-b border-gray-50 last:border-0 hover:bg-gray-50">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <Phone className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">{call.type}</p>
              <p className="text-sm text-gray-500">with {call.caretaker}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900">{call.time}</p>
            </div>
          </div>
        ))}
        <div className="p-4 flex items-center space-x-4 hover:bg-gray-50">
          <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
            <Pill className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900">Vitamin D</p>
            <p className="text-sm text-gray-500">Before Bed</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900">06:00 PM</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
