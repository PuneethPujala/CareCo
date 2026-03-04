import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { User, Phone, Mail, Heart, LogOut, Settings, Shield } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  
  const patientInfo = {
    age: 68,
    allergies: ['Penicillin'],
    emergencyContact: {
      name: 'Jane Doe',
      relation: 'Daughter',
      phone: '555-0123'
    },
    caretaker: 'Sarah Johnson',
    mentor: 'Jane Doe (Daughter)'
  };
  
  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Profile Header */}
      <Card className="text-center hover:shadow-lg transition-all duration-300">
        <img 
          src={user?.avatar || 'https://i.pravatar.cc/150?img=1'}
          alt={user?.name}
          className="w-28 h-28 rounded-full mx-auto mb-4 border-4 border-violet-500 shadow-lg"
        />
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          {user?.name}
        </h2>
        <p className="text-gray-600">{patientInfo.age} years old</p>
      </Card>
      
      {/* Personal Information */}
      <Card className="hover:shadow-lg transition-all duration-300">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-violet-600" />
          Personal Information
        </h3>
        <div className="space-y-4">
          <div className="pb-3 border-b border-gray-100">
            <p className="text-sm text-gray-600 mb-1">Email</p>
            <p className="font-medium text-gray-900">{user?.email}</p>
          </div>
          <div className="pb-3 border-b border-gray-100">
            <p className="text-sm text-gray-600 mb-1">Assigned Caretaker</p>
            <p className="font-medium text-gray-900">{patientInfo.caretaker}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Patient Mentor</p>
            <p className="font-medium text-gray-900">{patientInfo.mentor}</p>
          </div>
        </div>
      </Card>
      
      {/* Emergency Contact */}
      <Card className="hover:shadow-lg transition-all duration-300">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5 text-red-600" />
          Emergency Contact
        </h3>
        <div className="space-y-4">
          <div className="pb-3 border-b border-gray-100">
            <p className="text-sm text-gray-600 mb-1">Name</p>
            <p className="font-medium text-gray-900">{patientInfo.emergencyContact.name}</p>
          </div>
          <div className="pb-3 border-b border-gray-100">
            <p className="text-sm text-gray-600 mb-1">Relationship</p>
            <p className="font-medium text-gray-900">{patientInfo.emergencyContact.relation}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Phone</p>
            <p className="font-medium text-gray-900">{patientInfo.emergencyContact.phone}</p>
          </div>
        </div>
      </Card>
      
      {/* Allergies */}
      <Card className="hover:shadow-lg transition-all duration-300">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-600" />
          Allergies
        </h3>
        {patientInfo.allergies.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {patientInfo.allergies.map((allergy, idx) => (
              <span 
                key={idx}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium border border-red-200"
              >
                {allergy}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No known allergies</p>
        )}
      </Card>
      
      {/* Settings */}
      <Card className="hover:shadow-lg transition-all duration-300">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-600" />
          Settings
        </h3>
        <div className="space-y-2">
          <button className="w-full text-left p-4 hover:bg-violet-50 rounded-xl transition-colors flex items-center justify-between group">
            <div>
              <p className="font-medium text-gray-900">Notification Preferences</p>
              <p className="text-sm text-gray-600">Manage how you receive reminders</p>
            </div>
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center group-hover:bg-violet-200 transition-colors">
              <Settings className="w-4 h-4 text-violet-600" />
            </div>
          </button>
          <button className="w-full text-left p-4 hover:bg-violet-50 rounded-xl transition-colors flex items-center justify-between group">
            <div>
              <p className="font-medium text-gray-900">Privacy Settings</p>
              <p className="text-sm text-gray-600">Control your data sharing</p>
            </div>
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center group-hover:bg-violet-200 transition-colors">
              <Shield className="w-4 h-4 text-violet-600" />
            </div>
          </button>
        </div>
      </Card>
      
      {/* Logout */}
      <Button 
        variant="danger" 
        fullWidth 
        size="lg"
        onClick={logout}
        className="hover:shadow-lg transition-all duration-300"
      >
        <LogOut className="w-5 h-5 mr-2" />
        Logout
      </Button>
    </div>
  );
};

export default Profile;
