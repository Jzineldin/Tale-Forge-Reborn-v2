// Tale Forge - Generate Story Image Edge Function
// This function generates images for story segments using OVH Stable Diffusion XL
// Images are generated asynchronously and updated live

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';

// OVH Stable Diffusion XL Configuration
const SDXL_CONFIG = {
  baseUrl: 'https://stable-diffusion-xl.endpoints.kepler.ai.cloud.ovh.net/api/text2image',
  accessToken: Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN'),
  imageSize: '1024x1024',
  defaultNegativePrompt: 'ugly, blurry, low quality, distorted, nsfw, inappropriate for children, dark, scary, violent'
};

console.log("Generate Story Image function started");

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate environment variables
    const ovhApiKey = Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required Supabase environment variables');
    }

    if (!ovhApiKey || ovhApiKey.includes('placeholder')) {
      console.log('⚠️ No valid OVH API key found - image generation disabled');
      return new Response(
        JSON.stringify({ 
          error: 'Image generation not available', 
          code: 'MISSING_IMAGE_API_KEY',
          message: 'OVH SDXL API key not configured'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log('🎨 OVH Stable Diffusion XL available');

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey
    );

    // Get request body
    const { segmentId, imagePrompt, negativePrompt } = await req.json();

    if (!segmentId || !imagePrompt) {
      return new Response(
        JSON.stringify({ error: 'Missing segmentId or imagePrompt in request body' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`🖼️ Generating image for segment ${segmentId}`);
    console.log(`📝 Prompt: ${imagePrompt.substring(0, 100)}...`);

    // Update segment status to generating
    await supabase
      .from('story_segments')
      .update({ 
        image_generation_status: 'generating',
        is_image_generating: true
      })
      .eq('id', segmentId);

    // Create child-friendly image prompt
    const enhancedPrompt = `Children's book illustration, ${imagePrompt}, colorful, warm lighting, safe for kids, cartoon style, digital art, high quality`;
    const finalNegativePrompt = negativePrompt || SDXL_CONFIG.defaultNegativePrompt;

    console.log(`🎨 Enhanced prompt: ${enhancedPrompt}`);

    // Generate image using OVH Stable Diffusion XL
    const imageResponse = await fetch(SDXL_CONFIG.baseUrl, {
      method: 'POST',
      headers: {
        'accept': 'application/octet-stream',
        'content-type': 'application/json',
        'Authorization': `Bearer ${SDXL_CONFIG.accessToken}`,
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        negative_prompt: finalNegativePrompt
      }),
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error('OVH SDXL API error:', imageResponse.status, errorText);
      
      // Update segment status to failed
      await supabase
        .from('story_segments')
        .update({ 
          image_generation_status: 'failed',
          is_image_generating: false
        })
        .eq('id', segmentId);

      throw new Error(`OVH SDXL API error: ${imageResponse.status}`);
    }

    // Get image data as array buffer
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBytes = new Uint8Array(imageBuffer);
    
    console.log(`✅ Image generated successfully, size: ${imageBytes.length} bytes`);

    // Upload image to Supabase Storage
    const fileName = `segment-images/${segmentId}-${Date.now()}.jpg`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('story-images')
      .upload(fileName, imageBytes, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      
      // Update segment status to failed
      await supabase
        .from('story_segments')
        .update({ 
          image_generation_status: 'failed',
          is_image_generating: false
        })
        .eq('id', segmentId);

      throw new Error(`Storage upload error: ${uploadError.message}`);
    }

    // Get public URL for the uploaded image
    const { data: publicUrlData } = supabase.storage
      .from('story-images')
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;
    console.log(`🔗 Image uploaded to: ${imageUrl}`);

    // Update segment with the image URL and completion status
    const { error: updateError } = await supabase
      .from('story_segments')
      .update({ 
        image_url: imageUrl,
        image_generation_status: 'completed',
        is_image_generating: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', segmentId);

    if (updateError) {
      console.error('Segment update error:', updateError);
      throw new Error(`Segment update error: ${updateError.message}`);
    }

    console.log(`🎉 Image generation completed for segment ${segmentId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        segmentId: segmentId,
        imageUrl: imageUrl,
        prompt: enhancedPrompt,
        message: 'Image generated successfully'
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error in generate-story-image function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});