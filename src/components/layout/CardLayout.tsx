import React from 'react';

interface CardLayoutProps {
  children: React.ReactNode;
  /** Card variant affects styling */
  variant?: 'default' | 'hero' | 'elevated' | 'flat';
  /** Enable hover effects */
  hoverable?: boolean;
  /** Custom className for the card */
  className?: string;
  /** Padding size */
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  /** Show border */
  bordered?: boolean;
}

/**
 * Unified Card Layout Component
 * Ensures consistent glass morphism design across all cards
 */
const CardLayout: React.FC<CardLayoutProps> = ({
  children,
  variant = 'default',
  hoverable = false,
  className = '',
  padding = 'lg',
  bordered = true
}) => {
  // Padding classes
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8 md:p-12',
    xl: 'p-8 md:p-12 lg:p-16'
  };

  // Base card classes - consistent with HomePage
  const baseClasses = 'glass-card rounded-2xl';

  // Variant-specific classes
  const variantClasses = {
    default: 'glass-card',
    hero: 'glass-card', // Same as default but can be extended
    elevated: 'glass-enhanced',
    flat: 'glass rounded-lg'
  };

  // Hover effects
  const hoverClasses = hoverable 
    ? 'hover:transform hover:scale-[1.02] transition-all duration-300'
    : '';

  // Border classes
  const borderClasses = bordered ? '' : 'border-0';

  return (
    <div 
      className={`
        ${variantClasses[variant]} 
        ${paddingClasses[padding]}
        ${hoverClasses}
        ${borderClasses}
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
};

export default CardLayout;