import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Clock, Filter, Search, User } from 'lucide-react';
import { mockAlerts } from '../../mockData/alerts';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const Alerts = () => {
    const [filter, setFilter] = useState('all'); // all, unresolved, resolved
    const [priorityFilter, setPriorityFilter] = useState('all'); // all, high, medium, low

    const filteredAlerts = mockAlerts.filter(alert => {
        const matchesStatus = filter === 'all' || alert.status === filter;
        const matchesPriority = priorityFilter === 'all' || alert.priority === priorityFilter;
        return matchesStatus && matchesPriority;
    });

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-50 border-red-100';
            case 'medium': return 'text-orange-600 bg-orange-50 border-orange-100';
            case 'low': return 'text-blue-600 bg-blue-50 border-blue-100';
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Alerts Center</h1>
                    <p className="text-gray-500 text-sm">Monitor and resolve critical patient alerts</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setFilter('unresolved')}>
                        Unresolved Only
                    </Button>
                    <Button variant="outline" onClick={() => setFilter('all')}>
                        Show All
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 pb-2">
                {['all', 'high', 'medium', 'low'].map(priority => (
                    <button
                        key={priority}
                        onClick={() => setPriorityFilter(priority)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${priorityFilter === priority
                                ? 'bg-gray-800 text-white'
                                : 'bg-white border border-gray-200 text-gray-600'
                            }`}
                    >
                        {priority} Priority
                    </button>
                ))}
            </div>

            {/* Alerts List */}
            <div className="space-y-4">
                {filteredAlerts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">All Clear!</h3>
                        <p className="text-gray-500">No alerts found matching your criteria.</p>
                    </div>
                ) : (
                    filteredAlerts.map((alert) => (
                        <Card key={alert.id} className={`border-l-4 ${alert.priority === 'high' ? 'border-l-red-500' :
                                alert.priority === 'medium' ? 'border-l-orange-500' : 'border-l-blue-500'
                            }`}>
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${getPriorityColor(alert.priority)}`}>
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-gray-900">{alert.type.replace('_', ' ').toUpperCase()}</h3>
                                            <Badge variant={alert.status === 'resolved' ? 'success' : 'error'} size="sm">
                                                {alert.status}
                                            </Badge>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-3">
                                            {alert.message}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                            <div className="flex items-center">
                                                <User className="w-3 h-3 mr-1" />
                                                Patient: <span className="font-medium text-gray-700 ml-1">{alert.patientName}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <User className="w-3 h-3 mr-1" />
                                                Caretaker: <span className="font-medium text-gray-700 ml-1">{alert.caretaker}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {new Date(alert.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {alert.status === 'unresolved' && (
                                        <Button size="sm" className="w-full">
                                            Resolve
                                        </Button>
                                    )}
                                    <Button variant="outline" size="sm" className="w-full">
                                        Details
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default Alerts;
