import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Clock, CheckCircle, MapPin, Navigation, Calendar, ChevronRight, Star, MoreVertical } from 'lucide-react';
import { mockCaretakers } from '../../mockData';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const Home = () => {
  const { user } = useAuth();
  const [isOnDuty, setIsOnDuty] = useState(true);

  // Get current caretaker data
  const currentCaretaker = mockCaretakers.find(c => c.name === user?.name) || mockCaretakers[0];

  // Mock calls/visits data - structured like "orders"
  const activeVisit = {
    id: '1',
    patientId: '1',
    patientName: 'John Doe',
    patientAvatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random',
    address: '123 Main St, Apt 4B',
    distance: '2.5 km',
    time: '09:00 AM',
    type: 'Routine Checkup',
    status: 'In Progress',
    medications: ['Metformin', 'Lisinopril']
  };

  const upcomingVisits = [
    {
      id: '2',
      patientId: '2',
      patientName: 'Mary Smith',
      patientAvatar: 'https://ui-avatars.com/api/?name=Mary+Smith&background=random',
      address: '456 Oak Ave',
      time: '11:30 AM',
      type: 'Medication',
      status: 'Scheduled'
    },
    {
      id: '3',
      patientId: '4',
      patientName: 'Robert Wilson',
      patientAvatar: 'https://ui-avatars.com/api/?name=Robert+Wilson&background=random',
      address: '789 Pine Ln',
      time: '02:00 PM',
      type: 'Emergency',
      status: 'Urgent'
    },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Top Bar with Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {isOnDuty ? '🟢 Online' : '🔴 Offline'}
          </h1>
          <p className="text-sm text-gray-500">
            {isOnDuty ? 'You are visible to new assignments' : 'Go online to receive tasks'}
          </p>
        </div>
        <button
          onClick={() => setIsOnDuty(!isOnDuty)}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isOnDuty ? 'bg-green-500' : 'bg-gray-200'}`}
        >
          <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isOnDuty ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
      </div>

      {/* Stats Scroll (Story style) */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        <div className="min-w-[140px] p-4 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col items-start gap-2">
          <div className="p-2 bg-white rounded-xl shadow-sm">
            <CheckCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">12</p>
            <p className="text-xs text-blue-700 font-medium">Visits Done</p>
          </div>
        </div>
        <div className="min-w-[140px] p-4 bg-purple-50 rounded-2xl border border-purple-100 flex flex-col items-start gap-2">
          <div className="p-2 bg-white rounded-xl shadow-sm">
            <Star className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">4.9</p>
            <p className="text-xs text-purple-700 font-medium">Rating</p>
          </div>
        </div>
        <div className="min-w-[140px] p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col items-start gap-2">
          <div className="p-2 bg-white rounded-xl shadow-sm">
            <Clock className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">98%</p>
            <p className="text-xs text-emerald-700 font-medium">On-Time</p>
          </div>
        </div>
      </div>

      {/* "Live Order" / Active Visit */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          Current Visit
          <span className="animate-pulse w-2 h-2 bg-red-500 rounded-full"></span>
        </h2>
        <Card className="overflow-hidden border-0 shadow-xl bg-white rounded-3xl relative">
          {/* Map Placeholder */}
          <div className="h-32 bg-gray-100 relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/OpenStreetMap_Logo_2011.svg')] bg-cover bg-center"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center animate-ping absolute"></div>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg relative z-10">
                <Navigation className="w-6 h-6 text-blue-600 fill-current" />
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{activeVisit.patientName}</h3>
                <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" /> {activeVisit.address}
                </p>
              </div>
              <div className="p-2 bg-gray-50 rounded-full">
                <img src={activeVisit.patientAvatar} alt="Avatar" className="w-10 h-10 rounded-full" />
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <Badge variant="warning">{activeVisit.status}</Badge>
              <Badge variant="info">{activeVisit.distance}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-4 shadow-lg shadow-green-200">
                <Navigation className="w-4 h-4 mr-2" />
                Navigate
              </Button>
              <Button variant="outline" className="w-full rounded-xl py-4 border-gray-200">
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Upcoming Visits List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Upcoming Today</h2>
          <Link to="/caretaker/schedule" className="text-sm font-semibold text-blue-600">See All</Link>
        </div>

        <div className="space-y-4">
          {upcomingVisits.map(visit => (
            <div key={visit.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center text-center flex-shrink-0">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">{visit.time.split(' ')[1]}</p>
                  <p className="text-lg font-bold text-gray-900">{visit.time.split(' ')[0]}</p>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">{visit.patientName}</h4>
                <p className="text-xs text-gray-500 mb-1">{visit.type}</p>
                <p className="text-xs text-gray-400 flex items-center truncate">
                  <MapPin className="w-3 h-3 mr-1" /> {visit.address}
                </p>
              </div>
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-400">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
