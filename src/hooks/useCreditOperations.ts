import { useState } from 'react';
import { creditsService } from '@/services/creditsService';

export const useCreditOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const spendCredits = async (
    amount: number,
    description: string,
    referenceId?: string,
    referenceType?: string,
    metadata?: Record<string, any>
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await creditsService.spendCredits(
        amount,
        description,
        referenceId,
        referenceType,
        metadata
      );
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to spend credits');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const addCredits = async (
    amount: number,
    description: string,
    referenceId?: string,
    referenceType?: string,
    metadata?: Record<string, any>
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await creditsService.addCredits(
        amount,
        description,
        referenceId,
        referenceType,
        metadata
      );
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add credits');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const processStoryPayment = async (
    storyId: string,
    storyType: 'short' | 'medium' | 'long',
    includeImages = true,
    includeAudio = true
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await creditsService.processStoryPayment(
        storyId,
        storyType,
        includeImages,
        includeAudio
      );
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payment');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    spendCredits,
    addCredits,
    processStoryPayment,
    isLoading,
    error
  };
};