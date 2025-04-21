import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  rounded = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClass = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 disabled:bg-primary-300',
    secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white focus:ring-secondary-500 disabled:bg-secondary-300',
    accent: 'bg-accent-600 hover:bg-accent-700 text-white focus:ring-accent-500 disabled:bg-accent-300',
    outline: 'border border-neutral-300 dark:border-neutral-600 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-white focus:ring-primary-500',
    ghost: 'bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-white focus:ring-primary-500',
    link: 'bg-transparent underline text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 p-0 h-auto',
    danger: 'bg-error hover:bg-red-600 text-white focus:ring-red-500',
    success: 'bg-success hover:bg-green-600 text-white focus:ring-green-500',
  };
  
  const sizes = {
    xs: 'text-xs px-2.5 py-1.5',
    sm: 'text-sm px-3 py-2',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
    xl: 'text-lg px-7 py-4',
  };
  
  const iconOnly = {
    xs: !children && 'p-1.5',
    sm: !children && 'p-2',
    md: !children && 'p-2.5',
    lg: !children && 'p-3',
    xl: !children && 'p-4',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  const roundedClass = rounded ? 'rounded-full' : 'rounded-lg';
  const disabledClass = disabled || loading ? 'opacity-70 cursor-not-allowed' : '';
  
  // Handle loading state with spinner
  const Spinner = () => (
    <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
  
  return (
    <button
      type={type}
      className={`${baseClass} ${variants[variant]} ${sizes[size]} ${iconOnly[size]} ${widthClass} ${roundedClass} ${disabledClass} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className={`mr-2`}>
          <Spinner />
        </span>
      )}
      
      {icon && iconPosition === 'left' && !loading && (
        <span className={`${children ? 'mr-2' : ''}`}>
          {icon}
        </span>
      )}
      
      {children}
      
      {icon && iconPosition === 'right' && (
        <span className={`${children ? 'ml-2' : ''}`}>
          {icon}
        </span>
      )}
    </button>
  );
};

export default Button; 