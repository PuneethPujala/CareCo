import React, { useState } from 'react';
import { mockCaretakerApplications } from '../../mockData';
import { Check, X, Clock, FileText, ChevronLeft, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const CaretakerApplications = () => {
    const [applications, setApplications] = useState(mockCaretakerApplications);
    const [filter, setFilter] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');

    const handleStatusChange = (id, newStatus) => {
        setApplications(applications.map(app =>
            app.id === id ? { ...app, status: newStatus } : app
        ));
        // In a real app, this would trigger an API call to create the user account or send rejection email
    };

    const filteredApplications = applications.filter(app => {
        const matchesFilter = filter === 'all' || app.status === filter;
        const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <Link to="/manager/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Caretaker Applications</h1>
                        <p className="text-gray-500">Review and manage job applications</p>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex bg-gray-100 rounded-lg p-1">
                    {['pending', 'approved', 'rejected', 'all'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === status
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search applicants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                    />
                </div>
            </div>

            {/* Applications List */}
            <div className="grid gap-4">
                {filteredApplications.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No applications found</h3>
                        <p className="text-gray-500">Try adjusting your filters or search terms</p>
                    </div>
                ) : (
                    filteredApplications.map((app) => (
                        <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
                            <div className="flex flex-col lg:flex-row justify-between gap-6">
                                {/* Applicant Info */}
                                <div className="flex items-start space-x-4">
                                    <img
                                        src={app.avatar}
                                        alt={app.name}
                                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                                    />
                                    <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <h3 className="text-lg font-bold text-gray-900">{app.name}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize 
                        ${app.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                                    app.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        'bg-red-100 text-red-700'}`}>
                                                {app.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{app.email} • {app.phone}</p>
                                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                                            <span className="flex items-center">
                                                <Clock className="w-4 h-4 mr-1" /> Applied: {app.appliedDate}
                                            </span>
                                            <span>Experience: {app.experience}</span>
                                        </div>
                                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm leading-relaxed max-w-2xl">
                                            "{app.bio}"
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                {app.status === 'pending' && (
                                    <div className="flex lg:flex-col gap-3 justify-end min-w-[140px]">
                                        <button
                                            onClick={() => handleStatusChange(app.id, 'approved')}
                                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                                        >
                                            <Check className="w-4 h-4" />
                                            <span>Approve</span>
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(app.id, 'rejected')}
                                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                            <span>Reject</span>
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

export default CaretakerApplications;
