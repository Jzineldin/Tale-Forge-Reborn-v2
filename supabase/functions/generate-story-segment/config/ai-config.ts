// AI Provider Configuration
// Centralized configuration for OpenAI and OVH AI providers

import { OpenAIConfig, OVHConfig } from '../types/interfaces.ts';

// OpenAI Configuration (Primary AI Provider)
export const OPENAI_CONFIG: OpenAIConfig = {
  baseUrl: 'https://api.openai.com/v1',
  apiKey: Deno.env.get('OPENAI_API_KEY') || '',
  model: 'gpt-4o',
  maxTokens: 512,
  temperature: 0.7
};

// OVH AI Configuration (Fallback AI Provider)
export const OVH_AI_CONFIG: OVHConfig = {
  baseUrl: 'https://oai.endpoints.kepler.ai.cloud.ovh.net/v1',
  accessToken: Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN') || '',
  model: 'Meta-Llama-3_3-70B-Instruct',
  maxTokens: 512,
  temperature: 0.7
};

// Age-based token limits
export const getTokenLimitsForAge = (targetAge: string): number => {
  switch (targetAge) {
    case '4-6':
      return 300;
    case '7-9':
      return 400;
    default:
      return 500;
  }
};

// JSON structure token overhead
export const JSON_STRUCTURE_OVERHEAD = 200;

// Calculate total tokens needed for structured JSON response
export const calculateMaxTokens = (targetAge: string): number => {
  return getTokenLimitsForAge(targetAge) + JSON_STRUCTURE_OVERHEAD;
};

// Provider validation
export const validateProviderConfig = (config: OpenAIConfig | OVHConfig): boolean => {
  const apiKey = 'apiKey' in config ? config.apiKey : config.accessToken;
  return !!(
    config.baseUrl && 
    apiKey && 
    !apiKey.includes('placeholder') &&
    config.model &&
    config.maxTokens > 0 &&
    config.temperature >= 0
  );
};

// System prompts for different providers
export const SYSTEM_PROMPTS = {
  story_generation: `You are an expert children's story writer. You create engaging, age-appropriate stories with positive messages. 

CRITICAL REQUIREMENTS:
- Always respond with valid JSON in the exact format requested
- Write story segments that lead naturally to the 3 choices you provide
- Make sure choices directly relate to what happens in your story segment
- Keep choices short (4-8 words) and easy for children to understand
- Each choice must offer a different story direction

Your job is to advance the story in an engaging way and provide meaningful choices that children can understand and that relate directly to your story content.`,
  choice_generation: 'You are an expert children\'s story writer who creates engaging, age-appropriate stories with positive messages.'
} as const;