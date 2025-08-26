import { supabase } from '../lib/supabase';

/**
 * Simple Template Credit System
 * 1 credit per chapter (includes text + image)
 */

export interface TemplateTier {
  id: 'short' | 'medium' | 'long';
  name: string;
  chapters: number;
  totalCost: number;
  description: string;
}

export interface StoryTemplate {
  id: string;
  name: string;
  description: string;
  genre: string;
  age_group: '3-5' | '6-8' | '9-12' | '13+';
  difficulty: 1 | 2 | 3 | 4 | 5;
  characters: TemplateCharacter[];
  settings: TemplateSetting[];
  plot_elements: string[];
  is_preset: boolean;
  creator_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateCharacter {
  name: string;
  description: string;
  personality: string;
  appearance: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'mentor';
}

export interface TemplateSetting {
  name: string;
  description: string;
  atmosphere: string;
  time_period?: string;
  location_type: 'indoor' | 'outdoor' | 'fantasy' | 'historical' | 'modern';
}

export interface SubscriptionLimits {
  template_creation_limit: number;
  custom_templates_created: number;
  can_create_templates: boolean;
  subscription_tier: 'free' | 'basic' | 'pro';
}

export interface StoryCreationCost {
  template_id: string;
  tier: TemplateTier;
  includes_audio: boolean;
  total_cost: number;
  breakdown: {
    story_cost: number;
    audio_cost: number;
  };
}

class TemplateCreditsService {
  // Simple 3-tier pricing: 1 credit per chapter (includes text + image)
  private readonly TEMPLATE_TIERS: TemplateTier[] = [
    {
      id: 'short',
      name: 'Short Story',
      chapters: 3,
      totalCost: 3,
      description: '3 chapters - Perfect for bedtime stories'
    },
    {
      id: 'medium', 
      name: 'Medium Story',
      chapters: 5,
      totalCost: 5,
      description: '5 chapters - Great for weekend adventures'
    },
    {
      id: 'long',
      name: 'Long Story',
      chapters: 8,
      totalCost: 8,
      description: '8 chapters - Epic tales for story lovers'
    }
  ];

  private readonly AUDIO_COST = 5; // Flat 5 credits for full story audio

  /**
   * Get all available template tiers
   */
  getTemplateTiers(): TemplateTier[] {
    return this.TEMPLATE_TIERS;
  }

  /**
   * Calculate cost for creating a story from a template
   */
  calculateTemplateStoryCost(
    tierId: 'short' | 'medium' | 'long',
    includeAudio = false
  ): StoryCreationCost {
    const tier = this.TEMPLATE_TIERS.find(t => t.id === tierId);
    if (!tier) {
      throw new Error('Invalid tier ID');
    }

    const audioCost = includeAudio ? this.AUDIO_COST : 0;
    const totalCost = tier.totalCost + audioCost;

    return {
      template_id: '',
      tier,
      includes_audio: includeAudio,
      total_cost: totalCost,
      breakdown: {
        story_cost: tier.totalCost,
        audio_cost: audioCost
      }
    };
  }

  /**
   * Get preset templates from gallery
   */
  async getPresetTemplates(
    genre?: string,
    age_group?: string,
    limit = 20
  ): Promise<StoryTemplate[]> {
    try {
      let query = supabase
        .from('story_templates')
        .select('*')
        .eq('is_preset', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (genre) query = query.eq('genre', genre);
      if (age_group) query = query.eq('age_group', age_group);

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch preset templates: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('TemplateCreditsService.getPresetTemplates error:', error);
      throw error;
    }
  }

  /**
   * Get user's custom templates
   */
  async getUserCustomTemplates(userId: string): Promise<StoryTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('story_templates')
        .select('*')
        .eq('creator_id', userId)
        .eq('is_preset', false)
        .order('updated_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch user templates: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('TemplateCreditsService.getUserCustomTemplates error:', error);
      throw error;
    }
  }

  /**
   * Check user's template creation limits based on subscription
   */
  async getSubscriptionLimits(userId: string): Promise<SubscriptionLimits> {
    try {
      const { data, error } = await supabase.rpc('get_user_template_limits', {
        user_uuid: userId
      });

      if (error) {
        throw new Error(`Failed to get subscription limits: ${error.message}`);
      }

      return data || {
        template_creation_limit: 0,
        custom_templates_created: 0,
        can_create_templates: false,
        subscription_tier: 'free'
      };
    } catch (error) {
      console.error('TemplateCreditsService.getSubscriptionLimits error:', error);
      // Fallback for free tier
      return {
        template_creation_limit: 0,
        custom_templates_created: 0,
        can_create_templates: false,
        subscription_tier: 'free'
      };
    }
  }

