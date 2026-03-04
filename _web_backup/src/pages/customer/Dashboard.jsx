import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Calendar, TrendingUp, Pill, MessageSquare, Plus, Activity, Clock, CheckCircle, Phone, FileText, MapPin, Video, Info, Star } from 'lucide-react';
import { mockPatients } from '../../mockData';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const Dashboard = () => {
  const { user } = useAuth();
  const patient = mockPatients[0]; // John Doe as example

  // Mock timeline events (Live styling)
  const timeline = [
    { time: '09:00 AM', title: 'Morning Meds Taken', desc: 'Metformin & Lisinopril', type: 'success', icon: Pill },
    { time: '08:30 AM', title: 'Breakfast', desc: 'Oatmeal and Fruit', type: 'default', icon: Clock },
    { time: '08:00 AM', title: 'Vitals Checked', desc: 'BP: 120/80, Pulse: 72', type: 'info', icon: Activity },
    { time: '07:30 AM', title: 'Woke Up', desc: 'Good mood reported', type: 'default', icon: Heart },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Patient Hero / Status Card */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Live Updates
          </span>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <img
              src={patient.avatar || `https://ui-avatars.com/api/?name=${patient.name}`}
              alt={patient.name}
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
            />
            <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full border-2 border-white">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
          <p className="text-gray-500 text-sm mb-6">Last update: 5 mins ago</p>

          {/* Quick Vitals Row */}
          <div className="flex justify-center gap-6 w-full max-w-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">98%</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Adherence</p>
            </div>
            <div className="text-center border-l border-gray-200 pl-6">
              <p className="text-2xl font-bold text-gray-900">120/80</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">BP Level</p>
            </div>
            <div className="text-center border-l border-gray-200 pl-6">
              <p className="text-2xl font-bold text-gray-900">Good</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Mood</p>
            </div>
          </div>
        </div>
      </div>

      {/* "Live Order" Timeline */}
      <div>
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-lg font-bold text-gray-900">Today's Journey</h2>
          <Link to="/customer/history" className="text-blue-600 text-sm font-semibold">View History</Link>
        </div>

        <div className="space-y-6 pl-4 relative">
          {/* Vertical Line */}
          <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-gray-200"></div>

          {timeline.map((event, index) => {
            const Icon = event.icon;
            return (
              <div key={index} className="relative pl-12">
                {/* Timeline Dot */}
                <div className={`absolute left-5 top-1 -translate-x-1/2 w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center z-10 ${event.type === 'success' ? 'bg-green-500 text-white' :
                  event.type === 'info' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                  <Icon className="w-3 h-3" />
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-900">{event.title}</h3>
                    <span className="text-xs text-gray-400 font-medium">{event.time}</span>
                  </div>
                  <p className="text-sm text-gray-600">{event.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Acts Grid */}
      <h2 className="text-lg font-bold text-gray-900 px-2 pt-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-4">
        <button className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-2xl border border-blue-100 active:scale-95 transition-transform">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-blue-600">
            <Video className="w-6 h-6" />
          </div>
          <span className="font-semibold text-gray-900">Video Call</span>
        </button>
        <button className="flex flex-col items-center justify-center p-6 bg-purple-50 rounded-2xl border border-purple-100 active:scale-95 transition-transform">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-purple-600">
            <MessageSquare className="w-6 h-6" />
          </div>
          <span className="font-semibold text-gray-900">Message Team</span>
        </button>
      </div>

      {/* Caretaker Info Card (Driver details style) */}
      <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-100 mt-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Assigned Caretaker</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src="https://ui-avatars.com/api/?name=Sarah+Johnson" alt="Caretaker" className="w-12 h-12 rounded-full" />
            <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white w-4 h-4 rounded-full"></div>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900">Sarah Johnson</h4>
            <div className="flex items-center text-yellow-500 text-xs">
              <Star className="w-3 h-3 fill-current" />
              <Star className="w-3 h-3 fill-current" />
              <Star className="w-3 h-3 fill-current" />
              <Star className="w-3 h-3 fill-current" />
              <span className="text-gray-400 ml-1">(4.9)</span>
            </div>
          </div>
          <button className="p-3 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200">
            <Phone className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
