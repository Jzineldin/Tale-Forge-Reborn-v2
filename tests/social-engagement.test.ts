// Comprehensive Social Engagement System Tests
// Tests the entire like, bookmark, review, and sharing system

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for testing
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

describe('Social Engagement System', () => {
  let testTemplateId: string;
  let testUserId: string;
  let testUserId2: string;

  beforeAll(async () => {
    // Create test users
    const { data: user1, error: error1 } = await supabase.auth.signUp({
      email: 'test1@example.com',
      password: 'testpass123'
    });
    
    const { data: user2, error: error2 } = await supabase.auth.signUp({
      email: 'test2@example.com', 
      password: 'testpass123'
    });

    if (error1 || error2) {
      console.warn('Test users may already exist, continuing with tests');
    }

    // Get existing template ID for testing
    const { data: templates } = await supabase
      .from('story_templates')
      .select('id')
      .limit(1);

    if (templates && templates.length > 0) {
      testTemplateId = templates[0].id;
    } else {
      throw new Error('No templates found for testing');
    }
  });

  describe('Template Likes System', () => {
    it('should allow users to like templates', async () => {
      // Sign in as test user
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: 'test1@example.com',
        password: 'testpass123'
      });

      if (!authData.user) throw new Error('Failed to sign in test user');

      // Like the template
      const { data, error } = await supabase
        .from('story_template_likes')
        .insert({
          template_id: testTemplateId,
          user_id: authData.user.id
        });

      expect(error).toBeNull();
      
      // Verify like count increased
      const { data: template } = await supabase
        .from('story_templates')
        .select('likes_count')
        .eq('id', testTemplateId)
        .single();

      expect(template?.likes_count).toBeGreaterThan(0);
    });

    it('should prevent duplicate likes from same user', async () => {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: 'test1@example.com',
        password: 'testpass123'
      });

      // Try to like again (should fail)
      const { error } = await supabase
        .from('story_template_likes')
        .insert({
          template_id: testTemplateId,
          user_id: authData.user!.id
        });

      expect(error).toBeTruthy();
      expect(error?.code).toBe('23505'); // Unique constraint violation
    });

    it('should allow users to unlike templates', async () => {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: 'test1@example.com',
        password: 'testpass123'
      });

      // Get current like count
      const { data: beforeTemplate } = await supabase
        .from('story_templates')
        .select('likes_count')
        .eq('id', testTemplateId)
        .single();

      // Unlike the template
      const { error } = await supabase
        .from('story_template_likes')
        .delete()
        .eq('template_id', testTemplateId)
        .eq('user_id', authData.user!.id);

      expect(error).toBeNull();

      // Verify like count decreased
      const { data: afterTemplate } = await supabase
        .from('story_templates')
        .select('likes_count')
        .eq('id', testTemplateId)
        .single();

      expect(afterTemplate?.likes_count).toBeLessThan(beforeTemplate?.likes_count || 0);
    });
  });

  describe('Template Reviews System', () => {
    it('should allow users to review templates', async () => {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: 'test2@example.com',
        password: 'testpass123'
      });

      const reviewData = {
        template_id: testTemplateId,
        user_id: authData.user!.id,
        rating: 5,
        title: 'Amazing Template!',
        content: 'This template helped me create a fantastic story.',
        tags: ['creative', 'well-written']
      };

      const { data, error } = await supabase
        .from('story_template_reviews')
        .insert(reviewData);

      expect(error).toBeNull();

      // Verify review count and rating average updated
      const { data: template } = await supabase
        .from('story_templates')
        .select('reviews_count, rating_average')
        .eq('id', testTemplateId)
        .single();

      expect(template?.reviews_count).toBeGreaterThan(0);
      expect(template?.rating_average).toBeGreaterThan(0);
    });

    it('should calculate correct rating average', async () => {
      // Get current reviews
      const { data: reviews } = await supabase
        .from('story_template_reviews')
        .select('rating')
        .eq('template_id', testTemplateId);

      const expectedAverage = reviews!.reduce((sum, review) => sum + review.rating, 0) / reviews!.length;

      const { data: template } = await supabase
        .from('story_templates')
        .select('rating_average')
        .eq('id', testTemplateId)
        .single();

      expect(Math.abs(template!.rating_average - expectedAverage)).toBeLessThan(0.1);
    });
  });

  describe('Template Bookmarks System', () => {
    it('should allow users to bookmark templates', async () => {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: 'test1@example.com',
        password: 'testpass123'
      });

      const { data, error } = await supabase
        .from('story_template_bookmarks')
        .insert({
          template_id: testTemplateId,
          user_id: authData.user!.id,
          collection_name: 'favorites',
          notes: 'Great template for fantasy stories'
        });

      expect(error).toBeNull();

      // Verify bookmark was created
      const { data: bookmark } = await supabase
        .from('story_template_bookmarks')
        .select('*')
        .eq('template_id', testTemplateId)
        .eq('user_id', authData.user!.id)
        .single();

      expect(bookmark).toBeTruthy();
      expect(bookmark?.collection_name).toBe('favorites');
    });
  });

  describe('Template Sharing System', () => {
    it('should track template shares', async () => {
      const { data, error } = await supabase
        .from('story_template_shares')
        .insert({
          template_id: testTemplateId,
          platform: 'twitter',
          referrer: 'test-referrer'
        });

      expect(error).toBeNull();

      // Verify share was tracked
      const { data: shares } = await supabase
        .from('story_template_shares')
        .select('*')
        .eq('template_id', testTemplateId)
        .eq('platform', 'twitter');

      expect(shares?.length).toBeGreaterThan(0);
    });
  });

  describe('Featured Content System', () => {
    it('should allow scheduling featured content', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      const { data, error } = await supabase
        .from('featured_content')
        .insert({
          content_type: 'template',
          content_id: testTemplateId,
          title: 'Test Featured Template',
          description: 'This is a test featured template',
          feature_type: 'hero',
          featured_from: new Date().toISOString(),
          featured_until: futureDate.toISOString(),
          display_order: 1
        });

      expect(error).toBeNull();

      // Verify featured content was created
      const { data: featured } = await supabase
        .from('featured_content')
        .select('*')
        .eq('content_id', testTemplateId)
        .eq('feature_type', 'hero')
        .single();

      expect(featured).toBeTruthy();
      expect(featured?.title).toBe('Test Featured Template');
    });

    it('should retrieve active featured content', async () => {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('featured_content')
        .select('*')
        .eq('is_active', true)
        .lte('featured_from', now)
        .gte('featured_until', now)
        .order('display_order');

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Database Functions', () => {
    it('should update template quality scores', async () => {
      // This would test the quality score calculation function
      // Note: Function needs to be created in migration
      const { data: templates } = await supabase
        .from('story_templates')
        .select('id, quality_score, likes_count, rating_average')
        .limit(5);

      expect(templates).toBeTruthy();
      templates?.forEach(template => {
        expect(typeof template.quality_score).toBe('number');
        expect(template.quality_score).toBeGreaterThanOrEqual(0);
      });
    });
  });

  afterAll(async () => {
    // Clean up test data
    await supabase
      .from('story_template_likes')
      .delete()
      .eq('template_id', testTemplateId);

    await supabase
      .from('story_template_reviews')
      .delete()
      .eq('template_id', testTemplateId);

    await supabase
      .from('story_template_bookmarks')
      .delete()
      .eq('template_id', testTemplateId);

    await supabase
      .from('featured_content')
      .delete()
      .eq('content_id', testTemplateId);

    // Sign out
    await supabase.auth.signOut();
  });
});