  /**
   * Create a custom template (if user has subscription limits)
   */
  async createCustomTemplate(template: Omit<StoryTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Check if user can create templates
      const limits = await this.getSubscriptionLimits(user.id);
      
      if (!limits.can_create_templates || limits.custom_templates_created >= limits.template_creation_limit) {
        throw new Error(`Template creation limit reached. Upgrade your subscription to create more templates.`);
      }

      const { data, error } = await supabase
        .from('story_templates')
        .insert([{
          ...template,
          creator_id: user.id,
          is_preset: false
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create template: ${error.message}`);
      }

      return data.id;
    } catch (error) {
      console.error('TemplateCreditsService.createCustomTemplate error:', error);
      throw error;
    }
  }

  /**
   * Process story creation from template with credit payment
   */
  async createStoryFromTemplate(
    templateId: string,
    tierId: 'short' | 'medium' | 'long',
    includeAudio = false,
    customizations: {
      title: string;
      child_name?: string;
      difficulty_adjustment?: number;
    }
  ): Promise<{ success: boolean; story_id?: string; cost: StoryCreationCost }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Calculate cost
      const cost = this.calculateTemplateStoryCost(tierId, includeAudio);
      cost.template_id = templateId;

      // Check if user can afford
      const { data: userCredits, error: creditsError } = await supabase.rpc('get_user_credits', {
        user_uuid: user.id
      });

      if (creditsError) {
        throw new Error(`Failed to check user credits: ${creditsError.message}`);
      }

      const currentBalance = userCredits?.current_balance || 0;
      if (currentBalance < cost.total_cost) {
        throw new Error(`Insufficient credits. Need ${cost.total_cost}, have ${currentBalance}`);
      }

      // Create story and deduct credits in transaction
      const { data, error } = await supabase.rpc('create_story_from_template', {
        user_uuid: user.id,
        template_uuid: templateId,
        tier_id: tierId,
        story_title: customizations.title,
        child_name: customizations.child_name || null,
        includes_audio: includeAudio,
        credit_cost: cost.total_cost
      });

      if (error) {
        throw new Error(`Failed to create story: ${error.message}`);
      }

      return {
        success: true,
        story_id: data.story_id,
        cost
      };

    } catch (error) {
      console.error('TemplateCreditsService.createStoryFromTemplate error:', error);
      return {
        success: false,
        cost: this.calculateTemplateStoryCost(tierId, includeAudio)
      };
    }
  }

  /**
   * Calculate audio cost for completed story (flat 5 credits)
   */
  calculateStoryAudioCost(): {
    audioCost: number;
    description: string;
  } {
    return {
      audioCost: this.AUDIO_COST,
      description: `Professional narration for entire story (${this.AUDIO_COST} credits)`
    };
  }

  /**
   * Purchase audio narration for completed story
   */
  async purchaseStoryAudio(
    storyId: string
  ): Promise<{ success: boolean; cost: number; audioUrl?: string }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { audioCost } = this.calculateStoryAudioCost();

      // Check if user can afford
      const { data: userCredits, error: creditsError } = await supabase.rpc('get_user_credits', {
        user_uuid: user.id
      });

      if (creditsError) {
        throw new Error(`Failed to check user credits: ${creditsError.message}`);
      }

      const currentBalance = userCredits?.current_balance || 0;
      if (currentBalance < audioCost) {
        throw new Error(`Insufficient credits. Need ${audioCost}, have ${currentBalance}`);
      }

      // Process audio purchase
      const { data, error } = await supabase.rpc('purchase_full_story_audio', {
        user_uuid: user.id,
        story_uuid: storyId,
        credit_cost: audioCost
      });

      if (error) {
        throw new Error(`Failed to purchase audio: ${error.message}`);
      }

      return {
        success: true,
        cost: audioCost,
        audioUrl: data?.audio_url
      };

    } catch (error) {
      console.error('TemplateCreditsService.purchaseStoryAudio error:', error);
      return {
        success: false,
        cost: 0
      };
    }
  }
}

export const templateCreditsService = new TemplateCreditsService();