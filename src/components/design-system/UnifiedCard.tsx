import React from 'react';
import { DESIGN_TOKENS } from './DesignTokens';

interface UnifiedCardProps {
  children: React.ReactNode;
  variant?: 'glass' | 'enhanced' | 'refined' | 'solid';
  padding?: 'small' | 'medium' | 'large';
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

const UnifiedCard: React.FC<UnifiedCardProps> = ({
  children,
  variant = 'glass',
  padding = 'medium',
  hover = false,
  className = '',
  onClick
}) => {
  // Get base card styles based on variant
  const getVariantClasses = () => {
    switch (variant) {
      case 'enhanced':
        return DESIGN_TOKENS.effects.glassEnhanced;
      case 'refined':
        return DESIGN_TOKENS.effects.refinedCard;
      case 'solid':
        return 'bg-slate-800 border border-slate-700';
      case 'glass':
      default:
        return DESIGN_TOKENS.effects.glassMedium;
    }
  };

  // Get padding classes
  const getPaddingClasses = () => {
    switch (padding) {
      case 'small': return DESIGN_TOKENS.spacing.cardSmall;
      case 'large': return DESIGN_TOKENS.spacing.cardLarge;
      default: return DESIGN_TOKENS.spacing.card;
    }
  };

  // Get hover effects
  const getHoverClasses = () => {
    if (!hover) return '';
    return `${DESIGN_TOKENS.effects.hover.scale} ${DESIGN_TOKENS.effects.hover.glow} cursor-pointer`;
  };

  const cardClasses = `
    ${getVariantClasses()}
    ${getPaddingClasses()}
    ${getHoverClasses()}
    rounded-2xl
    ${className}
  `.trim();

  // If onClick is provided, render as button
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={cardClasses}
      >
        {children}
      </button>
    );
  }

  return (
    <div className={cardClasses}>
      {children}
    </div>
  );
};

// Specialized card variants for common use cases
export const MetricCard: React.FC<{
  title: string;
  value: string | number;
  icon?: string;
  trend?: { value: string; positive?: boolean };
  className?: string;
  onClick?: () => void;
}> = ({ title, value, icon, trend, className, onClick }) => (
  <UnifiedCard variant="glass" hover className={className} onClick={onClick}>
    <div className="flex items-center justify-between mb-4">
      {icon && <div className="text-3xl">{icon}</div>}
      {trend && (
        <div className={`text-sm font-medium px-2 py-1 rounded ${
          trend.positive !== false ? 'text-green-400 bg-green-400/20' : 'text-red-400 bg-red-400/20'
        }`}>
          {trend.value}
        </div>
      )}
    </div>
    <div className="text-white/70 text-sm mb-1">{title}</div>
    <div className="text-2xl font-bold text-white">{value}</div>
  </UnifiedCard>
);

export const ActionCard: React.FC<{
  title: string;
  description: string;
  icon: string;
  iconBg?: string;
  onClick?: () => void;
  className?: string;
}> = ({ title, description, icon, iconBg = 'bg-amber-500', onClick, className }) => (
  <UnifiedCard variant="glass" hover onClick={onClick} className={className}>
    <div className="flex items-start space-x-4">
      <div className={`${iconBg} rounded-lg p-3 text-2xl group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-white font-semibold mb-2 group-hover:text-amber-400 transition-colors">
          {title}
        </h3>
        <p className="text-white/70 text-sm">
          {description}
        </p>
      </div>
    </div>
  </UnifiedCard>
);

export const StatusCard: React.FC<{
  title: string;
  status: 'good' | 'warning' | 'critical';
  value?: string;
  description?: string;
  className?: string;
}> = ({ title, status, value, description, className }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'good': return 'bg-green-500 text-green-400';
      case 'warning': return 'bg-amber-500 text-amber-400';
      case 'critical': return 'bg-red-500 text-red-400';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'good': return 'Healthy';
      case 'warning': return 'Warning';
      case 'critical': return 'Critical';
    }
  };

  return (
    <UnifiedCard variant="glass" className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-3 h-3 rounded-full ${getStatusColor().split(' ')[0]}`}></div>
        <span className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor().replace('bg-', 'bg-').replace('text-', '')}/20 ${getStatusColor().split(' ')[1]}`}>
          {getStatusText()}
        </span>
      </div>
      <div className="text-white font-medium mb-1">{title}</div>
      {value && <div className="text-2xl font-bold text-white mb-2">{value}</div>}
      {description && <div className="text-white/70 text-sm">{description}</div>}
    </UnifiedCard>
  );
};

export default UnifiedCard;