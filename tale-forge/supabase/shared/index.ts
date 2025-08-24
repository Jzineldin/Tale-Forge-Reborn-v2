// Shared Services Index - One-stop import for all shared utilities
// Makes it easy for all 18 functions to import common services

// CORS utilities - eliminates duplicate CORS code
export {
  corsHeaders,
  handleCorsPreflightRequest,
  createCorsResponse,
  createCorsErrorResponse
} from './utils/cors.ts';

// Environment validation - eliminates duplicate env checking
export {
  validateEnvironment,
  validateSupabaseEnvironment,
  validateAIEnvironment,
  getEnvironmentSummary,
  type EnvironmentConfig,
  type EnvironmentValidation
} from './utils/environment.ts';

// Authentication services - standardizes auth patterns
export {
  validateAuthentication,
  validateUserAuth,
  validateAdminAuth,
  validateOptionalAuth,
  createAuthenticatedSupabaseClient,
  createServiceRoleSupabaseClient,
  validateStoryOwnership,
  type AuthValidation,
  type AuthConfig
} from './services/auth.ts';

// Error handling - standardizes error responses
export {
  ErrorCodes,
  createStandardError,
  handleFunctionError,
  createValidationError,
  createAuthError,
  createNotFoundError,
  createServiceError,
  safeAsyncOperation,
  validateRequiredFields,
  createRateLimitError,
  type StandardError
} from './utils/errors.ts';

// Story types - single source of truth for all story-related types
export {
  type BaseStory,
  type DatabaseStory,
  type APIStory,
  type StoryCreationRequest,
  type Character,
  type StorySegment,
  type StoryChoice,
  type StoryStats,
  type StoryFilter,
  type StoryListResponse,
  AGE_GROUP_MAPPINGS,
  normalizeAgeGroup,
  mapDatabaseStoryToAPI,
  validateStoryCreationRequest
} from './types/story.ts';

/**
 * Standard function template for all Edge Functions
 * Eliminates boilerplate and ensures consistency
 * 
 * Usage example:
 * ```typescript
 * import { standardFunctionHandler } from '../shared/index.ts';
 * 
 * serve(standardFunctionHandler('function-name', async (req, env, auth) => {
 *   // Your function logic here
 *   return { success: true, data: 'result' };
 * }));
 * ```
 */
export async function standardFunctionHandler<T = any>(
  functionName: string,
  handler: (
    request: Request,
    envConfig: EnvironmentConfig,
    auth: AuthValidation
  ) => Promise<T>
) {
  return async (request: Request): Promise<Response> => {
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCorsPreflightRequest();
    }
    
    try {
      console.log(`🚀 [${functionName}] Function started`);
      
      // Validate environment
      const envValidation = validateSupabaseEnvironment();
      if (!envValidation.isValid) {
        console.error(`❌ [${functionName}] Environment validation failed:`, envValidation.errors);
        return createCorsErrorResponse(
          'Service configuration error',
          500,
          ErrorCodes.MISSING_CONFIG
        );
      }
      
      // Validate authentication (most functions require auth)
      const authValidation = await validateUserAuth(request, envValidation.config!);
      if (!authValidation.isValid) {
        console.error(`❌ [${functionName}] Authentication failed:`, authValidation.error);
        return createCorsErrorResponse(
          authValidation.error || 'Authentication required',
          401,
          ErrorCodes.MISSING_AUTH
        );
      }
      
      // Execute function handler
      const result = await handler(request, envValidation.config!, authValidation);
      
      console.log(`✅ [${functionName}] Function completed successfully`);
      
      // Return standardized success response
      return createCorsResponse(result);
      
    } catch (error) {
      return handleFunctionError(error, functionName);
    }
  };
}

/**
 * Standard function template for functions that don't require authentication
 * For public or webhook functions
 */
export async function publicFunctionHandler<T = any>(
  functionName: string,
  handler: (
    request: Request,
    envConfig: EnvironmentConfig
  ) => Promise<T>
) {
  return async (request: Request): Promise<Response> => {
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCorsPreflightRequest();
    }
    
    try {
      console.log(`🚀 [${functionName}] Public function started`);
      
      // Validate environment
      const envValidation = validateSupabaseEnvironment();
      if (!envValidation.isValid) {
        console.error(`❌ [${functionName}] Environment validation failed:`, envValidation.errors);
        return createCorsErrorResponse(
          'Service configuration error',
          500,
          ErrorCodes.MISSING_CONFIG
        );
      }
      
      // Execute function handler
      const result = await handler(request, envValidation.config!);
      
      console.log(`✅ [${functionName}] Public function completed successfully`);
      
      // Return standardized success response
      return createCorsResponse(result);
      
    } catch (error) {
      return handleFunctionError(error, functionName);
    }
  };
}

/**
 * Standard function template for admin-only functions
 * Requires admin role authentication
 */
export async function adminFunctionHandler<T = any>(
  functionName: string,
  handler: (
    request: Request,
    envConfig: EnvironmentConfig,
    auth: AuthValidation
  ) => Promise<T>
) {
  return async (request: Request): Promise<Response> => {
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCorsPreflightRequest();
    }
    
    try {
      console.log(`🚀 [${functionName}] Admin function started`);
      
      // Validate environment
      const envValidation = validateSupabaseEnvironment();
      if (!envValidation.isValid) {
        console.error(`❌ [${functionName}] Environment validation failed:`, envValidation.errors);
        return createCorsErrorResponse(
          'Service configuration error',
          500,
          ErrorCodes.MISSING_CONFIG
        );
      }
      
      // Validate admin authentication
      const authValidation = await validateAdminAuth(request, envValidation.config!);
      if (!authValidation.isValid) {
        console.error(`❌ [${functionName}] Admin authentication failed:`, authValidation.error);
        return createCorsErrorResponse(
          authValidation.error || 'Admin access required',
          authValidation.error?.includes('Insufficient') ? 403 : 401,
          authValidation.error?.includes('Insufficient') ? ErrorCodes.INSUFFICIENT_PERMISSIONS : ErrorCodes.MISSING_AUTH
        );
      }
      
      // Execute function handler
      const result = await handler(request, envValidation.config!, authValidation);
      
      console.log(`✅ [${functionName}] Admin function completed successfully`);
      
      // Return standardized success response
      return createCorsResponse(result);
      
    } catch (error) {
      return handleFunctionError(error, functionName);
    }
  };
}