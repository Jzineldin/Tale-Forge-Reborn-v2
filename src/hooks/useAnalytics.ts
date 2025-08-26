import { useState, useEffect } from 'react';
import { analyticsService, AnalyticsData } from '@/services/analyticsService';

export interface UseAnalyticsReturn {
  analyticsData: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  refreshAnalytics: () => Promise<void>;
}

export const useAnalytics = (): UseAnalyticsReturn => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = async () => {
    try {
      setError(null);
      const data = await analyticsService.getAllAnalyticsData();
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    }
  };

  const refreshAnalytics = async () => {
    setLoading(true);
    await fetchAnalyticsData();
    setLoading(false);
  };

  // Initialize analytics data
  useEffect(() => {
    const initializeAnalytics = async () => {
      setLoading(true);
      await fetchAnalyticsData();
      setLoading(false);
    };

    initializeAnalytics();
  }, []);

  return {
    analyticsData,
    loading,
    error,
    refreshAnalytics
  };
};

// Hook for tracking analytics events
export const useAnalyticsTracking = () => {
  const trackEvent = async (
    eventType: string,
    eventCategory: string,
    eventData: Record<string, any> = {},
    pageUrl?: string
  ) => {
    await analyticsService.trackEvent(eventType, eventCategory, eventData, pageUrl);
  };

  const trackPageView = async (pageName: string, pageUrl?: string) => {
    await trackEvent('page_view', 'user_action', { page_name: pageName }, pageUrl);
  };

  const trackStoryCreation = async (storyId: string, genre: string, targetAge: number) => {
    await trackEvent('story_created', 'content', {
      story_id: storyId,
      genre,
      target_age: targetAge
    });
  };

  const trackStoryCompletion = async (storyId: string, segmentCount: number, creditsUsed: number) => {
    await trackEvent('story_completed', 'content', {
      story_id: storyId,
      segment_count: segmentCount,
      credits_used: creditsUsed
    });
  };

  const trackSubscription = async (planType: string, action: 'upgrade' | 'downgrade' | 'cancel') => {
    await trackEvent('subscription_change', 'revenue', {
      plan_type: planType,
      action
    });
  };

  const trackCreditPurchase = async (creditCount: number, amount: number) => {
    await trackEvent('credit_purchase', 'revenue', {
      credit_count: creditCount,
      amount
    });
  };

  const trackFounderRegistration = async (founderNumber: number, tier: string) => {
    await trackEvent('founder_registered', 'user_action', {
      founder_number: founderNumber,
      tier
    });
  };

  const startSession = async () => {
    await analyticsService.startSession();
  };

  return {
    trackEvent,
    trackPageView,
    trackStoryCreation,
    trackStoryCompletion,
    trackSubscription,
    trackCreditPurchase,
    trackFounderRegistration,
    startSession
  };
};