// Real Story Service - Connects to Supabase instead of mock data
import { supabase } from '@/lib/supabase';
import { Story, StorySegment, StoryChoice, UserCharacter } from '@shared/types';
import { MockAIService } from './mockAIService';

// Error types
export class StoryServiceError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'StoryServiceError';
  }
}

// API Configuration - use Supabase edge functions URL
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://fyihypkigbcmsxyvseca.supabase.co';
const API_BASE_URL = `${SUPABASE_URL}/functions/v1`;

// Helper function to get auth headers
const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  console.log('🔑 Auth session check:', {
    hasSession: !!session,
    hasAccessToken: !!session?.access_token,
    tokenLength: session?.access_token?.length || 0,
    userId: session?.user?.id || 'none'
  });
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
  };
  
  console.log('📡 Auth headers prepared:', {
    hasAuthHeader: !!headers.Authorization,
    authHeaderStart: headers.Authorization.substring(0, 20) + '...'
  });
  
  return headers;
};

// Helper function for retrying API requests with exponential backoff
const retryApiRequest = async (
  requestFn: () => Promise<Response>,
  maxRetries: number = 2,
  baseDelay: number = 1000
): Promise<Response> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 API request attempt ${attempt + 1}/${maxRetries + 1}`);
      const response = await requestFn();
      
      // Only retry on network errors or 5xx server errors
      if (response.ok || response.status < 500) {
        return response;
      }
      
      // Don't retry on client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        return response;
      }
      
      lastError = new Error(`Server error: ${response.status} ${response.statusText}`);
      
    } catch (error: any) {
      lastError = error;
      console.warn(`⚠️ Request attempt ${attempt + 1} failed:`, error.message);
    }
    
    // Wait before retrying (exponential backoff)
    if (attempt < maxRetries) {
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
};

// Story CRUD operations using real Supabase + Backend Functions
export const realStoryService = {
  // Create a new story using the backend function
  async createStory(userId: string, storyData: Omit<Story, 'id' | 'created_at' | 'updated_at'>): Promise<Story> {
    try {
      console.log('🎯 Creating story with real backend:', storyData);

      // Call the backend function with retry logic
      const headers = await getAuthHeaders();
      const response = await retryApiRequest(() => 
        fetch(`${API_BASE_URL}/create-story`, {
          method: 'POST',
          headers,
          body: JSON.stringify(storyData)
        })
      );

      if (!response.ok) {
        console.error('🚨 CREATE-STORY FUNCTION FAILED:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        });
        
        const errorText = await response.text();
        console.error('🚨 CREATE-STORY ERROR DETAILS:', errorText);
        console.warn('⚠️ Analyzing error for potential fallback to mock service...');
        
        // Only fall back to mock in development or explicit configuration scenarios
        const isDevMode = import.meta.env.DEV || import.meta.env.VITE_NODE_ENV === 'development';
        const isLegitimateAPIKeyIssue = (
          errorText.includes('No valid AI provider API keys found') ||
          errorText.includes('OPENAI_API_KEY') ||
          errorText.includes('OVH_AI_ENDPOINTS_ACCESS_TOKEN')
        ) && !errorText.includes('Missing Authorization header');
        
        if (isDevMode && isLegitimateAPIKeyIssue) {
          console.log('🎭 Development mode: Falling back to Mock AI Service due to missing API keys');
          console.log('📝 Configure OPENAI_API_KEY or OVH_AI_ENDPOINTS_ACCESS_TOKEN in your Supabase Edge Functions to use real AI');
          const mockResult = await MockAIService.createMockStory(storyData);
          
          // Save the mock story to Supabase for persistence
          const { data: savedStory, error: saveError } = await supabase
            .from('stories')
            .insert({
              title: mockResult.story.title,
              description: mockResult.story.description,
              user_id: userId,
              genre: mockResult.story.genre,
              target_age: String(storyData.target_age || storyData.age_group || "7-9"),
              story_mode: 'interactive',
              is_completed: false,
              is_public: false,
              language: 'en',
              content_rating: 'G',
              ai_model_used: 'Mock-AI-Dev',
              generation_settings: {
                theme: storyData.theme,
                setting: storyData.setting,
                characters: storyData.characters,
                conflict: storyData.conflict,
                quest: storyData.quest,
                moral_lesson: storyData.moralLesson,
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (saveError) {
            console.error('❌ Error saving mock story to database:', saveError);
            throw new StoryServiceError('Failed to save story', 'SAVE_STORY_ERROR');
          }

          // Save the first segment
          const { error: segmentError } = await supabase
            .from('story_segments')
            .insert({
              story_id: savedStory.id,
              content: mockResult.firstSegment.content,
              position: 1,
              choices: mockResult.firstSegment.choices,
              image_prompt: mockResult.firstSegment.image_prompt,
              created_at: new Date().toISOString()
            });

          if (segmentError) {
            console.error('❌ Error saving first segment:', segmentError);
          }

          return {
            id: savedStory.id,
            title: savedStory.title,
            description: savedStory.description,
            genre: savedStory.genre,
            age_group: savedStory.target_age,
            status: (savedStory.is_completed ? 'completed' : 'draft') as Story['status'],
            created_at: savedStory.created_at,
            updated_at: savedStory.updated_at,
            user_id: savedStory.user_id,
            theme: storyData.theme || '',
            setting: storyData.setting || '',
            characters: storyData.characters || [],
            conflict: storyData.conflict || '',
            quest: storyData.quest || '',
            moralLesson: storyData.moralLesson || ''
          };
        } else {
          // Production mode or not a legitimate API key issue - throw the real error
          console.error('🚨 PRODUCTION ERROR: Not falling back to mock service');
          console.error('🔍 Error analysis:', {
            isDevMode,
            isLegitimateAPIKeyIssue,
            responseStatus: response.status,
            errorPreview: errorText.substring(0, 100) + '...'
          });
        }
        
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { message: errorText };
        }
        
        throw new StoryServiceError(error.message || error.error || 'Failed to create story', 'CREATE_STORY_ERROR');
      }

      const data = await response.json();
      console.log('✅ Story created successfully:', data.story.id);
      
      return data.story;
    } catch (error) {
      console.error('❌ Error creating story:', error);
      if (error instanceof StoryServiceError) {
        throw error;
      }
      throw new StoryServiceError('Failed to create story', 'CREATE_STORY_ERROR');
    }
  },

  // Get all stories for a user from Supabase
  async getStories(userId: string): Promise<Story[]> {
    try {
      console.log('📚 Fetching stories for user:', userId);

      const { data: stories, error } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Transform to match expected format
      const transformedStories = stories?.map(story => ({
        id: story.id,
        title: story.title,
        description: story.description || 'A wonderful adventure awaits',
        genre: story.genre || 'fantasy',
        age_group: story.target_age || 'All Ages',
        status: (story.is_completed ? 'completed' : 'draft') as Story['status'],
        created_at: story.created_at,
        updated_at: story.updated_at,
        user_id: story.user_id,
        theme: story.generation_settings?.theme || '',
        setting: story.generation_settings?.setting || '',
        characters: story.generation_settings?.characters || [],
        conflict: story.generation_settings?.conflict || '',
        quest: story.generation_settings?.quest || '',
        moralLesson: story.generation_settings?.moral_lesson || '',
      })) || [];

      console.log(`✅ Fetched ${transformedStories.length} stories`);
      return transformedStories;
    } catch (error) {
      console.error('❌ Error fetching stories:', error);
      throw new StoryServiceError('Failed to fetch stories', 'FETCH_STORIES_ERROR');
    }
  },

  // Get a specific story by ID using backend function
  async getStoryById(userId: string, storyId: string): Promise<Story | null> {
    try {
      console.log('📖 Fetching story:', storyId);

      // Call the backend function with retry logic
      const headers = await getAuthHeaders();
      const response = await retryApiRequest(() =>
        fetch(`${API_BASE_URL}/get-story`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ storyId })
        })
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const error = await response.json();
        throw new StoryServiceError(error.message || 'Failed to fetch story', 'FETCH_STORY_ERROR');
      }

      const data = await response.json();
      console.log('✅ Story fetched successfully:', data.story.id);
      
      return data.story;
    } catch (error) {
      console.error('❌ Error fetching story:', error);
      if (error instanceof StoryServiceError) {
        throw error;
      }
      throw new StoryServiceError('Failed to fetch story', 'FETCH_STORY_ERROR');
    }
  },

  // Update a story
  async updateStory(userId: string, storyId: string, storyData: Partial<Story>): Promise<Story> {
    try {
      console.log('🔄 Updating story:', storyId);

      const { data: updatedStory, error } = await supabase
        .from('stories')
        .update({
          title: storyData.title,
          description: storyData.description,
          genre: storyData.genre,
          target_age: storyData.age_group,
          is_completed: storyData.status === 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', storyId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      if (!updatedStory) {
        throw new StoryServiceError('Story not found or unauthorized', 'STORY_NOT_FOUND');
      }

      console.log('✅ Story updated successfully:', storyId);
      
      // Transform back to expected format
      return {
        id: updatedStory.id,
        title: updatedStory.title,
        description: updatedStory.description,
        genre: updatedStory.genre,
        age_group: updatedStory.target_age,
        status: (updatedStory.is_completed ? 'completed' : 'draft') as Story['status'],
        created_at: updatedStory.created_at,
        updated_at: updatedStory.updated_at,
        user_id: updatedStory.user_id,
      };
    } catch (error) {
      console.error('❌ Error updating story:', error);
      if (error instanceof StoryServiceError) {
        throw error;
      }
      throw new StoryServiceError('Failed to update story', 'UPDATE_STORY_ERROR');
    }
  },

  // Delete a story
  async deleteStory(userId: string, storyId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting story:', storyId);

      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId)
        .eq('user_id', userId);

      if (error) throw error;

      console.log('✅ Story deleted successfully:', storyId);
    } catch (error) {
      console.error('❌ Error deleting story:', error);
      throw new StoryServiceError('Failed to delete story', 'DELETE_STORY_ERROR');
    }
  },

  // Story Segment operations
  async createStorySegment(segmentData: Omit<StorySegment, 'id' | 'created_at'>): Promise<StorySegment> {
    try {
      console.log('📝 Creating story segment for story:', segmentData.story_id);

      const { data: newSegment, error } = await supabase
        .from('story_segments')
        .insert({
          story_id: segmentData.story_id,
          content: segmentData.content,
          position: segmentData.position,
          choices: segmentData.choices || [],
          image_prompt: segmentData.image_prompt,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Story segment created successfully');
      return newSegment;
    } catch (error) {
      console.error('❌ Error creating story segment:', error);
      throw new StoryServiceError('Failed to create story segment', 'CREATE_SEGMENT_ERROR');
    }
  },

  // Get segments for a story
  async getStorySegments(storyId: string): Promise<StorySegment[]> {
    try {
      console.log('📄 Fetching segments for story:', storyId);

      const { data: segments, error } = await supabase
        .from('story_segments')
        .select('*')
        .eq('story_id', storyId)
        .order('position', { ascending: true });

      if (error) throw error;

      console.log(`✅ Fetched ${segments?.length || 0} segments`);
      return segments || [];
    } catch (error) {
      console.error('❌ Error fetching story segments:', error);
      throw new StoryServiceError('Failed to fetch story segments', 'FETCH_SEGMENTS_ERROR');
    }
  },

  // Generate next story segment using backend function
  async generateStorySegment(storyId: string, choiceIndex?: number): Promise<StorySegment> {
    try {
      console.log('🤖 Generating story segment for:', storyId);

      const headers = await getAuthHeaders();
      const response = await retryApiRequest(() =>
        fetch(`${API_BASE_URL}/generate-story-segment`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ storyId, choiceIndex })
        })
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error generating segment:', errorText);
        
        // Only fall back to mock in development with legitimate API key issues
        const isDevMode = import.meta.env.DEV || import.meta.env.VITE_NODE_ENV === 'development';
        const isLegitimateAPIKeyIssue = (
          errorText.includes('No valid AI provider API keys found') ||
          errorText.includes('OPENAI_API_KEY') ||
          errorText.includes('OVH_AI_ENDPOINTS_ACCESS_TOKEN')
        ) && !errorText.includes('Missing Authorization header');
        
        if (isDevMode && isLegitimateAPIKeyIssue) {
          console.log('🎭 Development mode: Falling back to Mock AI Service for segment generation');
          console.log('📝 Configure OPENAI_API_KEY or OVH_AI_ENDPOINTS_ACCESS_TOKEN in your Supabase Edge Functions to use real AI');
          const mockResult = await MockAIService.generateMockSegment(storyId, choiceIndex);
          
          // Save the mock segment to Supabase
          const { data: savedSegment, error: saveError } = await supabase
            .from('story_segments')
            .insert({
              story_id: storyId,
              content: mockResult.segment.content,
              position: mockResult.segment.position,
              choices: mockResult.segment.choices,
              image_prompt: mockResult.segment.image_prompt,
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (saveError) {
            console.error('❌ Error saving mock segment:', saveError);
            throw new StoryServiceError('Failed to save segment', 'SAVE_SEGMENT_ERROR');
          }

          return savedSegment;
        } else {
          // Production mode or not a legitimate API key issue - throw the real error
          console.error('🚨 PRODUCTION ERROR: Not falling back to mock service for segment generation');
          console.error('🔍 Error analysis:', {
            isDevMode,
            isLegitimateAPIKeyIssue,
            responseStatus: response.status,
            errorPreview: errorText.substring(0, 100) + '...'
          });
        }
        
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { message: errorText };
        }
        throw new StoryServiceError(error.message || 'Failed to generate segment', 'GENERATE_SEGMENT_ERROR');
      }

      const data = await response.json();
      console.log('✅ Story segment generated successfully');
      
      return data.segment;
    } catch (error) {
      console.error('❌ Error generating story segment:', error);
      if (error instanceof StoryServiceError) {
        throw error;
      }
      throw new StoryServiceError('Failed to generate story segment', 'GENERATE_SEGMENT_ERROR');
    }
  },

  // Other segment operations...
  async getStorySegmentById(segmentId: string): Promise<StorySegment | null> {
    try {
      const { data: segment, error } = await supabase
        .from('story_segments')
        .select('*')
        .eq('id', segmentId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return null;
        }
        throw error;
      }

      return segment;
    } catch (error) {
      console.error('❌ Error fetching story segment:', error);
      throw new StoryServiceError('Failed to fetch story segment', 'FETCH_SEGMENT_ERROR');
    }
  },

  async updateStorySegment(segmentId: string, segmentData: Partial<StorySegment>): Promise<StorySegment> {
    try {
      const { data: updatedSegment, error } = await supabase
        .from('story_segments')
        .update({
          content: segmentData.content,
          choices: segmentData.choices,
          image_url: segmentData.image_url,
          image_prompt: segmentData.image_prompt,
        })
        .eq('id', segmentId)
        .select()
        .single();

      if (error) throw error;

      return updatedSegment;
    } catch (error) {
      console.error('❌ Error updating story segment:', error);
      throw new StoryServiceError('Failed to update story segment', 'UPDATE_SEGMENT_ERROR');
    }
  },

  async deleteStorySegment(segmentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('story_segments')
        .delete()
        .eq('id', segmentId);

      if (error) throw error;
    } catch (error) {
      console.error('❌ Error deleting story segment:', error);
      throw new StoryServiceError('Failed to delete story segment', 'DELETE_SEGMENT_ERROR');
    }
  },

  // Story Choice operations (if using separate table)
  async createStoryChoice(choiceData: Omit<StoryChoice, 'id'>): Promise<StoryChoice> {
    try {
      const { data: newChoice, error } = await supabase
        .from('story_choices')
        .insert(choiceData)
        .select()
        .single();

      if (error) throw error;

      return newChoice;
    } catch (error) {
      console.error('❌ Error creating story choice:', error);
      throw new StoryServiceError('Failed to create story choice', 'CREATE_CHOICE_ERROR');
    }
  },

  async getStoryChoices(segmentId: string): Promise<StoryChoice[]> {
    try {
      const { data: choices, error } = await supabase
        .from('story_choices')
        .select('*')
        .eq('segment_id', segmentId)
        .order('position', { ascending: true });

      if (error) throw error;

      return choices || [];
    } catch (error) {
      console.error('❌ Error fetching story choices:', error);
      throw new StoryServiceError('Failed to fetch story choices', 'FETCH_CHOICES_ERROR');
    }
  },

  async updateStoryChoice(choiceId: string, choiceData: Partial<StoryChoice>): Promise<StoryChoice> {
    try {
      const { data: updatedChoice, error } = await supabase
        .from('story_choices')
        .update(choiceData)
        .eq('id', choiceId)
        .select()
        .single();

      if (error) throw error;

      return updatedChoice;
    } catch (error) {
      console.error('❌ Error updating story choice:', error);
      throw new StoryServiceError('Failed to update story choice', 'UPDATE_CHOICE_ERROR');
    }
  },

  async deleteStoryChoice(choiceId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('story_choices')
        .delete()
        .eq('id', choiceId);

      if (error) throw error;
    } catch (error) {
      console.error('❌ Error deleting story choice:', error);
      throw new StoryServiceError('Failed to delete story choice', 'DELETE_CHOICE_ERROR');
    }
  },

  // User Character persistence operations
  async saveUserCharacter(userId: string, character: Omit<UserCharacter, 'id' | 'user_id' | 'created_at'>): Promise<UserCharacter> {
    try {
      console.log('💾 Saving user character:', character.name);

      const { data: newCharacter, error } = await supabase
        .from('user_characters')
        .insert({
          user_id: userId,
          name: character.name,
          description: character.description,
          role: character.role,
          traits: character.traits,
          avatar_url: character.avatar_url,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ User character saved successfully:', newCharacter.id);
      return newCharacter;
    } catch (error) {
      console.error('❌ Error saving user character:', error);
      throw new StoryServiceError('Failed to save character', 'SAVE_CHARACTER_ERROR');
    }
  },

  async getUserCharacters(userId: string): Promise<UserCharacter[]> {
    try {
      console.log('📚 Fetching user characters for:', userId);

      const { data: characters, error } = await supabase
        .from('user_characters')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log(`✅ Fetched ${characters?.length || 0} user characters`);
      return characters || [];
    } catch (error) {
      console.error('❌ Error fetching user characters:', error);
      throw new StoryServiceError('Failed to fetch characters', 'FETCH_CHARACTERS_ERROR');
    }
  },

  async deleteUserCharacter(userId: string, characterId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting user character:', characterId);

      const { error } = await supabase
        .from('user_characters')
        .delete()
        .eq('id', characterId)
        .eq('user_id', userId);

      if (error) throw error;

      console.log('✅ User character deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting user character:', error);
      throw new StoryServiceError('Failed to delete character', 'DELETE_CHARACTER_ERROR');
    }
  },

  async updateUserCharacter(userId: string, characterId: string, updates: Partial<UserCharacter>): Promise<UserCharacter> {
    try {
      console.log('🔄 Updating user character:', characterId);

      const { data: updatedCharacter, error } = await supabase
        .from('user_characters')
        .update({
          name: updates.name,
          description: updates.description,
          role: updates.role,
          traits: updates.traits,
          avatar_url: updates.avatar_url
        })
        .eq('id', characterId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ User character updated successfully');
      return updatedCharacter;
    } catch (error) {
      console.error('❌ Error updating user character:', error);
      throw new StoryServiceError('Failed to update character', 'UPDATE_CHARACTER_ERROR');
    }
  }
};

// Optimized query functions using real Supabase
export const realStoryQueries = {
  // Get stories with pagination
  async getStoriesPaginated(userId: string, page: number = 1, limit: number = 10): Promise<{ stories: Story[], totalCount: number }> {
    try {
      const startIndex = (page - 1) * limit;
      
      const { data: stories, error, count } = await supabase
        .from('stories')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .range(startIndex, startIndex + limit - 1);

      if (error) throw error;

      const transformedStories = stories?.map(story => ({
        id: story.id,
        title: story.title,
        description: story.description,
        genre: story.genre,
        age_group: story.target_age,
        status: (story.is_completed ? 'completed' : 'draft') as Story['status'],
        created_at: story.created_at,
        updated_at: story.updated_at,
        user_id: story.user_id,
      })) || [];

      return { stories: transformedStories, totalCount: count || 0 };
    } catch (error) {
      console.error('❌ Error fetching paginated stories:', error);
      throw new StoryServiceError('Failed to fetch stories', 'FETCH_STORIES_ERROR');
    }
  },

  // Get stories by status
  async getStoriesByStatus(userId: string, status: Story['status']): Promise<Story[]> {
    try {
      const isCompleted = status === 'completed';
      
      const { data: stories, error } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', userId)
        .eq('is_completed', isCompleted)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return stories?.map(story => ({
        id: story.id,
        title: story.title,
        description: story.description,
        genre: story.genre,
        age_group: story.target_age,
        status: (story.is_completed ? 'completed' : 'draft') as Story['status'],
        created_at: story.created_at,
        updated_at: story.updated_at,
        user_id: story.user_id,
      })) || [];
    } catch (error) {
      console.error('❌ Error fetching stories by status:', error);
      throw new StoryServiceError('Failed to fetch stories by status', 'FETCH_STORIES_ERROR');
    }
  },

  // Get stories by genre
  async getStoriesByGenre(userId: string, genre: string): Promise<Story[]> {
    try {
      const { data: stories, error } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', userId)
        .eq('genre', genre)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return stories?.map(story => ({
        id: story.id,
        title: story.title,
        description: story.description,
        genre: story.genre,
        age_group: story.target_age,
        status: (story.is_completed ? 'completed' : 'draft') as Story['status'],
        created_at: story.created_at,
        updated_at: story.updated_at,
        user_id: story.user_id,
      })) || [];
    } catch (error) {
      console.error('❌ Error fetching stories by genre:', error);
      throw new StoryServiceError('Failed to fetch stories by genre', 'FETCH_STORIES_ERROR');
    }
  },

  // Search stories by title
  async searchStories(userId: string, searchTerm: string): Promise<Story[]> {
    try {
      const { data: stories, error } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', userId)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return stories?.map(story => ({
        id: story.id,
        title: story.title,
        description: story.description,
        genre: story.genre,
        age_group: story.target_age,
        status: (story.is_completed ? 'completed' : 'draft') as Story['status'],
        created_at: story.created_at,
        updated_at: story.updated_at,
        user_id: story.user_id,
      })) || [];
    } catch (error) {
      console.error('❌ Error searching stories:', error);
      throw new StoryServiceError('Failed to search stories', 'SEARCH_STORIES_ERROR');
    }
  },

  // Get recent stories
  async getRecentStories(userId: string, limit: number = 5): Promise<Story[]> {
    try {
      const { data: stories, error } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return stories?.map(story => ({
        id: story.id,
        title: story.title,
        description: story.description,
        genre: story.genre,
        age_group: story.target_age,
        status: (story.is_completed ? 'completed' : 'draft') as Story['status'],
        created_at: story.created_at,
        updated_at: story.updated_at,
        user_id: story.user_id,
      })) || [];
    } catch (error) {
      console.error('❌ Error fetching recent stories:', error);
      throw new StoryServiceError('Failed to fetch recent stories', 'FETCH_STORIES_ERROR');
    }
  }
};

export default realStoryService;