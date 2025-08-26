import { useState, useEffect } from 'react';
import { foundersService, FoundersProgramStatus, FounderProfile } from '@/services/foundersService';

export interface UseFoundersProgramReturn {
  status: FoundersProgramStatus | null;
  founderProfile: FounderProfile | null;
  loading: boolean;
  error: string | null;
  registerAsFounder: (tier: 'premium' | 'professional') => Promise<boolean>;
  refreshStatus: () => Promise<void>;
}

export const useFoundersProgram = (): UseFoundersProgramReturn => {
  const [status, setStatus] = useState<FoundersProgramStatus | null>(null);
  const [founderProfile, setFounderProfile] = useState<FounderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch founders program status
  const fetchStatus = async () => {
    try {
      setError(null);
      const programStatus = await foundersService.getFoundersProgramStatus();
      setStatus(programStatus);
    } catch (err) {
      console.error('Error fetching founders program status:', err);
      setError(err instanceof Error ? err.message : 'Failed to load founders program status');
    }
  };

  // Fetch user's founder profile
  const fetchFounderProfile = async () => {
    try {
      const profile = await foundersService.getFounderProfile();
      setFounderProfile(profile);
    } catch (err) {
      console.error('Error fetching founder profile:', err);
      // Don't set error for profile fetch failures - user might not be a founder
    }
  };

  // Register user as founder
  const registerAsFounder = async (tier: 'premium' | 'professional'): Promise<boolean> => {
    try {
      setError(null);
      const result = await foundersService.registerFounder(tier);
      
      if (result.success) {
        // Refresh both status and profile after successful registration
        await Promise.all([fetchStatus(), fetchFounderProfile()]);
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register as founder';
      setError(errorMessage);
      return false;
    }
  };

  // Refresh status manually
  const refreshStatus = async () => {
    setLoading(true);
    await Promise.all([fetchStatus(), fetchFounderProfile()]);
    setLoading(false);
  };

  // Initialize data and real-time subscription
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([fetchStatus(), fetchFounderProfile()]);
      setLoading(false);
    };

    initializeData();

    // Set up real-time subscription for status changes
    const realtimeSubscription = foundersService.subscribeToFoundersStatus((updatedStatus) => {
      setStatus(updatedStatus);
    });


    // Cleanup subscription on unmount
    return () => {
      if (realtimeSubscription) {
        realtimeSubscription.unsubscribe();
      }
    };
  }, []);

  return {
    status,
    founderProfile,
    loading,
    error,
    registerAsFounder,
    refreshStatus
  };
};

// Hook for founders leaderboard data
export const useFoundersLeaderboard = (limit: number = 50) => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await foundersService.getFoundersLeaderboard(limit);
        setLeaderboard(data);
      } catch (err) {
        console.error('Error fetching founders leaderboard:', err);
        setError(err instanceof Error ? err.message : 'Failed to load founders leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [limit]);

  return {
    leaderboard,
    loading,
    error
  };
};