// Performance utilities for optimized data fetching and caching
import { useQuery, useMutation, useQueryClient } from 'react-query';
import cache, { CACHE_TTL } from './cache';
import { supabase } from '@/lib/supabase';

// API base URL (would be environment variable in real app)
const API_BASE_URL = 'https://fyihypkigbcmsxyvseca.supabase.co/functions/v1';

// Generic API fetcher with caching
export const fetchWithCache = async <T,>(key: string, url: string, options?: RequestInit): Promise<T> => {
  // Check if we have a cached value
  const cachedValue = cache.get<T>(key);
  if (cachedValue) {
    return cachedValue;
  }
  
  // Fetch from API
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Cache the result
  cache.set(key, data, CACHE_TTL.MEDIUM);
  
  return data;
};

// React Query hooks with 2025 optimizations
export const useStories = (userId: string | null) => {
  const queryClient = useQueryClient();
  
  return useQuery(
    ['stories', userId],
    async () => {
      if (!userId) {
        return [];
      }
      
      console.log('Fetching stories for user:', userId);
      
      // Fetch from Supabase directly
      const { data: stories, error } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching stories:', error);
        throw new Error('Failed to fetch stories');
      }
      
      console.log('Fetched stories:', stories);
      
      // Transform stories to match expected format
      const transformedStories = stories?.map(story => ({
        id: story.id,
        title: story.title,
        description: story.description || 'No description available',
        genre: story.genre || 'fantasy',
        age_group: story.target_age || 'All Ages',
        status: story.is_completed ? 'published' : 'draft',
        imageUrl: story.cover_image_url || story.thumbnail_url || '/images/placeholder-story.png',
        created_at: story.created_at,
        updated_at: story.updated_at
      })) || [];
      
      return transformedStories;
    },
    {
      enabled: !!userId,
      staleTime: CACHE_TTL.SHORT,
      cacheTime: CACHE_TTL.LONG,
      // 2025 optimization: Prefetch related data
      onSuccess: (data) => {
        // Prefetch first story for each user
        if (data && data.length > 0) {
          queryClient.prefetchQuery(['story', data[0].id]);
        }
      },
      // Enhanced error boundary
      useErrorBoundary: true,
      // Optimistic updates
      optimisticResults: true
    }
  );
};

export const useStory = (storyId: string | null) => {
  return useQuery(
    ['story', storyId],
    async () => {
      if (!storyId) {
        return null;
      }
      
      // Get current session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔑 Session check:', { 
        hasSession: !!session, 
        hasToken: !!session?.access_token, 
        tokenLength: session?.access_token?.length
      });
      
      if (!session?.access_token) {
        throw new Error('No authentication session found');
      }

      // Fetch from Supabase backend
      console.log('🔍 Fetching story:', storyId);
      
      const response = await fetch(`${API_BASE_URL}/get-story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ storyId })
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Get-story error response:', errorText);
        throw new Error(`Failed to fetch story: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Story fetched successfully:', data.success);
      return data.story || null;
    },
    {
      enabled: !!storyId,
      staleTime: 30000, // Cache for 30 seconds to prevent excessive requests
      cacheTime: CACHE_TTL.LONG,
      refetchInterval: (data) => {
        // Only poll if story is actively being generated (not for existing stories)
        if (!data) {
          return 2000; // Very frequent polling while fetching initial data
        }
        
        // CRITICAL FIX: Poll if story is generating OR images are being generated
        const isStoryGenerating = data.status === 'generating' || (data.segments && data.segments.length === 0);
        
        // Check if any segment has images currently being generated (has prompt but no URL)
        const hasGeneratingImages = data.segments?.some((segment: any) => 
          segment.image_prompt && !segment.image_url
        ) || false;
        
        // Poll if story OR images are being generated, but with reasonable limits
        if (isStoryGenerating) {
          console.log(`🔄 Polling story ${data.id}: story content generating`);
          return 2000; // Poll every 2 seconds for story generation
        } else if (hasGeneratingImages) {
          console.log(`🔄 Polling story ${data.id}: images generating for ${data.segments?.filter((s: any) => s.image_prompt && !s.image_url).length} segments`);
          return 5000; // Poll every 5 seconds for image generation (slower)
        }
        
        console.log(`⏹️ Stopping poll for story ${data.id}: story and images complete`);
        return false; // Stop polling once story and images are complete
      },
      refetchIntervalInBackground: true, // Allow background polling
      refetchOnWindowFocus: true, // Aggressive refetch when returning to tab
      refetchOnMount: true,
      retry: 2
    }
  );
};

