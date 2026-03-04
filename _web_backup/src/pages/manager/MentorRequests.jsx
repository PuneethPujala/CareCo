import React, { useState } from 'react';
import { mockMentorRequests } from '../../mockData';
import { Check, X, Clock, Heart, ChevronLeft, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const MentorRequests = () => {
    const [requests, setRequests] = useState(mockMentorRequests);
    const [filter, setFilter] = useState('pending');

    const handleStatusChange = (id, newStatus) => {
        setRequests(requests.map(req =>
            req.id === id ? { ...req, status: newStatus } : req
        ));
        // Simulate API call and email notification
    };

    const filteredRequests = requests.filter(req => filter === 'all' || req.status === filter);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <Link to="/manager/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mentor Access Requests</h1>
                    <p className="text-gray-500">Manage family member access to patient records</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-2">
                {['pending', 'approved', 'rejected', 'all'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === status
                                ? 'bg-pink-50 text-pink-700 shadow-sm border border-pink-100'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {/* Requests List */}
            <div className="grid gap-4">
                {filteredRequests.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No requests found</h3>
                    </div>
                ) : (
                    filteredRequests.map((req) => (
                        <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex flex-col lg:flex-row justify-between gap-6">
                                <div>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-lg font-bold text-gray-900">{req.applicantName}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize 
                      ${req.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                                req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    'bg-red-100 text-red-700'}`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">{req.applicantEmail}</p>
                                    <div className="flex items-center text-sm text-gray-500 mt-2">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md mr-3">
                                            Requesting Access To: <strong>{req.patientName}</strong>
                                        </span>
                                        <span className="flex items-center">
                                            <Clock className="w-3 h-3 mr-1" /> {req.requestDate}
                                        </span>
                                    </div>
                                </div>

                                {req.status === 'pending' && (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleStatusChange(req.id, 'approved')}
                                            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                                        >
                                            <Check className="w-4 h-4" />
                                            <span>Approve Access</span>
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(req.id, 'rejected')}
                                            className="flex items-center space-x-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                            <span>Deny</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MentorRequests;
