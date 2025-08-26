import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large' | 'xl';
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
  // Map variants to our unified CSS classes
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };
  
  // Map sizes to our unified CSS size modifiers
  const sizeClasses = {
    small: 'btn-sm',
    medium: '',  // Default size, no modifier needed
    large: 'btn-lg',
    xl: 'btn-xl',
  };
  
  // Combine base btn class with variant and size modifiers
  const classes = `btn ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();
  
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