import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  variant = 'default', 
  hover = true,
  onClick = null
}) => {
  const baseClass = 'rounded-2xl overflow-hidden transition-all duration-300';
  
  const variants = {
    default: 'bg-white dark:bg-neutral-800 shadow-card',
    primary: 'bg-primary-50 dark:bg-primary-900 shadow-card',
    secondary: 'bg-secondary-50 dark:bg-secondary-900 shadow-card',
    accent: 'bg-accent-50 dark:bg-accent-900 shadow-card',
    outline: 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700',
    transparent: 'bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm',
  };

  const hoverEffect = hover 
    ? 'hover:shadow-lg hover:-translate-y-1 hover:scale-[1.01]' 
    : '';
  
  const clickableClass = onClick ? 'cursor-pointer' : '';

  return (
    <div 
      className={`${baseClass} ${variants[variant]} ${hoverEffect} ${clickableClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', centered = false }) => {
  const centeredClass = centered ? 'text-center' : '';
  
  return (
    <div className={`p-5 border-b border-neutral-200 dark:border-neutral-700 ${centeredClass} ${className}`}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '' }) => {
  return (
    <h3 className={`text-xl font-semibold text-neutral-900 dark:text-white ${className}`}>
      {children}
    </h3>
  );
};

export const CardDescription = ({ children, className = '' }) => {
  return (
    <p className={`mt-1 text-sm text-neutral-500 dark:text-neutral-400 ${className}`}>
      {children}
    </p>
  );
};

export const CardContent = ({ children, className = '' }) => {
  return (
    <div className={`p-5 ${className}`}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '', centered = false }) => {
  const centeredClass = centered ? 'text-center' : '';
  
  return (
    <div className={`p-5 border-t border-neutral-200 dark:border-neutral-700 ${centeredClass} ${className}`}>
      {children}
    </div>
  );
};

export default Card; 