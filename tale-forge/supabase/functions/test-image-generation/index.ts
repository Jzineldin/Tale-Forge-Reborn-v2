// Test Image Generation Function
// This function tests the OVH AI Stable Diffusion XL endpoint

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

console.log("Test Image Generation function started");

serve(async (req) => {
  try {
    // Validate environment variables
    const ovhApiKey = Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN');
    
    if (!ovhApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing OVH_AI_ENDPOINTS_ACCESS_TOKEN environment variable',
          success: false 
        }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log('🎨 Testing OVH AI Stable Diffusion XL...');
    console.log('🔗 Endpoint: https://stable-diffusion-xl.endpoints.kepler.ai.cloud.ovh.net/api/text2image');

    // Simple test prompt
    const testPrompt = "A cute cartoon cat sitting in a garden, children's book illustration style, colorful, simple";
    const negativePrompt = "ugly, blurry, low quality, scary, violent";

    console.log('🎨 Test prompt:', testPrompt);
    console.log('📤 Sending image generation request...');
    
    // Create a timeout promise (10 seconds for testing)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Image generation timeout after 10 seconds')), 10000);
    });
    
    // Create the fetch promise
    const fetchPromise = fetch('https://stable-diffusion-xl.endpoints.kepler.ai.cloud.ovh.net/api/text2image', {
      method: 'POST',
      headers: {
        'accept': 'application/octet-stream',
        'content-type': 'application/json',
        'Authorization': `Bearer ${ovhApiKey}`,
      },
      body: JSON.stringify({
        prompt: testPrompt,
        negative_prompt: negativePrompt
      }),
    });

    // Race between fetch and timeout
    const imageResponse = await Promise.race([fetchPromise, timeoutPromise]);
    
    console.log('📥 Image API response status:', imageResponse.status);
    console.log('📥 Response headers:', Object.fromEntries(imageResponse.headers.entries()));

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error('❌ Image generation API error:', imageResponse.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          error: `Image generation API error: ${imageResponse.status}`,
          details: errorText,
          success: false 
        }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Get image bytes
    const imageBuffer = await imageResponse.arrayBuffer();
    console.log('📦 Image buffer size:', imageBuffer.byteLength, 'bytes');

    if (imageBuffer.byteLength === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Received empty image buffer',
          success: false 
        }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log('✅ Image generation successful!');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Image generation test successful!',
        imageSize: imageBuffer.byteLength,
        prompt: testPrompt,
        endpoint: 'https://stable-diffusion-xl.endpoints.kepler.ai.cloud.ovh.net/api/text2image'
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error('❌ Image generation test failed:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Image generation test failed',
        details: error.message,
        success: false 
      }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
