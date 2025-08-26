import { useState, useEffect, useCallback } from 'react';
import { creditsService, UserCredits, CreditTransaction, StoryCost } from '@/services/creditsService';

export interface UseCreditsReturn {
  credits: UserCredits | null;
  transactions: CreditTransaction[];
  loading: boolean;
  error: string | null;
  refreshCredits: () => Promise<void>;
  spendCredits: (
    amount: number,
    description: string,
    referenceId?: string,
    referenceType?: string,
    metadata?: Record<string, any>
  ) => Promise<boolean>;
  addCredits: (
    amount: number,
    description: string,
    referenceId?: string,
    referenceType?: string,
    metadata?: Record<string, any>
  ) => Promise<boolean>;
  canAffordStory: (
    storyType: 'short' | 'medium' | 'long',
    includeImages?: boolean,
    includeAudio?: boolean
  ) => Promise<{ canAfford: boolean; userCredits: number; storyCost: number }>;
  processStoryPayment: (
    storyId: string,
    storyType: 'short' | 'medium' | 'long',
    includeImages?: boolean,
    includeAudio?: boolean
  ) => Promise<boolean>;
  calculateStoryCost: (
    storyType: 'short' | 'medium' | 'long',
    includeImages?: boolean,
    includeAudio?: boolean
  ) => Promise<StoryCost>;
}

export const useCredits = (): UseCreditsReturn => {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCreditsData = async () => {
    try {
      setError(null);
      const [creditsData, transactionsData] = await Promise.all([
        creditsService.getUserCredits(),
        creditsService.getCreditTransactions(50, 0)
      ]);
      
      setCredits(creditsData);
      setTransactions(transactionsData);
    } catch (err) {
      console.error('Error fetching credits data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load credits data');
    }
  };

  const refreshCredits = async () => {
    setLoading(true);
    await fetchCreditsData();
    setLoading(false);
  };

  const spendCredits = useCallback(async (
    amount: number,
    description: string,
    referenceId?: string,
    referenceType?: string,
    metadata?: Record<string, any>
  ): Promise<boolean> => {
    try {
      setError(null);
      const success = await creditsService.spendCredits(
        amount,
        description,
        referenceId,
        referenceType,
        metadata
      );
      
      if (success) {
        // Refresh data after successful spend
        await fetchCreditsData();
      }
      
      return success;
    } catch (err) {
      console.error('Error spending credits:', err);
      setError(err instanceof Error ? err.message : 'Failed to spend credits');
      return false;
    }
  }, []);

  const addCredits = useCallback(async (
    amount: number,
    description: string,
    referenceId?: string,
    referenceType?: string,
    metadata?: Record<string, any>
  ): Promise<boolean> => {
    try {
      setError(null);
      const success = await creditsService.addCredits(
        amount,
        description,
        referenceId,
        referenceType,
        metadata
      );
      
      if (success) {
        // Refresh data after successful add
        await fetchCreditsData();
      }
      
      return success;
    } catch (err) {
      console.error('Error adding credits:', err);
      setError(err instanceof Error ? err.message : 'Failed to add credits');
      return false;
    }
  }, []);

  const canAffordStory = useCallback(async (
    storyType: 'short' | 'medium' | 'long',
    includeImages = true,
    includeAudio = true
  ) => {
    try {
      setError(null);
      return await creditsService.canAffordStory(storyType, includeImages, includeAudio);
    } catch (err) {
      console.error('Error checking story affordability:', err);
      setError(err instanceof Error ? err.message : 'Failed to check story affordability');
      return { canAfford: false, userCredits: 0, storyCost: 0 };
    }
  }, []);

  const processStoryPayment = useCallback(async (
    storyId: string,
    storyType: 'short' | 'medium' | 'long',
    includeImages = true,
    includeAudio = true
  ): Promise<boolean> => {
    try {
      setError(null);
      const success = await creditsService.processStoryPayment(
        storyId,
        storyType,
        includeImages,
        includeAudio
      );
      
      if (success) {
        // Refresh data after successful payment
        await fetchCreditsData();
      }
      
      return success;
    } catch (err) {
      console.error('Error processing story payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to process story payment');
      return false;
    }
  }, []);

  const calculateStoryCost = useCallback(async (
    storyType: 'short' | 'medium' | 'long',
    includeImages = true,
    includeAudio = true
  ): Promise<StoryCost> => {
    try {
      setError(null);
      return await creditsService.calculateStoryCost(storyType, includeImages, includeAudio);
    } catch (err) {
      console.error('Error calculating story cost:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate story cost');
      // Return default cost structure
      return {
        chapters: 3,
        storyCost: 3,
        audioCost: 5,
        totalCost: 8
      };
    }
  }, []);

  // Initialize credits data
  useEffect(() => {
    const initializeCredits = async () => {
      setLoading(true);
      await fetchCreditsData();
      setLoading(false);
    };

    initializeCredits();
  }, []);

  return {
    credits,
    transactions,
    loading,
    error,
    refreshCredits,
    spendCredits,
    addCredits,
    canAffordStory,
    processStoryPayment,
    calculateStoryCost
  };
};

export interface UseCreditSummaryReturn {
  balance: number;
  canCreateShort: boolean;
  canCreateMedium: boolean;
  canCreateLong: boolean;
  loading: boolean;
  error: string | null;
  refreshSummary: () => Promise<void>;
}

// Lightweight hook for just getting credit balance and story affordability
export const useCreditSummary = (): UseCreditSummaryReturn => {
  const [balance, setBalance] = useState(0);
  const [canCreateShort, setCanCreateShort] = useState(false);
  const [canCreateMedium, setCanCreateMedium] = useState(false);
  const [canCreateLong, setCanCreateLong] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      setError(null);
      const summary = await creditsService.getCreditSummary();
      setBalance(summary.balance);
      setCanCreateShort(summary.canCreateShort);
      setCanCreateMedium(summary.canCreateMedium);
      setCanCreateLong(summary.canCreateLong);
    } catch (err) {
      console.error('Error fetching credit summary:', err);
      setError(err instanceof Error ? err.message : 'Failed to load credit summary');
    }
  };

  const refreshSummary = async () => {
    setLoading(true);
    await fetchSummary();
    setLoading(false);
  };

  useEffect(() => {
    const initializeSummary = async () => {
      setLoading(true);
      await fetchSummary();
      setLoading(false);
    };

    initializeSummary();
  }, []);

  return {
    balance,
    canCreateShort,
    canCreateMedium,
    canCreateLong,
    loading,
    error,
    refreshSummary
  };
};