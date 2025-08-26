// Validation Service
// Handles environment validation, API key checking, and request validation
// Extracted from main function for better testability and maintainability

import { 
  ValidationService, 
  EnvironmentStatus, 
  ValidationResult, 
  APIKeyStatus 
} from '../types/interfaces.ts';

export class Validation implements ValidationService {
  
  /**
   * Validate all environment variables and configuration
   */
  async validateEnvironment(): Promise<EnvironmentStatus> {
    console.log('🔍 Validating environment configuration...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const ovhApiKey = Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN');
    
    const errors: string[] = [];
    
    // Check Supabase configuration
    const hasSupabase = !!(supabaseUrl && supabaseServiceKey);
    if (!hasSupabase) {
      if (!supabaseUrl) errors.push('Missing SUPABASE_URL environment variable');
      if (!supabaseServiceKey) errors.push('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
    }
    
    // Check AI provider keys
    const hasOpenAI = !!(openaiApiKey && !openaiApiKey.includes('placeholder'));
    const hasOVH = !!(ovhApiKey && !ovhApiKey.includes('placeholder'));
    
    if (!hasOpenAI && !hasOVH) {
      errors.push('No valid AI provider API keys found (OpenAI or OVH)');
    }
    
    const isValid = hasSupabase && (hasOpenAI || hasOVH);
    
    console.log('🔍 Environment validation result:', {
      isValid,
      hasSupabase,
      hasOpenAI,
      hasOVH,
      errorCount: errors.length
    });
    
    return {
      isValid,
      hasSupabase,
      hasOpenAI,
      hasOVH,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Validate incoming request parameters and authentication
   */
  async validateRequest(request: Request): Promise<ValidationResult> {
    console.log('📥 Validating incoming request...');
    
    const errors: string[] = [];
    let storyId: string | undefined;
    let choiceIndex: number | undefined;
    let authHeader: string | undefined;
    let templateContext: any;
    
    // Check authorization header
    authHeader = request.headers.get('Authorization') || undefined;
    if (!authHeader) {
      errors.push('Missing Authorization header');
    }
    
    // Parse request body
    try {
      const body = await request.json();
      storyId = body.storyId;
      choiceIndex = body.choiceIndex;
      templateContext = body.templateContext; // Extract template context
      
      // Validate storyId
      if (!storyId || typeof storyId !== 'string') {
        errors.push('Missing or invalid storyId in request body');
      }
      
      // choiceIndex is optional (undefined for first segment)
      if (choiceIndex !== undefined && (typeof choiceIndex !== 'number' || choiceIndex < 0)) {
        errors.push('Invalid choiceIndex in request body (must be a non-negative number)');
      }
      
    } catch (parseError) {
      errors.push(`Invalid JSON in request body: ${parseError.message}`);
    }
    
    const isValid = errors.length === 0;
    
    console.log('📥 Request validation result:', {
      isValid,
      hasAuth: !!authHeader,
      hasStoryId: !!storyId,
      choiceIndex,
      errorCount: errors.length
    });
    
    return {
      isValid,
      storyId,
      choiceIndex,
      authHeader,
      templateContext,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Validate API keys for all providers
   */
  async validateAPIKeys(): Promise<APIKeyStatus> {
    console.log('🔑 Validating API keys...');
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const ovhApiKey = Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN');
    
    const hasOpenAI = this.isValidAPIKey(openaiApiKey);
    const hasOVH = this.isValidAPIKey(ovhApiKey);
    
    const hasValidApiKeys = hasOpenAI || hasOVH;
    const primaryProvider = hasOpenAI ? 'OpenAI' : hasOVH ? 'OVH' : 'None';
    
    console.log('🔑 API key validation result:', {
      hasValidApiKeys,
      hasOpenAI,
      hasOVH,
      primaryProvider
    });
    
    return {
      hasValidApiKeys,
      hasOpenAI,
      hasOVH,
      primaryProvider
    };
  }

  /**
   * Check if an API key is valid (not empty, not placeholder)
   */
  private isValidAPIKey(apiKey: string | undefined): boolean {
    return !!(apiKey && apiKey.trim().length > 0 && !apiKey.includes('placeholder'));
  }

  /**
   * Validate Supabase client configuration
   */
  async validateSupabaseClient(supabase: any): Promise<boolean> {
    try {
      // Try a simple query to test the connection
      const { error } = await supabase
        .from('stories')
        .select('id')
        .limit(1);
        
      if (error) {
        console.error('❌ Supabase client validation failed:', error);
        return false;
      }
      
      console.log('✅ Supabase client validated successfully');
      return true;
    } catch (error) {
      console.error('❌ Supabase client validation error:', error);
      return false;
    }
  }

  /**
   * Validate user authentication using Supabase
   */
  async validateUserAuth(supabase: any, authHeader: string): Promise<{
    isValid: boolean;
    userId?: string;
    error?: string;
  }> {
    console.log('🔐 Validating user authentication...');
    
    try {
      // Extract JWT token from authorization header
      const jwt = authHeader.replace('Bearer ', '');
      
      const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
      
      if (userError || !user) {
        console.error('❌ User authentication failed:', userError);
        return {
          isValid: false,
          error: userError?.message || 'No user found'
        };
      }
      
      console.log('✅ User authenticated successfully:', user.id);
      return {
        isValid: true,
        userId: user.id
      };
      
    } catch (error) {
      console.error('❌ Authentication validation error:', error);
      return {
        isValid: false,
        error: error.message
      };
    }
  }

  /**
   * Validate story ownership by user
   */
  async validateStoryOwnership(supabase: any, storyId: string, userId: string): Promise<boolean> {
    try {
      const { data: story, error } = await supabase
        .from('stories')
        .select('user_id')
        .eq('id', storyId)
        .single();
        
      if (error || !story) {
        console.error('❌ Story ownership validation failed:', error);
        return false;
      }
      
      const isOwner = story.user_id === userId;
      console.log(`🔒 Story ownership validation: ${isOwner ? 'PASSED' : 'FAILED'}`);
      
      return isOwner;
    } catch (error) {
      console.error('❌ Story ownership validation error:', error);
      return false;
    }
  }

  /**
   * Comprehensive validation for all requirements
   */
  async validateAllRequirements(request: Request): Promise<{
    isValid: boolean;
    environment?: EnvironmentStatus;
    requestValidation?: ValidationResult;
    apiKeys?: APIKeyStatus;
    errors: string[];
  }> {
    console.log('🔍 Running comprehensive validation...');
    
    const errors: string[] = [];
    
    // Validate environment
    const environment = await this.validateEnvironment();
    if (!environment.isValid) {
      errors.push('Environment validation failed');
      if (environment.errors) {
        errors.push(...environment.errors);
      }
    }
    
    // Validate request
    const requestValidation = await this.validateRequest(request);
    if (!requestValidation.isValid) {
      errors.push('Request validation failed');
      if (requestValidation.errors) {
        errors.push(...requestValidation.errors);
      }
    }
    
    // Validate API keys
    const apiKeys = await this.validateAPIKeys();
    if (!apiKeys.hasValidApiKeys) {
      errors.push('No valid API keys available');
    }
    
    const isValid = errors.length === 0;
    
    console.log('🔍 Comprehensive validation result:', {
      isValid,
      errorCount: errors.length
    });
    
    return {
      isValid,
      environment,
      requestValidation,
      apiKeys,
      errors
    };
  }

  /**
   * Get validation status summary for debugging
   */
  async getValidationSummary(): Promise<{
    timestamp: string;
    environment: EnvironmentStatus;
    apiKeys: APIKeyStatus;
    systemHealth: {
      environmentReady: boolean;
      providersReady: boolean;
      overallStatus: 'ready' | 'degraded' | 'offline';
    };
  }> {
    const environment = await this.validateEnvironment();
    const apiKeys = await this.validateAPIKeys();
    
    const environmentReady = environment.isValid;
    const providersReady = apiKeys.hasValidApiKeys;
    
    let overallStatus: 'ready' | 'degraded' | 'offline';
    if (environmentReady && providersReady) {
      overallStatus = 'ready';
    } else if (environmentReady || providersReady) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'offline';
    }
    
    return {
      timestamp: new Date().toISOString(),
      environment,
      apiKeys,
      systemHealth: {
        environmentReady,
        providersReady,
        overallStatus
      }
    };
  }
}

// Export singleton instance for use in main function
export const validation = new Validation();