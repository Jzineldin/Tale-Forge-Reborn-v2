import { supabase } from '../lib/supabase';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'story_creation' | 'template_creation' | 'social_engagement' | 'special_events' | 'milestones';
  tier: 'novice' | 'intermediate' | 'advanced' | 'master' | 'legendary';
  icon: string;
  badge_color: string;
  requirement_type: string;
  requirement_value: number;
  credits_reward: number;
  tier_required: 'free' | 'creator' | 'master';
  is_active: boolean;
  is_repeatable: boolean;
  requirement_timeframe?: string;
  display_order: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  credits_earned: number;
  progress_when_earned: number;
  is_claimed: boolean;
  claimed_at?: string;
  period_identifier?: string;
  achievement?: Achievement;
}

export interface AchievementProgress {
  achievement_id: string;
  achievement_name: string;
  description: string;
  category: string;
  tier: string;
  icon: string;
  badge_color: string;
  credits_reward: number;
  requirement_type: string;
  requirement_value: number;
  current_progress: number;
  progress_percentage: number;
  is_completed: boolean;
}

export interface UserProgressStats {
  id: string;
  user_id: string;
  stories_created_total: number;
  stories_created_this_month: number;
  stories_created_this_week: number;
  stories_created_today: number;
  templates_created_total: number;
  templates_public_total: number;
  template_usage_received_total: number;
  template_likes_received_total: number;
  likes_given_total: number;
  likes_received_total: number;
  templates_saved_total: number;
  reviews_written_total: number;
  helpful_votes_received: number;
  login_streak_current: number;
  login_streak_best: number;
  last_activity_date: string;
  credits_earned_from_social: number;
  credits_earned_from_templates: number;
  credits_earned_from_achievements: number;
  credits_earned_from_goals: number;
  updated_at: string;
}

