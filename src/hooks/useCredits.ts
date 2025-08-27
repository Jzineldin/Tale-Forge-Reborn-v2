// Simplified useCredits - composing focused hooks
import { useCreditBalance } from './useCreditBalance';
import { useCreditOperations } from './useCreditOperations';
import { useStoryCosts } from './useStoryCosts';
import { useState, useEffect } from 'react';
import { creditsService, CreditTransaction } from '@/services/creditsService';

export interface UseCreditsReturn {
  // Balance
  balance: number;
  balanceLoading: boolean;
  balanceError: string | null;
  refreshBalance: () => void;
  
  // Operations
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
  processStoryPayment: (
    storyId: string,
    storyType: 'short' | 'medium' | 'long',
    includeImages?: boolean,
    includeAudio?: boolean
  ) => Promise<boolean>;
  operationsLoading: boolean;
  operationsError: string | null;
  
  // Costs
  calculateStoryCost: (
    storyType: 'short' | 'medium' | 'long',
    includeImages?: boolean,
    includeAudio?: boolean
  ) => Promise<any>;
  canAffordStory: (
    storyType: 'short' | 'medium' | 'long',
    includeImages?: boolean,
    includeAudio?: boolean
  ) => Promise<any>;
  costsLoading: boolean;
  costsError: string | null;
  
  // Transactions
  transactions: CreditTransaction[];
  transactionsLoading: boolean;
  refreshTransactions: () => void;
  
  // Derived values
  totalEarned: number;
  totalSpent: number;
}

export const useCredits = (): UseCreditsReturn => {
  const { balance, loading: balanceLoading, error: balanceError, refresh: refreshBalance } = useCreditBalance();
  const { spendCredits, addCredits, processStoryPayment, isLoading: operationsLoading, error: operationsError } = useCreditOperations();
  const { calculateCost: calculateStoryCost, checkAffordability: canAffordStory, loading: costsLoading, error: costsError } = useStoryCosts();
  
  // Simple transactions state
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  const refreshTransactions = async () => {
    setTransactionsLoading(true);
    try {
      const txns = await creditsService.getCreditTransactions(50, 0);
      setTransactions(txns);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  useEffect(() => {
    refreshTransactions();
  }, []);

  // Compute derived values from transactions
  const totalEarned = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));

  return {
    balance,
    balanceLoading,
    balanceError,
    refreshBalance,
    spendCredits,
    addCredits,
    processStoryPayment,
    operationsLoading,
    operationsError,
    calculateStoryCost,
    canAffordStory,
    costsLoading,
    costsError,
    transactions,
    transactionsLoading,
    refreshTransactions,
    totalEarned,
    totalSpent
  };
};

// Lightweight hook for basic credit info
export interface UseCreditSummaryReturn {
  balance: number;
  canCreateShort: boolean;
  canCreateMedium: boolean;
  canCreateLong: boolean;
  loading: boolean;
  error: string | null;
  refreshSummary: () => Promise<void>;
}

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
    refreshSummary();
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