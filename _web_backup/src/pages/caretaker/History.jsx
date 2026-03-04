import React, { useState } from 'react';
import { Phone, Clock, Calendar, CheckCircle, AlertTriangle, Search, Filter } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

// Mock Call History Data (If mockData/calls.js structure is complex, use local mock or adapt)
import { mockCalls } from '../../mockData/calls';

const History = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // Fallback if mockCalls import fails or is empty
    const calls = mockCalls || [
        {
            id: 1,
            patientName: 'John Doe',
            date: '2023-06-15',
            time: '10:00 AM',
            duration: '15 mins',
            status: 'completed',
            notes: 'Patient adherence is good. Reported slight dizziness.',
            type: 'Routine Check'
        },
        {
            id: 2,
            patientName: 'Mary Smith',
            date: '2023-06-14',
            time: '02:30 PM',
            duration: '5 mins',
            status: 'missed',
            notes: 'Patient did not answer. Left voicemail.',
            type: 'Follow-up'
        }
    ];

    const filteredCalls = calls.filter(call =>
        call.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-24">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Call History</h1>
                <p className="text-gray-500 text-sm">Review past interactions and call logs</p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search history..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
            </div>

            {/* History List */}
            <div className="space-y-4">
                {filteredCalls.map((call) => (
                    <Card key={call.id} className="p-4 border-l-4 border-l-blue-500">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-gray-900">{call.patientName}</h3>
                                <p className="text-xs text-gray-500">{call.type}</p>
                            </div>
                            <Badge variant={call.status === 'completed' ? 'success' : 'error'} size="sm">
                                {call.status}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                                {call.date}
                            </div>
                            <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1 text-gray-400" />
                                {call.time} ({call.duration})
                            </div>
                        </div>

                        {call.notes && (
                            <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 italic border border-gray-100">
                                "{call.notes}"
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default History;
