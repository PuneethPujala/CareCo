import React from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { Pill, Clock, AlertCircle, Phone } from 'lucide-react';

const Medications = () => {
  const medications = [
    { 
      name: 'Metformin', 
      dosage: '500mg', 
      time: '08:00 AM', 
      frequency: 'Daily',
      instructions: 'Take with breakfast',
      sideEffects: 'May cause nausea'
    },
    { 
      name: 'Lisinopril', 
      dosage: '10mg', 
      time: '08:00 AM', 
      frequency: 'Daily',
      instructions: 'Take with food',
      sideEffects: 'May cause dizziness'
    },
    { 
      name: 'Aspirin', 
      dosage: '81mg', 
      time: '12:00 PM', 
      frequency: 'Daily',
      instructions: 'Take with lunch',
      sideEffects: 'May cause stomach upset'
    },
    { 
      name: 'Vitamin D', 
      dosage: '1000IU', 
      time: '06:00 PM', 
      frequency: 'Daily',
      instructions: 'Take with dinner',
      sideEffects: 'Generally well tolerated'
    }
  ];
  
  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          My Medications
        </h1>
        <p className="text-gray-600">Your current medication schedule</p>
      </div>
      
      {/* Medication List */}
      <div className="space-y-4">
        {medications.map((med, idx) => (
          <Card key={idx} className="hover:shadow-lg transition-all duration-300">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Pill className="w-7 h-7 text-violet-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  {med.name}
                </h3>
                <p className="text-gray-600 font-medium">{med.dosage}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600">Time:</span>
                <span className="font-semibold text-gray-900">{med.time}</span>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-600">Frequency:</span>
                <Badge variant="info">{med.frequency}</Badge>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-900 mb-2">Instructions:</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{med.instructions}</p>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Side Effects:</p>
                  <p className="text-sm text-gray-600">{med.sideEffects}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Help Card */}
      <Card className="bg-violet-50 border border-violet-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-2">Need Help?</p>
            <p className="text-sm text-gray-600">
              If you have questions about your medications or need to report side effects, 
              your caretaker will ask during your next scheduled call. You can also contact 
              your patient mentor (family member) anytime.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Medications;
