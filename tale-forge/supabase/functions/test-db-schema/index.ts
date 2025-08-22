// Test function to check database schema
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if story_segments table exists
    const { data: segments, error: segmentsError } = await supabase
      .from('story_segments')
      .select('*')
      .limit(1);

    // Check stories table
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('*')
      .limit(1);

    // Get table info using raw SQL
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('check_table_structure', {
        table_name: 'story_segments'
      });

    return new Response(
      JSON.stringify({
        success: true,
        segments: { data: segments, error: segmentsError },
        stories: { data: stories, error: storiesError },
        tableInfo: { data: tableInfo, error: tableError }
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        status: 500
      }
    );
  }
});