import React, { useState } from 'react';
import { Pill, Clock, Calendar, CheckCircle, AlertCircle, Info, ChevronRight, Filter } from 'lucide-react';
import { mockMedications } from '../../mockData/medications';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const Medications = () => {
    const [filter, setFilter] = useState('all'); // all, morning, afternoon, evening
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Filter medications based on time of day
    const getFilteredMedications = () => {
        if (filter === 'all') return mockMedications;

        return mockMedications.filter(med => {
            const hour = parseInt(med.time.split(':')[0]);
            const isPM = med.time.includes('PM');
            const time24 = isPM && hour !== 12 ? hour + 12 : (hour === 12 && !isPM ? 0 : hour);

            if (filter === 'morning') return time24 >= 5 && time24 < 12;
            if (filter === 'afternoon') return time24 >= 12 && time24 < 17;
            if (filter === 'evening') return time24 >= 17 || time24 < 5;
            return true;
        });
    };

    const filteredMeds = getFilteredMedications();

    // Calculate daily progress
    const totalMeds = mockMedications.length;
    const takenMeds = mockMedications.filter(m => m.taken).length;
    const progress = Math.round((takenMeds / totalMeds) * 100);

    return (
        <div className="space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Medications</h1>
                    <p className="text-gray-500 text-sm">Track and manage your daily intake</p>
                </div>
                <Button variant="outline" size="sm" className="hidden sm:flex">
                    <Calendar className="w-4 h-4 mr-2" />
                    Full Schedule
                </Button>
            </div>

            {/* Progress Card */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-white/90">Daily Progress</h2>
                        <p className="text-blue-100 text-sm">You've taken {takenMeds} of {totalMeds} meds today</p>
                    </div>
                    <div className="w-12 h-12 relative flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="transparent"
                                className="text-blue-400/30"
                            />
                            <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="transparent"
                                strokeDasharray={126}
                                strokeDashoffset={126 - (126 * progress) / 100}
                                className="text-white transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <span className="absolute text-xs font-bold">{progress}%</span>
                    </div>
                </div>
            </div>

            {/* Date & Filter */}
            <div className="sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10 py-2 space-y-4">
                {/* Days Scroll */}
                <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                    {[-2, -1, 0, 1, 2, 3, 4].map((offset) => {
                        const date = new Date();
                        date.setDate(date.getDate() + offset);
                        const isSelected = offset === 0;

                        return (
                            <button
                                key={offset}
                                className={`flex flex-col items-center justify-center min-w-[60px] p-3 rounded-xl transition-all ${isSelected
                                        ? 'bg-blue-600 text-white shadow-md transform scale-105'
                                        : 'bg-white text-gray-500 border border-gray-100'
                                    }`}
                            >
                                <span className="text-xs font-medium uppercase">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                <span className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-900'}`}>{date.getDate()}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Time Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {[
                        { id: 'all', label: 'All Day' },
                        { id: 'morning', label: 'Morning' },
                        { id: 'afternoon', label: 'Afternoon' },
                        { id: 'evening', label: 'Evening' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setFilter(item.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === item.id
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Medications List */}
            <div className="space-y-4">
                {filteredMeds.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No medications scheduled for this time.</p>
                    </div>
                ) : (
                    filteredMeds.map((med) => (
                        <Card key={med.id} className="p-4 border-l-4 border-l-blue-500">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4">
                                    <div className="p-3 bg-blue-50 rounded-xl">
                                        <Pill className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{med.name}</h3>
                                        <p className="text-sm text-gray-500">{med.dosage} • {med.frequency}</p>

                                        <div className="flex items-center mt-2 space-x-3">
                                            <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {med.time}
                                            </div>
                                            {med.withFood && (
                                                <div className="flex items-center text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                                                    <Info className="w-3 h-3 mr-1" />
                                                    With Food
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${med.taken
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-gray-100 text-gray-400 hover:bg-blue-100 hover:text-blue-600'
                                        }`}
                                >
                                    <CheckCircle className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Instructions Accordion (Simplified) */}
                            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                <p className="text-xs text-gray-500">
                                    <span className="font-medium text-gray-700">Instructions:</span> {med.instructions}
                                </p>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Add New Button (Floating) */}
            <button className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors z-20">
                <Plus className="w-6 h-6" />
            </button>
        </div>
    );
};

// Helper for the floating button
import { Plus } from 'lucide-react';

export default Medications;
