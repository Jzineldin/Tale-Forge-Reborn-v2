import { supabase } from '@/lib/supabase';

export interface UserEngagementMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  avgSessionDuration: string;
  avgStoriesPerUser: number;
  userRetention30d: number;
  storyCompletionRate: number;
}

export interface ContentAnalytics {
  totalStories: number;
  publishedStories: number;
  draftStories: number;
  reportedStories: number;
  popularGenres: Array<{ genre: string; count: number; percentage: number }>;
  ageGroupDistribution: Array<{ ageGroup: string; count: number; percentage: number }>;
}

export interface SubscriptionMetrics {
  totalRevenue: number;
  averageRevenuePerUser: number;
  churnRate: number;
  free: { users: number; percentage: number; revenue: number };
  premium: { users: number; percentage: number; revenue: number };
  pro: { users: number; percentage: number; revenue: number };
}

export interface SystemMetrics {
  apiResponseTime: number;
  serverUptime: number;
  errorRate: number;
  databasePerformance: number;
  storageUsage: number;
}

export interface UserGrowthData {
  date: string;
  newUsers: number;
  totalUsers: number;
  retainedUsers: number;
}

export interface StoryMetricsData {
  date: string;
  storiesCreated: number;
  storiesCompleted: number;
  storiesShared: number;
}

export interface AnalyticsData {
  userEngagement: UserEngagementMetrics;
  subscriptionMetrics: SubscriptionMetrics;
  contentAnalytics: ContentAnalytics;
  systemMetrics: SystemMetrics;
  userGrowth: UserGrowthData[];
  storyMetrics: StoryMetricsData[];
}

