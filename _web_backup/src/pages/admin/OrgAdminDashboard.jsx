import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrganization } from '../../context/OrganizationContext';
import { Users, FileText, Settings, LogOut, TrendingUp, ShieldCheck, UserPlus } from 'lucide-react';

const OrgAdminDashboard = () => {
    const { user, logout } = useAuth();
    const { currentOrganization } = useOrganization();

    // Mock Org Stats
    const orgStats = [
        { label: 'Total Patients', value: currentOrganization?.patients_count || 1234, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Adherence Rate', value: '89%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { label: 'Compliance', value: 'Passed', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: 'Active Managers', value: '8', icon: Users, color: 'text-orange-600', bg: 'bg-orange-100' },
    ];

    if (!currentOrganization) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Navbar for Org Admin */}
            <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">
                        {currentOrganization.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{currentOrganization.name}</h1>
                        <p className="text-xs text-gray-500">Organization Admin Console</p>
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <button className="text-gray-500 hover:text-gray-900">
                        <Settings className="w-5 h-5" />
                    </button>
                    <div className="border-l pl-6 flex items-center space-x-3">
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                            <button onClick={logout} className="text-xs text-red-600 hover:underline">Sign Out</button>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                            <Users className="w-4 h-4 text-slate-600" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {orgStats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`p-3 rounded-lg ${stat.bg}`}>
                                        <Icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Managers List */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Managers Management</h3>
                                <button className="flex items-center space-x-2 text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 font-medium">
                                    <UserPlus className="w-4 h-4" />
                                    <span>Add Manager</span>
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {[1, 2, 3].map((_, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border">
                                                    <Users className="w-5 h-5 text-gray-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">Dr. Sarah Smith</h4>
                                                    <p className="text-sm text-gray-500">234 Active Patients</p>
                                                </div>
                                            </div>
                                            <button className="text-gray-400 hover:text-blue-600">Edit</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900">Recent Organization Activity</h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-6">
                                    {[1, 2, 3].map((_, i) => (
                                        <div key={i} className="flex space-x-4">
                                            <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                                            <div>
                                                <p className="text-gray-800 text-sm">New patient enrolled by Dr. Smith</p>
                                                <p className="text-xs text-gray-400 mt-1">2 minutes ago</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <Link to="/org-admin/billing" className="block w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium transition-colors">
                                    Generate Billing Report
                                </Link>
                                <Link to="/org-admin/compliance" className="block w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium transition-colors">
                                    Review Compliance Status
                                </Link>
                                <Link to="/org-admin/billing" className="block w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium transition-colors">
                                    Manage Subscriptions
                                </Link>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                            <h3 className="text-lg font-bold mb-2">Pro Plan</h3>
                            <p className="text-indigo-100 text-sm mb-4">Your organization is on the Professional tier.</p>
                            <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                                <div className="bg-white h-2 rounded-full w-3/4"></div>
                            </div>
                            <p className="text-xs text-indigo-200">75% of patient limit used</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OrgAdminDashboard;
