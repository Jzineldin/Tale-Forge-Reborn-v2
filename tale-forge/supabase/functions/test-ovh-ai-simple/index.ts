// Simple OVH AI Test Function
// This function tests the OVH AI connection using the official documentation format

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// OVH AI Configuration (based on official documentation)
const OVH_AI_CONFIG = {
  baseUrl: 'https://oai.endpoints.kepler.ai.cloud.ovh.net/v1',
  accessToken: Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN'),
  model: 'Meta-Llama-3_3-70B-Instruct'
};

console.log("Test OVH AI Simple function started");

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

    console.log('🔧 Testing OVH AI connection...');
    console.log('Using endpoint:', OVH_AI_CONFIG.baseUrl);
    console.log('Using model:', OVH_AI_CONFIG.model);

    // Simple test prompt
    const requestBody = {
      model: OVH_AI_CONFIG.model,
      messages: [
        {
          role: 'user',
          content: 'Say "Hello from OVH AI!" and nothing else.'
        }
      ],
      max_tokens: 50,
      temperature: 0
    };

    console.log('📤 Sending request to OVH AI...');
    
    const aiResponse = await fetch(`${OVH_AI_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OVH_AI_CONFIG.accessToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 Response status:', aiResponse.status);

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ OVH AI API error:', aiResponse.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          error: `OVH AI API error: ${aiResponse.status}`,
          details: errorText,
          success: false 
        }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    const completion = await aiResponse.json();
    const responseText = completion.choices[0].message.content?.trim() || '';

    console.log('✅ OVH AI response:', responseText);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'OVH AI connection successful!',
        response: responseText,
        model: OVH_AI_CONFIG.model,
        endpoint: OVH_AI_CONFIG.baseUrl
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error('❌ Test failed:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Test failed',
        details: error.message,
        success: false 
      }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
