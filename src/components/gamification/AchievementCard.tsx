import React from 'react';
import { Achievement, AchievementProgress } from '../../services/achievementService';
import { AchievementBadge } from './AchievementBadge';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { CheckCircle, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AchievementCardProps {
  achievement: Achievement | AchievementProgress;
  isCompleted?: boolean;
  canClaim?: boolean;
  onClaim?: () => void;
  onViewDetails?: () => void;
  showProgress?: boolean;
  compact?: boolean;
}

const categoryLabels = {
  story_creation: 'Story Creation',
  template_creation: 'Template Creation',
  social_engagement: 'Social Engagement',
  special_events: 'Special Events',
  milestones: 'Milestones'
};

const tierLabels = {
  novice: 'Novice',
  intermediate: 'Intermediate', 
  advanced: 'Advanced',
  master: 'Master',
  legendary: 'Legendary'
};

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  isCompleted = 'is_completed' in achievement ? achievement.is_completed : true,
  canClaim = false,
  onClaim,
  onViewDetails,
  showProgress = true,
  compact = false
}) => {
  const progress = 'progress_percentage' in achievement ? achievement.progress_percentage : 100;
  const currentProgress = 'current_progress' in achievement ? achievement.current_progress : achievement.requirement_value;
  
  const categoryLabel = categoryLabels[achievement.category as keyof typeof categoryLabels] || achievement.category;
  const tierLabel = tierLabels[achievement.tier as keyof typeof tierLabels] || achievement.tier;

  return (
    <Card className={cn(
      'transition-all duration-300 hover:shadow-lg',
      isCompleted ? 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-green-200 dark:border-green-800' : '',
      canClaim ? 'ring-2 ring-yellow-400 ring-opacity-50 animate-pulse' : '',
      compact ? 'p-3' : ''
    )}>
      <CardHeader className={cn('flex flex-row items-center space-y-0 pb-2', compact ? 'p-3' : '')}>
        <div className="flex items-center space-x-3 flex-1">
          <AchievementBadge 
            achievement={achievement}
            isCompleted={isCompleted}
            size={compact ? 'small' : 'medium'}
            showProgress={showProgress && !isCompleted}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={cn(
                'font-semibold truncate',
                compact ? 'text-sm' : 'text-base'
              )}>
                {'name' in achievement ? achievement.name : achievement.achievement_name}
              </h3>
              
              {isCompleted && (
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              )}
              
              {canClaim && (
                <div className="flex-shrink-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                  CLAIM
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                'text-muted-foreground capitalize',
                compact ? 'text-xs' : 'text-sm'
              )}>
                {categoryLabel}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className={cn(
                'font-medium capitalize',
                compact ? 'text-xs' : 'text-sm',
                achievement.tier === 'legendary' ? 'text-amber-600' :
                achievement.tier === 'advanced' ? 'text-purple-600' :
                achievement.tier === 'intermediate' ? 'text-blue-600' :
                achievement.tier === 'master' ? 'text-indigo-600' :
                'text-emerald-600'
              )}>
                {tierLabel}
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-1 text-yellow-600">
            <span className={cn('font-bold', compact ? 'text-sm' : 'text-base')}>
              {achievement.credits_reward}
            </span>
            <span className={cn('text-muted-foreground', compact ? 'text-xs' : 'text-sm')}>
              credits
            </span>
          </div>
        </div>
      </CardHeader>

      {!compact && (
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4">
            {achievement.description}
          </p>
          
          {showProgress && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className={cn(
                  'font-medium',
                  isCompleted ? 'text-green-600' : 'text-blue-600'
                )}>
                  {currentProgress} / {achievement.requirement_value}
                </span>
              </div>
              
              <Progress 
                value={progress} 
                className="h-2"
              />
              
              <div className="text-xs text-muted-foreground text-right">
                {progress}% complete
              </div>
            </div>
          )}
          
          {isCompleted && !canClaim && (
            <div className="flex items-center gap-2 mt-4 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Achievement unlocked!</span>
            </div>
          )}
          
          {!isCompleted && (
            <div className="flex items-center gap-2 mt-4 text-muted-foreground text-sm">
              <Clock className="w-4 h-4" />
              <span>In progress...</span>
            </div>
          )}
          
          <div className="flex gap-2 mt-4">
            {canClaim && onClaim && (
              <Button 
                onClick={onClaim}
                className="bg-yellow-500 hover:bg-yellow-600 text-yellow-900"
                size="sm"
              >
                Claim Reward
              </Button>
            )}
            
            {onViewDetails && (
              <Button 
                onClick={onViewDetails}
                variant="outline"
                size="sm"
              >
                View Details
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};