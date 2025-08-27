import { useState } from 'react';
import { creditsService, StoryCost } from '@/services/creditsService';

export const useStoryCosts = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateCost = async (
    storyType: 'short' | 'medium' | 'long',
    includeImages = true,
    includeAudio = true
  ): Promise<StoryCost> => {
    setLoading(true);
    setError(null);
    
    try {
      const cost = await creditsService.calculateStoryCost(storyType, includeImages, includeAudio);
      return cost;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate cost');
      // Return default cost structure
      return {
        chapters: 3,
        storyCost: 3,
        audioCost: 5,
        totalCost: 8
      };
    } finally {
      setLoading(false);
    }
  };

  const checkAffordability = async (
    storyType: 'short' | 'medium' | 'long',
    includeImages = true,
    includeAudio = true
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await creditsService.canAffordStory(storyType, includeImages, includeAudio);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check affordability');
      return { canAfford: false, userCredits: 0, storyCost: 0 };
    } finally {
      setLoading(false);
    }
  };

  return {
    calculateCost,
    checkAffordability,
    loading,
    error
  };
};