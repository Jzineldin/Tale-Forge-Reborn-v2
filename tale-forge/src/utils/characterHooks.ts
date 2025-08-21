// Character Management Hooks
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { realStoryService } from './realStoryService';
import { UserCharacter } from '@shared/types';
import { useAuth } from '@/providers/AuthContext';

// Hook to get user's saved characters
export const useUserCharacters = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['userCharacters', user?.id],
    queryFn: () => user ? realStoryService.getUserCharacters(user.id) : Promise.resolve([]),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to save a new character
export const useSaveCharacter = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (character: Omit<UserCharacter, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('User not authenticated');
      return realStoryService.saveUserCharacter(user.id, character);
    },
    onSuccess: () => {
      // Invalidate and refetch characters
      queryClient.invalidateQueries({ queryKey: ['userCharacters', user?.id] });
    },
    onError: (error) => {
      console.error('Failed to save character:', error);
    },
  });
};

// Hook to delete a character
export const useDeleteCharacter = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (characterId: string) => {
      if (!user) throw new Error('User not authenticated');
      return realStoryService.deleteUserCharacter(user.id, characterId);
    },
    onSuccess: () => {
      // Invalidate and refetch characters
      queryClient.invalidateQueries({ queryKey: ['userCharacters', user?.id] });
    },
    onError: (error) => {
      console.error('Failed to delete character:', error);
    },
  });
};

// Hook to update a character
export const useUpdateCharacter = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ characterId, updates }: { characterId: string; updates: Partial<UserCharacter> }) => {
      if (!user) throw new Error('User not authenticated');
      return realStoryService.updateUserCharacter(user.id, characterId, updates);
    },
    onSuccess: () => {
      // Invalidate and refetch characters
      queryClient.invalidateQueries({ queryKey: ['userCharacters', user?.id] });
    },
    onError: (error) => {
      console.error('Failed to update character:', error);
    },
  });
};