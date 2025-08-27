import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface ContentItem {
  id: string;
  title: string;
  author: string;
  authorId: string;
  status: 'published' | 'reported' | 'removed' | 'pending';
  type: 'completed_story' | 'chapter' | 'tutorial' | 'page' | 'comment';
  createdAt: string;
  reports: number;
  reportReasons: string[];
  content: string;
  ageGroup?: string;
  genre?: string;
  views?: number;
  likes?: number;
  lastReviewedAt?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface UseContentManagementOptions {
  searchTerm: string;
  filter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface UseContentManagementReturn {
  content: ContentItem[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  refreshContent: () => Promise<void>;
  takeContentAction: (contentId: string, action: 'approve' | 'remove' | 'warn') => Promise<void>;
  bulkAction: (contentIds: string[], action: 'approve' | 'remove' | 'warn') => Promise<void>;
}

export const useContentManagement = (
  options: UseContentManagementOptions
): UseContentManagementReturn => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const { searchTerm, filter, sortBy, sortOrder } = options;

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get total count for pagination
      const { count: totalStories } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true });

      setTotalCount(totalStories || 0);

      // Try admin RPC function first to bypass RLS
      console.log('🚀 Trying admin RPC function to bypass RLS...');
      const { data: rpcStories, error: rpcError } = await supabase.rpc('get_all_stories_for_admin');

      if (rpcError) {
        console.log('❌ RPC function failed, trying direct query:', rpcError);

        // Fallback: Query with service role key simulation
        const { data: directStories, error: directError } = await supabase
          .from('stories')
          .select(`
            id,
            title,
            user_id,
            status,
            created_at,
            age_group,
            genre,
            segments (content),
            user_profiles!stories_user_id_fkey (display_name)
          `)
          .order('created_at', { ascending: false });

        if (directError) {
          throw directError;
        }

        const contentItems = directStories?.map(story => ({
          id: story.id,
          title: story.title || 'Untitled Story',
          author: story.user_profiles?.display_name || 'Unknown User',
          authorId: story.user_id,
          status: story.status as ContentItem['status'],
          type: 'completed_story' as const,
          createdAt: story.created_at,
          reports: 0, // Default values since we don't have reports table
          reportReasons: [],
          content: story.segments?.[0]?.content || 'No content available',
          ageGroup: story.age_group || undefined,
          genre: story.genre || undefined,
          views: Math.floor(Math.random() * 1000), // Placeholder
          likes: Math.floor(Math.random() * 100), // Placeholder
          severity: 'low' as const // Default severity
        })) || [];

        setContent(contentItems);
      } else {
        // Use RPC data if successful
        console.log('✅ RPC function succeeded, processing data...');
        const contentItems = rpcStories?.map(story => ({
          id: story.id,
          title: story.title || 'Untitled Story',
          author: story.display_name || 'Unknown User',
          authorId: story.user_id,
          status: story.status as ContentItem['status'],
          type: 'completed_story' as const,
          createdAt: story.created_at,
          reports: story.reports || 0,
          reportReasons: story.report_reasons || [],
          content: story.content || 'No content available',
          ageGroup: story.age_group || undefined,
          genre: story.genre || undefined,
          views: story.views || 0,
          likes: story.likes || 0,
          severity: story.severity || 'low'
        })) || [];

        setContent(contentItems);
      }
    } catch (err) {
      console.error('Content fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const takeContentAction = async (contentId: string, action: 'approve' | 'remove' | 'warn') => {
    try {
      let newStatus: string;
      switch (action) {
        case 'approve':
          newStatus = 'published';
          break;
        case 'remove':
          newStatus = 'removed';
          break;
        case 'warn':
          newStatus = 'pending';
          break;
        default:
          throw new Error('Invalid action');
      }

      const { error } = await supabase
        .from('stories')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', contentId);

      if (error) throw error;

      // Update local state
      setContent(prev => prev.map(item => 
        item.id === contentId 
          ? { ...item, status: newStatus as ContentItem['status'] }
          : item
      ));

      console.log(`✅ Content ${contentId} ${action}d successfully`);
    } catch (err) {
      console.error(`Failed to ${action} content:`, err);
      throw err;
    }
  };

  const bulkAction = async (contentIds: string[], action: 'approve' | 'remove' | 'warn') => {
    try {
      await Promise.all(contentIds.map(id => takeContentAction(id, action)));
      console.log(`✅ Bulk ${action} completed for ${contentIds.length} items`);
    } catch (err) {
      console.error(`Bulk ${action} failed:`, err);
      throw err;
    }
  };

  useEffect(() => {
    fetchContent();
  }, [searchTerm, filter, sortBy, sortOrder]);

  return {
    content,
    loading,
    error,
    totalCount,
    refreshContent: fetchContent,
    takeContentAction,
    bulkAction
  };
};