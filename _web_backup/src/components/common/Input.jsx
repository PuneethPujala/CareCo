import React from 'react';
import { Eye, EyeOff, Mail, Lock, Search, User, Phone } from 'lucide-react';

const Input = ({ 
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  icon,
  showPasswordToggle = false,
  className = '',
  ...props 
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const getIcon = () => {
    if (icon === 'email') return <Mail className="w-4 h-4" />;
    if (icon === 'password') return <Lock className="w-4 h-4" />;
    if (icon === 'search') return <Search className="w-4 h-4" />;
    if (icon === 'user') return <User className="w-4 h-4" />;
    if (icon === 'phone') return <Phone className="w-4 h-4" />;
    return null;
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {getIcon()}
          </div>
        )}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 text-sm ${
            icon ? 'pl-10' : ''
          } ${showPasswordToggle ? 'pr-10' : ''} ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Input;
