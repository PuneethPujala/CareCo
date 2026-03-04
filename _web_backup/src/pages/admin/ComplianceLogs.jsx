import React, { useState } from 'react';
import { Search, Filter, Download, Shield, AlertTriangle, FileText, User } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const ComplianceLogs = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const logs = [
        { id: 'LOG-9921', action: 'Patient Record View', actor: 'Dr. Sarah Smith', target: 'John Doe', timestamp: 'Oct 24, 2024 10:30 AM', status: 'Authorized', ip: '192.168.1.4' },
        { id: 'LOG-9922', action: 'Medication Update', actor: 'Dr. Emily Chen', target: 'Mary Johnson', timestamp: 'Oct 24, 2024 10:45 AM', status: 'Authorized', ip: '192.168.1.5' },
        { id: 'LOG-9923', action: 'Failed Login Attempt', actor: 'Unknown', target: 'System', timestamp: 'Oct 24, 2024 11:00 AM', status: 'Denied', ip: '45.22.11.90' },
        { id: 'LOG-9924', action: 'Export Patient Data', actor: 'Admin User', target: 'All Patients', timestamp: 'Oct 24, 2024 11:15 AM', status: 'Authorized', ip: '192.168.1.2' },
        { id: 'LOG-9925', action: 'Role Modification', actor: 'Super Admin', target: 'Staff Member', timestamp: 'Oct 24, 2024 11:30 AM', status: 'Authorized', ip: '192.168.1.1' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="w-6 h-6 text-emerald-600" />
                        Compliance & Audit Logs
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        HIPAA-compliant system activity tracking. All actions are immutable.
                    </p>
                </div>
                <div className="flex space-x-3">
                    <Button variant="outline">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                    <Button>
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            <Card className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search logs by actor, action, or ID..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </Card>

            {/* Logs Table */}
            <Card className="overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Log ID</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Action</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Actor</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Target</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Timestamp</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4 text-sm font-mono text-gray-500">{log.id}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.action}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs">
                                            {log.actor.charAt(0)}
                                        </div>
                                        <span className="text-sm text-gray-700">{log.actor}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{log.target}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{log.timestamp}</td>
                                <td className="px-6 py-4">
                                    <Badge variant={log.status === 'Authorized' ? 'success' : 'error'} size="sm">
                                        {log.status === 'Denied' && <AlertTriangle className="w-3 h-3 mr-1 inline" />}
                                        {log.status}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default ComplianceLogs;
