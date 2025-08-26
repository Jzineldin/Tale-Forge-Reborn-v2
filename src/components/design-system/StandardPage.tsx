import React from 'react';
import FloatingElements from './FloatingElements';
import PageHeader from './PageHeader';
import { getContainerClasses } from './DesignTokens';

interface StandardPageProps {
  title: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
  showFloatingElements?: boolean;
  containerSize?: 'small' | 'base' | 'large';
  headerSize?: 'small' | 'medium' | 'large';
  centered?: boolean;
  className?: string;
}

const StandardPage: React.FC<StandardPageProps> = ({ 
  title,
  subtitle,
  icon,
  children,
  showFloatingElements = true,
  containerSize = 'base',
  headerSize = 'medium',
  centered = true,
  className = ''
}) => {
  return (
    <div className={`min-h-screen py-8 relative overflow-hidden ${className}`}>
      {/* Floating Elements Background */}
      {showFloatingElements && <FloatingElements />}
      
      {/* Main Content */}
      <div className="relative z-10">
        <div className={getContainerClasses(containerSize)}>
          {/* Page Header */}
          <PageHeader 
            title={title}
            subtitle={subtitle}
            icon={icon}
            size={headerSize}
            centered={centered}
          />
          
          {/* Page Content */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default StandardPage;