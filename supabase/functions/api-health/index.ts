// Tale Forge - API Health Check Edge Function
// Simple health check endpoint for monitoring and E2E testing

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

console.log("API Health function started");

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Basic health check data
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Tale Forge API',
      version: '1.0.0',
      environment: Deno.env.get('NODE_ENV') || 'development',
      uptime: Date.now(),
      checks: {
        database: 'healthy', // In a real implementation, you'd check DB connectivity
        ai_services: 'healthy', // Check AI provider availability
        storage: 'healthy' // Check file storage
      }
    };
    
    console.log('✅ Health check requested:', {
      timestamp: healthData.timestamp,
      environment: healthData.environment
    });
    
    // Return health status
    return new Response(
      JSON.stringify(healthData),
      { 
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
    
  } catch (error) {
    console.error('❌ Health check error:', error);
    
    // Return unhealthy status
    const errorData = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'Tale Forge API',
      error: error.message,
      checks: {
        database: 'error',
        ai_services: 'unknown',
        storage: 'unknown'
      }
    };
    
    return new Response(
      JSON.stringify(errorData),
      { 
        status: 503,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});