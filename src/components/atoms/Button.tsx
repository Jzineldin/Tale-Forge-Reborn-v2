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
  const baseClasses = 'font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 transform hover:scale-102 active:scale-98';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 focus:ring-amber-500 focus:ring-offset-amber-100 shadow-sm hover:shadow-md',
    secondary: 'bg-white/5 text-amber-400 border border-amber-400/30 hover:bg-amber-400/10 hover:border-amber-400/50 focus:ring-amber-400/50 backdrop-blur-sm shadow-sm hover:shadow-md',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 focus:ring-offset-red-100 shadow-sm hover:shadow-md',
    magical: 'bg-gradient-to-r from-amber-400 via-purple-500 to-amber-600 text-white hover:from-amber-500 hover:via-purple-600 hover:to-amber-700 shadow-sm hover:shadow-md',
    outline: 'bg-transparent border border-amber-500 text-amber-500 hover:bg-amber-500/10 hover:border-amber-600 focus:ring-amber-500 focus:ring-offset-amber-100 shadow-sm hover:shadow-md',
  };
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };
  
  // All variants now use consistent structure
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
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