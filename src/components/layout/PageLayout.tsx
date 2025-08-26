import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  /** Optional floating particles animation */
  showFloatingElements?: boolean;
  /** Page variant affects background styling */
  variant?: 'default' | 'hero' | 'story' | 'minimal';
  /** Max width constraint */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Remove padding for full-width content */
  noPadding?: boolean;
  /** Custom className for the outer container */
  className?: string;
}

/**
 * Unified Page Layout Component
 * Ensures consistent Tale-Forge design system across all pages
 */
const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  showFloatingElements = true,
  variant = 'default',
  maxWidth = 'lg',
  noPadding = false,
  className = ''
}) => {
  // Container classes based on maxWidth
  const containerClasses = {
    sm: 'container-sm',
    md: 'container-md', 
    lg: 'container-lg',
    xl: 'max-w-7xl mx-auto px-4',
    full: 'w-full'
  };

  // Variant-specific styles
  const variantClasses = {
    default: 'min-h-screen flex flex-col relative overflow-hidden',
    hero: 'min-h-screen flex flex-col relative overflow-hidden',
    story: 'min-h-screen flex flex-col relative overflow-hidden bg-black/10',
    minimal: 'min-h-screen relative overflow-hidden'
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      {/* Floating Elements - Same as HomePage */}
      {showFloatingElements && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-amber-500/25 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-amber-300/15 rounded-full animate-pulse delay-2000"></div>
          <div className="absolute top-1/3 right-2/3 w-1 h-1 bg-amber-600/20 rounded-full animate-pulse delay-3000"></div>
        </div>
      )}

      {/* Main Content */}
      <div className={`relative z-10 flex-1 ${noPadding ? '' : 'py-8 md:py-16'}`}>
        <div className={containerClasses[maxWidth]}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageLayout;