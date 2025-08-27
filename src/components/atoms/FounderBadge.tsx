import React from 'react';

interface FounderBadgeProps {
  tier: 'elite' | 'pioneer';
  number?: number;
  size?: 'small' | 'medium' | 'large';
  showNumber?: boolean;
  showDiscount?: boolean;
  discountPercentage?: number;
  className?: string;
}

const FounderBadge: React.FC<FounderBadgeProps> = ({
  tier,
  number,
  size = 'medium',
  showNumber = false,
  showDiscount = false,
  discountPercentage = 0,
  className = ''
}) => {
  // Define tier-specific styles
  const tierStyles = {
    elite: {
      gradient: 'from-blue-500 to-purple-600',
      shadow: 'shadow-blue-500/30',
      glow: 'shadow-blue-400/50',
      text: 'Elite Founder',
      emoji: '⭐'
    },
    pioneer: {
      gradient: 'from-amber-500 to-orange-600', 
      shadow: 'shadow-amber-500/30',
      glow: 'shadow-amber-400/50',
      text: 'Pioneer Founder',
      emoji: '🚀'
    }
  };

  // Define size styles
  const sizeStyles = {
    small: {
      container: 'px-2 py-1 text-xs',
      text: 'text-xs',
      emoji: 'text-sm'
    },
    medium: {
      container: 'px-3 py-1.5 text-sm',
      text: 'text-sm',
      emoji: 'text-base'
    },
    large: {
      container: 'px-4 py-2 text-base',
      text: 'text-base', 
      emoji: 'text-lg'
    }
  };

  const currentTier = tierStyles[tier];
  const currentSize = sizeStyles[size];

  return (
    <div className={`
      inline-flex items-center gap-1.5
      bg-gradient-to-r ${currentTier.gradient}
      text-white font-bold rounded-full
      ${currentSize.container}
      ${currentTier.shadow} hover:${currentTier.glow}
      transition-all duration-300 ease-out
      border border-white/20
      backdrop-blur-sm
      ${className}
    `}>
      <span className={currentSize.emoji}>{currentTier.emoji}</span>
      <span className={currentSize.text}>
        {currentTier.text}
        {showNumber && number && ` #${number}`}
      </span>
      {showDiscount && discountPercentage > 0 && (
        <span className={`
          ${currentSize.text} bg-white/20 rounded-full px-1.5 py-0.5
          ${size === 'small' ? 'text-xs px-1' : ''}
        `}>
          -{discountPercentage}%
        </span>
      )}
    </div>
  );
};

export default FounderBadge;