class AnalyticsService {
  /**
   * Check if current user has admin access
   */
  private async checkAdminAccess(): Promise<boolean> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return false;
      }

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        return false;
      }

      return profile.role === 'admin';
    } catch (error) {
      console.error('Error checking admin access:', error);
      return false;
    }
  }

  /**
   * Get user engagement metrics
   */
  async getUserEngagementMetrics(): Promise<UserEngagementMetrics> {
    try {
      const hasAccess = await this.checkAdminAccess();
      if (!hasAccess) {
        throw new Error('Admin access required for analytics data');
      }

      const { data, error } = await supabase.rpc('get_user_engagement_metrics');
      
      if (error) {
        console.error('Error fetching user engagement metrics:', error);
        throw new Error(`Failed to fetch user engagement metrics: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        // Return default values if no data
        return {
          dailyActiveUsers: 0,
          weeklyActiveUsers: 0,
          monthlyActiveUsers: 0,
          avgSessionDuration: '0m 0s',
          avgStoriesPerUser: 0,
          userRetention30d: 0,
          storyCompletionRate: 0
        };
      }
      
      const metrics = data[0];
      return {
        dailyActiveUsers: metrics.daily_active_users || 0,
        weeklyActiveUsers: metrics.weekly_active_users || 0,
        monthlyActiveUsers: metrics.monthly_active_users || 0,
        avgSessionDuration: metrics.avg_session_duration || '0m 0s',
        avgStoriesPerUser: metrics.avg_stories_per_user || 0,
        userRetention30d: metrics.user_retention_30d || 0,
        storyCompletionRate: metrics.story_completion_rate || 0
      };
    } catch (error) {
      console.error('AnalyticsService.getUserEngagementMetrics error:', error);
      throw error;
    }
  }

  /**
   * Get content analytics
   */
  async getContentAnalytics(): Promise<ContentAnalytics> {
    try {
      const hasAccess = await this.checkAdminAccess();
      if (!hasAccess) {
        throw new Error('Admin access required for analytics data');
      }

      const { data, error } = await supabase.rpc('get_content_analytics');
      
      if (error) {
        console.error('Error fetching content analytics:', error);
        throw new Error(`Failed to fetch content analytics: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        return {
          totalStories: 0,
          publishedStories: 0,
          draftStories: 0,
          reportedStories: 0,
          popularGenres: [],
          ageGroupDistribution: []
        };
      }
      
      const analytics = data[0];
      return {
        totalStories: analytics.total_stories || 0,
        publishedStories: analytics.published_stories || 0,
        draftStories: analytics.draft_stories || 0,
        reportedStories: analytics.reported_stories || 0,
        popularGenres: analytics.popular_genres || [],
        ageGroupDistribution: analytics.age_group_distribution || []
      };
    } catch (error) {
      console.error('AnalyticsService.getContentAnalytics error:', error);
      throw error;
    }
  }

  /**
   * Get subscription metrics
   */
  async getSubscriptionMetrics(): Promise<SubscriptionMetrics> {
    try {
      const hasAccess = await this.checkAdminAccess();
      if (!hasAccess) {
        throw new Error('Admin access required for analytics data');
      }

      const { data, error } = await supabase.rpc('get_subscription_metrics');
      
      if (error) {
        console.error('Error fetching subscription metrics:', error);
        throw new Error(`Failed to fetch subscription metrics: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        return {
          totalRevenue: 0,
          averageRevenuePerUser: 0,
          churnRate: 0,
          free: { users: 0, percentage: 0, revenue: 0 },
          premium: { users: 0, percentage: 0, revenue: 0 },
          pro: { users: 0, percentage: 0, revenue: 0 }
        };
      }
      
      const metrics = data[0];
      return {
        totalRevenue: metrics.total_revenue || 0,
        averageRevenuePerUser: metrics.average_revenue_per_user || 0,
        churnRate: metrics.churn_rate || 0,
        free: {
          users: metrics.free_users || 0,
          percentage: metrics.free_percentage || 0,
          revenue: metrics.free_revenue || 0
        },
        premium: {
          users: metrics.premium_users || 0,
          percentage: metrics.premium_percentage || 0,
          revenue: metrics.premium_revenue || 0
        },
        pro: {
          users: metrics.pro_users || 0,
          percentage: metrics.pro_percentage || 0,
          revenue: metrics.pro_revenue || 0
        }
      };
    } catch (error) {
      console.error('AnalyticsService.getSubscriptionMetrics error:', error);
      throw error;
    }
  }

  /**
   * Get system metrics
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      const hasAccess = await this.checkAdminAccess();
      if (!hasAccess) {
        throw new Error('Admin access required for analytics data');
      }

      const { data, error } = await supabase.rpc('get_system_metrics');
      
      if (error) {
        console.error('Error fetching system metrics:', error);
        throw new Error(`Failed to fetch system metrics: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        return {
          apiResponseTime: 0,
          serverUptime: 0,
          errorRate: 0,
          databasePerformance: 0,
          storageUsage: 0
        };
      }
      
      const metrics = data[0];
      return {
        apiResponseTime: metrics.api_response_time || 0,
        serverUptime: metrics.server_uptime || 0,
        errorRate: metrics.error_rate || 0,
        databasePerformance: metrics.database_performance || 0,
        storageUsage: metrics.storage_usage || 0
      };
    } catch (error) {
      console.error('AnalyticsService.getSystemMetrics error:', error);
      throw error;
    }
  }

  /**
   * Get user growth data for charts
   */
  async getUserGrowthData(): Promise<UserGrowthData[]> {
    try {
      const hasAccess = await this.checkAdminAccess();
      if (!hasAccess) {
        throw new Error('Admin access required for analytics data');
      }

      const { data, error } = await supabase.rpc('get_user_growth_data');
      
      if (error) {
        console.error('Error fetching user growth data:', error);
        throw new Error(`Failed to fetch user growth data: ${error.message}`);
      }
      
      return (data || []).map((item: any) => ({
        date: item.date,
        newUsers: item.new_users || 0,
        totalUsers: item.total_users || 0,
        retainedUsers: item.retained_users || 0
      }));
    } catch (error) {
      console.error('AnalyticsService.getUserGrowthData error:', error);
      throw error;
    }
  }

  /**
   * Get story metrics data for charts
   */
  async getStoryMetricsData(): Promise<StoryMetricsData[]> {
    try {
      const hasAccess = await this.checkAdminAccess();
      if (!hasAccess) {
        throw new Error('Admin access required for analytics data');
      }

      const { data, error } = await supabase.rpc('get_story_metrics_data');
      
      if (error) {
        console.error('Error fetching story metrics data:', error);
        throw new Error(`Failed to fetch story metrics data: ${error.message}`);
      }
      
      return (data || []).map((item: any) => ({
        date: item.date,
        storiesCreated: item.stories_created || 0,
        storiesCompleted: item.stories_completed || 0,
        storiesShared: item.stories_shared || 0
      }));
    } catch (error) {
      console.error('AnalyticsService.getStoryMetricsData error:', error);
      throw error;
    }
  }

  /**
   * Get all analytics data in one call
   */
  async getAllAnalyticsData(): Promise<AnalyticsData> {
    try {
      const hasAccess = await this.checkAdminAccess();
      if (!hasAccess) {
        throw new Error('Admin access required for analytics data');
      }

      // Fetch all analytics data in parallel for better performance
      const [
        userEngagement,
        subscriptionMetrics,
        contentAnalytics,
        systemMetrics,
        userGrowth,
        storyMetrics
      ] = await Promise.all([
        this.getUserEngagementMetrics(),
        this.getSubscriptionMetrics(),
        this.getContentAnalytics(),
        this.getSystemMetrics(),
        this.getUserGrowthData(),
        this.getStoryMetricsData()
      ]);

      return {
        userEngagement,
        subscriptionMetrics,
        contentAnalytics,
        systemMetrics,
        userGrowth,
        storyMetrics
      };
    } catch (error) {
      console.error('AnalyticsService.getAllAnalyticsData error:', error);
      throw error;
    }
  }

  /**
   * Track an analytics event
   */
  async trackEvent(
    eventType: string,
    eventCategory: string,
    eventData: Record<string, any> = {},
    pageUrl?: string
  ): Promise<void> {
    // ANALYTICS COMPLETELY DISABLED
    return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('analytics_events')
        .insert([{
          user_id: user?.id || null,
          event_type: eventType,
          event_category: eventCategory,
          event_data: eventData,
          page_url: pageUrl || window?.location?.href
        }]);
      
      if (error) {
        // Temporarily enable logging to debug the console error issue
        console.error('Error tracking analytics event:', error);
      }
    } catch (error) {
      // Silently ignore analytics errors
    }
  }

  /**
   * Start user session tracking
   */
  async startSession(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Get user agent info
      const userAgent = navigator.userAgent;
      const deviceType = /Mobile|Android|iPhone|iPad/.test(userAgent) ? 'mobile' : 'desktop';
      
      const { error } = await supabase
        .from('user_sessions')
        .insert([{
          user_id: user.id,
          device_type: deviceType,
          browser: this.getBrowserName(userAgent),
          os: this.getOSName(userAgent)
        }]);
      
      if (error) {
        // Silently ignore session errors - table might not exist yet
      }
    } catch (error) {
      // Silently ignore session errors
    }
  }

  /**
   * Helper function to get browser name
   */
  private getBrowserName(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  }

  /**
   * Helper function to get OS name
   */
  private getOSName(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Other';
  }
}

export const analyticsService = new AnalyticsService();