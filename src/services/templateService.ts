import { supabase } from '../lib/supabase';

export interface UserStoryTemplate {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  genre: string;
  age_group: '3-5' | '6-8' | '9-12' | '13+';
  difficulty_level: number; // 1-5
  characters: Array<{
    name: string;
    description: string;
    personality?: string;
    appearance?: string;
  }>;
  settings: Array<{
    name: string;
    description: string;
    atmosphere?: string;
    details?: string;
  }>;
  plot_elements: Array<{
    element: string;
    description: string;
    importance?: 'low' | 'medium' | 'high';
  }>;
  story_hooks: Array<{
    hook: string;
    description: string;
    type?: 'opening' | 'conflict' | 'twist' | 'resolution';
  }>;
  estimated_chapters: number;
  estimated_word_count: number;
  tags: string[];
  is_public: boolean;
  is_featured: boolean;
  is_approved: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  usage_count: number;
  likes_count: number;
  saves_count: number;
  reviews_count: number;
  rating_average: number;
  creator_tier: 'free' | 'creator' | 'master';
  credits_earned: number;
  created_at: string;
  updated_at: string;
  last_used_at?: string;
  featured_at?: string;
  creator?: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface TemplateUsageLog {
  id: string;
  template_id: string;
  template_creator_id: string;
  user_id: string;
  story_id?: string;
  credits_awarded: number;
  award_processed: boolean;
  usage_type: 'story_creation' | 'template_copy' | 'inspiration';
  created_at: string;
}

export interface TemplateAnalytics {
  id: string;
  template_id: string;
  date: string;
  views_count: number;
  unique_viewers: number;
  uses_count: number;
  unique_users: number;
  likes_count: number;
  saves_count: number;
  shares_count: number;
  rating_average: number;
  reviews_count: number;
}

export interface CreateTemplateData {
  title: string;
  description?: string;
  genre: string;
  age_group: '3-5' | '6-8' | '9-12' | '13+';
  difficulty_level?: number;
  characters: Array<{
    name: string;
    description: string;
    personality?: string;
    appearance?: string;
  }>;
  settings: Array<{
    name: string;
    description: string;
    atmosphere?: string;
    details?: string;
  }>;
  plot_elements: Array<{
    element: string;
    description: string;
    importance?: 'low' | 'medium' | 'high';
  }>;
  story_hooks: Array<{
    hook: string;
    description: string;
    type?: 'opening' | 'conflict' | 'twist' | 'resolution';
  }>;
  estimated_chapters?: number;
  estimated_word_count?: number;
  tags?: string[];
  is_public?: boolean;
}

class TemplateService {
  /**
   * Create a new user template
   */
  async createTemplate(userId: string, templateData: CreateTemplateData): Promise<UserStoryTemplate> {
    // Get user's tier to determine limits
    const userTier = await this.getUserTier(userId);
    const templateCount = await this.getUserTemplateCount(userId);
    
    // Check tier limits
    if (!this.canCreateTemplate(userTier, templateCount, templateData.is_public)) {
      throw new Error('Template creation limit reached for your tier');
    }

    const { data, error } = await supabase
      .from('user_story_templates')
      .insert({
        creator_id: userId,
        creator_tier: userTier,
        ...templateData
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating template:', error);
      throw new Error(`Failed to create template: ${error.message}`);
    }

    // Update user progress stats
    await supabase.rpc('update_user_progress_stats', {
      user_uuid: userId,
      stat_type: 'template_created'
    });

    // If making public, update public template count
    if (templateData.is_public) {
      await supabase.rpc('update_user_progress_stats', {
        user_uuid: userId,
        stat_type: 'template_made_public'
      });
    }

    return data;
  }

  /**
   * Update an existing template
   */
  async updateTemplate(
    userId: string, 
    templateId: string, 
    updateData: Partial<CreateTemplateData>
  ): Promise<UserStoryTemplate> {
    const { data, error } = await supabase
      .from('user_story_templates')
      .update(updateData)
      .eq('id', templateId)
      .eq('creator_id', userId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating template:', error);
      throw new Error(`Failed to update template: ${error.message}`);
    }

    // If making public for the first time, update stats
    if (updateData.is_public && !data.is_public) {
      await supabase.rpc('update_user_progress_stats', {
        user_uuid: userId,
        stat_type: 'template_made_public'
      });
    }

    return data;
  }

  /**
   * Delete a template
   */
  async deleteTemplate(userId: string, templateId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_story_templates')
      .delete()
      .eq('id', templateId)
      .eq('creator_id', userId);

    if (error) {
      console.error('Error deleting template:', error);
      throw new Error(`Failed to delete template: ${error.message}`);
    }

    return true;
  }

  /**
   * Get template by ID
   */
  async getTemplateById(templateId: string, userId?: string): Promise<UserStoryTemplate | null> {
    let query = supabase
      .from('user_story_templates')
      .select('*')
      .eq('id', templateId);

    // If user is provided, they can see their own private templates
    if (userId) {
      query = query.or(`is_public.eq.true,creator_id.eq.${userId}`);
    } else {
      query = query.eq('is_public', true);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching template:', error);
      throw new Error(`Failed to fetch template: ${error.message}`);
    }

    // Update analytics
    if (data && userId && userId !== data.creator_id) {
      await this.updateTemplateAnalytics(templateId, 'view', userId);
    }

    return data;
  }

  /**
   * Get user's templates
   */
  async getUserTemplates(
    userId: string, 
    includePrivate: boolean = true,
    limit: number = 20,
    offset: number = 0
  ): Promise<UserStoryTemplate[]> {
    let query = supabase
      .from('user_story_templates')
      .select('*')
      .eq('creator_id', userId)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (!includePrivate) {
      query = query.eq('is_public', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user templates:', error);
      throw new Error(`Failed to fetch user templates: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get public templates with filters
   */
  async getPublicTemplates(options: {
    genre?: string;
    age_group?: string;
    difficulty_level?: number;
    tags?: string[];
    featured_only?: boolean;
    search?: string;
    sort_by?: 'popular' | 'recent' | 'highly_rated' | 'most_used';
    limit?: number;
    offset?: number;
  } = {}): Promise<UserStoryTemplate[]> {
    const {
      genre,
      age_group,
      difficulty_level,
      tags,
      featured_only = false,
      search,
      sort_by = 'popular',
      limit = 20,
      offset = 0
    } = options;

    let query = supabase
      .from('user_story_templates')
      .select('*')
      .eq('is_public', true)
      .eq('is_approved', true);

    // Apply filters
    if (genre) query = query.eq('genre', genre);
    if (age_group) query = query.eq('age_group', age_group);
    if (difficulty_level) query = query.eq('difficulty_level', difficulty_level);
    if (featured_only) query = query.eq('is_featured', true);
    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply sorting
    switch (sort_by) {
      case 'popular':
        query = query.order('likes_count', { ascending: false })
                    .order('usage_count', { ascending: false });
        break;
      case 'recent':
        query = query.order('created_at', { ascending: false });
        break;
      case 'highly_rated':
        query = query.order('rating_average', { ascending: false })
                    .order('reviews_count', { ascending: false });
        break;
      case 'most_used':
        query = query.order('usage_count', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching public templates:', error);
      throw new Error(`Failed to fetch public templates: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get featured templates
   */
  async getFeaturedTemplates(): Promise<UserStoryTemplate[]> {
    return this.getPublicTemplates({ featured_only: true, limit: 6 });
  }

  /**
   * Use a template (log usage and award credits)
   */
  async useTemplate(
    userId: string, 
    templateId: string, 
    storyId?: string,
    usageType: 'story_creation' | 'template_copy' | 'inspiration' = 'story_creation'
  ): Promise<boolean> {
    // Get template info
    const template = await this.getTemplateById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Don't log usage if user is using their own template
    if (template.creator_id === userId) {
      return true;
    }

    // Log the usage
    const { error } = await supabase
      .from('template_usage_logs')
      .insert({
        template_id: templateId,
        template_creator_id: template.creator_id,
        user_id: userId,
        story_id: storyId,
        usage_type: usageType
      });

    if (error) {
      console.error('Error logging template usage:', error);
      throw new Error(`Failed to log template usage: ${error.message}`);
    }

    // Update analytics
    await this.updateTemplateAnalytics(templateId, 'use', userId);

    // Update user progress
    await supabase.rpc('update_user_progress_stats', {
      user_uuid: template.creator_id,
      stat_type: 'template_usage_received'
    });

    return true;
  }

  /**
   * Like/unlike a template
   */
  async toggleTemplateLike(userId: string, templateId: string): Promise<{ liked: boolean }> {
    // Check if already liked
    const { data: existingLike } = await supabase
      .from('template_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('template_id', templateId)
      .single();

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('template_likes')
        .delete()
        .eq('user_id', userId)
        .eq('template_id', templateId);

      if (error) {
        console.error('Error unliking template:', error);
        throw new Error(`Failed to unlike template: ${error.message}`);
      }

      return { liked: false };
    } else {
      // Like
      const { error } = await supabase
        .from('template_likes')
        .insert({
          user_id: userId,
          template_id: templateId
        });

      if (error) {
        console.error('Error liking template:', error);
        throw new Error(`Failed to like template: ${error.message}`);
      }

      // Update analytics and user progress
      await this.updateTemplateAnalytics(templateId, 'like', userId);
      
      await supabase.rpc('update_user_progress_stats', {
        user_uuid: userId,
        stat_type: 'like_given'
      });

      // Get template creator and update their stats
      const template = await this.getTemplateById(templateId);
      if (template) {
        await supabase.rpc('update_user_progress_stats', {
          user_uuid: template.creator_id,
          stat_type: 'like_received'
        });
      }

      return { liked: true };
    }
  }

  /**
   * Save/unsave a template
   */
  async toggleTemplateSave(userId: string, templateId: string): Promise<{ saved: boolean }> {
    // Check if already saved
    const { data: existingSave } = await supabase
      .from('template_saves')
      .select('id')
      .eq('user_id', userId)
      .eq('template_id', templateId)
      .single();

    if (existingSave) {
      // Unsave
      const { error } = await supabase
        .from('template_saves')
        .delete()
        .eq('user_id', userId)
        .eq('template_id', templateId);

      if (error) {
        console.error('Error unsaving template:', error);
        throw new Error(`Failed to unsave template: ${error.message}`);
      }

      return { saved: false };
    } else {
      // Save
      const { error } = await supabase
        .from('template_saves')
        .insert({
          user_id: userId,
          template_id: templateId
        });

      if (error) {
        console.error('Error saving template:', error);
        throw new Error(`Failed to save template: ${error.message}`);
      }

      // Update analytics and user progress
      await this.updateTemplateAnalytics(templateId, 'save', userId);
      
      await supabase.rpc('update_user_progress_stats', {
        user_uuid: userId,
        stat_type: 'template_saved'
      });

      return { saved: true };
    }
  }

  /**
   * Get user's saved templates
   */
  async getUserSavedTemplates(userId: string, limit: number = 20, offset: number = 0): Promise<UserStoryTemplate[]> {
    const { data, error } = await supabase
      .from('template_saves')
      .select(`
        *,
        template:user_story_templates(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching saved templates:', error);
      throw new Error(`Failed to fetch saved templates: ${error.message}`);
    }

    return (data || []).map(item => item.template).filter(Boolean);
  }

  /**
   * Get template analytics
   */
  async getTemplateAnalytics(templateId: string, days: number = 30): Promise<TemplateAnalytics[]> {
    const { data, error } = await supabase
      .from('template_analytics')
      .select('*')
      .eq('template_id', templateId)
      .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching template analytics:', error);
      throw new Error(`Failed to fetch template analytics: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Update template analytics
   */
  async updateTemplateAnalytics(
    templateId: string, 
    eventType: 'view' | 'use' | 'like' | 'save' | 'share',
    userId?: string
  ): Promise<void> {
    const { error } = await supabase.rpc('update_template_analytics', {
      template_uuid: templateId,
      event_type: eventType,
      user_uuid: userId
    });

    if (error) {
      console.error('Error updating template analytics:', error);
    }
  }

  /**
   * Get user's template creation limits based on tier
   */
  async getUserTier(userId: string): Promise<'free' | 'creator' | 'master'> {
    // This would check user's subscription tier - simplified for now
    const { data } = await supabase
      .from('user_subscriptions')
      .select('tier')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return (data?.tier as 'free' | 'creator' | 'master') || 'free';
  }

  /**
   * Get user's template count
   */
  async getUserTemplateCount(userId: string): Promise<{ total: number; public: number }> {
    const { data, error } = await supabase
      .from('user_story_templates')
      .select('is_public')
      .eq('creator_id', userId);

    if (error) {
      console.error('Error fetching template count:', error);
      return { total: 0, public: 0 };
    }

    const total = data?.length || 0;
    const publicCount = data?.filter(t => t.is_public).length || 0;

    return { total, public: publicCount };
  }

  /**
   * Check if user can create a template based on tier limits
   */
  canCreateTemplate(tier: string, currentCount: { total: number; public: number }, isPublic?: boolean): boolean {
    const limits = {
      free: { total: 3, public: 1 },
      creator: { total: 15, public: 5 },
      master: { total: Infinity, public: Infinity }
    };

    const tierLimits = limits[tier as keyof typeof limits] || limits.free;
    
    if (currentCount.total >= tierLimits.total) return false;
    if (isPublic && currentCount.public >= tierLimits.public) return false;
    
    return true;
  }
}

export const templateService = new TemplateService();