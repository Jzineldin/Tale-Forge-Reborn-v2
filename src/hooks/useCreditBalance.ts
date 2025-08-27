import { useState, useEffect } from 'react';
import { creditsService } from '@/services/creditsService';

export const useCreditBalance = () => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    try {
      setError(null);
      const credits = await creditsService.getUserCredits();
      setBalance(credits.currentBalance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return {
    balance,
    loading,
    error,
    refresh: fetchBalance
  };
};