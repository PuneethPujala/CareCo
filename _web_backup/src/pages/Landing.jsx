import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Building2, Users, ArrowRight, Phone, Lock } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-emerald-50 flex flex-col">
      {/* Navbar */}
      <nav className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-br from-sky-400 to-teal-500 rounded-lg">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-teal-600 bg-clip-text text-transparent">
            CarePlatform
          </span>
        </div>
        <Link to="/login/manager">
          <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-all text-gray-600 hover:text-sky-600 font-medium border border-gray-100">
            <Lock className="w-4 h-4" />
            <span>Staff Login</span>
          </button>
        </Link>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        <div className="max-w-4xl mx-auto w-full text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 leading-tight">
            Healthcare Coordination <br />
            <span className="bg-gradient-to-r from-sky-600 to-teal-500 bg-clip-text text-transparent">
              Reimagined
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            A production-ready platform connecting healthcare organizations, care managers, and families for optimal patient adherence.
          </p>
        </div>

        {/* Entry Points Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full px-4">

          {/* For Organizations */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 hover:transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 transition-opacity group-hover:opacity-40"></div>
            <div className="p-3 bg-blue-100 rounded-xl w-fit mb-6">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">For Organizations</h3>
            <p className="text-gray-600 mb-6">
              Enterprise-grade solution for hospitals and clinics to manage patient care at scale.
            </p>
            <div className="space-y-3">
              <Link to="/contact/sales" className="block w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-medium text-center hover:bg-gray-800 transition-colors">
                Contact Sales
              </Link>
              <Link to="/login/org_admin" className="block w-full py-3 px-4 bg-gray-50 text-gray-700 rounded-xl font-medium text-center hover:bg-gray-100 transition-colors">
                Admin Login
              </Link>
            </div>
          </div>

          {/* For Caretakers */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 hover:transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 transition-opacity group-hover:opacity-40"></div>
            <div className="p-3 bg-sky-100 rounded-xl w-fit mb-6">
              <Phone className="w-8 h-8 text-sky-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">For Caretakers</h3>
            <p className="text-gray-600 mb-6">
              Join our network of compassionate care providers. Work remotely and make a difference.
            </p>
            <div className="space-y-3">
              <Link to="/careers" className="block w-full py-3 px-4 bg-sky-600 text-white rounded-xl font-medium text-center hover:bg-sky-700 transition-colors">
                View Open Positions
              </Link>
              <Link to="/login/caretaker" className="block w-full py-3 px-4 bg-sky-50 text-sky-700 rounded-xl font-medium text-center hover:bg-sky-100 transition-colors">
                Caretaker Login
              </Link>
            </div>
          </div>

          {/* For Families */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 hover:transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 transition-opacity group-hover:opacity-40"></div>
            <div className="p-3 bg-emerald-100 rounded-xl w-fit mb-6">
              <Users className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">For Families</h3>
            <p className="text-gray-600 mb-6">
              Stay connected with your loved one's health journey. Monitor adherence and wellbeing.
            </p>
            <div className="space-y-3">
              <Link to="/request-access" className="block w-full py-3 px-4 bg-emerald-600 text-white rounded-xl font-medium text-center hover:bg-emerald-700 transition-colors">
                Request Mentor Access
              </Link>
              <Link to="/login/mentor" className="block w-full py-3 px-4 bg-emerald-50 text-emerald-700 rounded-xl font-medium text-center hover:bg-emerald-100 transition-colors">
                Family Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm">
        <p>© 2024 CarePlatform. All rights reserved. HIPAA Compliant.</p>
        <div className="mt-2 space-x-4">
          <Link to="/login/super_admin" className="hover:text-gray-900">Platform Owner</Link>
          <span>•</span>
          <Link to="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
          <span>•</span>
          <Link to="/terms" className="hover:text-gray-900">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
