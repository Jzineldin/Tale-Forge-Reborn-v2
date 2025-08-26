import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { 
  Trophy, 
  Target, 
  Coins, 
  TrendingUp, 
  Star,
  BookOpen,
  Heart,
  Zap,
  Crown,
  Award,
  Clock
} from 'lucide-react';
import { useAuth } from '../../providers/AuthContext';
import { achievementService, AchievementProgress, UserAchievement } from '../../services/achievementService';
import { goalService, GoalProgress } from '../../services/goalService';
import { creditService } from '../../services/creditService';
import { AchievementBadge, AchievementCard } from '../gamification';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend,
  className 
}) => (
  <Card className={cn('transition-all duration-300 hover:shadow-md', className)}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {trend && (
        <p className={cn(
          'text-xs flex items-center gap-1 mt-1',
          trend.isPositive ? 'text-green-600' : 'text-red-600'
        )}>
          <TrendingUp className={cn(
            'h-3 w-3',
            !trend.isPositive && 'rotate-180'
          )} />
          {trend.value}% from last month
        </p>
      )}
    </CardContent>
  </Card>
);

interface GoalCardProps {
  goal: GoalProgress;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal }) => {
  const getGoalIcon = (type: string) => {
    if (type.includes('story')) return <BookOpen className="w-4 h-4" />;
    if (type.includes('template')) return <Star className="w-4 h-4" />;
    if (type.includes('engagement') || type.includes('social')) return <Heart className="w-4 h-4" />;
    return <Target className="w-4 h-4" />;
  };

  const getTimeRemainingColor = (timeRemaining: any) => {
    const totalHours = timeRemaining.days * 24 + timeRemaining.hours;
    if (totalHours <= 6) return 'text-red-500';
    if (totalHours <= 24) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getGoalIcon(goal.goal.goal_type)}
            <div>
              <h4 className="font-medium text-sm">
                {goal.goal.goal_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h4>
              <p className="text-xs text-muted-foreground">
                {goal.goal.current_value} / {goal.goal.target_value}
              </p>
            </div>
          </div>
          <Badge 
            variant={goal.goal.completed ? "default" : "outline"}
            className={cn(
              'text-xs',
              goal.goal.completed && 'bg-green-500 text-white'
            )}
          >
            {goal.goal.completed ? 'Complete' : `${goal.progress_percentage}%`}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        <Progress 
          value={goal.progress_percentage} 
          className="h-2" 
        />
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <Coins className="w-3 h-3" />
            <span>{goal.goal.credits_reward} credits</span>
          </div>
          
          {!goal.goal.completed && (
            <div className={cn(
              'flex items-center gap-1',
              getTimeRemainingColor(goal.time_remaining)
            )}>
              <Clock className="w-3 h-3" />
              <span>
                {goal.time_remaining.days > 0 
                  ? `${goal.time_remaining.days}d ${goal.time_remaining.hours}h`
                  : `${goal.time_remaining.hours}h ${goal.time_remaining.minutes}m`
                }
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const GamificationDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Achievement data
  const [recentAchievements, setRecentAchievements] = useState<UserAchievement[]>([]);
  const [unclaimedAchievements, setUnclaimedAchievements] = useState<UserAchievement[]>([]);
  const [achievementStats, setAchievementStats] = useState<any>({});
  const [availableAchievements, setAvailableAchievements] = useState<AchievementProgress[]>([]);
  
  // Goal data
  const [activeGoals, setActiveGoals] = useState<GoalProgress[]>([]);
  const [goalStats, setGoalStats] = useState<any>({});
  
  // Credit data
  const [creditStats, setCreditStats] = useState<any>({});
  const [creditHistory, setCreditHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      const [
        recentAchievementsData,
        unclaimedAchievementsData,
        achievementStatsData,
        availableAchievementsData,
        activeGoalsData,
        goalStatsData,
        creditStatsData,
        creditHistoryData
      ] = await Promise.all([
        achievementService.getRecentAchievements(user.id),
        achievementService.getUnclaimedAchievements(user.id),
        achievementService.getAchievementStats(user.id),
        achievementService.getAvailableAchievements(user.id),
        goalService.getUserGoalsWithProgress(user.id),
        goalService.getGoalStats(user.id),
        creditService.getCreditStats(user.id),
        creditService.getCreditHistory(user.id, 10)
      ]);

      setRecentAchievements(recentAchievementsData);
      setUnclaimedAchievements(unclaimedAchievementsData);
      setAchievementStats(achievementStatsData);
      setAvailableAchievements(availableAchievementsData);
      setActiveGoals(activeGoalsData);
      setGoalStats(goalStatsData);
      setCreditStats(creditStatsData);
      setCreditHistory(creditHistoryData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimAchievement = async (achievementId: string) => {
    if (!user?.id) return;
    
    try {
      const success = await achievementService.claimAchievement(user.id, achievementId);
      if (success) {
        toast.success('Achievement claimed successfully!');
        loadDashboardData(); // Refresh data
      } else {
        toast.error('Failed to claim achievement');
      }
    } catch (error) {
      console.error('Error claiming achievement:', error);
      toast.error('Failed to claim achievement');
    }
  };

  const topAchievements = availableAchievements
    .filter(a => !a.is_completed && a.current_progress > 0)
    .sort((a, b) => b.progress_percentage - a.progress_percentage)
    .slice(0, 6);

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Progress Dashboard</h1>
        <p className="text-muted-foreground">
          Track your achievements, goals, and rewards
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Credits Balance"
          value={creditStats.current_balance || 0}
          icon={<Coins className="h-4 w-4 text-yellow-500" />}
          trend={{
            value: Math.round(((creditStats.avg_monthly_earned || 0) / Math.max(creditStats.current_balance || 1, 1)) * 100),
            isPositive: (creditStats.avg_monthly_earned || 0) > 0
          }}
          className="border-yellow-200 dark:border-yellow-800"
        />
        
        <StatsCard
          title="Achievements Earned"
          value={achievementStats.total_earned || 0}
          icon={<Trophy className="h-4 w-4 text-purple-500" />}
          trend={{
            value: achievementStats.recent_streak || 0,
            isPositive: (achievementStats.recent_streak || 0) > 0
          }}
          className="border-purple-200 dark:border-purple-800"
        />
        
        <StatsCard
          title="Current Streak"
          value={`${goalStats.current_streak || 0} days`}
          icon={<Zap className="h-4 w-4 text-orange-500" />}
          trend={{
            value: Math.round(((goalStats.current_streak || 0) / Math.max(goalStats.best_streak || 1, 1)) * 100),
            isPositive: (goalStats.current_streak || 0) > 0
          }}
          className="border-orange-200 dark:border-orange-800"
        />
        
        <StatsCard
          title="Weekly Goals"
          value={`${goalStats.completion_rate_this_week || 0}%`}
          icon={<Target className="h-4 w-4 text-green-500" />}
          trend={{
            value: (goalStats.completion_rate_this_week || 0) - (goalStats.completion_rate_this_month || 0),
            isPositive: (goalStats.completion_rate_this_week || 0) >= (goalStats.completion_rate_this_month || 0)
          }}
          className="border-green-200 dark:border-green-800"
        />
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">
            Achievements {unclaimedAchievements.length > 0 && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {unclaimedAchievements.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="credits">Credits</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentAchievements.length > 0 ? (
                  <div className="space-y-3">
                    {recentAchievements.slice(0, 3).map(achievement => (
                      <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <AchievementBadge 
                          achievement={achievement.achievement!} 
                          size="small" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {achievement.achievement!.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(achievement.earned_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className="bg-yellow-500 text-yellow-900">
                          +{achievement.credits_earned}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent achievements</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Active Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeGoals.length > 0 ? (
                  <div className="space-y-3">
                    {activeGoals.slice(0, 3).map(goal => (
                      <div key={goal.goal.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {goal.goal.goal_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {goal.goal.current_value}/{goal.goal.target_value}
                          </span>
                        </div>
                        <Progress value={goal.progress_percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No active goals</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Achievement Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Achievement Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topAchievements.map(achievement => (
                  <AchievementCard
                    key={achievement.achievement_id}
                    achievement={achievement}
                    compact
                    showProgress
                  />
                ))}
              </div>
              
              {topAchievements.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No achievements in progress</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          {unclaimedAchievements.length > 0 && (
            <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <Award className="w-5 h-5" />
                  Unclaimed Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {unclaimedAchievements.map(achievement => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement.achievement!}
                      isCompleted={true}
                      canClaim={true}
                      onClaim={() => handleClaimAchievement(achievement.achievement_id)}
                      compact
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Achievement Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(achievementStats.completion_by_category || {}).map(([category, stats]: [string, any]) => (
                  <div key={category} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium capitalize">
                        {category.replace(/_/g, ' ')}
                      </h4>
                      <Badge variant="outline">
                        {stats.earned}/{stats.total}
                      </Badge>
                    </div>
                    <Progress value={stats.percentage} className="h-2 mb-2" />
                    <p className="text-xs text-muted-foreground">
                      {stats.percentage}% complete
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeGoals.map(goal => (
              <GoalCard key={goal.goal.id} goal={goal} />
            ))}
          </div>

          {activeGoals.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-2">No active goals</p>
                <p className="text-sm text-muted-foreground">
                  Goals will automatically be created based on your activity
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Credits Tab */}
        <TabsContent value="credits" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  Credit Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {creditStats.current_balance || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Current Balance
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Earned</span>
                    <span className="font-medium">{creditStats.total_earned || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Spent</span>
                    <span className="font-medium">{creditStats.total_spent || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>This Month</span>
                    <span className="font-medium text-green-600">
                      +{creditStats.avg_monthly_earned || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {creditHistory.length > 0 ? (
                  <div className="space-y-3">
                    {creditHistory.map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-2 h-2 rounded-full',
                            transaction.amount > 0 ? 'bg-green-500' : 'bg-red-500'
                          )} />
                          <div>
                            <p className="font-medium text-sm">
                              {transaction.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className={cn(
                          'font-bold text-sm',
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        )}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Coins className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No transaction history</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};