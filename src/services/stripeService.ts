import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  maxStories: number;
  maxCharacters: number;
  creditsIncluded: number;
}

export interface UserSubscription {
  planId: string;
  planName: string;
  status: string;
  creditsIncluded: number;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

class StripeService {
  /**
   * Create a Stripe checkout session for subscription
   */
  async createCheckoutSession(
    planId: string,
    successUrl?: string,
    cancelUrl?: string
  ): Promise<{ sessionUrl: string; sessionId: string }> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      throw new Error('User must be authenticated');
    }

    const response = await supabase.functions.invoke('create-checkout-session', {
      body: {
        planId,
        successUrl: successUrl || `${window.location.origin}/account/billing?success=true`,
        cancelUrl: cancelUrl || `${window.location.origin}/credits`,
      },
    });

    if (response.error) {
      throw new Error(response.error.message || 'Failed to create checkout session');
    }

    return response.data;
  }

  /**
   * Cancel user's subscription at period end
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      throw new Error('User must be authenticated');
    }

    const response = await supabase.functions.invoke('manage-subscription', {
      body: {
        action: 'cancel',
        subscriptionId,
      },
    });

    if (response.error) {
      throw new Error(response.error.message || 'Failed to cancel subscription');
    }
  }

  /**
   * Reactivate a cancelled subscription
   */
  async reactivateSubscription(subscriptionId: string): Promise<void> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      throw new Error('User must be authenticated');
    }

    const response = await supabase.functions.invoke('manage-subscription', {
      body: {
        action: 'reactivate',
        subscriptionId,
      },
    });

    if (response.error) {
      throw new Error(response.error.message || 'Failed to reactivate subscription');
    }
  }

  /**
   * Open Stripe customer portal for billing management
   */
  async openCustomerPortal(): Promise<string> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      throw new Error('User must be authenticated');
    }

    const response = await supabase.functions.invoke('manage-subscription', {
      body: {
        action: 'portal',
      },
    });

    if (response.error) {
      throw new Error(response.error.message || 'Failed to open customer portal');
    }

    return response.data.url;
  }

  /**
   * Get user's current subscription
   */
  async getUserSubscription(): Promise<UserSubscription | null> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      return null;
    }

    const { data, error } = await supabase
      .rpc('get_user_subscription', {
        user_uuid: session.session.user.id,
      });

    if (error || !data || data.length === 0) {
      return null;
    }

    const sub = data[0];
    return {
      planId: sub.plan_id,
      planName: sub.plan_name,
      status: sub.status,
      creditsIncluded: sub.credits_included,
      currentPeriodEnd: sub.current_period_end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    };
  }

  /**
   * Get available subscription plans
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
      .from('subscription_tiers')
      .select('*')
      .order('price', { ascending: true });

    if (error) {
      console.error('Error fetching subscription plans:', error);
      throw new Error('Failed to fetch subscription plans');
    }

    return data.map(plan => ({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      features: plan.features || [],
      maxStories: plan.max_stories,
      maxCharacters: plan.max_characters,
      creditsIncluded: plan.credits_included,
    }));
  }

  /**
   * Get user's payment history
   */
  async getPaymentHistory(limit: number = 10): Promise<any[]> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      return [];
    }

    const { data, error } = await supabase
      .from('payment_history')
      .select('*')
      .eq('user_id', session.session.user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Check if user has active subscription
   */
  async hasActiveSubscription(): Promise<boolean> {
    const subscription = await this.getUserSubscription();
    return subscription !== null && subscription.status === 'active';
  }

  /**
   * Get user's subscription tier
   */
  async getSubscriptionTier(): Promise<string> {
    const subscription = await this.getUserSubscription();
    return subscription?.planId || 'free';
  }
}

export const stripeService = new StripeService();