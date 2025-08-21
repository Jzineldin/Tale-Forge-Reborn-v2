import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'magical' | 'outline';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  className = '',
  type = 'button',
  ...props
}) => {
  const baseClasses = 'font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 active:scale-95';
  
  const variantClasses = {
    primary: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500 focus:ring-offset-amber-100 shadow-md hover:shadow-lg',
    secondary: 'bg-white/20 text-white border border-white/30 hover:bg-white/30 focus:ring-white/50 focus:ring-offset-white/10 backdrop-blur-sm shadow-md hover:shadow-lg',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 focus:ring-offset-red-100 shadow-md hover:shadow-lg',
    magical: 'btn-magical shadow-lg hover:shadow-xl',
    outline: 'bg-transparent border-2 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white focus:ring-amber-500 focus:ring-offset-amber-100 shadow-md hover:shadow-lg',
  };
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };
  
  // If it's the magical variant, we don't need additional size classes
  const classes = variant === 'magical' 
    ? `${variantClasses[variant]} ${className}`
    : `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <button 
      className={classes} 
      type={type}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;