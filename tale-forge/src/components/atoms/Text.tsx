import React from 'react';

interface TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'small';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  color?: 'primary' | 'secondary' | 'muted' | 'subtle' | 'dark' | 'danger' | 'success' | 'warning' | 'gold' | 'blue' | 'purple' | 'amber' | 'indigo' | 'violet' | 'white';
  className?: string;
  id?: string;
  role?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const Text: React.FC<TextProps> = ({
  children,
  variant = 'p',
  size = 'base',
  weight = 'normal',
  color = 'primary',
  className = '',
  id,
  role,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) => {
  // Font size classes
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
  };
  
  // Font weight classes
  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
  };
  
  // Color classes using the new color palette
  const colorClasses = {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    muted: 'text-gray-500',
    subtle: 'text-gray-400',
    dark: 'text-gray-900',
    danger: 'text-red-500',
    success: 'text-green-500',
    warning: 'text-amber-500',
    gold: 'text-amber-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    amber: 'text-amber-500',
    indigo: 'text-indigo-500',
    violet: 'text-violet-500',
    white: 'text-white',
  };
  
  const classes = `${sizeClasses[size]} ${weightClasses[weight]} ${colorClasses[color]} ${className}`;
  
  const Element = variant;
  
  return (
    <Element 
      className={classes}
      id={id}
      role={role}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
    >
      {children}
    </Element>
  );
};

export default Text;