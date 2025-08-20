// StoryService.ts
// Utility functions for story database operations

import { Story, StorySegment, StoryChoice } from '@shared/types';

// Error types
export class StoryServiceError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'StoryServiceError';
  }
}

// Validation functions
const validateStory = (story: Partial<Story>): string[] => {
  const errors: string[] = [];
  
  if (!story.title || story.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (story.title && story.title.length > 100) {
    errors.push('Title must be less than 100 characters');
  }
  
  if (!story.genre || story.genre.trim().length === 0) {
    errors.push('Genre is required');
  }
  
  if (!story.age_group || story.age_group.trim().length === 0) {
    errors.push('Age group is required');
  }
  
  return errors;
};

const validateStorySegment = (segment: Partial<StorySegment>): string[] => {
  const errors: string[] = [];
  
  if (!segment.story_id) {
    errors.push('Story ID is required');
  }
  
  if (!segment.content || segment.content.trim().length === 0) {
    errors.push('Content is required');
  }
  
  if (segment.position === undefined || segment.position < 0) {
    errors.push('Position must be a positive number');
  }
  
  return errors;
};

const validateStoryChoice = (choice: Partial<StoryChoice>): string[] => {
  const errors: string[] = [];
  
  if (!choice.segment_id) {
    errors.push('Segment ID is required');
  }
  
  if (!choice.text || choice.text.trim().length === 0) {
    errors.push('Choice text is required');
  }
  
  return errors;
};

// Mock data storage (in a real app, this would be API calls to Supabase)
let mockStories: (Story & { user_id: string })[] = [];
let mockSegments: (StorySegment & { user_id: string })[] = [];
let mockChoices: (StoryChoice & { user_id: string })[] = [];

// Optimized query functions
export const storyQueries = {
  // Get stories with pagination
  async getStoriesPaginated(userId: string, page: number = 1, limit: number = 10): Promise<{ stories: Story[], totalCount: number }> {
    try {
      // Filter stories by user (in a real app, this would be done in the database)
      const userStories = mockStories
        .filter(story => story.user_id === userId)
        .map(({ user_id, ...story }) => story);
      
      // Calculate pagination
      const totalCount = userStories.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const stories = userStories.slice(startIndex, endIndex);
      
      return { stories, totalCount };
    } catch (error) {
      throw new StoryServiceError('Failed to fetch stories', 'FETCH_STORIES_ERROR');
    }
  },
  
  // Get stories by status
  async getStoriesByStatus(userId: string, status: Story['status']): Promise<Story[]> {
    try {
      return mockStories
        .filter(story => story.user_id === userId && story.status === status)
        .map(({ user_id, ...story }) => story);
    } catch (error) {
      throw new StoryServiceError('Failed to fetch stories by status', 'FETCH_STORIES_ERROR');
    }
  },
  
  // Get stories by genre
  async getStoriesByGenre(userId: string, genre: string): Promise<Story[]> {
    try {
      return mockStories
        .filter(story => story.user_id === userId && story.genre === genre)
        .map(({ user_id, ...story }) => story);
    } catch (error) {
      throw new StoryServiceError('Failed to fetch stories by genre', 'FETCH_STORIES_ERROR');
    }
  },
  
  // Search stories by title
  async searchStories(userId: string, searchTerm: string): Promise<Story[]> {
    try {
      const term = searchTerm.toLowerCase();
      return mockStories
        .filter(story =>
          story.user_id === userId &&
          (story.title.toLowerCase().includes(term) ||
           story.description.toLowerCase().includes(term))
        )
        .map(({ user_id, ...story }) => story);
    } catch (error) {
      throw new StoryServiceError('Failed to search stories', 'SEARCH_STORIES_ERROR');
    }
  },
  
  // Get recent stories
  async getRecentStories(userId: string, limit: number = 5): Promise<Story[]> {
    try {
      // Filter by user and sort by created_at date
      const userStories = mockStories
        .filter(story => story.user_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map(({ user_id, ...story }) => story);
      
      return userStories.slice(0, limit);
    } catch (error) {
      throw new StoryServiceError('Failed to fetch recent stories', 'FETCH_STORIES_ERROR');
    }
  }
};

// Story CRUD operations
export const storyService = {
  // Create a new story
  async createStory(userId: string, storyData: Omit<Story, 'id' | 'created_at' | 'updated_at'>): Promise<Story> {
    try {
      // Validate story data
      const validationErrors = validateStory(storyData);
      if (validationErrors.length > 0) {
        throw new StoryServiceError(`Validation failed: ${validationErrors.join(', ')}`, 'VALIDATION_ERROR');
      }
      
      // Create story object
      const newStory: Story & { user_id: string } = {
        id: `story-${Date.now()}`,
        ...storyData,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // In a real app, this would be an API call to Supabase
      mockStories.push(newStory);
      
      // Return the story without the user_id property
      const { user_id, ...story } = newStory;
      return story;
    } catch (error) {
      if (error instanceof StoryServiceError) {
        throw error;
      }
      throw new StoryServiceError('Failed to create story', 'CREATE_STORY_ERROR');
    }
  },
  
  // Get all stories for a user
  async getStories(userId: string): Promise<Story[]> {
    try {
      // In a real app, this would be an API call to Supabase
      return mockStories
        .filter(story => story.user_id === userId)
        .map(({ user_id, ...story }) => story);
    } catch (error) {
      throw new StoryServiceError('Failed to fetch stories', 'FETCH_STORIES_ERROR');
    }
  },
  
  // Get a specific story by ID
  async getStoryById(userId: string, storyId: string): Promise<Story | null> {
    try {
      // In a real app, this would be an API call to Supabase
      const story = mockStories.find(s => s.id === storyId && s.user_id === userId);
      if (!story) return null;
      
      // Return the story without the user_id property
      const { user_id, ...storyWithoutUserId } = story;
      return storyWithoutUserId;
    } catch (error) {
      throw new StoryServiceError('Failed to fetch story', 'FETCH_STORY_ERROR');
    }
  },
  
  // Update a story
  async updateStory(userId: string, storyId: string, storyData: Partial<Story>): Promise<Story> {
    try {
      // Validate story data
      const validationErrors = validateStory(storyData);
      if (validationErrors.length > 0) {
        throw new StoryServiceError(`Validation failed: ${validationErrors.join(', ')}`, 'VALIDATION_ERROR');
      }
      
      // Find the story
      const storyIndex = mockStories.findIndex(s => s.id === storyId && s.user_id === userId);
      if (storyIndex === -1) {
        throw new StoryServiceError('Story not found or unauthorized', 'STORY_NOT_FOUND');
      }
      
      // Update story
      const updatedStory = {
        ...mockStories[storyIndex],
        ...storyData,
        updated_at: new Date().toISOString()
      };
      
      mockStories[storyIndex] = updatedStory;
      
      // Return the story without the user_id property
      const { user_id, ...story } = updatedStory;
      return story;
    } catch (error) {
      if (error instanceof StoryServiceError) {
        throw error;
      }
      throw new StoryServiceError('Failed to update story', 'UPDATE_STORY_ERROR');
    }
  },
  
  // Delete a story
  async deleteStory(userId: string, storyId: string): Promise<void> {
    try {
      // In a real app, this would also delete associated segments and choices
      const storyIndex = mockStories.findIndex(s => s.id === storyId && s.user_id === userId);
      if (storyIndex === -1) {
        throw new StoryServiceError('Story not found or unauthorized', 'STORY_NOT_FOUND');
      }
      
      mockStories.splice(storyIndex, 1);
    } catch (error) {
      if (error instanceof StoryServiceError) {
        throw error;
      }
      throw new StoryServiceError('Failed to delete story', 'DELETE_STORY_ERROR');
    }
  },
  
  // Story Segment CRUD operations
  async createStorySegment(userId: string, segmentData: Omit<StorySegment, 'id' | 'created_at'>): Promise<StorySegment> {
    try {
      // Validate segment data
      const validationErrors = validateStorySegment(segmentData);
      if (validationErrors.length > 0) {
        throw new StoryServiceError(`Validation failed: ${validationErrors.join(', ')}`, 'VALIDATION_ERROR');
      }
      
      // Create segment object
      const newSegment: StorySegment & { user_id: string } = {
        id: `segment-${Date.now()}`,
        ...segmentData,
        user_id: userId,
        created_at: new Date().toISOString()
      };
      
      // In a real app, this would be an API call to Supabase
      mockSegments.push(newSegment);
      
      // Return the segment without the user_id property
      const { user_id, ...segment } = newSegment;
      return segment;
    } catch (error) {
      if (error instanceof StoryServiceError) {
        throw error;
      }
      throw new StoryServiceError('Failed to create story segment', 'CREATE_SEGMENT_ERROR');
    }
  },
  
  // Get segments for a story
  async getStorySegments(userId: string, storyId: string): Promise<StorySegment[]> {
    try {
      // In a real app, this would be an API call to Supabase
      return mockSegments
        .filter(segment => segment.story_id === storyId && segment.user_id === userId)
        .map(({ user_id, ...segment }) => segment);
    } catch (error) {
      throw new StoryServiceError('Failed to fetch story segments', 'FETCH_SEGMENTS_ERROR');
    }
  },
  
  // Get a specific segment by ID
  async getStorySegmentById(userId: string, segmentId: string): Promise<StorySegment | null> {
    try {
      // In a real app, this would be an API call to Supabase
      const segment = mockSegments.find(s => s.id === segmentId && s.user_id === userId);
      if (!segment) return null;
      
      // Return the segment without the user_id property
      const { user_id, ...segmentWithoutUserId } = segment;
      return segmentWithoutUserId;
    } catch (error) {
      throw new StoryServiceError('Failed to fetch story segment', 'FETCH_SEGMENT_ERROR');
    }
  },
  
  // Update a story segment
  async updateStorySegment(userId: string, segmentId: string, segmentData: Partial<StorySegment>): Promise<StorySegment> {
    try {
      // Validate segment data if provided
      if (Object.keys(segmentData).length > 0) {
        const validationErrors = validateStorySegment(segmentData);
        if (validationErrors.length > 0) {
          throw new StoryServiceError(`Validation failed: ${validationErrors.join(', ')}`, 'VALIDATION_ERROR');
        }
      }
      
      // Find the segment
      const segmentIndex = mockSegments.findIndex(s => s.id === segmentId && s.user_id === userId);
      if (segmentIndex === -1) {
        throw new StoryServiceError('Story segment not found or unauthorized', 'SEGMENT_NOT_FOUND');
      }
      
      // Update segment
      const updatedSegment = {
        ...mockSegments[segmentIndex],
        ...segmentData
      };
      
      mockSegments[segmentIndex] = updatedSegment;
      
      // Return the segment without the user_id property
      const { user_id, ...segment } = updatedSegment;
      return segment;
    } catch (error) {
      if (error instanceof StoryServiceError) {
        throw error;
      }
      throw new StoryServiceError('Failed to update story segment', 'UPDATE_SEGMENT_ERROR');
    }
  },
  
  // Delete a story segment
  async deleteStorySegment(userId: string, segmentId: string): Promise<void> {
    try {
      const segmentIndex = mockSegments.findIndex(s => s.id === segmentId && s.user_id === userId);
      if (segmentIndex === -1) {
        throw new StoryServiceError('Story segment not found or unauthorized', 'SEGMENT_NOT_FOUND');
      }
      
      mockSegments.splice(segmentIndex, 1);
    } catch (error) {
      if (error instanceof StoryServiceError) {
        throw error;
      }
      throw new StoryServiceError('Failed to delete story segment', 'DELETE_SEGMENT_ERROR');
    }
  },
  
  // Story Choice CRUD operations
  async createStoryChoice(userId: string, choiceData: Omit<StoryChoice, 'id'>): Promise<StoryChoice> {
    try {
      // Validate choice data
      const validationErrors = validateStoryChoice(choiceData);
      if (validationErrors.length > 0) {
        throw new StoryServiceError(`Validation failed: ${validationErrors.join(', ')}`, 'VALIDATION_ERROR');
      }
      
      // Create choice object
      const newChoice: StoryChoice & { user_id: string } = {
        id: `choice-${Date.now()}`,
        ...choiceData,
        user_id: userId
      };
      
      // In a real app, this would be an API call to Supabase
      mockChoices.push(newChoice);
      
      // Return the choice without the user_id property
      const { user_id, ...choice } = newChoice;
      return choice;
    } catch (error) {
      if (error instanceof StoryServiceError) {
        throw error;
      }
      throw new StoryServiceError('Failed to create story choice', 'CREATE_CHOICE_ERROR');
    }
  },
  
  // Get choices for a segment
  async getStoryChoices(userId: string, segmentId: string): Promise<StoryChoice[]> {
    try {
      // In a real app, this would be an API call to Supabase
      return mockChoices
        .filter(choice => choice.segment_id === segmentId && choice.user_id === userId)
        .map(({ user_id, ...choice }) => choice);
    } catch (error) {
      throw new StoryServiceError('Failed to fetch story choices', 'FETCH_CHOICES_ERROR');
    }
  },
  
  // Update a story choice
  async updateStoryChoice(userId: string, choiceId: string, choiceData: Partial<StoryChoice>): Promise<StoryChoice> {
    try {
      // Validate choice data if provided
      if (Object.keys(choiceData).length > 0) {
        const validationErrors = validateStoryChoice(choiceData);
        if (validationErrors.length > 0) {
          throw new StoryServiceError(`Validation failed: ${validationErrors.join(', ')}`, 'VALIDATION_ERROR');
        }
      }
      
      // Find the choice
      const choiceIndex = mockChoices.findIndex(c => c.id === choiceId && c.user_id === userId);
      if (choiceIndex === -1) {
        throw new StoryServiceError('Story choice not found or unauthorized', 'CHOICE_NOT_FOUND');
      }
      
      // Update choice
      const updatedChoice = {
        ...mockChoices[choiceIndex],
        ...choiceData
      };
      
      mockChoices[choiceIndex] = updatedChoice;
      
      // Return the choice without the user_id property
      const { user_id, ...choice } = updatedChoice;
      return choice;
    } catch (error) {
      if (error instanceof StoryServiceError) {
        throw error;
      }
      throw new StoryServiceError('Failed to update story choice', 'UPDATE_CHOICE_ERROR');
    }
  },
  
  // Delete a story choice
  async deleteStoryChoice(userId: string, choiceId: string): Promise<void> {
    try {
      const choiceIndex = mockChoices.findIndex(c => c.id === choiceId && c.user_id === userId);
      if (choiceIndex === -1) {
        throw new StoryServiceError('Story choice not found or unauthorized', 'CHOICE_NOT_FOUND');
      }
      
      mockChoices.splice(choiceIndex, 1);
    } catch (error) {
      if (error instanceof StoryServiceError) {
        throw error;
      }
      throw new StoryServiceError('Failed to delete story choice', 'DELETE_CHOICE_ERROR');
    }
  }
};

export default storyService;