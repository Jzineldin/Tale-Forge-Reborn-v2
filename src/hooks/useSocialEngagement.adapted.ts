// Adapted Social Engagement Hooks for story_templates table
// Updated to work with the actual database structure

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthContext';

export interface StoryTemplateLike {
  id: string;
  template_id: string;
  user_id: string;
  created_at: string;
}

export interface StoryTemplateReview {
  id: string;
  template_id: string;
  user_id: string;
  rating: number;
  title?: string;
  content?: string;
  tags: string[];
  helpful_votes: number;
  is_featured: boolean;
  created_at: string;
}

export interface StoryTemplateSocialStats {
  likes_count: number;
  bookmarks_count: number;
  shares_count: number;
  reviews_count: number;
  rating_average: number;
  usage_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
}

// Hook for template likes functionality
export function useStoryTemplateLikes(templateId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Get like status and count
  const { data: likeData, isLoading } = useQuery(
    ['story-template-likes', templateId],
    async () => {
      if (!templateId) return null;
      
      // Get total likes and user's like status
      const [likesResponse, userLikeResponse] = await Promise.all([
        supabase
          .from('story_templates')
          .select('likes_count')
          .eq('id', templateId)
          .single(),
        
        user ? supabase
          .from('story_template_likes')
          .select('id')
          .eq('template_id', templateId)
          .eq('user_id', user.id)
          .maybeSingle() : Promise.resolve({ data: null })
      ]);
      
      return {
        count: likesResponse.data?.likes_count || 0,
        isLiked: !!userLikeResponse.data,
        userLikeId: userLikeResponse.data?.id
      };
    },
    {
      enabled: !!templateId
    }
  );
  
  // Toggle like mutation
  const toggleLikeMutation = useMutation(
    async () => {
      if (!user || !templateId) throw new Error('Must be logged in to like templates');
      
      if (likeData?.isLiked) {
        // Unlike
        const { error } = await supabase
          .from('story_template_likes')
          .delete()
          .eq('template_id', templateId)
          .eq('user_id', user.id);
          
        if (error) throw error;
        return { action: 'unliked' };
      } else {
        // Like
        const { error } = await supabase
          .from('story_template_likes')
          .insert({
            template_id: templateId,
            user_id: user.id
          });
          
        if (error) throw error;
        return { action: 'liked' };
      }
    },
    {
      onSuccess: (data) => {
        // Optimistically update the cache
        queryClient.setQueryData(['story-template-likes', templateId], (old: any) => ({
          ...old,
          count: old.count + (data.action === 'liked' ? 1 : -1),
          isLiked: data.action === 'liked'
        }));
        
        // Invalidate related queries
        queryClient.invalidateQueries(['story-template', templateId]);
        queryClient.invalidateQueries(['story-templates']);
        
        // Show success message
        const message = data.action === 'liked' ? 
          '❤️ Template liked! +1 XP' : 
          'Template unliked';
          
        console.log(message);
      },
      onError: (error) => {
        console.error('Error toggling like:', error);
      }
    }
  );
  
  return {
    likeCount: likeData?.count || 0,
    isLiked: likeData?.isLiked || false,
    isLoading,
    toggleLike: toggleLikeMutation.mutate,
    isToggling: toggleLikeMutation.isLoading
  };
}

// Hook for template bookmarks
export function useStoryTemplateBookmarks(templateId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: bookmarkData, isLoading } = useQuery(
    ['story-template-bookmarks', templateId],
    async () => {
      if (!templateId || !user) return { count: 0, isBookmarked: false };
      
      const [countResponse, userBookmarkResponse] = await Promise.all([
        supabase
          .from('story_templates')
          .select('bookmarks_count')
          .eq('id', templateId)
          .single(),
          
        supabase
          .from('story_template_bookmarks')
          .select('id, collection_name')
          .eq('template_id', templateId)
          .eq('user_id', user.id)
          .maybeSingle()
      ]);
      
      return {
        count: countResponse.data?.bookmarks_count || 0,
        isBookmarked: !!userBookmarkResponse.data,
        collection: userBookmarkResponse.data?.collection_name || 'default'
      };
    },
    {
      enabled: !!templateId && !!user
    }
  );
  
  const toggleBookmarkMutation = useMutation(
    async (collection: string = 'default') => {
      if (!user || !templateId) throw new Error('Must be logged in to bookmark');
      
      if (bookmarkData?.isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('story_template_bookmarks')
          .delete()
          .eq('template_id', templateId)
          .eq('user_id', user.id);
          
        if (error) throw error;
        return { action: 'unbookmarked' };
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('story_template_bookmarks')
          .insert({
            template_id: templateId,
            user_id: user.id,
            collection_name: collection
          });
          
        if (error) throw error;
        return { action: 'bookmarked' };
      }
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['story-template-bookmarks', templateId], (old: any) => ({
          ...old,
          count: old.count + (data.action === 'bookmarked' ? 1 : -1),
          isBookmarked: data.action === 'bookmarked'
        }));
        
        const message = data.action === 'bookmarked' ? 
          '🔖 Template saved to your library!' : 
          'Template removed from library';
          
        console.log(message);
      }
    }
  );
  
  return {
    bookmarkCount: bookmarkData?.count || 0,
    isBookmarked: bookmarkData?.isBookmarked || false,
    collection: bookmarkData?.collection || 'default',
    isLoading,
    toggleBookmark: toggleBookmarkMutation.mutate,
    isToggling: toggleBookmarkMutation.isLoading
  };
}

