import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false, 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-gradient-to-r from-sky-500 to-teal-500 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
    secondary: 'border-2 border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white',
    danger: 'border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white',
    outline: 'border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50',
    ghost: 'text-gray-600 hover:bg-gray-100',
  };
  
  const sizes = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-2.5 px-6 text-sm',
    lg: 'py-3 px-8 text-base',
    xl: 'py-4 px-10 text-lg',
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
