import React from 'react';

const Input = ({
  id,
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  required = false,
  error = '',
  success = false,
  helperText = '',
  icon = null,
  iconPosition = 'left',
  variant = 'default',
  className = '',
  inputClassName = '',
  fullWidth = true,
  ...props
}) => {
  const baseInputClass = 'block w-full focus:outline-none';
  
  const variants = {
    default: 'border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 dark:bg-neutral-800 dark:text-white',
    filled: 'bg-neutral-100 dark:bg-neutral-700 border-none rounded-lg focus:ring-2 focus:ring-primary-400 dark:text-white',
    flushed: 'border-b border-neutral-300 dark:border-neutral-600 rounded-none px-0 focus:ring-0 focus:border-primary-400 dark:bg-transparent dark:text-white',
    unstyled: 'border-none focus:ring-0 p-0',
  };
  
  const stateClasses = {
    default: '',
    error: 'border-error focus:ring-error focus:border-error',
    success: 'border-success focus:ring-success focus:border-success',
    disabled: 'opacity-60 cursor-not-allowed bg-neutral-100 dark:bg-neutral-800',
  };
  
  const paddingClasses = {
    left: icon ? 'pl-10' : '',
    right: icon ? 'pr-10' : '',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  const hasError = error !== '';
  const state = disabled ? 'disabled' : hasError ? 'error' : success ? 'success' : 'default';
  
  return (
    <div className={`mb-4 ${widthClass} ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="block mb-2 text-sm font-medium text-neutral-900 dark:text-white"
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500">
            {icon}
          </div>
        )}
        
        <input
          id={id}
          type={type}
          className={`
            ${baseInputClass} 
            ${variants[variant]} 
            ${stateClasses[state]} 
            ${paddingClasses[iconPosition]}
            ${inputClassName}
          `}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          required={required}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neutral-500">
            {icon}
          </div>
        )}
      </div>
      
      {(helperText || hasError) && (
        <p className={`mt-1 text-sm ${hasError ? 'text-error' : 'text-neutral-500 dark:text-neutral-400'}`}>
          {hasError ? error : helperText}
        </p>
      )}
    </div>
  );
};

export default Input; 