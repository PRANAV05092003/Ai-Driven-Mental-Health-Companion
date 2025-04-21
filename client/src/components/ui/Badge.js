import React from 'react';

const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded = false,
  icon = null,
  iconPosition = 'left',
  className = '',
  onClick = null,
  dismissible = false,
  onDismiss = null,
  ...props
}) => {
  const baseClass = 'inline-flex items-center font-medium';
  
  const variants = {
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300',
    secondary: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-300',
    accent: 'bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-300',
    neutral: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    outline: 'bg-transparent border border-current text-primary-600 dark:text-primary-400',
  };
  
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };
  
  const roundedClass = rounded ? 'rounded-full' : 'rounded-md';
  const clickableClass = onClick ? 'cursor-pointer hover:opacity-80' : '';
  
  // Dismissible X button
  const DismissButton = () => (
    <button
      type="button"
      className="ml-1 -mr-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-current hover:bg-opacity-25 hover:bg-neutral-900 focus:outline-none"
      onClick={(e) => {
        e.stopPropagation();
        onDismiss && onDismiss();
      }}
    >
      <span className="sr-only">Remove</span>
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
  
  return (
    <span
      className={`${baseClass} ${variants[variant]} ${sizes[size]} ${roundedClass} ${clickableClass} ${className}`}
      onClick={onClick}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className={`${children ? 'mr-1.5' : ''}`}>
          {icon}
        </span>
      )}
      
      {children}
      
      {icon && iconPosition === 'right' && !dismissible && (
        <span className={`${children ? 'ml-1.5' : ''}`}>
          {icon}
        </span>
      )}
      
      {dismissible && (
        <DismissButton />
      )}
    </span>
  );
};

export default Badge; 