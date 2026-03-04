import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Phone, Heart, ArrowRight, Shield, User } from 'lucide-react';

const RoleSelection = () => {
  const roles = [
    {
      id: 'manager',
      title: 'Care Manager',
      description: 'Oversee operations and coordinate care teams',
      icon: Shield,
      color: 'from-purple-400 to-purple-600',
      path: '/login/manager'
    },
    {
      id: 'caretaker',
      title: 'Caretaker',
      description: 'Call patients and provide medication reminders',
      icon: Phone,
      color: 'from-sky-400 to-sky-600',
      path: '/login/caretaker'
    },
    {
      id: 'customer',
      title: 'Patient Mentor',
      description: 'Monitor your loved one\'s health journey',
      icon: Heart,
      color: 'from-emerald-400 to-emerald-600',
      path: '/login/customer'
    },
    {
      id: 'patient',
      title: 'Patient',
      description: 'View your care schedule and call history',
      icon: User,
      color: 'from-violet-400 to-violet-600',
      path: '/login/patient'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-emerald-50">
      {/* Medical Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)
          `
        }}></div>
      </div>
      
      <div className="relative flex flex-col min-h-screen">
        {/* Header */}
        <div className="px-6 py-4">
          <Link 
            to="/"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center px-6 py-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Choose Your Role</h1>
            <p className="text-gray-600">How would you like to use CareConnect?</p>
          </div>

          {/* Role Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto w-full">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Link
                  key={role.id}
                  to={role.path}
                  className="block"
                >
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl hover:bg-white/90 transition-all duration-200">
                    <div className="flex flex-col items-center space-y-4 text-center">
                      <div className={`p-3 bg-gradient-to-br ${role.color} rounded-xl`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-lg">{role.title}</h3>
                        <p className="text-gray-600 text-sm">{role.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer Info */}
        <div className="px-6 py-8 text-center">
          <p className="text-gray-500 text-sm">
            Don't have an account yet? 
            <Link to="/role-selection" className="text-sky-600 font-medium ml-1">
              Get started
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
