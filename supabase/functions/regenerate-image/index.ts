// Tale Forge - Regenerate Image Edge Function
// This function regenerates an image for a story segment using Stable Diffusion

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';

console.log("Regenerate Image function started");

serve(async (req) => {
  try {
    // Validate environment variables
    const ovhAccessToken = Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!ovhAccessToken || !supabaseUrl || !supabaseAnonKey) {
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

    // Create Supabase client (SECURITY FIXED: Using anon key)
    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { 
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false } // Edge Functions are stateless
      }
    );

    // Get request body
    const { segmentId, imagePrompt } = await req.json();

    if (!segmentId || !imagePrompt) {
      return new Response(
        JSON.stringify({ error: 'Missing segmentId or imagePrompt in request body' }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Validate user authentication first
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { headers: { "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Fetch segment data from Supabase with story info for user validation
    const { data: segment, error: segmentError } = await supabase
      .from('story_segments')
      .select(`
        *,
        stories!inner(id, user_id)
      `)
      .eq('id', segmentId)
      .single();

    if (segmentError) {
      console.error('Error fetching segment:', segmentError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch segment' }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (!segment) {
      return new Response(
        JSON.stringify({ error: 'Segment not found' }),
        { headers: { "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Validate user owns this story
    if (segment.stories.user_id !== user.id) {
      console.error('Access denied: User does not own this story');
      return new Response(
        JSON.stringify({ error: 'Access denied: You can only regenerate images for your own stories' }),
        { headers: { "Content-Type": "application/json" }, status: 403 }
      );
    }

    // Prepare the image generation request for OVH SDXL with 2025 optimizations
    const ovhEndpoint = 'https://stable-diffusion-xl.endpoints.kepler.ai.cloud.ovh.net/api/text2image';
    
    // Split intelligent prompt to handle NEGATIVE: sections
    const [mainPrompt, negativeSection] = imagePrompt.includes('NEGATIVE:') 
      ? imagePrompt.split('NEGATIVE:')
      : [imagePrompt, ''];
    
    // Enhanced negative prompt with children's safety focus
    const enhancedNegativePrompt = [
      'scary, violent, inappropriate, adult content, nsfw, frightening, dark, disturbing',
      'ugly, blurry, low quality, distorted, deformed, malformed, mutation, bad anatomy',
      'extra limbs, missing limbs, floating limbs, disconnected limbs, bad hands, bad fingers',
      'text, watermark, signature, username, logo, copyright',
      negativeSection.trim() // Add any negative elements from intelligent prompt
    ].filter(Boolean).join(', ');
    
    const imageRequest = {
      prompt: mainPrompt.trim(),
      negative_prompt: enhancedNegativePrompt
    };

    // Call OVH SDXL API to generate image
    const response = await fetch(ovhEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ovhAccessToken}`,
        'Content-Type': 'application/json',
        'accept': 'application/octet-stream'
      },
      body: JSON.stringify(imageRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OVH AI API error: ${response.status} - ${errorText}`);
    }

    // OVH SDXL API returns binary image data directly
    const imageBuffer = new Uint8Array(await response.arrayBuffer());
    
    // Upload the binary image data to Supabase Storage
    const fileName = `story-images/${segment.stories.id}/${segmentId}-${Date.now()}.png`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('story-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png'
      });
    
    if (uploadError) {
      console.error('Failed to upload image to Supabase Storage:', uploadError);
      throw new Error(`Failed to upload image to Supabase Storage: ${uploadError.message}`);
    }
    
    // Get public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('story-images')
      .getPublicUrl(fileName);
    
    const imageUrl = publicUrl;

    // Update the segment with the new image URL
    const { data: updatedSegment, error: updateError } = await supabase
      .from('story_segments')
      .update({ image_url: imageUrl })
      .eq('id', segmentId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating segment:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update segment with new image' }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        segment: updatedSegment,
        message: 'Image regenerated successfully'
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error in regenerate-image function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});