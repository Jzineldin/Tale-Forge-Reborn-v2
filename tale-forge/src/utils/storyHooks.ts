// storyHooks.ts
// React Query hooks for story data retrieval and manipulation

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { realStoryService as storyService, realStoryQueries as storyQueries, StoryServiceError } from './realStoryService';
import { Story, StorySegment, StoryChoice } from '@shared/types';
import { useAuth } from '../providers/AuthContext';

// Error handling utilities
const handleStoryServiceError = (error: unknown): string => {
  if (error instanceof StoryServiceError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};

// Story hooks
export const useStories = () => {
  const { user } = useAuth();
  
  return useQuery<Story[], string>(
    ['stories', user?.id],
    () => {
      if (!user) {
        throw new StoryServiceError('User is not authenticated', 'NOT_AUTHENTICATED');
      }
      return storyService.getStories(user.id);
    },
    {
      enabled: !!user,
      onError: (error) => {
        console.error('Error fetching stories:', handleStoryServiceError(error));
      }
    }
  );
};

export const useStory = (storyId: string | null) => {
  const { user } = useAuth();
  
  return useQuery<Story | null, string>(
    ['story', storyId],
    () => {
      if (!user) {
        throw new StoryServiceError('User is not authenticated', 'NOT_AUTHENTICATED');
      }
      if (!storyId) {
        throw new StoryServiceError('Story ID is required', 'MISSING_STORY_ID');
      }
      return storyService.getStoryById(user.id, storyId);
    },
    {
      enabled: !!user && !!storyId,
      onError: (error) => {
        console.error('Error fetching story:', handleStoryServiceError(error));
      }
    }
  );
};

export const useCreateStory = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation(
    (storyData: Omit<Story, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user) {
        throw new StoryServiceError('User is not authenticated', 'NOT_AUTHENTICATED');
      }
      return storyService.createStory(user.id, storyData);
    },
    {
      onSuccess: (newStory) => {
        // Invalidate and refetch stories
        queryClient.invalidateQueries(['stories']);
        // Add the new story to the cache
        queryClient.setQueryData(['story', newStory.id], newStory);
      },
      onError: (error) => {
        console.error('Error creating story:', handleStoryServiceError(error));
      }
    }
  );
};

export const useUpdateStory = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation(
    ({ storyId, storyData }: { storyId: string; storyData: Partial<Story> }) => {
      if (!user) {
        throw new StoryServiceError('User is not authenticated', 'NOT_AUTHENTICATED');
      }
      return storyService.updateStory(user.id, storyId, storyData);
    },
    {
      onSuccess: (updatedStory) => {
        // Update the story in the cache
        queryClient.setQueryData(['story', updatedStory.id], updatedStory);
        // Invalidate stories to trigger refetch
        queryClient.invalidateQueries(['stories']);
      },
      onError: (error) => {
        console.error('Error updating story:', handleStoryServiceError(error));
      }
    }
  );
};

export const useDeleteStory = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation(
    (storyId: string) => {
      if (!user) {
        throw new StoryServiceError('User is not authenticated', 'NOT_AUTHENTICATED');
      }
      return storyService.deleteStory(user.id, storyId);
    },
    {
      onSuccess: (_, storyId) => {
        // Remove the story from the cache
        queryClient.removeQueries(['story', storyId]);
        // Invalidate stories to trigger refetch
        queryClient.invalidateQueries(['stories']);
      },
      onError: (error) => {
        console.error('Error deleting story:', handleStoryServiceError(error));
      }
    }
  );
};

// Story Segment hooks
export const useStorySegments = (storyId: string | null) => {
  const { user } = useAuth();
  
  return useQuery<StorySegment[], string>(
    ['segments', storyId],
    () => {
      if (!user) {
        throw new StoryServiceError('User is not authenticated', 'NOT_AUTHENTICATED');
      }
      if (!storyId) {
        throw new StoryServiceError('Story ID is required', 'MISSING_STORY_ID');
      }
      return storyService.getStorySegments(user.id, storyId);
    },
    {
      enabled: !!user && !!storyId,
      onError: (error) => {
        console.error('Error fetching story segments:', handleStoryServiceError(error));
      }
    }
  );
};

