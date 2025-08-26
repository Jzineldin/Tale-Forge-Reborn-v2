// Featured Content Hook
// Fetches and manages featured templates and stories for homepage

import { useQuery } from 'react-query';
import { contentCurationService, type FeaturedContent } from '@/services/contentCuration';
import { supabase } from '@/lib/supabase';

export interface FeaturedContentData {
  hero: FeaturedContent | null;
  trending: FeaturedContent[];
  stories: FeaturedContent[];
}

export interface TemplateWithStats {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  difficulty: number;
  chapterCount: number;
  estimatedReadTime: string;
  baseCost: number;
  likes_count: number;
  rating_average: number;
  usage_count: number;
  creator_name?: string;
}

export interface StoryWithStats {
  id: string;
  title: string;
  description?: string;
  rating_average: number;
  completion_rate: number;
  created_at: string;
  creator_name?: string;
}

/**
 * Hook to fetch featured content for homepage
 */
export function useFeaturedContent() {
  return useQuery(
    'featured-content',
    () => contentCurationService.getFeaturedContent(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false
    }
  );
}

/**
 * Hook to fetch detailed data for featured templates
 */
export function useFeaturedTemplates() {
  const { data: featuredContent } = useFeaturedContent();
  
  return useQuery(
    ['featured-templates', featuredContent],
    async () => {
      if (!featuredContent) return { hero: null, trending: [] };
      
      // Get template IDs
      const heroId = featuredContent.hero?.content_type === 'template' ? 
        featuredContent.hero.content_id : null;
      const trendingIds = featuredContent.trending
        .filter(item => item.content_type === 'template')
        .map(item => item.content_id);
      
      if (!heroId && trendingIds.length === 0) {
        return { hero: null, trending: [] };
      }
      
      // Fetch template details with social stats
      const allIds = [heroId, ...trendingIds].filter(Boolean) as string[];
      
      const { data, error } = await supabase
        .from('templates')
        .select(`
          id,
          name,
          description,
          icon,
          category,
          difficulty,
          chapterCount,
          estimatedReadTime,
          baseCost,
          likes_count,
          rating_average,
          usage_count,
          creator:creator_id(display_name)
        `)
        .in('id', allIds);
        
      if (error) throw error;
      
      // Type the database result properly
      type DatabaseTemplate = {
        id: string;
        name: string;
        description: string;
        icon: string;
        category: string;
        difficulty: number;
        chapterCount: number;
        estimatedReadTime: string;
        baseCost: number;
        likes_count: number;
        rating_average: number;
        usage_count: number;
        creator?: { display_name?: string } | null;
      };
      
      const templatesMap = new Map(
        (data as DatabaseTemplate[] || []).map(template => [
          template.id, 
          {
            ...template,
            creator_name: template.creator?.display_name || 'Anonymous'
          }
        ])
      );
      
      return {
        hero: heroId ? templatesMap.get(heroId) || null : null,
        trending: trendingIds.map(id => templatesMap.get(id)).filter(Boolean) as TemplateWithStats[]
      };
    },
    {
      enabled: !!featuredContent,
      staleTime: 5 * 60 * 1000
    }
  );
}

/**
 * Hook to fetch detailed data for featured stories
 */
export function useFeaturedStories() {
  const { data: featuredContent } = useFeaturedContent();
  
  return useQuery(
    ['featured-stories', featuredContent],
    async () => {
      if (!featuredContent?.stories.length) return [];
      
      const storyIds = featuredContent.stories
        .filter(item => item.content_type === 'story')
        .map(item => item.content_id);
        
      if (storyIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('stories')
        .select(`
          id,
          title,
          description,
          rating_average,
          completion_rate,
          created_at,
          creator:creator_id(display_name)
        `)
        .in('id', storyIds);
        
      if (error) throw error;
      
      // Type the database result properly
      type DatabaseStory = {
        id: string;
        title: string;
        description?: string;
        rating_average: number;
        completion_rate: number;
        created_at: string;
        creator?: { display_name?: string } | null;
      };
      
      return (data as DatabaseStory[] || []).map(story => ({
        ...story,
        creator_name: story.creator?.display_name || 'Anonymous'
      })) as StoryWithStats[];
    },
    {
      enabled: !!featuredContent?.stories.length,
      staleTime: 5 * 60 * 1000
    }
  );
}

/**
 * Hook to fetch trending templates (real-time)
 */
export function useTrendingTemplates(limit: number = 6) {
  return useQuery(
    ['trending-templates', limit],
    async () => {
      const { data, error } = await supabase
        .from('templates')
        .select(`
          id,
          name,
          description,
          icon,
          category,
          difficulty,
          chapterCount,
          estimatedReadTime,
          baseCost,
          likes_count,
          rating_average,
          usage_count,
          creator:creator_id(display_name)
        `)
        .eq('is_public', true)
        .order('quality_score', { ascending: false })
        .order('likes_count', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      
      // Type the database result properly
      type DatabaseTemplate = {
        id: string;
        name: string;
        description: string;
        icon: string;
        category: string;
        difficulty: number;
        chapterCount: number;
        estimatedReadTime: string;
        baseCost: number;
        likes_count: number;
        rating_average: number;
        usage_count: number;
        creator?: { display_name?: string } | null;
      };
      
      return (data as DatabaseTemplate[] || []).map(template => ({
        ...template,
        creator_name: template.creator?.display_name || 'Anonymous'
      })) as TemplateWithStats[];
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes for trending data
      cacheTime: 5 * 60 * 1000
    }
  );
}

/**
 * Hook to track featured content impressions
 */
export function useTrackFeaturedContentImpression() {
  const trackImpression = async (contentId: string, contentType: 'template' | 'story') => {
    try {
      await supabase.rpc('track_featured_impression', {
        content_id: contentId,
        content_type: contentType
      });
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  };
  
  return { trackImpression };
}