// Hook for template reviews
export function useStoryTemplateReviews(templateId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: reviews, isLoading } = useQuery(
    ['story-template-reviews', templateId],
    async () => {
      if (!templateId) return [];
      
      const { data, error } = await supabase
        .from('story_template_reviews')
        .select(`
          *,
          profiles:user_id(display_name, avatar_url)
        `)
        .eq('template_id', templateId)
        .order('helpful_votes', { ascending: false })
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    {
      enabled: !!templateId
    }
  );
  
  const submitReviewMutation = useMutation(
    async (reviewData: {
      rating: number;
      title?: string;
      content?: string;
      tags?: string[];
    }) => {
      if (!user || !templateId) throw new Error('Must be logged in to review');
      
      const { error } = await supabase
        .from('story_template_reviews')
        .upsert({
          template_id: templateId,
          user_id: user.id,
          ...reviewData,
          tags: reviewData.tags || []
        });
        
      if (error) throw error;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['story-template-reviews', templateId]);
        queryClient.invalidateQueries(['story-template', templateId]);
        console.log('✅ Review submitted! +5 XP');
      }
    }
  );
  
  return {
    reviews: reviews || [],
    isLoading,
    submitReview: submitReviewMutation.mutate,
    isSubmitting: submitReviewMutation.isLoading
  };
}

// Hook for sharing templates
export function useStoryTemplateSharing(templateId: string) {
  const { user } = useAuth();
  
  const trackShareMutation = useMutation(
    async (platform: string) => {
      const { error } = await supabase
        .from('story_template_shares')
        .insert({
          template_id: templateId,
          user_id: user?.id || null,
          platform,
          referrer: window.location.href
        });
        
      if (error) throw error;
      
      // Update share count (if we had a function for this)
      // For now, we'll increment manually
      await supabase
        .from('story_templates')
        .update({ 
          shares_count: 'shares_count + 1' as any
        })
        .eq('id', templateId);
    }
  );
  
  const shareTemplate = useCallback(async (platform: string) => {
    await trackShareMutation.mutateAsync(platform);
    
    // Generate share URLs
    const templateUrl = `${window.location.origin}/templates/${templateId}`;
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(templateUrl)}&text=${encodeURIComponent('Check out this amazing story template!')}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(templateUrl)}`,
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(templateUrl)}&title=${encodeURIComponent('Amazing Story Template')}`,
      link: templateUrl
    };
    
    if (platform === 'link') {
      // Copy to clipboard
      await navigator.clipboard.writeText(templateUrl);
      console.log('🔗 Link copied to clipboard! +3 XP');
    } else if (shareUrls[platform as keyof typeof shareUrls]) {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
    }
  }, [templateId, trackShareMutation]);
  
  return {
    shareTemplate,
    isSharing: trackShareMutation.isLoading
  };
}

// Composite hook for all social stats
export function useStoryTemplateSocialStats(templateId: string): StoryTemplateSocialStats {
  const { likeCount, isLiked } = useStoryTemplateLikes(templateId);
  const { bookmarkCount, isBookmarked } = useStoryTemplateBookmarks(templateId);
  const { reviews } = useStoryTemplateReviews(templateId);
  
  const { data: templateData } = useQuery(
    ['story-template-social', templateId],
    async () => {
      const { data, error } = await supabase
        .from('story_templates')
        .select('shares_count, usage_count, rating_average')
        .eq('id', templateId)
        .single();
        
      if (error) throw error;
      return data;
    },
    {
      enabled: !!templateId
    }
  );
  
  return {
    likes_count: likeCount,
    bookmarks_count: bookmarkCount,
    shares_count: templateData?.shares_count || 0,
    reviews_count: reviews.length,
    rating_average: templateData?.rating_average || 0,
    usage_count: templateData?.usage_count || 0,
    is_liked: isLiked,
    is_bookmarked: isBookmarked
  };
}