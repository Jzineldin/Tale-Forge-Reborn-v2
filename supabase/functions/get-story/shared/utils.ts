// Working Shared Utilities for get-story function
// This approach works with Supabase Edge Function deployment

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';

// CORS Headers
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
} as const;

// Handle CORS preflight
export function handleCorsPreflightRequest(): Response {
  return new Response(null, { 
    headers: corsHeaders,
    status: 200
  });
}

// Create CORS response
export function createCorsResponse(body: any, options: ResponseInit = {}): Response {
  const headers = {
    ...corsHeaders,
    'Content-Type': 'application/json',
    ...options.headers
  };

  return new Response(
    typeof body === 'string' ? body : JSON.stringify(body),
    {
      ...options,
      headers
    }
  );
}

// Environment validation
export function validateEnvironment(): {
  isValid: boolean;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  error?: string;
} {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      isValid: false,
      error: 'Missing required Supabase environment variables'
    };
  }
  
  return {
    isValid: true,
    supabaseUrl,
    supabaseAnonKey
  };
}

// Authentication validation
export async function validateUserAuth(request: Request, supabaseUrl: string, supabaseAnonKey: string): Promise<{
  isValid: boolean;
  user?: { id: string; email?: string };
  error?: string;
}> {
  
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return {
      isValid: false,
      error: 'Missing Authorization header'
    };
  }
  
  try {
    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return {
        isValid: false,
        error: userError?.message || 'Invalid token'
      };
    }
    
    return {
      isValid: true,
      user: {
        id: user.id,
        email: user.email || undefined
      }
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Authentication error: ${error.message}`
    };
  }
}

// Create authenticated Supabase client
export function createAuthenticatedSupabaseClient(supabaseUrl: string, supabaseAnonKey: string, authHeader: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { 
      headers: { Authorization: authHeader } 
    }
  });
}

// Validation helpers
export function validateRequiredFields(data: Record<string, any>, requiredFields: string[]): string[] {
  const errors: string[] = [];
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      errors.push(`${field} is required`);
    }
  }
  
  return errors;
}