class AchievementService {
  /**
   * Get all available achievements for a user with progress
   */
  async getAvailableAchievements(userId: string): Promise<AchievementProgress[]> {
    try {
      const { data, error } = await supabase.rpc('get_available_achievements', {
        user_uuid: userId
      });

      if (error) {
        console.error('Error fetching available achievements:', error);
        // Return empty array instead of throwing to prevent app crash
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Achievement function not available:', error);
      // Return empty array as fallback
      return [];
    }
  }

  /**
   * Get user's earned achievements
   */
  async getUserAchievements(userId: string, limit: number = 50): Promise<UserAchievement[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user achievements:', error);
      throw new Error(`Failed to fetch user achievements: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get recent achievements (last 7 days)
   */
  async getRecentAchievements(userId: string): Promise<UserAchievement[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', userId)
      .gte('earned_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching recent achievements:', error);
      throw new Error(`Failed to fetch recent achievements: ${error.message}`);
    }
    return data || [];
  }

  /**
   * Get unclaimed achievements
   */
  async getUnclaimedAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const { data: userAchievements, error: userError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('is_claimed', false)
        .order('earned_at', { ascending: false });

      if (userError) {
        console.error('Error fetching user achievements:', userError);
        return []; // Return empty array instead of throwing
      }

      if (!userAchievements || userAchievements.length === 0) {
        return [];
      }

      const achievementIds = userAchievements.map(ua => ua.achievement_id);
      const { data: achievements, error: achievementError } = await supabase
        .from('achievements')
        .select('*')
        .in('id', achievementIds);

      if (achievementError) {
        console.error('Error fetching achievement details:', achievementError);
        return []; // Return empty array instead of throwing
      }

      const achievementMap = new Map(achievements?.map(a => [a.id, a]) || []);
      
      const data = userAchievements.map(ua => ({
        ...ua,
        achievement: achievementMap.get(ua.achievement_id)
      }));

      return data || [];
    } catch (error) {
      console.error('Achievement tables not available:', error);
      return []; // Return empty array as fallback
    }
  }

  /**
   * Claim an achievement and receive credits
   */
  async claimAchievement(userId: string, achievementId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .update({
          is_claimed: true,
          claimed_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .eq('is_claimed', false)
        .select()
        .single();

      if (error) {
        console.error('Error claiming achievement:', error);
        return false;
      }

      if (data && data.credits_earned > 0) {
        // Credits are automatically awarded via database triggers
        console.log(`Achievement claimed: ${data.credits_earned} credits awarded`);
      }

      return true;
    } catch (error) {
      console.error('Error claiming achievement:', error);
      return false;
    }
  }

  /**
   * Get user's progress statistics
   */
  async getUserProgressStats(userId: string): Promise<UserProgressStats | null> {
    const { data, error } = await supabase
      .from('user_progress_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found, create initial stats
        return this.initializeUserProgressStats(userId);
      }
      console.error('Error fetching user progress stats:', error);
      throw new Error(`Failed to fetch user progress stats: ${error.message}`);
    }

    return data;
  }

  /**
   * Initialize progress stats for a new user
   */
  async initializeUserProgressStats(userId: string): Promise<UserProgressStats | null> {
    const { data, error } = await supabase
      .from('user_progress_stats')
      .insert({ user_id: userId })
      .select()
      .single();

    if (error) {
      console.error('Error initializing user progress stats:', error);
      throw new Error(`Failed to initialize user progress stats: ${error.message}`);
    }

    return data;
  }

  /**
   * Update user progress and check for achievements
   */
  async updateUserProgress(userId: string, statType: string, incrementValue: number = 1): Promise<void> {
    const { error } = await supabase.rpc('update_user_progress_stats', {
      user_uuid: userId,
      stat_type: statType,
      increment_value: incrementValue
    });

    if (error) {
      console.error('Error updating user progress:', error);
      throw new Error(`Failed to update user progress: ${error.message}`);
    }
  }

  /**
   * Manually check and award achievements for a user
   */
  async checkAndAwardAchievements(userId: string, achievementType: string, currentValue?: number): Promise<void> {
    const { error } = await supabase.rpc('check_and_award_achievements', {
      user_uuid: userId,
      achievement_type: achievementType,
      current_value: currentValue
    });

    if (error) {
      console.error('Error checking achievements:', error);
      throw new Error(`Failed to check achievements: ${error.message}`);
    }
  }

  /**
   * Get achievements by category
   */
  async getAchievementsByCategory(userId: string, category: string): Promise<AchievementProgress[]> {
    const achievements = await this.getAvailableAchievements(userId);
    return achievements.filter(achievement => achievement.category === category);
  }

  /**
   * Get achievement statistics for a user
   */
  async getAchievementStats(userId: string): Promise<{
    total_earned: number;
    total_credits_from_achievements: number;
    completion_by_category: Record<string, { earned: number; total: number; percentage: number }>;
    recent_streak: number;
  }> {
    const [userAchievements, availableAchievements, progressStats] = await Promise.all([
      this.getUserAchievements(userId),
      this.getAvailableAchievements(userId),
      this.getUserProgressStats(userId)
    ]);

    const completionByCategory: Record<string, { earned: number; total: number; percentage: number }> = {};
    const categories = [...new Set(availableAchievements.map(a => a.category))];

    for (const category of categories) {
      const categoryAchievements = availableAchievements.filter(a => a.category === category);
      const earnedInCategory = categoryAchievements.filter(a => a.is_completed).length;

      completionByCategory[category] = {
        earned: earnedInCategory,
        total: categoryAchievements.length,
        percentage: Math.round((earnedInCategory / categoryAchievements.length) * 100)
      };
    }

    // Calculate recent achievement streak (achievements earned in consecutive days)
    const recentAchievements = userAchievements.slice(0, 10);
    let recentStreak = 0;
    if (recentAchievements.length > 0) {
      const today = new Date();
      let checkDate = new Date(today);

      for (let i = 0; i < 7; i++) {
        const dayAchievements = recentAchievements.filter(a => {
          const earnedDate = new Date(a.earned_at);
          return earnedDate.toDateString() === checkDate.toDateString();
        });

        if (dayAchievements.length > 0) {
          recentStreak++;
        } else {
          break;
        }

        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    return {
      total_earned: userAchievements.length,
      total_credits_from_achievements: progressStats?.credits_earned_from_achievements || 0,
      completion_by_category: completionByCategory,
      recent_streak: recentStreak
    };
  }

  /**
   * Get leaderboard for a specific achievement category
   */
  async getAchievementLeaderboard(category: string, limit: number = 10): Promise<Array<{
    user_id: string;
    user_name: string;
    achievements_count: number;
    total_credits: number;
  }>> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        user_id,
        credits_earned,
        achievement:achievements!inner(category)
      `)
      .eq('achievement.category', category)
      .eq('is_claimed', true);

    if (error) {
      console.error('Error fetching achievement leaderboard:', error);
      throw new Error(`Failed to fetch achievement leaderboard: ${error.message}`);
    }

    // Group by user and calculate totals
    const userStats: Record<string, { achievements_count: number; total_credits: number }> = {};

    for (const achievement of data || []) {
      if (!userStats[achievement.user_id]) {
        userStats[achievement.user_id] = { achievements_count: 0, total_credits: 0 };
      }
      userStats[achievement.user_id].achievements_count++;
      userStats[achievement.user_id].total_credits += achievement.credits_earned;
    }

    // Get user names and sort by achievements count
    const leaderboard = await Promise.all(
      Object.entries(userStats)
        .sort(([, a], [, b]) => b.achievements_count - a.achievements_count)
        .slice(0, limit)
        .map(async ([userId, stats]) => {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name')
            .eq('id', userId)
            .single();

          return {
            user_id: userId,
            user_name: profile?.full_name || 'Unknown User',
            achievements_count: stats.achievements_count,
            total_credits: stats.total_credits
          };
        })
    );

    return leaderboard;
  }
}

export const achievementService = new AchievementService();