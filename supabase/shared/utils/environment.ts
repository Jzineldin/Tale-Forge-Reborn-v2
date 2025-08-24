// Shared Environment Validation for all Supabase Edge Functions
// Eliminates duplicate env checking across 18+ functions

export interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  supabaseAnonKey?: string;
  openaiApiKey?: string;
  ovhApiKey?: string;
}

export interface EnvironmentValidation {
  isValid: boolean;
  config?: EnvironmentConfig;
  errors: string[];
  warnings: string[];
}

/**
 * Validate all required environment variables
 * Centralized validation eliminates duplicate code across functions
 */
export function validateEnvironment(requiredKeys: {
  supabase?: boolean;
  openai?: boolean;
  ovh?: boolean;
  requireAnyAI?: boolean;
} = { supabase: true }): EnvironmentValidation {
  
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Core Supabase configuration
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  
  if (requiredKeys.supabase) {
    if (!supabaseUrl) errors.push('Missing SUPABASE_URL environment variable');
    if (!supabaseServiceKey) errors.push('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
    if (!supabaseAnonKey) warnings.push('Missing SUPABASE_ANON_KEY (optional but recommended)');
  }
  
  // AI Provider configuration
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  const ovhApiKey = Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN');
  
  const hasValidOpenAI = openaiApiKey && !openaiApiKey.includes('placeholder');
  const hasValidOVH = ovhApiKey && !ovhApiKey.includes('placeholder');
  
  if (requiredKeys.openai && !hasValidOpenAI) {
    errors.push('Missing or invalid OPENAI_API_KEY environment variable');
  }
  
  if (requiredKeys.ovh && !hasValidOVH) {
    errors.push('Missing or invalid OVH_AI_ENDPOINTS_ACCESS_TOKEN environment variable');
  }
  
  if (requiredKeys.requireAnyAI && !hasValidOpenAI && !hasValidOVH) {
    errors.push('At least one valid AI provider API key is required (OpenAI or OVH)');
  }
  
  const isValid = errors.length === 0;
  
  const config: EnvironmentConfig = {
    supabaseUrl: supabaseUrl!,
    supabaseServiceKey: supabaseServiceKey!,
    supabaseAnonKey,
    openaiApiKey: hasValidOpenAI ? openaiApiKey : undefined,
    ovhApiKey: hasValidOVH ? ovhApiKey : undefined
  };
  
  // Log validation summary
  console.log('🔍 Environment validation:', {
    isValid,
    hasSupabase: !!(supabaseUrl && supabaseServiceKey),
    hasOpenAI: hasValidOpenAI,
    hasOVH: hasValidOVH,
    errorCount: errors.length,
    warningCount: warnings.length
  });
  
  return {
    isValid,
    config: isValid ? config : undefined,
    errors,
    warnings
  };
}

/**
 * Quick validation for functions that only need Supabase
 * Most common validation pattern
 */
export function validateSupabaseEnvironment(): EnvironmentValidation {
  return validateEnvironment({ supabase: true });
}

/**
 * Validation for AI functions requiring any AI provider
 * Used by story generation and AI-related functions
 */
export function validateAIEnvironment(): EnvironmentValidation {
  return validateEnvironment({ 
    supabase: true, 
    requireAnyAI: true 
  });
}

/**
 * Get environment summary for debugging
 * Safely logs environment status without exposing secrets
 */
export function getEnvironmentSummary(): {
  timestamp: string;
  environment: 'production' | 'development' | 'unknown';
  services: {
    supabase: boolean;
    openai: boolean;
    ovh: boolean;
  };
} {
  const env = validateEnvironment();
  
  return {
    timestamp: new Date().toISOString(),
    environment: Deno.env.get('DENO_ENV') as any || 'unknown',
    services: {
      supabase: !!(env.config?.supabaseUrl && env.config?.supabaseServiceKey),
      openai: !!env.config?.openaiApiKey,
      ovh: !!env.config?.ovhApiKey
    }
  };
}