export const useStorySegment = (segmentId: string | null) => {
  const { user } = useAuth();
  
  return useQuery<StorySegment | null, string>(
    ['segment', segmentId],
    () => {
      if (!user) {
        throw new StoryServiceError('User is not authenticated', 'NOT_AUTHENTICATED');
      }
      if (!segmentId) {
        throw new StoryServiceError('Segment ID is required', 'MISSING_SEGMENT_ID');
      }
      return storyService.getStorySegmentById(user.id, segmentId);
    },
    {
      enabled: !!user && !!segmentId,
      onError: (error) => {
        console.error('Error fetching story segment:', handleStoryServiceError(error));
      }
    }
  );
};

export const useCreateStorySegment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation(
    (segmentData: Omit<StorySegment, 'id' | 'created_at'>) => {
      if (!user) {
        throw new StoryServiceError('User is not authenticated', 'NOT_AUTHENTICATED');
      }
      return storyService.createStorySegment(user.id, segmentData);
    },
    {
      onSuccess: (newSegment) => {
        // Invalidate and refetch segments for this story
        queryClient.invalidateQueries(['segments', newSegment.story_id]);
        // Add the new segment to the cache
        queryClient.setQueryData(['segment', newSegment.id], newSegment);
      },
      onError: (error) => {
        console.error('Error creating story segment:', handleStoryServiceError(error));
      }
    }
  );
};

export const useUpdateStorySegment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation(
    ({ segmentId, segmentData }: { segmentId: string; segmentData: Partial<StorySegment> }) => {
      if (!user) {
        throw new StoryServiceError('User is not authenticated', 'NOT_AUTHENTICATED');
      }
      return storyService.updateStorySegment(user.id, segmentId, segmentData);
    },
    {
      onSuccess: (updatedSegment) => {
        // Update the segment in the cache
        queryClient.setQueryData(['segment', updatedSegment.id], updatedSegment);
        // Invalidate segments for this story to trigger refetch
        queryClient.invalidateQueries(['segments', updatedSegment.story_id]);
      },
      onError: (error) => {
        console.error('Error updating story segment:', handleStoryServiceError(error));
      }
    }
  );
};

export const useDeleteStorySegment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation(
    ({ segmentId, storyId }: { segmentId: string; storyId: string }) => {
      if (!user) {
        throw new StoryServiceError('User is not authenticated', 'NOT_AUTHENTICATED');
      }
      return storyService.deleteStorySegment(user.id, segmentId);
    },
    {
      onSuccess: (_, { segmentId, storyId }) => {
        // Remove the segment from the cache
        queryClient.removeQueries(['segment', segmentId]);
        // Invalidate segments for this story to trigger refetch
        queryClient.invalidateQueries(['segments', storyId]);
      },
      onError: (error) => {
        console.error('Error deleting story segment:', handleStoryServiceError(error));
      }
    }
  );
};

// Story Choice hooks
export const useStoryChoices = (segmentId: string | null) => {
  const { user } = useAuth();
  
  return useQuery<StoryChoice[], string>(
    ['choices', segmentId],
    () => {
      if (!user) {
        throw new StoryServiceError('User is not authenticated', 'NOT_AUTHENTICATED');
      }
      if (!segmentId) {
        throw new StoryServiceError('Segment ID is required', 'MISSING_SEGMENT_ID');
      }
      return storyService.getStoryChoices(user.id, segmentId);
    },
    {
      enabled: !!user && !!segmentId,
      onError: (error) => {
        console.error('Error fetching story choices:', handleStoryServiceError(error));
      }
    }
  );
};

export const useCreateStoryChoice = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation(
    (choiceData: Omit<StoryChoice, 'id'>) => {
      if (!user) {
        throw new StoryServiceError('User is not authenticated', 'NOT_AUTHENTICATED');
      }
      return storyService.createStoryChoice(user.id, choiceData);
    },
    {
      onSuccess: (newChoice) => {
        // Invalidate and refetch choices for this segment
        queryClient.invalidateQueries(['choices', newChoice.segment_id]);
      },
      onError: (error) => {
        console.error('Error creating story choice:', handleStoryServiceError(error));
      }
    }
  );
};

