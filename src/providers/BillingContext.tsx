import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { stripeService, type SubscriptionPlan } from '../services/stripeService';

interface BillingHistoryItem {
  id: string;
  date: string;
  amount: number;
  description: string;
  status: string;
}

interface BillingContextType {
  subscription: SubscriptionPlan | null;
  billingHistory: BillingHistoryItem[];
  isLoading: boolean;
  isCheckingOut: boolean;
  subscribeToPlan: (planId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  openCustomerPortal: () => Promise<void>;
  loadSubscriptionData: () => Promise<void>;
  plans: SubscriptionPlan[];
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

interface BillingProviderProps {
  children: ReactNode;
}

export const BillingProvider: React.FC<BillingProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionPlan | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Load subscription data from Supabase
  const loadSubscriptionData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Load subscription plans
      const availablePlans = await stripeService.getSubscriptionPlans();
      setPlans(availablePlans);
      
      // Load user's current subscription
      const userSubscription = await stripeService.getUserSubscription();
      if (userSubscription) {
        const plan = availablePlans.find(p => p.id === userSubscription.planId);
        if (plan) {
          setSubscription(plan);
        }
      } else {
        // Set free plan as default
        const freePlan = availablePlans.find(p => p.id === 'free');
        if (freePlan) {
          setSubscription(freePlan);
        }
      }
      
      // Load payment history
      const history = await stripeService.getPaymentHistory();
      setBillingHistory(history.map(item => ({
        id: item.id,
        date: item.created_at,
        amount: item.amount,
        description: item.description,
        status: item.status,
      })));
    } catch (error) {
      console.error('Error loading subscription data:', error);
      // Set free plan as fallback
      const freePlan: SubscriptionPlan = {
        id: 'free',
        name: 'Free',
        price: 0,
        features: ['Up to 3 stories per month', 'Basic story elements', 'Community access'],
        maxStories: 3,
        maxCharacters: 5000,
        creditsIncluded: 15,
      };
      setSubscription(freePlan);
      setPlans([freePlan]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Load subscription data on mount and when user changes
  useEffect(() => {
    loadSubscriptionData();
  }, [loadSubscriptionData]);

  const subscribeToPlan = async (planId: string) => {
    if (!user) {
      throw new Error('User must be logged in to subscribe');
    }

    setIsCheckingOut(true);
    
    try {
      // Create Stripe checkout session
      const { sessionUrl } = await stripeService.createCheckoutSession(planId);
      
      // Redirect to Stripe checkout
      window.location.href = sessionUrl;
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      throw error;
    } finally {
      setIsCheckingOut(false);
    }
  };

  const cancelSubscription = async () => {
    if (!user) {
      throw new Error('User must be logged in to cancel subscription');
    }

    try {
      // In a real app, this would call the backend to cancel the Stripe subscription
      // For now, we'll simulate the process
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setSubscription(plans[0]); // Set to free plan
      localStorage.setItem(`subscription_${user.id}`, JSON.stringify(plans[0]));
      
      // Add to billing history
      const newTransaction: BillingHistoryItem = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        amount: 0,
        description: 'Subscription cancelled',
        status: 'cancelled'
      };
      
      const updatedHistory = [newTransaction, ...billingHistory];
      setBillingHistory(updatedHistory);
      localStorage.setItem(`billingHistory_${user.id}`, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  };

  const openCustomerPortal = async () => {
    if (!user) {
      throw new Error('User must be logged in to access customer portal');
    }

    try {
      // In a real app, this would call the backend to create a Stripe customer portal session
      // For now, we'll simulate the process
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real implementation, we would:
      // 1. Call the backend function to create a customer portal session
      // 2. Redirect to the Stripe customer portal
      // window.location.href = portalUrl;
      
      alert('In a real application, this would open the Stripe customer portal where you can manage your subscription, payment methods, and billing history.');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      throw error;
    }
  };

  const value = {
    subscription,
    billingHistory,
    isLoading,
    isCheckingOut,
    subscribeToPlan,
    cancelSubscription,
    openCustomerPortal,
    loadSubscriptionData
  };

  return (
    <BillingContext.Provider value={value}>
      {children}
    </BillingContext.Provider>
  );
};

export const useBilling = () => {
  const context = useContext(BillingContext);
  if (context === undefined) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
};