import React, { useState } from 'react';
import { Search, Filter, Phone, Mail, MoreVertical, Star, UserCheck, UserX, Clock, MapPin } from 'lucide-react';
import { mockCaretakers } from '../../mockData/caretakers';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const Caretakers = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredCaretakers = mockCaretakers.filter(caretaker => {
        const matchesSearch = caretaker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            caretaker.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || caretaker.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'available': return <Badge variant="success">Available</Badge>;
            case 'on_call': return <Badge variant="warning">On Call</Badge>;
            case 'off_duty': return <Badge variant="neutral">Off Duty</Badge>;
            default: return <Badge variant="neutral">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Caretakers Team</h1>
                    <p className="text-gray-500 text-sm">Manage caretaker assignments and performance</p>
                </div>
                <Button>
                    Add New Caretaker
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search caretakers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'available', 'on_call', 'off_duty'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${statusFilter === status
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {status.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCaretakers.map((caretaker) => (
                    <Card key={caretaker.id} className="hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src={caretaker.avatar}
                                    alt={caretaker.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <h3 className="font-bold text-gray-900">{caretaker.name}</h3>
                                    <div className="flex items-center text-xs text-gray-500 gap-1">
                                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                        <span>{caretaker.performanceScore}% Score</span>
                                    </div>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 mb-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Status</span>
                                {getStatusBadge(caretaker.status)}
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Assigned Patients</span>
                                <span className="font-medium text-gray-900">{caretaker.assignedPatients}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Today's Calls</span>
                                <span className="font-medium text-gray-900">{caretaker.callsCompletedToday}/{caretaker.callsScheduledToday}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                            <Button variant="outline" size="sm" className="flex-1">
                                <Mail className="w-4 h-4 mr-2" />
                                Email
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                                <Phone className="w-4 h-4 mr-2" />
                                Call
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Caretakers;
