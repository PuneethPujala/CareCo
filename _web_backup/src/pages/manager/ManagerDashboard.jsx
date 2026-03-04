import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Phone, TrendingUp, AlertTriangle, Activity, BarChart3, Clock, CheckCircle, UserPlus, FileText, Heart } from 'lucide-react';
import { mockPatients, mockCaretakers } from '../../mockData';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

const ManagerDashboard = () => {
  // Calculate KPIs
  const totalPatients = mockPatients.length;
  const activeCaretakers = mockCaretakers.filter(c => c.status !== 'off_duty').length;
  const avgAdherenceRate = Math.round(
    mockPatients.reduce((sum, p) => sum + p.adherenceRate, 0) / mockPatients.length
  );
  const criticalAlerts = 2; // Mock value for critical alerts

  // Mock pending items
  const pendingApplications = 5;
  const pendingMentorRequests = 2;

  const recentActivity = [
    { id: 1, type: 'patient', message: 'New patient John Doe added', time: '2 hours ago', icon: Users },
    { id: 2, type: 'alert', message: 'Critical alert for William Miller resolved', time: '3 hours ago', icon: AlertTriangle },
    { id: 3, type: 'call', message: 'Sarah Johnson completed 10 calls today', time: '4 hours ago', icon: Phone },
    { id: 4, type: 'adherence', message: 'Average adherence rate improved by 3%', time: '5 hours ago', icon: TrendingUp },
  ];

  const topPerformers = mockCaretakers
    .sort((a, b) => b.performanceScore - a.performanceScore)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hover className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-sky-100 rounded-xl">
              <Users className="w-6 h-6 text-sky-600" />
            </div>
            <Badge variant="success" size="sm">+12%</Badge>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{totalPatients}</h3>
          <p className="text-gray-600 text-sm">Total Patients</p>
        </Card>

        <Card hover className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-teal-100 rounded-xl">
              <Phone className="w-6 h-6 text-teal-600" />
            </div>
            <Badge variant="info" size="sm">Active</Badge>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{activeCaretakers}</h3>
          <p className="text-gray-600 text-sm">Active Caretakers</p>
        </Card>

        <Card hover className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <Badge variant="success" size="sm">+5%</Badge>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{avgAdherenceRate}%</h3>
          <p className="text-gray-600 text-sm">Adherence Rate</p>
        </Card>

        <Card hover className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <Badge variant="error" size="sm">Urgent</Badge>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{criticalAlerts}</h3>
          <p className="text-gray-600 text-sm">Critical Alerts</p>
        </Card>
      </div>

      {/* Quick Actions & Pending Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/manager/enroll-patient" className="block">
          <Card hover className="p-6 border-l-4 border-indigo-500 cursor-pointer hover:bg-indigo-50 transition-colors h-full">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <UserPlus className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Enroll New Patient</h3>
                <p className="text-sm text-gray-500">Add patient & assign care</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link to="/manager/applications" className="block">
          <Card hover className="p-6 border-l-4 border-orange-500 cursor-pointer hover:bg-orange-50 transition-colors relative h-full">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Review Applications</h3>
                <p className="text-sm text-gray-500">Caretaker job requests</p>
              </div>
            </div>
            {pendingApplications > 0 && (
              <span className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-sm ring-2 ring-white">
                {pendingApplications}
              </span>
            )}
          </Card>
        </Link>

        <Link to="/manager/mentor-requests" className="block">
          <Card hover className="p-6 border-l-4 border-pink-500 cursor-pointer hover:bg-pink-50 transition-colors relative h-full">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-pink-100 rounded-lg">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Mentor Requests</h3>
                <p className="text-sm text-gray-500">Family access approvals</p>
              </div>
            </div>
            {pendingMentorRequests > 0 && (
              <span className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-sm ring-2 ring-white">
                {pendingMentorRequests}
              </span>
            )}
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <button className="text-sm text-sky-600 hover:text-sky-800 transition-colors">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-white rounded-lg">
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top Performers */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {topPerformers.map((caretaker, index) => (
              <div key={caretaker.id} className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={caretaker.avatar}
                    alt={caretaker.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-900">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{caretaker.name}</p>
                  <p className="text-xs text-gray-500">{caretaker.callsCompletedToday} calls today</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{caretaker.performanceScore}%</p>
                  <p className="text-xs text-gray-500">Score</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Performance Analytics</h2>
        <Link to="/manager/analytics" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
          View Full Report <BarChart3 className="w-4 h-4 ml-2" />
        </Link>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Adherence Trends */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Medication Adherence Trends</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>

          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Adherence trending upward</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">87%</p>
              <p className="text-sm text-gray-500">Current Week Average</p>
            </div>
          </div>
        </Card>

        {/* Call Outcomes */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Call Outcomes Distribution</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>

          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Call success rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">92%</p>
              <p className="text-sm text-gray-500">This Month</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;
