// Shared types between frontend and backend

export interface Story {
  id: string;
  title: string;
  description: string;
  genre: string;
  age_group: string;
  target_age?: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'published' | 'archived' | 'completed';
  segments?: StorySegment[];  // Critical: Frontend expects this
  // Extended properties from generation_settings
  theme?: string;
  setting?: string;
  characters?: Character[];
  conflict?: string;
  quest?: string;
  moralLesson?: string;
  additionalDetails?: string;
  settingDescription?: string;
  timePeriod?: string;
  atmosphere?: string;
  wordsPerChapter?: number;
  childName?: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  role: string;
  traits: string[];
}

export interface StorySegment {
  id: string;
  story_id: string;
  content: string;
  image_url?: string;
  image_prompt?: string;
  audio_url?: string;
  choices: StoryChoice[];
  position: number;
  created_at: string;
}

export interface StoryChoice {
  id: string;
  segment_id: string;
  text: string;
  next_segment_id?: string;
}

export interface UserCharacter {
  id: string;
  user_id: string;
  name: string;
  description: string;
  role: string;
  traits: string[];
  avatar_url?: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: 'free' | 'premium' | 'pro' | 'family';
  status: 'active' | 'cancelled' | 'expired';
  started_at: string;
  expires_at?: string;
  customer_id?: string;
}

export interface UserUsage {
  id: string;
  user_id: string;
  stories_created: number;
  images_generated: number;
  audio_generated: number;
  period_start: string;
  period_end: string;
}