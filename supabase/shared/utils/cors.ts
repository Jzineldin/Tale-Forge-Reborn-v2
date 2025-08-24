// Shared CORS utilities for all Supabase Edge Functions
// Eliminates code duplication across 18+ functions

/**
 * Standard CORS headers for all Tale Forge functions
 * Used by every single function to handle cross-origin requests
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
} as const;

/**
 * Handle CORS preflight requests
 * Returns standardized OPTIONS response for all functions
 */
export function handleCorsPreflightRequest(): Response {
  return new Response(null, { 
    headers: corsHeaders,
    status: 200
  });
}

/**
 * Create response with CORS headers
 * Ensures all function responses include proper CORS headers
 */
export function createCorsResponse(
  body: any, 
  options: ResponseInit = {}
): Response {
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

/**
 * Create error response with CORS headers
 * Standardized error responses across all functions
 */
export function createCorsErrorResponse(
  error: string | Error, 
  status: number = 500,
  code?: string
): Response {
  const errorBody = {
    error: error instanceof Error ? error.message : error,
    ...(code && { code }),
    timestamp: new Date().toISOString()
  };

  return createCorsResponse(errorBody, { status });
}