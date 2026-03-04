import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, Phone, Users, Shield, Mail, Lock, Eye, EyeOff, Stethoscope, Activity, Pill, User, Building, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState('');
  const [activeTab, setActiveTab] = useState('app'); // 'app' or 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Get role from URL params if present
  React.useEffect(() => {
    const pathParts = location.pathname.split('/');
    const roleFromUrl = pathParts[pathParts.length - 1];

    // Map URL roles to internal IDs if needed
    if (['caretaker', 'manager', 'patient'].includes(roleFromUrl)) {
      setSelectedRole(roleFromUrl);
      if (roleFromUrl === 'manager') setActiveTab('admin');
    } else if (roleFromUrl === 'customer') {
      setSelectedRole('mentor');
    } else if (['admin', 'super-admin', 'org-admin'].includes(roleFromUrl)) {
      setActiveTab('admin');
    }
  }, [location.pathname]);

  const appRoles = [
    {
      id: 'patient',
      name: 'Patient',
      icon: User,
      description: 'Access your care plan',
      color: 'from-pink-400 to-rose-500',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200'
    },
    {
      id: 'caretaker',
      name: 'Caretaker',
      icon: Phone,
      description: 'Manage visits and tasks',
      color: 'from-sky-400 to-sky-600',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200'
    },
    {
      id: 'mentor',
      name: 'Family/Mentor',
      icon: Users,
      description: 'Monitor loved ones',
      color: 'from-emerald-400 to-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    }
  ];

  const adminRoles = [
    {
      id: 'manager',
      name: 'Care Manager',
      icon: Shield,
      description: 'Oversee care operations',
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 'org_admin',
      name: 'Org Admin',
      icon: Building,
      description: 'Manage organization',
      color: 'from-orange-400 to-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      id: 'super_admin',
      name: 'Super Admin',
      icon: Database,
      description: 'Platform administration',
      color: 'from-slate-600 to-slate-800',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200'
    }
  ];

  const handleLogin = (e) => {
    e.preventDefault();

    if (!selectedRole || !email || !password) {
      return;
    }

    try {
      const user = login(selectedRole, { email, name: email.split('@')[0] });

      // Redirect based on role
      switch (selectedRole) {
        case 'super_admin': navigate('/super-admin/dashboard'); break;
        case 'org_admin': navigate('/org-admin/dashboard'); break;
        case 'manager': navigate('/manager/dashboard'); break;
        case 'caretaker': navigate('/caretaker/home'); break;
        case 'mentor': navigate('/customer/dashboard'); break;
        case 'patient': navigate('/patient/dashboard'); break;
        default: navigate('/role-selection');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleGoogleSignIn = () => {
    console.log('Google sign in initiated');
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-outfit">
      {/* Enhanced Medical Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-blue-50 to-emerald-50">
        {/* Medical Pattern Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full" style={{
            backgroundImage: `
              radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)
            `
          }}></div>
        </div>

        {/* Animated Medical Icons Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 animate-pulse-slow">
            <Stethoscope className="w-32 h-32 text-sky-300/30" />
          </div>
          <div className="absolute top-1/3 right-10 animate-pulse-slow" style={{ animationDelay: '1s' }}>
            <Activity className="w-28 h-28 text-emerald-300/30" />
          </div>
          <div className="absolute bottom-1/4 left-1/4 animate-pulse-slow" style={{ animationDelay: '2s' }}>
            <Pill className="w-24 h-24 text-purple-300/30" />
          </div>
          <div className="absolute bottom-20 right-1/3 animate-pulse-slow" style={{ animationDelay: '1.5s' }}>
            <Heart className="w-20 h-20 text-rose-300/30" />
          </div>
        </div>

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(59, 130, 246, 1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-4 lg:py-8">
        {/* Desktop Layout - Side by Side */}
        <div className="hidden lg:flex w-full max-w-6xl gap-8 items-center">

          {/* Left Side - Enhanced Welcome Section */}
          <div className="lg:w-1/2 space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-gradient-to-br from-sky-400 to-teal-500 rounded-2xl shadow-lg">
                    <Heart className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="font-outfit text-4xl lg:text-5xl font-bold bg-gradient-to-r from-sky-600 to-teal-600 bg-clip-text text-transparent">
                      CareConnect
                    </h1>
                    <p className="text-gray-600 font-medium">Healthcare Coordination Platform</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-gray-800">
                    Healthcare Coordination Made Simple
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Connect patients, caretakers, and mentors in one seamless platform.
                    Ensure medication adherence and provide quality care with our intelligent healthcare solution.
                  </p>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center space-x-3 p-4 bg-sky-50 rounded-2xl border border-sky-100">
                    <div className="p-2 bg-sky-500 rounded-xl">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">HIPAA Compliant</h3>
                      <p className="text-sm text-gray-600">Your data is protected and secure</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="p-2 bg-emerald-500 rounded-xl">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">End-to-End Encrypted</h3>
                      <p className="text-sm text-gray-600">Advanced security for all communications</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                    <div className="p-2 bg-purple-500 rounded-xl">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">24/7 Monitoring</h3>
                      <p className="text-sm text-gray-600">Continuous care and support</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="lg:w-1/2 w-full max-w-md">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-6 lg:p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h3>
                <p className="text-gray-600">Sign in to access your dashboard</p>
              </div>

              {/* Tabs */}
              <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
                <button
                  onClick={() => { setActiveTab('app'); setSelectedRole(''); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'app' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  App Login
                </button>
                <button
                  onClick={() => { setActiveTab('admin'); setSelectedRole(''); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'admin' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Administrative
                </button>
              </div>

              {/* Role Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Your Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(activeTab === 'app' ? appRoles : adminRoles).map((role) => {
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.id}
                        onClick={() => setSelectedRole(role.id)}
                        className={`relative p-3 rounded-xl border-2 transition-all duration-300 flex flex-col items-center space-y-2 group ${selectedRole === role.id
                            ? 'border-transparent bg-gradient-to-r ' + role.color + ' text-white shadow-lg transform scale-105'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
                          }`}
                      >
                        <div className={`p-2 rounded-lg transition-all duration-300 ${selectedRole === role.id
                            ? 'bg-white bg-opacity-20'
                            : 'bg-gray-50 group-hover:bg-gray-100'
                          }`}>
                          <Icon className={`w-4 h-4 ${selectedRole === role.id ? 'text-white' : 'text-gray-600'
                            }`} />
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-xs">{role.name}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Google Sign In (App Tab Only) */}
              {activeTab === 'app' && (
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center space-x-3 p-3 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 mb-4"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="font-medium text-gray-700 text-sm">Continue with Google</span>
                </button>
              )}

              {/* Divider */}
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-gray-500">
                    {activeTab === 'app' ? 'Or continue with email' : 'Secure Login'}
                  </span>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 text-sm"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 text-sm"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!selectedRole || !email || !password}
                  className="w-full bg-gradient-to-r from-sky-500 to-teal-500 text-white font-semibold py-2.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
                >
                  Sign In
                </button>

                <div className="text-center">
                  <button type="button" className="text-xs text-sky-600 hover:text-sky-700 font-medium transition-colors">
                    Forgot your password?
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Mobile Layout - Centered Form Only */}
        <div className="lg:hidden w-full max-w-sm">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-6">
            {/* Mobile Logo */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center space-x-2 mb-3">
                <div className="p-2 bg-gradient-to-br from-sky-400 to-teal-500 rounded-xl shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h1 className="font-outfit text-2xl font-bold bg-gradient-to-r from-sky-600 to-teal-600 bg-clip-text text-transparent">
                  CareConnect
                </h1>
              </div>
              <p className="text-sm text-gray-600">Sign in to continue</p>
            </div>

            {/* Mobile Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-lg mb-5">
              <button
                onClick={() => { setActiveTab('app'); setSelectedRole(''); }}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === 'app' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                App Login
              </button>
              <button
                onClick={() => { setActiveTab('admin'); setSelectedRole(''); }}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === 'admin' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Administrative
              </button>
            </div>

            {/* Role Selection */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(activeTab === 'app' ? appRoles : adminRoles).map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`relative p-2 rounded-lg border-2 transition-all duration-300 flex flex-col items-center space-y-1 group ${selectedRole === role.id
                          ? 'border-transparent bg-gradient-to-r ' + role.color + ' text-white shadow-lg transform scale-105'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
                        }`}
                    >
                      <div className={`p-1.5 rounded-lg transition-all duration-300 ${selectedRole === role.id
                          ? 'bg-white bg-opacity-20'
                          : 'bg-gray-50 group-hover:bg-gray-100'
                        }`}>
                        <Icon className={`w-3 h-3 ${selectedRole === role.id ? 'text-white' : 'text-gray-600'
                          }`} />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-xs">{role.name}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Google Sign In */}
            {activeTab === 'app' && (
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center space-x-2 p-2.5 border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 mb-3"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="font-medium text-gray-700 text-xs">Continue with Google</span>
              </button>
            )}

            {/* Divider */}
            <div className="relative mb-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500">
                  {activeTab === 'app' ? 'Or email' : 'Secure Login'}
                </span>
              </div>
            </div>

            {/* Mobile Form */}
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="Email"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="Password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedRole || !email || !password}
                className="w-full bg-gradient-to-r from-sky-500 to-teal-500 text-white font-semibold py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
              >
                Sign In
              </button>

              <div className="text-center">
                <button type="button" className="text-xs text-sky-600 hover:text-sky-700 font-medium transition-colors">
                  Forgot password?
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;