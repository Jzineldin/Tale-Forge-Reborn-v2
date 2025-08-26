import React from 'react';
import { DESIGN_TOKENS } from './DesignTokens';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  centered?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  icon, 
  centered = true, 
  size = 'medium',
  className = '' 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          title: 'text-2xl md:text-3xl',
          subtitle: 'text-lg',
          padding: 'p-6'
        };
      case 'large':
        return {
          title: 'text-4xl md:text-5xl lg:text-6xl',
          subtitle: 'text-xl md:text-2xl',
          padding: 'p-8 md:p-12'
        };
      default:
        return {
          title: 'text-3xl md:text-4xl lg:text-5xl',
          subtitle: 'text-lg md:text-xl',
          padding: 'p-8'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const alignmentClass = centered ? 'text-center' : 'text-left';

  return (
    <div className={`${DESIGN_TOKENS.effects.glassEnhanced} rounded-2xl ${sizeClasses.padding} mb-8 ${className}`}>
      <div className={alignmentClass}>
        {/* Icon */}
        {icon && (
          <div className="text-4xl md:text-5xl mb-4">
            {icon}
          </div>
        )}
        
        {/* Title */}
        <h1 
          className={`font-bold text-white mb-4 ${sizeClasses.title}`}
          style={{ fontFamily: DESIGN_TOKENS.fonts.heading }}
        >
          {title}
        </h1>
        
        {/* Subtitle */}
        {subtitle && (
          <p className={`text-white/90 max-w-4xl ${centered ? 'mx-auto' : ''} ${sizeClasses.subtitle}`}>
            {subtitle}
          </p>
        )}
        
        {/* Optional metadata line */}
        <div className="text-white/70 text-sm mt-4">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;