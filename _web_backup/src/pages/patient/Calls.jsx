import React from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { Phone, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';

const Calls = () => {
  // Mock call history - ONLY basic info (no recordings or detailed notes)
  const callHistory = [
    {
      id: 1,
      date: '2024-02-12',
      time: '09:00 AM',
      caretaker: 'Sarah Johnson',
      duration: '3:45',
      status: 'completed',
      medicationsConfirmed: ['Metformin', 'Lisinopril']
    },
    {
      id: 2,
      date: '2024-02-11',
      time: '09:00 AM',
      caretaker: 'Sarah Johnson',
      duration: '4:20',
      status: 'completed',
      medicationsConfirmed: ['Metformin', 'Lisinopril']
    },
    {
      id: 3,
      date: '2024-02-10',
      time: '09:00 AM',
      caretaker: 'Sarah Johnson',
      duration: '0:00',
      status: 'missed',
      medicationsConfirmed: []
    },
    {
      id: 4,
      date: '2024-02-09',
      time: '09:00 AM',
      caretaker: 'Michael Brown',
      duration: '5:12',
      status: 'completed',
      medicationsConfirmed: ['Metformin', 'Lisinopril']
    },
    {
      id: 5,
      date: '2024-02-08',
      time: '09:00 AM',
      caretaker: 'Sarah Johnson',
      duration: '3:30',
      status: 'completed',
      medicationsConfirmed: ['Metformin', 'Lisinopril']
    }
  ];
  
  const completedThisWeek = callHistory.filter(c => c.status === 'completed').length;
  
  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Call History
        </h1>
        <p className="text-gray-600">Your recent medication reminder calls</p>
      </div>
      
      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">This Week</p>
            <p className="text-3xl font-bold text-gray-900">
              {completedThisWeek}
            </p>
            <p className="text-sm text-green-600">Calls Completed</p>
          </div>
          <div className="text-right">
            <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center">
              <Phone className="w-8 h-8 text-violet-600" />
            </div>
          </div>
        </div>
      </Card>
      
      {/* Call History List */}
      <div className="space-y-4">
        {callHistory.map((call) => (
          <Card key={call.id} className="hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {call.status === 'completed' ? (
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">
                    {new Date(call.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm text-gray-600">{call.time}</p>
                </div>
              </div>
              <Badge variant={call.status === 'completed' ? 'success' : 'error'}>
                {call.status}
              </Badge>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>Caretaker: {call.caretaker}</span>
              </div>
              
              {call.duration !== '0:00' && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Duration: {call.duration}</span>
                </div>
              )}
              
              {call.medicationsConfirmed.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-gray-600 mb-2">Medications Confirmed:</p>
                  <div className="flex flex-wrap gap-2">
                    {call.medicationsConfirmed.map((med, idx) => (
                      <Badge key={idx} variant="success" size="sm">{med}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
      
      {/* Privacy Notice */}
      <Card className="bg-amber-50 border border-amber-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-amber-700 font-bold">!</span>
          </div>
          <div>
            <p className="font-medium text-gray-900 mb-1">About Call Records</p>
            <p className="text-sm text-gray-600">
              Call recordings and detailed notes are available only to your care manager 
              for quality monitoring and study purposes. You can see your call history 
              and medication confirmations here.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Calls;
