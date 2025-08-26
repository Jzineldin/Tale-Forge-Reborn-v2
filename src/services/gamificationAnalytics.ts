import { supabase } from '@/lib/supabase';
import { monitoring } from '@/utils/monitoring';

// Gamification-specific analytics interfaces
export interface GamificationMetrics {
  userEngagement: {
    templateCreationRate: number;
    averageAchievementProgress: number;
    goalCompletionRate: number;
    weeklyActiveUsers: number;
    streakRetentionRate: number;
  };
  businessMetrics: {
    creditPurchases: {
      totalRevenue: number;
      averageTransaction: number;
      conversionRate: number;
      repeatPurchaseRate: number;
    };
    subscriptionUpgrades: {
      totalUpgrades: number;
      upgradeConversionRate: number;
      churnRate: number;
      revenueImpact: number;
    };
  };
  contentMetrics: {
    templateUsage: {
      mostPopularTemplates: Array<{ id: string; name: string; usageCount: number }>;
      templateCompletionRate: number;
      userGeneratedTemplates: number;
      templateLikeRate: number;
    };
    achievementProgress: {
      mostUnlockedAchievements: Array<{ id: string; name: string; unlockCount: number }>;
      averageProgressPerUser: number;
      achievementRetentionImpact: number;
    };
  };
  systemHealth: {
    apiResponseTimes: {
      templates: number;
      achievements: number;
      goals: number;
      credits: number;
    };
    errorRates: {
      templateCreation: number;
      creditTransactions: number;
      achievementUnlocks: number;
    };
    databasePerformance: {
      querySpeed: number;
      connectionHealth: number;
      indexEfficiency: number;
    };
  };
}

export interface TimeSeriesData {
  date: string;
  templateCreations: number;
  achievementUnlocks: number;
  goalCompletions: number;
  creditSpent: number;
  newUsers: number;
}

export interface UserJourneyAnalytics {
  registrationToFirstTemplate: number; // Average time in minutes
  templateToFirstAchievement: number;
  achievementToSubscriptionUpgrade: number;
  averageSessionLength: number;
  bounceBateFromGamification: number;
}

class GamificationAnalyticsService {
  private static instance: GamificationAnalyticsService;

  static getInstance(): GamificationAnalyticsService {
    if (!GamificationAnalyticsService.instance) {
      GamificationAnalyticsService.instance = new GamificationAnalyticsService();
    }
    return GamificationAnalyticsService.instance;
  }

