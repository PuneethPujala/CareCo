import React, { useState } from 'react';
import { Search, Phone, MapPin, Clock, MoreVertical, FileText, ChevronRight, Filter } from 'lucide-react';
import { mockPatients } from '../../mockData/patients';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Link } from 'react-router-dom';

const Patients = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // In a real app, we would filter by the logged-in caretaker's ID
    // For this mock, we'll show all patients or filter by a specific name if needed
    // const caretakerName = 'Sarah Johnson'; 
    // const myPatients = mockPatients.filter(p => p.assignedCaretaker === caretakerName);

    // Showing all for demo purposes unless user wants specific filtering
    const myPatients = mockPatients;

    const filteredPatients = myPatients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
                    <p className="text-gray-500 text-sm">{filteredPatients.length} active assignments</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="rounded-full w-10 h-10 p-0 flex items-center justify-center">
                        <Filter className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
            </div>

            {/* Patients List */}
            <div className="space-y-4">
                {filteredPatients.map((patient) => (
                    <Link to={`/caretaker/patients/${patient.id}`} key={patient.id} className="block">
                        <Card className="p-4 active:scale-[0.99] transition-transform">
                            <div className="flex items-start gap-4">
                                <img
                                    src={patient.avatar || `https://ui-avatars.com/api/?name=${patient.name}`}
                                    alt={patient.name}
                                    className="w-16 h-16 rounded-xl object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-bold text-gray-900 truncate">{patient.name}</h3>
                                        <Badge variant={patient.status === 'active' ? 'success' : 'warning'} size="sm">
                                            {patient.status}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center text-sm text-gray-500 mt-1 mb-3">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        <span className="truncate">123 Main St, Apt 4B</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                                            <Clock className="w-3 h-3 mr-1" />
                                            Last visit: {patient.lastCallDate}
                                        </div>
                                        <div className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md font-medium">
                                            {patient.adherenceRate}% Adherence
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-4 pt-4 border-t border-gray-50">
                                <Button
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                    size="sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        // Handle call logic
                                    }}
                                >
                                    <Phone className="w-4 h-4 mr-2" />
                                    Call
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    size="sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        // Handle history/notes logic
                                    }}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Notes
                                </Button>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Patients;
