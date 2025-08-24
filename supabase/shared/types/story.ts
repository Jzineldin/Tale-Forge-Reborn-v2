// Shared Story Types - Single Source of Truth
// Eliminates 20+ duplicate Story interface definitions across codebase

/**
 * Base Story interface - Core fields present in all story contexts
 * Single source of truth for story data structure
 */
export interface BaseStory {
  id: string;
  title: string;
  description: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Database Story interface - Complete story record as stored in database
 * Used by database operations and internal processing
 */
export interface DatabaseStory extends BaseStory {
  story_mode: string;          // Genre/mode (adventure, educational, etc.)
  target_age: string;          // Age range (4-6, 7-9, 10-12)
  is_public: boolean;
  is_completed: boolean;
  segment_count: number;
  audio_generation_status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  image_generation_status?: 'not_started' | 'in_progress' | 'completed' | 'failed';
  word_count?: number;
  estimated_reading_time?: number;
  language?: string;
  theme?: string;
  setting?: string;
  characters?: any[];
  metadata?: Record<string, any>;
}

/**
 * API Story interface - Story data as returned by API endpoints
 * Used by frontend and external integrations
 */
export interface APIStory extends BaseStory {
  genre: string;              // Mapped from story_mode for frontend compatibility
  age_group: string;          // Mapped from target_age for frontend compatibility
  target_age?: number;        // Optional specific target age
  is_public: boolean;
  is_completed: boolean;
  segment_count: number;
  audio_status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  image_status?: 'not_started' | 'in_progress' | 'completed' | 'failed';
  word_count?: number;
  reading_time?: number;
  theme?: string;
  setting?: string;
  characters?: Character[];
}

/**
 * Story Creation Request interface
 * Used by create-story function and related endpoints
 */
export interface StoryCreationRequest {
  title: string;
  description: string;
  genre: string;
  age_group: string;
  target_age?: number;
  theme: string;
  setting: string;
  characters: Character[];
  conflict: string;
  quest: string;
  moralLesson: string;
  additional_details?: string;
  setting_description?: string;
  time_period?: string;
  atmosphere?: string;
  words_per_chapter?: number;
}

/**
 * Character interface - Story character definition
 * Used across story creation and generation
 */
export interface Character {
  id?: string;
  name: string;
  description: string;
  role: string;
  personality?: string;
  appearance?: string;
  backstory?: string;
}

/**
 * Story Segment interface - Individual story parts/chapters
 * Used by story generation and reading functions
 */
export interface StorySegment {
  id: string;
  story_id: string;
  segment_text: string;
  choices: StoryChoice[];
  is_end: boolean;
  parent_segment_id: string | null;
  word_count: number;
  position: number;
  created_at: string;
  image_url?: string;
  audio_url?: string;
  metadata?: Record<string, any>;
}

/**
 * Story Choice interface - Interactive story choices
 * Used by choice parsing and story navigation
 */
export interface StoryChoice {
  id: string;
  text: string;
  description?: string;
  next_segment_id: string | null;
  is_ending?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Story Statistics interface - Analytics and metrics
 * Used by admin and analytics functions
 */
export interface StoryStats {
  story_id: string;
  total_reads: number;
  unique_readers: number;
  completion_rate: number;
  average_session_time: number;
  popular_choices: Record<string, number>;
  user_ratings: {
    average: number;
    count: number;
  };
  last_updated: string;
}

/**
 * Story Filter interface - For search and discovery
 * Used by story listing and search functions
 */
export interface StoryFilter {
  genre?: string[];
  age_group?: string[];
  is_public?: boolean;
  is_completed?: boolean;
  min_word_count?: number;
  max_word_count?: number;
  created_after?: string;
  created_before?: string;
  user_id?: string;
  search_query?: string;
}

/**
 * Story List Response interface - Paginated story listings
 * Used by discovery and library functions
 */
export interface StoryListResponse {
  stories: APIStory[];
  total_count: number;
  page: number;
  page_size: number;
  has_more: boolean;
  filters_applied: StoryFilter;
}

/**
 * Age group mappings for database compatibility
 * Handles frontend-to-database age group normalization
 */
export const AGE_GROUP_MAPPINGS: Record<string, string> = {
  '4-6': '4-6',
  '7-9': '7-9',
  '7-12': '10-12',  // Normalize 7-12 to 10-12
  '10-12': '10-12',
  '13+': '10-12',   // Fallback for 13+ to closest supported range
  '13-18': '10-12'  // Fallback for 13-18 to closest supported range
};

/**
 * Normalize age group from frontend format to database format
 * Handles common frontend age group patterns
 */
export function normalizeAgeGroup(ageGroup: string, targetAge?: number): string {
  // Direct mapping first
  if (AGE_GROUP_MAPPINGS[ageGroup]) {
    return AGE_GROUP_MAPPINGS[ageGroup];
  }
  
  // Use specific target age if provided
  if (targetAge) {
    if (targetAge <= 6) return '4-6';
    if (targetAge <= 9) return '7-9';
    return '10-12';
  }
  
  // Default fallback
  console.warn(`Unknown age group: ${ageGroup}, defaulting to 7-9`);
  return '7-9';
}

/**
 * Map database story to API story format
 * Transforms internal database format to frontend-friendly format
 */
export function mapDatabaseStoryToAPI(dbStory: DatabaseStory): APIStory {
  return {
    id: dbStory.id,
    title: dbStory.title,
    description: dbStory.description,
    user_id: dbStory.user_id,
    created_at: dbStory.created_at,
    updated_at: dbStory.updated_at,
    genre: dbStory.story_mode,
    age_group: dbStory.target_age,
    is_public: dbStory.is_public,
    is_completed: dbStory.is_completed,
    segment_count: dbStory.segment_count,
    audio_status: dbStory.audio_generation_status,
    image_status: dbStory.image_generation_status,
    word_count: dbStory.word_count,
    reading_time: dbStory.estimated_reading_time,
    theme: dbStory.theme,
    setting: dbStory.setting,
    characters: dbStory.characters || []
  };
}

/**
 * Validate story creation request
 * Ensures all required fields are present and valid
 */
export function validateStoryCreationRequest(request: StoryCreationRequest): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!request.title?.trim()) errors.push('Title is required');
  if (!request.description?.trim()) errors.push('Description is required');
  if (!request.genre?.trim()) errors.push('Genre is required');
  if (!request.age_group?.trim()) errors.push('Age group is required');
  if (!request.theme?.trim()) errors.push('Theme is required');
  if (!request.setting?.trim()) errors.push('Setting is required');
  
  if (!Array.isArray(request.characters) || request.characters.length === 0) {
    errors.push('At least one character is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}