  /**
   * Check admin access for analytics
   */
  private async checkAdminAccess(): Promise<boolean> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return false;

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      return !profileError && profile?.role === 'admin';
    } catch (error) {
      console.error('Error checking admin access:', error);
      return false;
    }
  }

  /**
   * Get comprehensive gamification metrics
   */
  async getGamificationMetrics(): Promise<GamificationMetrics> {
    if (!(await this.checkAdminAccess())) {
      throw new Error('Admin access required for analytics data');
    }

    try {
      const startTime = performance.now();
      
      const [
        userEngagement,
        businessMetrics, 
        contentMetrics,
        systemHealth
      ] = await Promise.all([
        this.getUserEngagementMetrics(),
        this.getBusinessMetrics(),
        this.getContentMetrics(),
        this.getSystemHealthMetrics()
      ]);

      const endTime = performance.now();
      monitoring.trackBusinessMetric('analytics_query_time', endTime - startTime, {
        query_type: 'gamification_metrics'
      });

      return {
        userEngagement,
        businessMetrics,
        contentMetrics,
        systemHealth
      };
    } catch (error) {
      monitoring.reportError(error as Error, {
        context: 'gamification_metrics',
        function: 'getGamificationMetrics'
      });
      throw error;
    }
  }

  /**
   * Get user engagement metrics
   */
  private async getUserEngagementMetrics() {
    const { data, error } = await supabase.rpc('get_gamification_user_engagement');
    
    if (error) {
      console.error('Error fetching user engagement metrics:', error);
      throw new Error(`Failed to fetch user engagement metrics: ${error.message}`);
    }

    const metrics = data?.[0] || {};
    return {
      templateCreationRate: metrics.template_creation_rate || 0,
      averageAchievementProgress: metrics.avg_achievement_progress || 0,
      goalCompletionRate: metrics.goal_completion_rate || 0,
      weeklyActiveUsers: metrics.weekly_active_users || 0,
      streakRetentionRate: metrics.streak_retention_rate || 0
    };
  }

  /**
   * Get business metrics
   */
  private async getBusinessMetrics() {
    const [creditData, subscriptionData] = await Promise.all([
      supabase.rpc('get_credit_business_metrics'),
      supabase.rpc('get_subscription_business_metrics')
    ]);

    if (creditData.error) {
      throw new Error(`Failed to fetch credit metrics: ${creditData.error.message}`);
    }
    if (subscriptionData.error) {
      throw new Error(`Failed to fetch subscription metrics: ${subscriptionData.error.message}`);
    }

    const creditMetrics = creditData.data?.[0] || {};
    const subMetrics = subscriptionData.data?.[0] || {};

    return {
      creditPurchases: {
        totalRevenue: creditMetrics.total_revenue || 0,
        averageTransaction: creditMetrics.avg_transaction || 0,
        conversionRate: creditMetrics.conversion_rate || 0,
        repeatPurchaseRate: creditMetrics.repeat_purchase_rate || 0
      },
      subscriptionUpgrades: {
        totalUpgrades: subMetrics.total_upgrades || 0,
        upgradeConversionRate: subMetrics.upgrade_conversion_rate || 0,
        churnRate: subMetrics.churn_rate || 0,
        revenueImpact: subMetrics.revenue_impact || 0
      }
    };
  }

  /**
   * Get content metrics
   */
  private async getContentMetrics() {
    const [templateData, achievementData] = await Promise.all([
      supabase.rpc('get_template_content_metrics'),
      supabase.rpc('get_achievement_content_metrics')
    ]);

    if (templateData.error) {
      throw new Error(`Failed to fetch template metrics: ${templateData.error.message}`);
    }
    if (achievementData.error) {
      throw new Error(`Failed to fetch achievement metrics: ${achievementData.error.message}`);
    }

    const templateMetrics = templateData.data?.[0] || {};
    const achievementMetrics = achievementData.data?.[0] || {};

    return {
      templateUsage: {
        mostPopularTemplates: templateMetrics.popular_templates || [],
        templateCompletionRate: templateMetrics.completion_rate || 0,
        userGeneratedTemplates: templateMetrics.user_generated_count || 0,
        templateLikeRate: templateMetrics.like_rate || 0
      },
      achievementProgress: {
        mostUnlockedAchievements: achievementMetrics.popular_achievements || [],
        averageProgressPerUser: achievementMetrics.avg_progress_per_user || 0,
        achievementRetentionImpact: achievementMetrics.retention_impact || 0
      }
    };
  }

  /**
   * Get system health metrics
   */
  private async getSystemHealthMetrics() {
    const { data, error } = await supabase.rpc('get_gamification_system_health');
    
    if (error) {
      console.error('Error fetching system health metrics:', error);
      throw new Error(`Failed to fetch system health metrics: ${error.message}`);
    }

    const metrics = data?.[0] || {};
    
    return {
      apiResponseTimes: {
        templates: metrics.template_api_time || 0,
        achievements: metrics.achievement_api_time || 0,
        goals: metrics.goal_api_time || 0,
        credits: metrics.credit_api_time || 0
      },
      errorRates: {
        templateCreation: metrics.template_error_rate || 0,
        creditTransactions: metrics.credit_error_rate || 0,
        achievementUnlocks: metrics.achievement_error_rate || 0
      },
      databasePerformance: {
        querySpeed: metrics.avg_query_time || 0,
        connectionHealth: metrics.connection_health || 0,
        indexEfficiency: metrics.index_efficiency || 0
      }
    };
  }

  /**
   * Get time series data for charts
   */
  async getTimeSeriesData(days: number = 30): Promise<TimeSeriesData[]> {
    if (!(await this.checkAdminAccess())) {
      throw new Error('Admin access required for analytics data');
    }

    try {
      const { data, error } = await supabase.rpc('get_gamification_time_series', {
        days_back: days
      });

      if (error) {
        throw new Error(`Failed to fetch time series data: ${error.message}`);
      }

      return (data || []).map((item: any) => ({
        date: item.date,
        templateCreations: item.template_creations || 0,
        achievementUnlocks: item.achievement_unlocks || 0,
        goalCompletions: item.goal_completions || 0,
        creditSpent: item.credit_spent || 0,
        newUsers: item.new_users || 0
      }));
    } catch (error) {
      monitoring.reportError(error as Error, {
        context: 'time_series_data',
        days
      });
      throw error;
    }
  }

  /**
   * Get user journey analytics
   */
  async getUserJourneyAnalytics(): Promise<UserJourneyAnalytics> {
    if (!(await this.checkAdminAccess())) {
      throw new Error('Admin access required for analytics data');
    }

    try {
      const { data, error } = await supabase.rpc('get_user_journey_analytics');

      if (error) {
        throw new Error(`Failed to fetch user journey analytics: ${error.message}`);
      }

      const metrics = data?.[0] || {};
      
      return {
        registrationToFirstTemplate: metrics.reg_to_first_template || 0,
        templateToFirstAchievement: metrics.template_to_first_achievement || 0,
        achievementToSubscriptionUpgrade: metrics.achievement_to_upgrade || 0,
        averageSessionLength: metrics.avg_session_length || 0,
        bounceBateFromGamification: metrics.gamification_bounce_rate || 0
      };
    } catch (error) {
      monitoring.reportError(error as Error, {
        context: 'user_journey_analytics'
      });
      throw error;
    }
  }

  /**
   * Track specific gamification events with detailed metadata
   */
  async trackGamificationEvent(eventType: string, eventData: Record<string, any>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const enrichedData = {
        ...eventData,
        user_id: user?.id,
        timestamp: new Date().toISOString(),
        session_id: this.getSessionId(),
        user_agent: navigator.userAgent,
        page_url: window.location.href
      };

      // Track in database
      const { error } = await supabase
        .from('gamification_events')
        .insert([{
          event_type: eventType,
          event_data: enrichedData,
          user_id: user?.id
        }]);

      if (error) {
        console.error('Error tracking gamification event:', error);
      }

      // Track in monitoring
      monitoring.trackGamificationEvent(eventType, enrichedData);

      // Track specific business events
      if (eventType === 'credit_purchase') {
        monitoring.trackBusinessMetric('credit_revenue', eventData.amount, {
          credit_count: eventData.credits,
          user_id: user?.id
        });
      } else if (eventType === 'subscription_upgrade') {
        monitoring.trackBusinessMetric('subscription_revenue', eventData.amount, {
          plan: eventData.plan,
          user_id: user?.id
        });
      }

    } catch (error) {
      console.error('Error tracking gamification event:', error);
      monitoring.reportError(error as Error, {
        context: 'track_gamification_event',
        event_type: eventType
      });
    }
  }

  /**
   * Get or create session ID
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('tale_forge_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('tale_forge_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Generate alert conditions for monitoring
   */
  async checkAlertConditions() {
    try {
      if (!(await this.checkAdminAccess())) {
        return;
      }

      const metrics = await this.getGamificationMetrics();
      
      // Define alert thresholds
      const alerts = [];

      // User engagement alerts
      if (metrics.userEngagement.goalCompletionRate < 50) {
        alerts.push({
          type: 'warning',
          metric: 'goal_completion_rate',
          value: metrics.userEngagement.goalCompletionRate,
          threshold: 50,
          message: 'Goal completion rate is below 50%'
        });
      }

      // Business metric alerts
      if (metrics.businessMetrics.creditPurchases.conversionRate < 5) {
        alerts.push({
          type: 'critical',
          metric: 'credit_conversion_rate',
          value: metrics.businessMetrics.creditPurchases.conversionRate,
          threshold: 5,
          message: 'Credit purchase conversion rate is critically low'
        });
      }

      // System health alerts
      if (metrics.systemHealth.apiResponseTimes.templates > 2000) {
        alerts.push({
          type: 'critical',
          metric: 'template_api_response_time',
          value: metrics.systemHealth.apiResponseTimes.templates,
          threshold: 2000,
          message: 'Template API response time is too high'
        });
      }

      // Log alerts to monitoring
      for (const alert of alerts) {
        monitoring.trackEvent('system_alert', 'monitoring', alert);
        
        if (alert.type === 'critical') {
          monitoring.reportError(new Error(`Critical alert: ${alert.message}`), {
            alert_data: alert
          });
        }
      }

      return alerts;
    } catch (error) {
      monitoring.reportError(error as Error, {
        context: 'check_alert_conditions'
      });
    }
  }
}

export const gamificationAnalytics = GamificationAnalyticsService.getInstance();