export const useUpdateStoryChoice = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation(
    ({ choiceId, choiceData }: { choiceId: string; choiceData: Partial<StoryChoice> }) => {
      if (!user) {
        throw new StoryServiceError('User is not authenticated', 'NOT_AUTHENTICATED');
      }
      return storyService.updateStoryChoice(user.id, choiceId, choiceData);
    },
    {
      onSuccess: (updatedChoice) => {
        // Invalidate choices for this segment to trigger refetch
        queryClient.invalidateQueries(['choices', updatedChoice.segment_id]);
      },
      onError: (error) => {
        console.error('Error updating story choice:', handleStoryServiceError(error));
      }
    }
  );
};

export const useDeleteStoryChoice = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation(
    ({ choiceId, segmentId }: { choiceId: string; segmentId: string }) => {
      if (!user) {
        throw new StoryServiceError('User is not authenticated', 'NOT_AUTHENTICATED');
      }
      return storyService.deleteStoryChoice(user.id, choiceId);
    },
    {
      onSuccess: (_, { segmentId }) => {
        // Invalidate choices for this segment to trigger refetch
        queryClient.invalidateQueries(['choices', segmentId]);
      },
      onError: (error) => {
        console.error('Error deleting story choice:', handleStoryServiceError(error));
      }
    }
  );
};

// Optimized query hooks
export const useStoriesPaginated = (page: number, limit: number = 10) => {
  const { user } = useAuth();
  
  return useQuery<{ stories: Story[], totalCount: number }, string>(
    ['stories', 'paginated', user?.id, page, limit],
    () => {
      if (!user) {
        throw new StoryServiceError('User is not authenticated', 'NOT_AUTHENTICATED');
      }
      return storyQueries.getStoriesPaginated(user.id, page, limit);
    },
    {
      enabled: !!user,
      onError: (error) => {
        console.error('Error fetching paginated stories:', handleStoryServiceError(error));
      }
    }
  );
};

export const useStoriesByStatus = (status: Story['status']) => {
  const { user } = useAuth();
  
  return useQuery<Story[], string>(
    ['stories', 'status', user?.id, status],
    () => {
      if (!user) {
        throw new StoryServiceError('User is not authenticated', 'NOT_AUTHENTICATED');
      }
      return storyQueries.getStoriesByStatus(user.id, status);
    },
    {
      enabled: !!user,
      onError: (error) => {
        console.error('Error fetching stories by status:', handleStoryServiceError(error));
      }
    }
  );
};

export const useStoriesByGenre = (genre: string) => {
  const { user } = useAuth();
  
  return useQuery<Story[], string>(
    ['stories', 'genre', user?.id, genre],
    () => {
      if (!user) {
        throw new StoryServiceError('User is not authenticated', 'NOT_AUTHENTICATED');
      }
      return storyQueries.getStoriesByGenre(user.id, genre);
    },
    {
      enabled: !!user,
      onError: (error) => {
        console.error('Error fetching stories by genre:', handleStoryServiceError(error));
      }
    }
  );
};

export const useSearchStories = (searchTerm: string) => {
  const { user } = useAuth();
  
  return useQuery<Story[], string>(
    ['stories', 'search', user?.id, searchTerm],
    () => {
      if (!user) {
        throw new StoryServiceError('User is not authenticated', 'NOT_AUTHENTICATED');
      }
      return storyQueries.searchStories(user.id, searchTerm);
    },
    {
      enabled: !!user && searchTerm.length > 0,
      onError: (error) => {
        console.error('Error searching stories:', handleStoryServiceError(error));
      }
    }
  );
};

export const useRecentStories = (limit: number = 5) => {
  const { user } = useAuth();
  
  return useQuery<Story[], string>(
    ['stories', 'recent', user?.id, limit],
    () => {
      if (!user) {
        throw new StoryServiceError('User is not authenticated', 'NOT_AUTHENTICATED');
      }
      return storyQueries.getRecentStories(user.id, limit);
    },
    {
      enabled: !!user,
      onError: (error) => {
        console.error('Error fetching recent stories:', handleStoryServiceError(error));
      }
    }
  );
};