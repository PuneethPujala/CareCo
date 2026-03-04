import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  padding = 'normal',
  hover = false,
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-2xl shadow-sm border border-gray-200';
  
  const paddings = {
    none: '',
    sm: 'p-4',
    normal: 'p-6',
    lg: 'p-8',
  };
  
  const hoverClasses = hover ? 'hover:shadow-md transform hover:-translate-y-1 transition-all duration-200 cursor-pointer' : '';
  
  const classes = `${baseClasses} ${paddings[padding]} ${hoverClasses} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;
