import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'default',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    default: 'bg-blue-500 text-white hover:bg-blue-600',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-100'
  };
  
  const sizes = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3',
    lg: 'h-11 px-8'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}; 