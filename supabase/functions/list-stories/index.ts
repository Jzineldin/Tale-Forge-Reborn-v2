// Tale Forge - List Stories Edge Function
// Retrieve user's stories with optional filtering

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log("List Stories function started");

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to handle CORS preflight requests
function handleCorsPreflightRequest(): Response {
  return new Response('ok', { headers: corsHeaders });
}

// Helper function to create CORS-enabled responses
function createCorsResponse(data: any, options: ResponseInit = {}): Response {
  return new Response(
    JSON.stringify(data),
    {
      ...options,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }
  );
}

// Validate environment variables
function validateEnvironment() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      isValid: false,
      error: 'Missing required environment variables'
    };
  }
  
  return {
    isValid: true,
    supabaseUrl,
    supabaseAnonKey
  };
}

// Validate user authentication
async function validateUserAuth(req: Request, supabaseUrl: string, supabaseAnonKey: string) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      isValid: false,
      error: 'Missing or invalid authorization header'
    };
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader }
      }
    });
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return {
        isValid: false,
        error: 'Invalid or expired token'
      };
    }
    
    return {
      isValid: true,
      user
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Authentication failed'
    };
  }
}

// Create authenticated Supabase client
function createAuthenticatedSupabaseClient(supabaseUrl: string, supabaseAnonKey: string, authHeader: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: authHeader }
    }
  });
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }
  
  try {
    console.log('🚀 Processing list-stories request...');
    
    // 1. Validate environment
    const env = validateEnvironment();
    if (!env.isValid) {
      console.error('❌ Environment validation failed:', env.error);
      return createCorsResponse({
        error: env.error
      }, { status: 500 });
    }
    
    // 2. Validate authentication
    const authResult = await validateUserAuth(req, env.supabaseUrl!, env.supabaseAnonKey!);
    if (!authResult.isValid) {
      console.error('❌ Authentication failed:', authResult.error);
      return createCorsResponse({
        error: authResult.error
      }, { status: 401 });
    }
    
    console.log('✅ User authenticated:', authResult.user!.id);
    
    // 3. Parse query parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const status = url.searchParams.get('status'); // 'completed', 'in_progress', etc.
    const genre = url.searchParams.get('genre');
    const includeSegments = url.searchParams.get('include_segments') === 'true';
    
    console.log('📊 Query parameters:', {
      limit,
      offset,
      status,
      genre,
      includeSegments,
      userId: authResult.user!.id
    });
    
    // 4. Create authenticated Supabase client
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createAuthenticatedSupabaseClient(env.supabaseUrl!, env.supabaseAnonKey!, authHeader);
    
    // 5. Build query
    let query = supabase
      .from('stories')
      .select('*')
      .eq('user_id', authResult.user!.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Apply filters
    if (status) {
      if (status === 'completed') {
        query = query.eq('is_completed', true);
      } else if (status === 'in_progress') {
        query = query.eq('is_completed', false);
      }
    }
    
    if (genre) {
      query = query.eq('genre', genre);
    }
    
    // 6. Fetch stories
    const { data: stories, error: storiesError } = await query;
    
    if (storiesError) {
      console.error('❌ Error fetching stories:', storiesError);
      return createCorsResponse({
        error: 'Failed to fetch stories'
      }, { status: 500 });
    }
    
    // 7. Get total count for pagination
    let countQuery = supabase
      .from('stories')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', authResult.user!.id);
    
    // Apply same filters for count
    if (status) {
      if (status === 'completed') {
        countQuery = countQuery.eq('is_completed', true);
      } else if (status === 'in_progress') {
        countQuery = countQuery.eq('is_completed', false);
      }
    }
    
    if (genre) {
      countQuery = countQuery.eq('genre', genre);
    }
    
    const { count: totalCount, error: countError } = await countQuery;
    
    if (countError) {
      console.error('❌ Error fetching story count:', countError);
    }
    
    // 8. Optionally include segments
    let storiesWithSegments = stories || [];
    
    if (includeSegments && stories && stories.length > 0) {
      console.log('📖 Including segments for stories...');
      
      const storyIds = stories.map(story => story.id);
      const { data: segments, error: segmentsError } = await supabase
        .from('story_segments')
        .select('*')
        .in('story_id', storyIds)
        .order('position', { ascending: true });
      
      if (!segmentsError && segments) {
        // Group segments by story_id
        const segmentsByStory = segments.reduce((acc, segment) => {
          if (!acc[segment.story_id]) {
            acc[segment.story_id] = [];
          }
          acc[segment.story_id].push({
            id: segment.id,
            story_id: segment.story_id,
            content: segment.segment_text || segment.content,
            image_url: segment.image_url,
            audio_url: segment.audio_url,
            choices: segment.choices || [],
            position: segment.position || 1,
            is_end: segment.is_end || false,
            created_at: segment.created_at
          });
          return acc;
        }, {} as any);
        
        // Add segments to stories
        storiesWithSegments = stories.map(story => ({
          ...story,
          segments: segmentsByStory[story.id] || []
        }));
      }
    }
    
    console.log('✅ Stories retrieved successfully:', {
      count: stories?.length || 0,
      totalCount: totalCount || 0,
      includeSegments,
      userId: authResult.user!.id
    });
    
    // 9. Transform stories to match frontend interface
    const transformedStories = storiesWithSegments.map(story => ({
      id: story.id,
      title: story.title,
      description: story.description,
      genre: story.story_mode || story.genre,
      age_group: story.target_age,
      is_public: story.is_public,
      is_completed: story.is_completed,
      segment_count: story.segment_count || 0,
      created_at: story.created_at,
      updated_at: story.updated_at,
      ...(includeSegments && { segments: story.segments || [] })
    }));
    
    // 10. Return paginated response
    return createCorsResponse({
      success: true,
      stories: transformedStories,
      pagination: {
        total: totalCount || 0,
        limit,
        offset,
        hasMore: (totalCount || 0) > offset + limit
      },
      message: `Retrieved ${transformedStories.length} stories`
    });
    
  } catch (error: any) {
    console.error('❌ Unexpected error in list-stories:', {
      message: error.message,
      stack: error.stack?.substring(0, 500)
    });
    
    return createCorsResponse({
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
});