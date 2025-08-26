import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserGoal {
  id: string;
  user_id: string;
  goal_type: 'daily_story' | 'daily_engagement' | 'daily_template_interaction' | 
            'weekly_stories' | 'weekly_engagement' | 'weekly_template_creation' |
            'monthly_challenge' | 'monthly_social_activity';
  target_value: number;
  current_value: number;
  period_start: string;
  period_end: string;
  period_identifier: string;
  completed: boolean;
  completed_at?: string;
  credits_reward: number;
  bonus_multiplier: number;
  created_at: string;
  updated_at: string;
}

export interface GoalProgress {
  goal: UserGoal;
  progress_percentage: number;
  time_remaining: {
    days: number;
    hours: number;
    minutes: number;
  };
  is_achievable: boolean;
}

class GoalService {
  /**
   * Get user's current active goals
   */
  async getUserActiveGoals(userId: string): Promise<UserGoal[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', userId)
        .gte('period_end', today)
        .order('period_end', { ascending: true });

      if (error) {
        console.error('Error fetching user goals:', error);
        return []; // Return empty array instead of throwing
      }

      return data || [];
    } catch (error) {
      console.error('User goals table not available:', error);
      return []; // Return empty array as fallback
    }
  }

  /**
   * Get user's goals with progress information
   */
  async getUserGoalsWithProgress(userId: string): Promise<GoalProgress[]> {
    const goals = await this.getUserActiveGoals(userId);
    const now = new Date();

    return goals.map(goal => {
      const endDate = new Date(goal.period_end + 'T23:59:59');
      const timeRemaining = endDate.getTime() - now.getTime();
      
      const days = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60 * 24)));
      const hours = Math.max(0, Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
      const minutes = Math.max(0, Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60)));

      const progressPercentage = Math.min(100, Math.round((goal.current_value / goal.target_value) * 100));
      
      // Determine if goal is still achievable based on time remaining and typical user activity
      const isAchievable = timeRemaining > 0 && (
        goal.completed || 
        progressPercentage >= 80 || 
        (days > 0 && (goal.target_value - goal.current_value) <= days * 2) // Rough estimate
      );

      return {
        goal,
        progress_percentage: progressPercentage,
        time_remaining: { days, hours, minutes },
        is_achievable: isAchievable
      };
    });
  }

  /**
   * Get goals by type (daily, weekly, monthly)
   */
  async getUserGoalsByType(userId: string, type: 'daily' | 'weekly' | 'monthly'): Promise<GoalProgress[]> {
    const allGoals = await this.getUserGoalsWithProgress(userId);
    return allGoals.filter(goalProgress => 
      goalProgress.goal.goal_type.startsWith(type)
    );
  }

  /**
   * Initialize daily goals for a user
   */
  async initializeDailyGoals(userId: string, date?: Date): Promise<UserGoal[]> {
    const goalDate = date || new Date();
    const { error } = await supabase.rpc('create_daily_goals', {
      user_uuid: userId,
      goal_date: goalDate.toISOString().split('T')[0]
    });

    if (error) {
      console.error('Error initializing daily goals:', error);
      throw new Error(`Failed to initialize daily goals: ${error.message}`);
    }

    return this.getUserGoalsByType(userId, 'daily').then(goals => goals.map(g => g.goal));
  }

  /**
   * Initialize weekly goals for a user
   */
  async initializeWeeklyGoals(userId: string, weekStart?: Date): Promise<UserGoal[]> {
    const startDate = weekStart || this.getWeekStart(new Date());
    const { error } = await supabase.rpc('create_weekly_goals', {
      user_uuid: userId,
      week_start: startDate.toISOString().split('T')[0]
    });

    if (error) {
      console.error('Error initializing weekly goals:', error);
      throw new Error(`Failed to initialize weekly goals: ${error.message}`);
    }

    return this.getUserGoalsByType(userId, 'weekly').then(goals => goals.map(g => g.goal));
  }

  /**
   * Update goal progress
   */
  async updateGoalProgress(
    userId: string, 
    goalType: string, 
    incrementValue: number = 1
  ): Promise<boolean> {
    try {
      // Get the current period identifier
      const periodId = this.getPeriodIdentifier(goalType);
      
      // Update the goal
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('goal_type', goalType)
        .eq('period_identifier', periodId)
        .single();

      if (error || !data) {
        // Goal doesn't exist, create it first
        if (goalType.startsWith('daily')) {
          await this.initializeDailyGoals(userId);
        } else if (goalType.startsWith('weekly')) {
          await this.initializeWeeklyGoals(userId);
        }
        return false;
      }

      const newValue = data.current_value + incrementValue;
      const isCompleted = newValue >= data.target_value;

      const { error: updateError } = await supabase
        .from('user_goals')
        .update({
          current_value: newValue,
          completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : data.completed_at,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);

      if (updateError) {
        console.error('Error updating goal progress:', updateError);
        return false;
      }

      // Award credits if goal is completed
      if (isCompleted && !data.completed && data.credits_reward > 0) {
        await this.awardGoalCredits(userId, data.id, data.credits_reward);
      }

      return true;
    } catch (error) {
      console.error('Error updating goal progress:', error);
      return false;
    }
  }

  /**
   * Award credits for completed goal
   */
  private async awardGoalCredits(userId: string, goalId: string, creditsAmount: number): Promise<void> {
    try {
      // Insert credit transaction
      const { error } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          transaction_type: 'goal_completion',
          amount: creditsAmount,
          description: `Goal completion reward`,
          reference_id: goalId,
          reference_type: 'goal'
        });

      if (error) {
        console.error('Error awarding goal credits:', error);
      }

      // Update user progress stats
      await supabase.rpc('update_user_progress_stats', {
        user_uuid: userId,
        stat_type: 'goal_completed',
        increment_value: creditsAmount
      });
    } catch (error) {
      console.error('Error awarding goal credits:', error);
    }
  }

  /**
   * Get completed goals for a user
   */
  async getCompletedGoals(
    userId: string, 
    limit: number = 20,
    daysBack: number = 30
  ): Promise<UserGoal[]> {
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('completed_at', startDate)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching completed goals:', error);
      throw new Error(`Failed to fetch completed goals: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get goal statistics for a user
   */
  async getGoalStats(userId: string): Promise<{
    total_goals_completed: number;
    current_streak: number;
    best_streak: number;
    total_credits_from_goals: number;
    completion_rate_this_week: number;
    completion_rate_this_month: number;
  }> {
    const [completedGoals, activeGoals, progressStats] = await Promise.all([
      this.getCompletedGoals(userId, 100, 30),
      this.getUserActiveGoals(userId),
      this.getUserProgressStats(userId)
    ]);

    // Calculate current streak (consecutive days with completed goals)
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayGoalsCompleted = completedGoals.filter(goal => {
        const completedDate = new Date(goal.completed_at!);
        return completedDate.toDateString() === checkDate.toDateString();
      });

      if (dayGoalsCompleted.length > 0) {
        tempStreak++;
        if (i === 0 || currentStreak === i) {
          currentStreak = tempStreak;
        }
      } else {
        bestStreak = Math.max(bestStreak, tempStreak);
        tempStreak = 0;
        if (i === 0) {
          currentStreak = 0;
        }
      }
    }
    bestStreak = Math.max(bestStreak, tempStreak);

    // Calculate completion rates
    const thisWeekGoals = activeGoals.filter(goal => 
      goal.goal_type.startsWith('weekly') || goal.goal_type.startsWith('daily')
    );
    const thisWeekCompleted = thisWeekGoals.filter(goal => goal.completed);
    const weeklyCompletionRate = thisWeekGoals.length > 0 ? 
      Math.round((thisWeekCompleted.length / thisWeekGoals.length) * 100) : 0;

    const thisMonthGoals = completedGoals.filter(goal => {
      const completedDate = new Date(goal.completed_at!);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      return completedDate >= monthStart;
    });
    const monthlyCompletionRate = thisMonthGoals.length > 0 ? 100 : 0; // Simplified

    return {
      total_goals_completed: completedGoals.length,
      current_streak: currentStreak,
      best_streak: bestStreak,
      total_credits_from_goals: progressStats?.credits_earned_from_goals || 0,
      completion_rate_this_week: weeklyCompletionRate,
      completion_rate_this_month: monthlyCompletionRate
    };
  }

  /**
   * Reset expired goals and create new ones
   */
  async resetAndCreateGoals(userId: string): Promise<void> {
    const today = new Date();
    
    // Initialize daily goals if not exists
    await this.initializeDailyGoals(userId, today);
    
    // Initialize weekly goals if it's Monday or no weekly goals exist
    if (today.getDay() === 1) { // Monday
      await this.initializeWeeklyGoals(userId, this.getWeekStart(today));
    }
  }

  /**
   * Utility functions
   */
  private getPeriodIdentifier(goalType: string): string {
    const now = new Date();
    
    if (goalType.startsWith('daily')) {
      return now.toISOString().split('T')[0]; // YYYY-MM-DD
    } else if (goalType.startsWith('weekly')) {
      return this.getWeekIdentifier(now); // YYYY-WXX
    } else if (goalType.startsWith('monthly')) {
      return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`; // YYYY-MM
    }
    
    return now.toISOString().split('T')[0];
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  private getWeekIdentifier(date: Date): string {
    const weekStart = this.getWeekStart(date);
    const year = weekStart.getFullYear();
    const week = Math.ceil(((weekStart.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }

  private async getUserProgressStats(userId: string): Promise<any> {
    const { data } = await supabase
      .from('user_progress_stats')
      .select('credits_earned_from_goals')
      .eq('user_id', userId)
      .single();

    return data;
  }
}

export const goalService = new GoalService();