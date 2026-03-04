import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrganization } from '../../context/OrganizationContext';
import { Building2, Users, Activity, Settings, BarChart, Plus, Search, CheckCircle } from 'lucide-react';

const SuperAdminDashboard = () => {
    const { user, logout } = useAuth();
    const { organizations, addOrganization } = useOrganization();
    const [showAddOrg, setShowAddOrg] = useState(false);
    const [newOrgName, setNewOrgName] = useState('');

    // Mock Platform Stats
    const platformStats = [
        { label: 'Total Organizations', value: organizations.length, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Total Users', value: '12,543', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: 'Active Patients', value: '8,234', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { label: 'System Health', value: '99.9%', icon: CheckCircle, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    ];

    const handleAddOrg = (e) => {
        e.preventDefault();
        if (newOrgName.trim()) {
            addOrganization({
                name: newOrgName,
                type: 'clinic',
                subscription: 'professional',
                doctors_count: 0,
                patients_count: 0
            });
            setNewOrgName('');
            setShowAddOrg(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 text-white hidden md:block">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        CarePlatform
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Super Admin Console</p>
                </div>
                <nav className="mt-6">
                    <div className="px-4 py-3 bg-slate-800 border-l-4 border-blue-500 cursor-pointer">
                        <div className="flex items-center space-x-3">
                            <BarChart className="w-5 h-5" />
                            <span>Overview</span>
                        </div>
                    </div>
                    <div className="px-4 py-3 hover:bg-slate-800 cursor-pointer transition-colors text-slate-300">
                        <div className="flex items-center space-x-3">
                            <Building2 className="w-5 h-5" />
                            <span>Organizations</span>
                        </div>
                    </div>
                    <div className="px-4 py-3 hover:bg-slate-800 cursor-pointer transition-colors text-slate-300">
                        <div className="flex items-center space-x-3">
                            <Settings className="w-5 h-5" />
                            <span>System Settings</span>
                        </div>
                    </div>
                </nav>
                <div className="absolute bottom-0 w-64 p-4">
                    <button
                        onClick={logout}
                        className="w-full py-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                {/* Header */}
                <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Platform Overview</h2>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                                <Users className="w-4 h-4 text-slate-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                        </div>
                    </div>
                </header>

                <main className="p-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {platformStats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-lg ${stat.bg}`}>
                                            <Icon className={`w-6 h-6 ${stat.color}`} />
                                        </div>
                                        <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                                    </div>
                                    <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
                                </div>
                            );
                        })}
                    </div>

                    {/* Organizations Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">Organizations List</h3>
                            <button
                                onClick={() => setShowAddOrg(true)}
                                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>New Organization</span>
                            </button>
                        </div>

                        {showAddOrg && (
                            <div className="p-6 bg-blue-50 border-b border-blue-100">
                                <form onSubmit={handleAddOrg} className="flex gap-4">
                                    <input
                                        type="text"
                                        placeholder="Organization Name"
                                        value={newOrgName}
                                        onChange={(e) => setNewOrgName(e.target.value)}
                                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        autoFocus
                                    />
                                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                        Add
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddOrg(false)}
                                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                </form>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Organization</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Patients</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {organizations.map((org) => (
                                        <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                                        <Building2 className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <span className="font-medium text-gray-900">{org.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600 uppercase">
                                                    {org.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{org.patients_count}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-600">
                                                    {org.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Manage</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
