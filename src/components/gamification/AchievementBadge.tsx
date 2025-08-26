import React from 'react';
import { Achievement, AchievementProgress } from '../../services/achievementService';
import { Badge, Crown, Star, Trophy, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AchievementBadgeProps {
  achievement: Achievement | AchievementProgress;
  isCompleted?: boolean;
  showProgress?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  onClick?: () => void;
}

const tierColors = {
  novice: 'from-emerald-400 to-emerald-600',
  intermediate: 'from-blue-400 to-blue-600',
  advanced: 'from-purple-400 to-purple-600',
  master: 'from-indigo-400 to-indigo-600',
  legendary: 'from-amber-400 to-amber-600'
};

const tierIcons = {
  novice: Badge,
  intermediate: Star,
  advanced: Crown,
  master: Trophy,
  legendary: Zap
};

const sizeClasses = {
  small: 'w-12 h-12',
  medium: 'w-16 h-16',
  large: 'w-24 h-24'
};

const iconSizes = {
  small: 16,
  medium: 20,
  large: 32
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  isCompleted = 'is_completed' in achievement ? achievement.is_completed : true,
  showProgress = false,
  size = 'medium',
  className,
  onClick
}) => {
  const tier = 'tier' in achievement ? achievement.tier : 'novice';
  const progress = 'progress_percentage' in achievement ? achievement.progress_percentage : 100;
  
  const TierIcon = tierIcons[tier as keyof typeof tierIcons] || Badge;
  const gradientColors = tierColors[tier as keyof typeof tierColors];
  
  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full transition-all duration-300',
        sizeClasses[size],
        isCompleted 
          ? `bg-gradient-to-br ${gradientColors} shadow-lg hover:scale-105 cursor-pointer`
          : 'bg-gray-200 dark:bg-gray-700 opacity-50',
        onClick && 'cursor-pointer hover:shadow-xl',
        className
      )}
      onClick={onClick}
      title={'name' in achievement ? achievement.name : achievement.achievement_name}
    >
      {/* Achievement Icon */}
      <TierIcon
        size={iconSizes[size]}
        className={cn(
          'transition-all duration-300',
          isCompleted ? 'text-white' : 'text-gray-400 dark:text-gray-500'
        )}
      />
      
      {/* Progress Ring for incomplete achievements */}
      {!isCompleted && showProgress && progress > 0 && (
        <div className="absolute inset-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-gray-300 dark:text-gray-600"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className={`text-${tier === 'novice' ? 'emerald' : tier === 'intermediate' ? 'blue' : tier === 'advanced' ? 'purple' : tier === 'master' ? 'indigo' : 'amber'}-500 transition-all duration-500`}
            />
          </svg>
        </div>
      )}
      
      {/* Sparkle effect for completed achievements */}
      {isCompleted && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full opacity-80 animate-pulse" />
          <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-white rounded-full opacity-60 animate-pulse delay-500" />
          <div className="absolute top-1/2 -left-2 w-1 h-1 bg-white rounded-full opacity-40 animate-pulse delay-1000" />
        </div>
      )}
      
      {/* Credits reward indicator */}
      {achievement.credits_reward > 0 && (
        <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full shadow-lg">
          +{achievement.credits_reward}
        </div>
      )}
    </div>
  );
};