import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import { achievementService } from '@/services/achievementService';
import { goalService } from '@/services/goalService';
import { CreditBalanceIndicator } from '@/components/business/CreditDisplay';

interface GamificationStatusProps {
  compact?: boolean;
  className?: string;
}

export const GamificationStatus: React.FC<GamificationStatusProps> = ({ 
  compact = false, 
  className = '' 
}) => {
  const { user } = useAuth();
  const [unclaimedCount, setUnclaimedCount] = useState(0);
  const [nearCompletionGoals, setNearCompletionGoals] = useState(0);

  useEffect(() => {
    if (user?.id) {
      const fetchStatus = async () => {
        try {
          const [unclaimed, goals] = await Promise.all([
            achievementService.getUnclaimedAchievements(user.id),
            goalService.getUserGoalsWithProgress(user.id)
          ]);

          setUnclaimedCount(unclaimed?.length || 0);
          
          // Count goals that are 75%+ complete but not finished
          const nearCompletion = goals.filter(g => 
            !g.goal.completed && g.progress_percentage >= 75
          ).length;
          setNearCompletionGoals(nearCompletion);
        } catch (error) {
          console.error('Error fetching gamification status:', error);
        }
      };

      fetchStatus();
    }
  }, [user?.id]);

  if (!user) return null;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <CreditBalanceIndicator size="sm" />
        {unclaimedCount > 0 && (
          <Link 
            to="/achievements"
            className="relative bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs hover:bg-purple-500/30 transition-colors"
          >
            🏆 {unclaimedCount}
          </Link>
        )}
        {nearCompletionGoals > 0 && (
          <Link 
            to="/dashboard"
            className="relative bg-amber-500/20 text-amber-400 px-2 py-1 rounded text-xs hover:bg-amber-500/30 transition-colors"
          >
            🎯 {nearCompletionGoals}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white/5 border border-white/20 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-medium text-sm">Your Progress</h3>
        <CreditBalanceIndicator size="sm" />
      </div>
      
      <div className="space-y-2">
        {unclaimedCount > 0 && (
          <Link 
            to="/achievements"
            className="flex items-center justify-between text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            <span>🏆 Unclaimed achievements</span>
            <span className="bg-purple-500/20 px-2 py-1 rounded">{unclaimedCount}</span>
          </Link>
        )}
        
        {nearCompletionGoals > 0 && (
          <Link 
            to="/dashboard"
            className="flex items-center justify-between text-sm text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>🎯 Goals almost complete</span>
            <span className="bg-amber-500/20 px-2 py-1 rounded">{nearCompletionGoals}</span>
          </Link>
        )}

        {user.current_streak && user.current_streak > 1 && (
          <div className="flex items-center justify-between text-sm text-green-400">
            <span>🔥 Reading streak</span>
            <span>{user.current_streak} days</span>
          </div>
        )}
        
        {user.total_achievements && user.total_achievements > 0 && (
          <div className="flex items-center justify-between text-sm text-white/70">
            <span>🏆 Total achievements</span>
            <span>{user.total_achievements}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamificationStatus;