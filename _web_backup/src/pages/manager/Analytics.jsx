import React from 'react';
import { TrendingUp, Users, Activity, Phone, AlertCircle, BarChart2, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

const Analytics = () => {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
                    <p className="text-gray-500">Performance metrics and patient health trends</p>
                </div>
                <div className="flex space-x-2">
                    <select className="bg-white border rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>Last Quarter</option>
                    </select>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                        Export Report
                    </button>
                </div>
            </div>

            {/* Top Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <Badge variant="success" size="sm" className="bg-green-100 text-green-700">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            12%
                        </Badge>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">842</h3>
                    <p className="text-gray-500 text-sm mt-1">Total Active Patients</p>
                </Card>

                <Card className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 rounded-xl">
                            <Activity className="w-6 h-6 text-emerald-600" />
                        </div>
                        <Badge variant="success" size="sm" className="bg-green-100 text-green-700">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            5.3%
                        </Badge>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">94%</h3>
                    <p className="text-gray-500 text-sm mt-1">Medication Adherence</p>
                </Card>

                <Card className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 rounded-xl">
                            <Phone className="w-6 h-6 text-purple-600" />
                        </div>
                        <Badge variant="neutral" size="sm" className="bg-gray-100 text-gray-600">
                            <ArrowDownRight className="w-3 h-3 mr-1" />
                            2%
                        </Badge>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">45m</h3>
                    <p className="text-gray-500 text-sm mt-1">Avg. Call Duration</p>
                </Card>

                <Card className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-50 rounded-xl">
                            <AlertCircle className="w-6 h-6 text-orange-600" />
                        </div>
                        <Badge variant="error" size="sm" className="bg-red-100 text-red-700">
                            +3 New
                        </Badge>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">12</h3>
                    <p className="text-gray-500 text-sm mt-1">Pending Alerts</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Patient Health Trends */}
                <Card className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900">Patient Adherence Trends</h3>
                        <BarChart2 className="text-gray-400 w-5 h-5" />
                    </div>
                    {/* Mock Chart Visualization */}
                    <div className="h-64 flex items-end justify-between px-4 pb-4 border-b border-gray-100">
                        {[65, 78, 85, 92, 88, 94, 91].map((h, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 group">
                                <div className="relative w-8 bg-blue-100 rounded-t-lg transition-all group-hover:bg-blue-500" style={{ height: `${h}%` }}>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {h}%
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500">Day {i + 1}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Demographics / Distribution */}
                <Card className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900">Risk Level Distribution</h3>
                        <PieChart className="text-gray-400 w-5 h-5" />
                    </div>
                    <div className="flex items-center justify-center h-64">
                        <div className="relative w-48 h-48 rounded-full border-[16px] border-emerald-500 border-l-yellow-500 border-b-red-500 border-r-emerald-500 transform rotate-45">
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="text-3xl font-bold text-gray-900">Total</span>
                                <span className="text-sm text-gray-500">842 Patients</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span className="text-sm text-gray-600">Low Risk (65%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <span className="text-sm text-gray-600">Medium (25%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-sm text-gray-600">High (10%)</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Detailed Table */}
            <Card>
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Caretaker Performance Metrics</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Caretaker</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Patients</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Check-ins</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Adherence Score</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                                            <span className="font-medium text-gray-900">Sarah Johnson</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">12 Active</td>
                                    <td className="px-6 py-4 text-gray-600">145 / 150</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-2 bg-gray-100 rounded-full">
                                                <div className="h-2 bg-green-500 rounded-full" style={{ width: '92%' }}></div>
                                            </div>
                                            <span className="text-sm text-gray-700">92%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="success" size="sm">Top Rated</Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Analytics;
