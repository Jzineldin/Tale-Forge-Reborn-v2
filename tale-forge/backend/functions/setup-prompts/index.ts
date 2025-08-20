// Tale Forge - Setup Prompts Edge Function
// This function initializes the prompt library in the database

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';

console.log("Setup Prompts function started");

serve(async (req) => {
  try {
    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { headers: { "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Define default prompts for different genres and age groups
    const defaultPrompts = [
      {
        name: 'bedtime_4-6',
        genre: 'bedtime',
        age_group: '4-6',
        prompt_template: 'Create a gentle, calming bedtime story for a child aged 4-6 about {theme}. The story should be 50-90 words, feature {characters}, take place in {setting}, and have a peaceful ending that helps the child feel safe and ready for sleep. Include 3 simple choices for the child to make in the story.',
        description: 'Bedtime story template for ages 4-6'
      },
      {
        name: 'fantasy_7-9',
        genre: 'fantasy',
        age_group: '7-9',
        prompt_template: 'Create an exciting fantasy adventure story for a child aged 7-9 about {theme}. The story should be 80-120 words, feature {characters} with special abilities, take place in {setting}, and include a quest or challenge to overcome. Include 3 interesting choices for the child to make that affect the story direction.',
        description: 'Fantasy adventure template for ages 7-9'
      },
      {
        name: 'educational_10-12',
        genre: 'educational',
        age_group: '10-12',
        prompt_template: 'Create an educational story for a child aged 10-12 about {theme}. The story should be 150-180 words, feature {characters} learning about {educational_topic}, take place in {setting}, and include a problem-solving element. Include 3 thoughtful choices for the child to make that demonstrate their understanding of the educational content.',
        description: 'Educational story template for ages 10-12'
      }
    ];

    // Insert default prompts into the database
    const { data, error } = await supabase
      .from('prompt_library')
      .upsert(defaultPrompts, {
        onConflict: 'name'
      });

    if (error) {
      console.error('Error setting up prompts:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to set up prompts' }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Prompt library initialized successfully',
        prompts: data
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error in setup-prompts function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});