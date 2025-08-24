// Shared Authentication Service for all Supabase Edge Functions
// Eliminates inconsistent auth patterns across 18+ functions

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';
import { EnvironmentConfig } from '../utils/environment.ts';

export interface AuthValidation {
  isValid: boolean;
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
  token?: string;
  error?: string;
}

export interface AuthConfig {
  required?: boolean;
  allowAnonymous?: boolean;
  requireRole?: string;
}

/**
 * Standardized authentication validation for all functions
 * Replaces inconsistent auth patterns found across codebase
 */
export async function validateAuthentication(
  request: Request,
  envConfig: EnvironmentConfig,
  authConfig: AuthConfig = { required: true }
): Promise<AuthValidation> {
  
  console.log('🔐 Validating authentication...');
  
  try {
    // Extract authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      if (authConfig.allowAnonymous) {
        console.log('✅ Anonymous access allowed');
        return { isValid: true };
      }
      
      console.error('❌ Missing Authorization header');
      return { 
        isValid: false, 
        error: 'Missing Authorization header' 
      };
    }
    
    // Extract JWT token
    const token = authHeader.replace('Bearer ', '');
    if (!token || token === authHeader) {
      return { 
        isValid: false, 
        error: 'Invalid Authorization header format. Expected "Bearer <token>"' 
      };
    }
    
    // Create Supabase client for auth validation
    const supabase = createClient(
      envConfig.supabaseUrl,
      envConfig.supabaseAnonKey || envConfig.supabaseServiceKey,
      {
        global: { 
          headers: { Authorization: authHeader } 
        }
      }
    );
    
    // Validate user with Supabase auth
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('❌ Auth validation failed:', userError);
      return {
        isValid: false,
        error: userError?.message || 'Invalid or expired token'
      };
    }
    
    // Role-based access control (if required)
    if (authConfig.requireRole) {
      const userRole = user.user_metadata?.role || user.app_metadata?.role || 'user';
      
      if (userRole !== authConfig.requireRole) {
        console.error(`❌ Insufficient permissions. Required: ${authConfig.requireRole}, Got: ${userRole}`);
        return {
          isValid: false,
          error: `Insufficient permissions. Required role: ${authConfig.requireRole}`
        };
      }
    }
    
    console.log('✅ User authenticated successfully:', {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'user'
    });
    
    return {
      isValid: true,
      user: {
        id: user.id,
        email: user.email || undefined,
        role: user.user_metadata?.role || user.app_metadata?.role || 'user'
      },
      token
    };
    
  } catch (error) {
    console.error('❌ Authentication validation error:', error);
    return {
      isValid: false,
      error: `Authentication validation failed: ${error.message}`
    };
  }
}

/**
 * Quick auth validation for most functions
 * Standard user authentication requirement
 */
export async function validateUserAuth(
  request: Request,
  envConfig: EnvironmentConfig
): Promise<AuthValidation> {
  return validateAuthentication(request, envConfig, { required: true });
}

/**
 * Admin-only authentication validation
 * Used by admin functions and sensitive operations
 */
export async function validateAdminAuth(
  request: Request,
  envConfig: EnvironmentConfig
): Promise<AuthValidation> {
  return validateAuthentication(request, envConfig, { 
    required: true, 
    requireRole: 'admin' 
  });
}

/**
 * Optional authentication validation
 * Used by public functions that benefit from auth but don't require it
 */
export async function validateOptionalAuth(
  request: Request,
  envConfig: EnvironmentConfig
): Promise<AuthValidation> {
  return validateAuthentication(request, envConfig, { 
    required: false, 
    allowAnonymous: true 
  });
}

/**
 * Create authenticated Supabase client
 * Returns properly configured client for the authenticated user
 */
export function createAuthenticatedSupabaseClient(
  envConfig: EnvironmentConfig,
  authResult: AuthValidation
): any {
  if (!authResult.isValid || !authResult.token) {
    throw new Error('Cannot create authenticated client: invalid authentication');
  }
  
  return createClient(
    envConfig.supabaseUrl,
    envConfig.supabaseServiceKey,
    {
      global: { 
        headers: { Authorization: `Bearer ${authResult.token}` } 
      }
    }
  );
}

/**
 * Create service role Supabase client
 * For operations requiring elevated privileges
 */
export function createServiceRoleSupabaseClient(
  envConfig: EnvironmentConfig
): any {
  return createClient(
    envConfig.supabaseUrl,
    envConfig.supabaseServiceKey
  );
}

/**
 * Validate story ownership by user
 * Common pattern used across story-related functions
 */
export async function validateStoryOwnership(
  supabase: any, 
  storyId: string, 
  userId: string
): Promise<boolean> {
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