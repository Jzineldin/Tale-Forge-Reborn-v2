// Automated Content Curation System
// AI-powered system for featuring templates and stories on homepage

import { supabase } from '@/lib/supabase';

export interface CurationCandidate {
  id: string;
  type: 'template' | 'story';
  title: string;
  creator: {
    id: string;
    name: string;
    reputation_score: number;
  };
  metrics: {
    likes_count: number;
    usage_count: number;
    rating_average: number;
    completion_rate: number;
    recent_engagement: number;
  };
  quality_score: number;
  created_at: string;
}

export interface FeaturedContent {
  id: string;
  content_type: 'template' | 'story';
  content_id: string;
  title: string;
  description: string;
  featured_image_url?: string;
  feature_type: 'hero' | 'trending' | 'community_pick' | 'algorithmic';
  featured_from: string;
  featured_until: string;
  display_order: number;
}

class ContentCurationService {
  
  /**
   * Calculate template feature score using multi-factor algorithm
   */
  private calculateTemplateScore(template: any): number {
    const weights = {
      qualityScore: 0.30,        // Overall quality rating
      recentPopularity: 0.25,    // Usage in last 7 days
      socialEngagement: 0.20,    // Likes + reviews + shares
      creatorReputation: 0.15,   // Creator's overall score
      diversity: 0.10            // Category diversity bonus
    };
    
    // Normalize metrics to 0-1 scale
    const normalizedMetrics = {
      qualityScore: Math.min(template.quality_score / 10, 1),
      recentPopularity: Math.min(template.recent_usage / 100, 1), // Cap at 100 uses/week
      socialEngagement: Math.min((template.likes_count + template.reviews_count * 2) / 50, 1),
      creatorReputation: Math.min(template.creator_reputation / 10, 1),
      diversity: this.calculateDiversityBonus(template.category)
    };
    
    // Calculate weighted score
    let score = Object.entries(weights).reduce((total, [metric, weight]) => {
      return total + (normalizedMetrics[metric as keyof typeof normalizedMetrics] * weight);
    }, 0);
    
    // Apply boost multipliers
    const recencyBoost = this.isWithinDays(template.created_at, 30) ? 1.2 : 1.0;
    const trendingBoost = template.recent_usage > template.average_usage * 2 ? 1.3 : 1.0;
    const qualityBoost = template.rating_average > 4.5 ? 1.1 : 1.0;
    
    return score * recencyBoost * trendingBoost * qualityBoost;
  }
  
  /**
   * Calculate story feature score
   */
  private calculateStoryScore(story: any): number {
    const weights = {
      completionRate: 0.30,      // How many finish reading
      avgRating: 0.25,           // User ratings
      engagementTime: 0.20,      // Time spent reading
      socialShares: 0.15,        // Viral potential
      contentQuality: 0.10       // AI quality assessment
    };
    
    // Normalize metrics
    const normalizedMetrics = {
      completionRate: story.completion_rate || 0,
      avgRating: (story.rating_average || 0) / 5,
      engagementTime: Math.min(story.avg_engagement_time / 300, 1), // Cap at 5 minutes
      socialShares: Math.min(story.shares_count / 20, 1), // Cap at 20 shares
      contentQuality: Math.min(story.quality_score / 10, 1)
    };
    
    let score = Object.entries(weights).reduce((total, [metric, weight]) => {
      return total + (normalizedMetrics[metric as keyof typeof normalizedMetrics] * weight);
    }, 0);
    
    // Boost multipliers
    const freshBoost = this.isWithinDays(story.created_at, 14) ? 1.1 : 1.0;
    const viralBoost = story.shares_count > story.average_shares * 3 ? 1.4 : 1.0;
    
    return score * freshBoost * viralBoost;
  }
  
  /**
   * Get diversity bonus for underrepresented categories
   */
  private calculateDiversityBonus(category: string): number {
    // TODO: Implement actual category distribution analysis
    // For now, return base score
    return 0.5;
  }
  
  /**
   * Check if date is within specified days
   */
  private isWithinDays(dateString: string, days: number): boolean {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days;
  }
  
  /**
   * Get template candidates for featuring
   */
  async getTemplateCandidates(limit: number = 50): Promise<CurationCandidate[]> {
    const { data, error } = await supabase.rpc('get_template_candidates', {
      limit_count: limit
    });
    
    if (error) throw error;
    
    return data.map((template: any) => ({
      id: template.id,
      type: 'template' as const,
      title: template.name,
      creator: {
        id: template.creator_id,
        name: template.creator_name,
        reputation_score: template.creator_reputation
      },
      metrics: {
        likes_count: template.likes_count,
        usage_count: template.usage_count,
        rating_average: template.rating_average,
        completion_rate: template.completion_rate,
        recent_engagement: template.recent_engagement
      },
      quality_score: this.calculateTemplateScore(template),
      created_at: template.created_at
    }));
  }
  
  /**
   * Get story candidates for featuring
   */
  async getStoryCandidates(limit: number = 50): Promise<CurationCandidate[]> {
    const { data, error } = await supabase.rpc('get_story_candidates', {
      limit_count: limit
    });
    
    if (error) throw error;
    
    return data.map((story: any) => ({
      id: story.id,
      type: 'story' as const,
      title: story.title,
      creator: {
        id: story.creator_id,
        name: story.creator_name,
        reputation_score: story.creator_reputation
      },
      metrics: {
        likes_count: story.likes_count,
        usage_count: 0, // Stories don't have usage count
        rating_average: story.rating_average,
        completion_rate: story.completion_rate,
        recent_engagement: story.recent_engagement
      },
      quality_score: this.calculateStoryScore(story),
      created_at: story.created_at
    }));
  }
  
