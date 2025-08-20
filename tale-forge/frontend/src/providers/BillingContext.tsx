import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  maxStories: number;
  maxCharacters: number;
}

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
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

// Real plans data from PRD
const plans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: ['Up to 3 stories per month', 'Basic story elements', 'Community access'],
    maxStories: 3,
    maxCharacters: 5000
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    features: ['Up to 10 stories per month', '3 images per story', 'Voice narration (5 stories)', 'Character creation'],
    maxStories: 10,
    maxCharacters: 50000
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19.99,
    features: ['Unlimited stories', 'Unlimited images', 'Unlimited voice narration', 'Advanced features', 'Priority support'],
    maxStories: Infinity,
    maxCharacters: Infinity
  },
  {
    id: 'family',
    name: 'Family',
    price: 29.99,
    features: ['All Pro features', '5 family member accounts', 'Parental controls', 'Shared story library'],
    maxStories: Infinity,
    maxCharacters: Infinity
  }
];

// Map plan IDs to Stripe price IDs (these would be real IDs in production)
const planToPriceIdMap: Record<string, string> = {
  'premium': 'price_premium_monthly',
  'pro': 'price_pro_monthly',
  'family': 'price_family_monthly'
};

interface BillingProviderProps {
  children: ReactNode;
}

export const BillingProvider: React.FC<BillingProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionPlan | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Load subscription data from Supabase
  const loadSubscriptionData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // In a real app, this would fetch from Supabase
      // For now, we'll simulate with localStorage but with real structure
      const storedSubscription = localStorage.getItem(`subscription_${user.id}`);
      const storedBillingHistory = localStorage.getItem(`billingHistory_${user.id}`);
      
      if (storedSubscription) {
        try {
          setSubscription(JSON.parse(storedSubscription));
        } catch (e) {
          console.error('Failed to parse subscription data', e);
        }
      }
      
      if (storedBillingHistory) {
        try {
          setBillingHistory(JSON.parse(storedBillingHistory));
        } catch (e) {
          console.error('Failed to parse billing history', e);
        }
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load subscription data on mount and when user changes
  useEffect(() => {
    loadSubscriptionData();
  }, [user]);

  const subscribeToPlan = async (planId: string) => {
    if (!user) {
      throw new Error('User must be logged in to subscribe');
    }

    setIsCheckingOut(true);
    
    try {
      // In a real app, this would call the Stripe create checkout function
      // For now, we'll simulate the process
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the plan details
      const plan = plans.find(p => p.id === planId) || plans[0];
      
      // In a real implementation, we would:
      // 1. Call the backend function to create a Stripe checkout session
      // 2. Redirect to the Stripe checkout page
      // 3. Handle the webhook to update the subscription status
      
      // For simulation, we'll just update the local state
      setSubscription(plan);
      localStorage.setItem(`subscription_${user.id}`, JSON.stringify(plan));
      
      // Add to billing history
      const newTransaction: BillingHistoryItem = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        amount: plan.price,
        description: `Subscription to ${plan.name} plan`,
        status: 'completed'
      };
      
      const updatedHistory = [newTransaction, ...billingHistory];
      setBillingHistory(updatedHistory);
      localStorage.setItem(`billingHistory_${user.id}`, JSON.stringify(updatedHistory));
      
      // In a real app, we would redirect to Stripe checkout:
      // window.location.href = checkoutUrl;
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