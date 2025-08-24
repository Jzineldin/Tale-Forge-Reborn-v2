// Simple AI Connection Test Function
// Tests the AI provider connections and environment setup

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

console.log("Test AI Connection function started");

serve(async (req) => {
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      environment: {},
      ai_providers: {},
      tests: {}
    };

    // Check environment variables
    const envVars = [
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY', 
      'SUPABASE_ANON_KEY',
      'OVH_AI_ENDPOINTS_ACCESS_TOKEN',
      'OPENAI_API_KEY',
      'ELEVENLABS_API_KEY'
    ];

    for (const envVar of envVars) {
      const value = Deno.env.get(envVar);
      results.environment[envVar] = {
        exists: !!value,
        isPlaceholder: value?.includes('placeholder') || value?.includes('test') || false,
        length: value?.length || 0
      };
    }

    // Test OVH AI if available
    const ovhToken = Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN');
    if (ovhToken && !ovhToken.includes('placeholder')) {
      try {
        console.log('🤖 Testing OVH AI connection...');
        const ovhResponse = await fetch('https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ovhToken}`
          },
          body: JSON.stringify({
            model: 'Meta-Llama-3_3-70B-Instruct',
            messages: [{ role: 'user', content: 'Say "OVH AI is working" and nothing else.' }],
            max_tokens: 10,
            temperature: 0
          })
        });

        if (ovhResponse.ok) {
          const ovhData = await ovhResponse.json();
          results.ai_providers.ovh = {
            status: 'success',
            response: ovhData.choices[0]?.message?.content || 'No content',
            model: 'Meta-Llama-3_3-70B-Instruct'
          };
        } else {
          const error = await ovhResponse.text();
          results.ai_providers.ovh = {
            status: 'error',
            error: `${ovhResponse.status}: ${error}`
          };
        }
      } catch (error) {
        results.ai_providers.ovh = {
          status: 'error',
          error: error.message
        };
      }
    } else {
      results.ai_providers.ovh = {
        status: 'not_configured',
        reason: 'Token missing or is placeholder'
      };
    }

    // Test OpenAI if available
    const openaiToken = Deno.env.get('OPENAI_API_KEY');
    if (openaiToken && !openaiToken.includes('placeholder') && !openaiToken.includes('test')) {
      try {
        console.log('🤖 Testing OpenAI connection...');
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiToken}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: 'Say "OpenAI is working" and nothing else.' }],
            max_tokens: 10,
            temperature: 0
          })
        });

        if (openaiResponse.ok) {
          const openaiData = await openaiResponse.json();
          results.ai_providers.openai = {
            status: 'success',
            response: openaiData.choices[0]?.message?.content || 'No content',
            model: 'gpt-3.5-turbo'
          };
        } else {
          const error = await openaiResponse.text();
          results.ai_providers.openai = {
            status: 'error',
            error: `${openaiResponse.status}: ${error}`
          };
        }
      } catch (error) {
        results.ai_providers.openai = {
          status: 'error',
          error: error.message
        };
      }
    } else {
      results.ai_providers.openai = {
        status: 'not_configured',
        reason: 'Token missing or is placeholder'
      };
    }

    // Summary and recommendations
    const workingProviders = Object.values(results.ai_providers).filter(p => (p as any).status === 'success').length;
    results.tests.summary = {
      working_ai_providers: workingProviders,
      total_ai_providers: Object.keys(results.ai_providers).length,
      ready_for_production: workingProviders > 0,
      recommendation: workingProviders > 0 
        ? 'AI pipeline ready - at least one provider is working'
        : 'Set up API keys for OVH AI or OpenAI to enable story generation'
    };

    return new Response(JSON.stringify(results, null, 2), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
    
    return new Response(JSON.stringify({
      error: 'Test failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { "Content-Type": "application/json" },
      status: 500
    });
  }
});