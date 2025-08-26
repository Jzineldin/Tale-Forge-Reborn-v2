import React from 'react';

interface TypographyLayoutProps {
  children: React.ReactNode;
  /** Typography variant following HomePage design */
  variant: 'hero' | 'section' | 'card' | 'body' | 'caption';
  /** Custom className */
  className?: string;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Color variant */
  color?: 'primary' | 'secondary' | 'muted' | 'amber' | 'white';
  /** HTML element to render */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

/**
 * Unified Typography Component
 * Uses Tale-Forge design system typography classes consistently
 */
const TypographyLayout: React.FC<TypographyLayoutProps> = ({
  children,
  variant,
  className = '',
  align = 'left',
  color = 'primary',
  as = 'div'
}) => {
  // Typography classes from design system
  const variantClasses = {
    hero: 'title-hero',
    section: 'title-section',
    card: 'title-card',
    body: 'text-body',
    caption: 'text-body text-sm'
  };

  // Alignment classes
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  // Color classes
  const colorClasses = {
    primary: 'text-white',
    secondary: 'text-white/90',
    muted: 'text-white/70',
    amber: 'text-amber-400',
    white: 'text-white'
  };

  const Component = as;

  return (
    <Component 
      className={`
        ${variantClasses[variant]}
        ${alignClasses[align]}
        ${colorClasses[color]}
        ${className}
      `.trim()}
    >
      {children}
    </Component>
  );
};

export default TypographyLayout;