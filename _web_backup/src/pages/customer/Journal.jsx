import React, { useState } from 'react';
import { Plus, Calendar, Smile, Frown, Meh, Search, Filter, ChevronRight, Edit2, BookOpen } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const Journal = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // Mock Journal Data
    const [entries, setEntries] = useState([
        {
            id: 1,
            date: '2023-06-15',
            time: '09:30 AM',
            mood: 'happy',
            title: 'Feeling energetic today',
            content: 'Woke up feeling great after a good night\'s sleep. The new medication seems to be working well. Took a 30-minute walk in the park.',
            tags: ['Exercise', 'New Meds', 'Sleep'],
            intensity: 8
        },
        {
            id: 2,
            date: '2023-06-14',
            time: '08:00 PM',
            mood: 'neutral',
            title: 'Mild headache in the evening',
            content: 'Had a slight headache after dinner. Drank some water and rested for a bit. It went away after an hour.',
            tags: ['Symptom', 'Headache'],
            intensity: 5
        },
        {
            id: 3,
            date: '2023-06-12',
            time: '10:15 AM',
            mood: 'sad',
            title: 'Feeling a bit low',
            content: 'Missed my morning walk due to rain. Feeling a bit lethargic and down today.',
            tags: ['Mood', 'Weather'],
            intensity: 3
        }
    ]);

    const getMoodIcon = (mood) => {
        switch (mood) {
            case 'happy': return <Smile className="w-6 h-6 text-green-500" />;
            case 'sad': return <Frown className="w-6 h-6 text-red-500" />;
            default: return <Meh className="w-6 h-6 text-yellow-500" />;
        }
    };

    const filteredEntries = entries.filter(entry =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6 pb-24">
            {/* Header */}
            <div className="flex flex-col space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">Health Journal</h1>
                <p className="text-gray-500 text-sm">Record your symptoms, mood, and daily activities</p>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search entries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    />
                </div>
                <button className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-600 hover:bg-gray-50">
                    <Filter className="w-5 h-5" />
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-none">
                    <div className="flex flex-col h-full justify-between">
                        <div className="p-2 bg-white/20 w-fit rounded-lg mb-2">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold">{entries.length}</p>
                            <p className="text-purple-100 text-xs">Total Entries</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-pink-500 to-rose-500 text-white border-none">
                    <div className="flex flex-col h-full justify-between">
                        <div className="p-2 bg-white/20 w-fit rounded-lg mb-2">
                            <Smile className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold">Good</p>
                            <p className="text-pink-100 text-xs">Avg Mood This Week</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Entries List */}
            <div className="space-y-4">
                {filteredEntries.map((entry) => (
                    <Card key={entry.id} className="p-0 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-4 border-b border-gray-50 flex justify-between items-start">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gray-50 rounded-full">
                                    {getMoodIcon(entry.mood)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{entry.title}</h3>
                                    <div className="flex items-center text-xs text-gray-500 space-x-2">
                                        <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {entry.date}</span>
                                        <span>•</span>
                                        <span>{entry.time}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4">
                            <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                                {entry.content}
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {entry.tags.map((tag, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-50 px-4 py-3 flex justify-between items-center text-xs">
                            <span className="text-gray-500 font-medium">Intensity: {entry.intensity}/10</span>
                            <button className="text-blue-600 font-semibold flex items-center hover:text-blue-700">
                                Read More <ChevronRight className="w-3 h-3 ml-1" />
                            </button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* FAB */}
            <button className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors z-20">
                <Edit2 className="w-6 h-6" />
            </button>
        </div>
    );
};

export default Journal;
