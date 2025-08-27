// Database Service
// Handles all Supabase database operations for stories, segments, and characters
// Extracted from main function for better testability and maintainability

import { 
  DatabaseService, 
  Story, 
  Segment, 
  Character, 
  NewSegment 
} from '../types/interfaces.ts';

export class Database implements DatabaseService {
  
  /**
   * Fetch story data from Supabase
   */
  async fetchStoryData(storyId: string, supabase: any): Promise<Story> {
    console.log(`📖 Fetching story data for ID: ${storyId}`);
    
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single();

    if (storyError) {
      console.error('❌ Error fetching story:', storyError);
      throw new Error(`Failed to fetch story: ${storyError.message}`);
    }

    if (!story) {
      console.error('❌ Story not found:', storyId);
      throw new Error('Story not found');
    }

    console.log(`✅ Story fetched successfully: ${story.title} (${story.target_age}, ${story.story_mode})`);
    return story;
  }

  /**
   * Fetch the previous segment if this is not the first segment
   * Used for context building in story continuation
   */
  async fetchPreviousSegment(storyId: string, choiceIndex: number | undefined, supabase: any): Promise<Segment | null> {
    if (choiceIndex === undefined) {
      console.log('📝 First segment - no previous segment to fetch');
      return null;
    }

    console.log(`📖 Fetching previous segment for story ${storyId}`);
    
    const { data: prevSegment, error: prevSegmentError } = await supabase
      .from('story_segments')
      .select('*')
      .eq('story_id', storyId)
      .order('position', { ascending: false })
      .limit(1)
      .single();

    if (prevSegmentError) {
      console.error('⚠️ Error fetching previous segment:', prevSegmentError);
      // This is not fatal, we can continue without previous context
      return null;
    }

    if (prevSegment) {
      console.log(`✅ Previous segment fetched: ${prevSegment.content.substring(0, 50)}...`);
    }

    return prevSegment;
  }

  /**
   * Fetch user characters for this story to include in prompts
   */
  async fetchUserCharacters(storyId: string, userId: string, supabase: any): Promise<Character[]> {
    console.log(`👥 Fetching user characters for story ${storyId} and user ${userId}`);
    
    const { data: userCharacters, error: charactersError } = await supabase
      .from('story_characters')
      .select('user_characters(name, description, role)')
      .eq('story_id', storyId)
      .eq('user_characters.user_id', userId);

    if (charactersError) {
      console.error('⚠️ Error fetching user characters:', charactersError);
      // This is not fatal, we can continue without character context
      return [];
    }

    if (userCharacters && userCharacters.length > 0) {
      console.log(`✅ Found ${userCharacters.length} user characters`);
      userCharacters.forEach(char => {
        console.log(`  - ${char.user_characters.name}: ${char.user_characters.description}`);
      });
    } else {
      console.log('📝 No user characters found for this story');
    }

    return userCharacters || [];
  }

  /**
   * Get the next position number for the new segment
   */
  async getNextPosition(storyId: string, supabase: any): Promise<number> {
    console.log(`📊 Calculating next position for story ${storyId}`);
    
    const { data: segments, error: segmentsError } = await supabase
      .from('story_segments')
      .select('position')
      .eq('story_id', storyId)
      .order('position', { ascending: false })
      .limit(1);

    if (segmentsError) {
      console.error('⚠️ Error fetching segment positions:', segmentsError);
      // Default to position 1 if we can't determine the last position
      return 1;
    }

    const nextPosition = segments && segments.length > 0 ? segments[0].position + 1 : 1;
    console.log(`✅ Next segment position: ${nextPosition}`);
    
    return nextPosition;
  }

  /**
   * Save the new segment to the database
   * This is a critical operation that must succeed for the story to continue
   */
  async saveSegment(segmentData: NewSegment, supabase: any): Promise<Segment> {
    console.log(`💾 Saving new segment for story ${segmentData.story_id}`);
    console.log(`   📝 Text length: ${segmentData.content.length} characters`);
    console.log(`   🎯 Choices: ${segmentData.choices.length}`);
    console.log(`   📊 Position: ${segmentData.position}`);
    
    const { data: newSegment, error: segmentError } = await supabase
      .from('story_segments')
      .insert(segmentData)
      .select()
      .single();

    if (segmentError) {
      console.error('❌ Error saving segment:', segmentError);
      throw new Error(`Failed to save story segment: ${segmentError.message}`);
    }

    if (!newSegment) {
      console.error('❌ Segment was not created properly');
      throw new Error('Failed to create story segment - no data returned');
    }

    console.log(`✅ Segment saved successfully with ID: ${newSegment.id}`);
    return newSegment;
  }

  /**
   * Create a complete segment object ready for database insertion
   */
  createSegmentForInsertion(
    storyId: string,
    segmentText: string,
    choices: any[],
    previousSegmentId: string | null = null,
    imagePrompt: string | null = null
  ): NewSegment {
    // Get next position
    const position = 0; // Will be calculated in getNextPosition
    
    return {
      story_id: storyId,
      content: segmentText, // Changed from segment_text to content
      choices: choices,
      position: position,
      segment_number: position, // Same as position for now
      image_prompt: imagePrompt, // Include image prompt
      created_at: new Date().toISOString()
    };
  }

  /**
   * Validate that all required database connections and permissions are available
   */
  async validateDatabaseAccess(supabase: any): Promise<boolean> {
    try {
      // Try a simple query to test database connectivity
      const { data, error } = await supabase
        .from('stories')
        .select('id')
        .limit(1);

      if (error) {
        console.error('❌ Database access validation failed:', error);
        return false;
      }

      console.log('✅ Database access validated successfully');
      return true;
    } catch (error) {
      console.error('❌ Database validation error:', error);
      return false;
    }
  }

  /**
   * Get story statistics for debugging and analytics
   */
  async getStoryStatistics(storyId: string, supabase: any): Promise<{
    segmentCount: number;
    totalWords: number;
    lastUpdated: string;
  }> {
    const { data: segments, error } = await supabase
      .from('story_segments')
      .select('word_count, created_at')
      .eq('story_id', storyId)
      .order('created_at', { ascending: false });

    if (error || !segments) {
      return {
        segmentCount: 0,
        totalWords: 0,
        lastUpdated: new Date().toISOString()
      };
    }

    const totalWords = segments.reduce((sum, segment) => sum + (segment.word_count || 0), 0);
    
    return {
      segmentCount: segments.length,
      totalWords,
      lastUpdated: segments[0]?.created_at || new Date().toISOString()
    };
  }

  /**
   * Health check for database operations
   */
  async healthCheck(supabase: any): Promise<{
    connected: boolean;
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      await supabase.from('stories').select('id').limit(1);
      const responseTime = Date.now() - startTime;
      
      return {
        connected: true,
        responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        connected: false,
        responseTime,
        error: error.message
      };
    }
  }
}

// Export singleton instance for use in main function
export const database = new Database();