  /**
   * Apply diversity filters to ensure balanced content
   */
  private applyDiversityFilters(candidates: CurationCandidate[]): CurationCandidate[] {
    // Group by category and ensure representation
    const categoryCounts: { [key: string]: number } = {};
    const maxPerCategory = Math.ceil(candidates.length * 0.4); // Max 40% from one category
    
    return candidates.filter(candidate => {
      // TODO: Get actual category from candidate
      const category = 'general'; // Placeholder
      
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      return categoryCounts[category] <= maxPerCategory;
    });
  }
  
  /**
   * Select final featured content
   */
  async selectFeaturedContent(): Promise<{
    heroTemplate: CurationCandidate;
    trendingTemplates: CurationCandidate[];
    featuredStories: CurationCandidate[];
  }> {
    // Get candidates
    const [templateCandidates, storyCandidates] = await Promise.all([
      this.getTemplateCandidates(30),
      this.getStoryCandidates(20)
    ]);
    
    // Sort by quality score
    const topTemplates = templateCandidates
      .sort((a, b) => b.quality_score - a.quality_score)
      .slice(0, 10);
      
    const topStories = storyCandidates
      .sort((a, b) => b.quality_score - a.quality_score)
      .slice(0, 6);
    
    // Apply diversity filters
    const diverseTemplates = this.applyDiversityFilters(topTemplates);
    const diverseStories = this.applyDiversityFilters(topStories);
    
    return {
      heroTemplate: diverseTemplates[0], // Best template for hero section
      trendingTemplates: diverseTemplates.slice(1, 7), // Next 6 for trending
      featuredStories: diverseStories.slice(0, 4) // Top 4 stories
    };
  }
  
  /**
   * Schedule featured content in database
   */
  async scheduleFeaturedContent(): Promise<void> {
    try {
      const selection = await this.selectFeaturedContent();
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      // Clear existing featured content
      await supabase
        .from('featured_content')
        .update({ is_active: false })
        .eq('is_active', true);
      
      // Schedule new content
      const featuredItems = [
        // Hero template
        {
          content_type: 'template',
          content_id: selection.heroTemplate.id,
          title: selection.heroTemplate.title,
          description: 'This week\'s featured template - create your own story!',
          feature_type: 'hero',
          featured_from: now.toISOString(),
          featured_until: weekFromNow.toISOString(),
          display_order: 1
        },
        
        // Trending templates
        ...selection.trendingTemplates.map((template, index) => ({
          content_type: 'template' as const,
          content_id: template.id,
          title: template.title,
          description: 'Trending in the community',
          feature_type: 'trending' as const,
          featured_from: now.toISOString(),
          featured_until: weekFromNow.toISOString(),
          display_order: index + 2
        })),
        
        // Featured stories
        ...selection.featuredStories.map((story, index) => ({
          content_type: 'story' as const,
          content_id: story.id,
          title: story.title,
          description: 'Community favorite story',
          feature_type: 'community_pick' as const,
          featured_from: now.toISOString(),
          featured_until: weekFromNow.toISOString(),
          display_order: index + 10
        }))
      ];
      
      const { error } = await supabase
        .from('featured_content')
        .insert(featuredItems);
        
      if (error) throw error;
      
      console.log('✅ Featured content scheduled successfully');
      
    } catch (error) {
      console.error('❌ Error scheduling featured content:', error);
      throw error;
    }
  }
  
  /**
   * Get current featured content for homepage
   */
  async getFeaturedContent(): Promise<{
    hero: FeaturedContent | null;
    trending: FeaturedContent[];
    stories: FeaturedContent[];
  }> {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('featured_content')
      .select('*')
      .eq('is_active', true)
      .lte('featured_from', now)
      .gte('featured_until', now)
      .order('display_order');
      
    if (error) throw error;
    
    const featured = data || [];
    
    return {
      hero: featured.find(item => item.feature_type === 'hero') || null,
      trending: featured.filter(item => item.feature_type === 'trending'),
      stories: featured.filter(item => item.feature_type === 'community_pick')
    };
  }
  
  /**
   * Detect viral content in real-time
   */
  async detectViralContent(): Promise<CurationCandidate[]> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    // Get content with unusual activity spikes
    const { data, error } = await supabase.rpc('detect_viral_content', {
      since_time: oneHourAgo
    });
    
    if (error) throw error;
    
    return data.map((item: any) => ({
      id: item.id,
      type: item.content_type,
      title: item.title,
      creator: {
        id: item.creator_id,
        name: item.creator_name,
        reputation_score: item.creator_reputation
      },
      metrics: {
        likes_count: item.likes_count,
        usage_count: item.usage_count || 0,
        rating_average: item.rating_average,
        completion_rate: item.completion_rate || 0,
        recent_engagement: item.recent_engagement
      },
      quality_score: item.viral_score,
      created_at: item.created_at
    }));
  }
}

export const contentCurationService = new ContentCurationService();