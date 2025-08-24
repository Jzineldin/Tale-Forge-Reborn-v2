// TypeScript interfaces for generate-story-segment refactored services
// Ensures type safety and clear contracts between services

export interface Story {
  id: string;
  title: string;
  description: string;
  user_id: string;
  story_mode: string;
  target_age: string;
  genre?: string;
  age_group?: string;
  created_at: string;
  updated_at: string;
}

export interface Segment {
  id: string;
  story_id: string;
  segment_text: string;
  choices: Choice[];
  is_end: boolean;
  parent_segment_id: string | null;
  word_count: number;
  position?: number;
  created_at: string;
}

export interface Choice {
  id: string;
  text: string;
  next_segment_id: string | null;
}

export interface Character {
  user_characters: {
    name: string;
    description: string;
    role: string;
  };
}

export interface NewSegment {
  story_id: string;
  segment_text: string;
  choices: Choice[];
  is_end: boolean;
  parent_segment_id: string | null;
  word_count: number;
  created_at: string;
}

// AI Provider Interfaces

export interface AIProviderConfig {
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface OpenAIConfig extends AIProviderConfig {
  apiKey: string;
}

export interface OVHConfig extends AIProviderConfig {
  accessToken: string;
}

export interface AIRequestConfig {
  story: Story;
  prompt: string;
  targetAge: string;
}

export interface AIResponse {
  segmentText: string;
  choicesText: string;
  provider: string;
}

export interface ProviderStatus {
  hasOpenAI: boolean;
  hasOVH: boolean;
  primaryProvider: string;
}

// Service Interfaces

export interface AIProviderService {
  generateStorySegment(prompt: string, config: AIRequestConfig): Promise<AIResponse>;
  validateProviders(): Promise<ProviderStatus>;
}

export interface ChoiceParserService {
  parseChoices(aiResponse: string, storyText: string): Promise<Choice[]>;
  generateContextualFallbacks(storyText: string): Choice[];
}

export interface PromptBuilderService {
  buildPrompt(story: Story, previousSegment?: Segment | null, userChoice?: string, userCharacters?: Character[]): string;
  getTemplateForGenreAndAge(genre: string, targetAge: string): string;
}

export interface DatabaseService {
  fetchStoryData(storyId: string, supabase: any): Promise<Story>;
  fetchPreviousSegment(storyId: string, choiceIndex: number | undefined, supabase: any): Promise<Segment | null>;
  fetchUserCharacters(storyId: string, userId: string, supabase: any): Promise<Character[]>;
  saveSegment(segment: NewSegment, supabase: any): Promise<Segment>;
  getNextPosition(storyId: string, supabase: any): Promise<number>;
}

export interface ValidationService {
  validateEnvironment(): Promise<EnvironmentStatus>;
  validateRequest(request: Request): Promise<ValidationResult>;
  validateAPIKeys(): Promise<APIKeyStatus>;
}

// Validation Interfaces

export interface EnvironmentStatus {
  isValid: boolean;
  hasSupabase: boolean;
  hasOpenAI: boolean;
  hasOVH: boolean;
  errors?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  storyId?: string;
  choiceIndex?: number;
  authHeader?: string;
  errors?: string[];
}

export interface APIKeyStatus {
  hasValidApiKeys: boolean;
  hasOpenAI: boolean;
  hasOVH: boolean;
  primaryProvider: string;
}

// Response Types

export interface SegmentGenerationResponse {
  success: true;
  segment: Segment;
  imagePrompt: string;
  message: string;
  aiMetrics: {
    provider: string;
    method: string;
    api_calls_made: number;
    fallback_triggered: boolean;
    story_length: number;
    choices_count: number;
  };
}

export interface ErrorResponse {
  error: string;
  code?: string;
  message?: string;
  details?: string;
}

// CORS Headers
export interface CORSHeaders {
  'Access-Control-Allow-Origin': string;
  'Access-Control-Allow-Methods': string;
  'Access-Control-Allow-Headers': string;
}

// Constants
export const CORS_HEADERS: CORSHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};