export const useCreateStoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (storyData: any) => {
      // Get current session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication session found');
      }

      // Call the backend API to create a story
      const response = await fetch(`${API_BASE_URL}/create-story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify(storyData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create story');
      }
      
      const data = await response.json();
      return data.story;
    },
    {
      onSuccess: (data) => {
        // Invalidate and refetch stories query
        queryClient.invalidateQueries(['stories', data.userId]);
      }
    }
  );
};

export const useUpdateStory = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (storyData: any) => {
      const { id, userId, ...updates } = storyData;
      
      if (!id || !userId) {
        throw new Error('Story ID and User ID are required');
      }
      
      // Get current session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication session found');
      }
      
      // Call the backend API to update a story
      const response = await fetch(`${API_BASE_URL}/update-story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ storyId: id, updates })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update story');
      }
      
      const data = await response.json();
      return data.story;
    },
    {
      onSuccess: (data) => {
        // Invalidate and refetch story and stories queries
        queryClient.invalidateQueries(['story', data.id]);
        queryClient.invalidateQueries(['stories', data.userId]);
      }
    }
  );
};

export const useDeleteStory = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async ({ storyId, userId }: { storyId: string; userId: string }) => {
      if (!storyId || !userId) {
        throw new Error('Story ID and User ID are required');
      }
      
      // Get current session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication session found');
      }
      
      // Call the backend API to delete a story
      const response = await fetch(`${API_BASE_URL}/delete-story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ storyId })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete story');
      }
      
      return storyId;
    },
    {
      onSuccess: (data, variables) => {
        // Invalidate stories query
        queryClient.invalidateQueries(['stories', variables.userId]);
      }
    }
  );
};

// AI service hooks
export const useGenerateStorySegment = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async ({ storyId, choiceIndex }: { storyId: string; choiceIndex?: number }) => {
      // Get current session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication session found');
      }

      // Call the backend API to generate a story segment
      const response = await fetch(`${API_BASE_URL}/generate-story-segment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ storyId, choiceIndex })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate story segment');
      }
      
      const data = await response.json();
      return { ...data, storyId }; // Include storyId for cache invalidation
    },
    {
      onSuccess: (data) => {
        console.log('🔄 New segment generated - invalidating story cache for:', data.storyId);
        // CRITICAL FIX: Invalidate the story cache to trigger refetch with new segment
        queryClient.invalidateQueries(['story', data.storyId]);
        // Also invalidate the stories list cache
        queryClient.invalidateQueries(['stories']);
      }
    }
  );
};

export const useGenerateStoryEnding = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async ({ storyId }: { storyId: string }) => {
      console.log('🎬 useGenerateStoryEnding called with storyId:', storyId);
      
      // Get current session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.error('❌ No authentication session found');
        throw new Error('No authentication session found');
      }

      console.log('🔑 Session found, calling generate-story-ending API...');

      // Call the backend API to generate a story ending
      const response = await fetch(`${API_BASE_URL}/generate-story-ending`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ storyId })
      });
      
      console.log('📡 generate-story-ending response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ generate-story-ending API error:', response.status, errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        throw new Error(errorData.message || `API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ generate-story-ending success:', data);
      return { ...data, storyId }; // Include storyId for cache invalidation
    },
    {
      onSuccess: (data) => {
        console.log('🔄 Story ending generated - invalidating story cache for:', data.storyId);
        // CRITICAL FIX: Invalidate the story cache to trigger refetch with new ending segment
        queryClient.invalidateQueries(['story', data.storyId]);
        queryClient.invalidateQueries(['stories']);
      }
    }
  );
};

export const useGenerateAudio = () => {
  return useMutation(
    async ({ storyId }: { storyId: string }) => {
      // Get current session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication session found');
      }

      // Call the backend API to generate audio narration
      const response = await fetch(`${API_BASE_URL}/generate-audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ storyId })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate audio');
      }
      
      const data = await response.json();
      return data;
    }
  );
};

export const useRegenerateImage = () => {
  return useMutation(
    async ({ segmentId, imagePrompt }: { segmentId: string; imagePrompt: string }) => {
      // Get current session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication session found');
      }

      // Call the backend API to regenerate an image
      const response = await fetch(`${API_BASE_URL}/regenerate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ segmentId, imagePrompt })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to regenerate image');
      }
      
      const data = await response.json();
      return data;
    }
  );
};

// Image optimization utilities
export const useOptimizedImage = (src: string, width?: number, height?: number) => {
  // FIXED: Don't add query parameters to potentially break image URLs
  // Just return the original src with loading optimizations
  return {
    src: src || '/images/placeholder-story.png', // Fallback to placeholder if no src
    loading: 'lazy' as const,
    decoding: 'async' as const,
    onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
      // Fallback to placeholder on error
      e.currentTarget.src = '/images/placeholder-story.png';
    }
  };
};

// Skeleton component for loading states
export const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );
};

// Loading state component
export const LoadingState = ({ message = 'Loading...' }: { message?: string }) => {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

// Error state component
export const ErrorState = ({ message = 'Something went wrong' }: { message?: string }) => {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <div className="mx-auto mb-4">
          <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};