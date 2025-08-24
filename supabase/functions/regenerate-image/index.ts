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

    // Fetch segment data from Supabase
    const { data: segment, error: segmentError } = await supabase
      .from('story_segments')
      .select('*')
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

    // Prepare the image generation request for OVH SDXL (ALWAYS)
    const ovhEndpoint = 'https://stable-diffusion-xl.endpoints.kepler.ai.cloud.ovh.net/api/text2image';
    
    const imageRequest = {
      prompt: imagePrompt,
      negative_prompt: 'scary, violent, inappropriate, adult content, ugly, blurry, low quality, distorted, nsfw',
      width: 1024,
      height: 1024,
      num_inference_steps: 30,
      guidance_scale: 7.5
    };

    // Call OVH SDXL API to generate image
    const response = await fetch(ovhEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ovhAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(imageRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OVH AI API error: ${response.status} - ${errorText}`);
    }

    const imageData = await response.json();
    
    // Assuming the API returns a base64 encoded image or URL
    let imageUrl = '';
    
    if (imageData.image_url) {
      imageUrl = imageData.image_url;
    } else if (imageData.image_data) {
      // If we get base64 data, we need to upload it to Supabase Storage
      const imageBuffer = Uint8Array.from(atob(imageData.image_data), c => c.charCodeAt(0));
      
      // Upload to Supabase Storage
      const fileName = `story-images/${segment.story_id}/${segmentId}-${Date.now()}.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('story-images')
        .upload(fileName, imageBuffer, {
          contentType: 'image/png'
        });
      
      if (uploadError) {
        throw new Error(`Failed to upload image to Supabase Storage: ${uploadError.message}`);
      }
      
      // Get public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('story-images')
        .getPublicUrl(fileName);
      
      imageUrl = publicUrl;
    }

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