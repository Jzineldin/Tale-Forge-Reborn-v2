// Tale Forge - NVIDIA RIVA TTS Edge Function with SSML Emotional Storytelling
// Enhanced audio experience with character voices and emotional control
// 2025 Production-Ready Implementation

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';

// SSML Templates for different story types and emotions
const SSML_TEMPLATES = {
  bedtime: {
    wrapper: '<speak><prosody rate="0.9" pitch="-2st" volume="soft">{content}</prosody></speak>',
    emotions: {
      calm: '<prosody rate="0.8" pitch="-3st">',
      gentle: '<prosody rate="0.85" pitch="-2st">',
      whisper: '<prosody rate="0.7" volume="x-soft" pitch="-4st">'
    }
  },
  adventure: {
    wrapper: '<speak><prosody rate="1.1" pitch="+1st" volume="medium">{content}</prosody></speak>',
    emotions: {
      excited: '<prosody rate="1.3" pitch="+3st" volume="loud">',
      suspenseful: '<prosody rate="0.9" pitch="-1st" volume="soft">',
      dramatic: '<prosody rate="1.2" pitch="+2st" volume="loud">'
    }
  },
  fantasy: {
    wrapper: '<speak><prosody rate="1.0" pitch="0st" volume="medium">{content}</prosody></speak>',
    emotions: {
      magical: '<prosody rate="0.95" pitch="+1st">',
      mysterious: '<prosody rate="0.85" pitch="-2st" volume="soft">',
      heroic: '<prosody rate="1.15" pitch="+2st" volume="loud">'
    }
  }
};

// Character voice profiles with NVIDIA RIVA voices
const CHARACTER_VOICES = {
  narrator: {
    voice: 'English-US.Female-1',
    rate: '1.0',
    pitch: '0st',
    description: 'Warm, storytelling narrator voice'
  },
  child_protagonist: {
    voice: 'English-US.Female-2',
    rate: '1.1',
    pitch: '+2st',
    description: 'Young, curious child voice'
  },
  wise_character: {
    voice: 'English-US.Male-1',
    rate: '0.9',
    pitch: '-1st',
    description: 'Deep, wise mentor voice'
  },
  magical_being: {
    voice: 'English-US.Female-3',
    rate: '0.95',
    pitch: '+3st',
    description: 'Ethereal, magical creature voice'
  },
  villain: {
    voice: 'English-US.Male-2',
    rate: '0.85',
    pitch: '-3st',
    description: 'Dark, menacing antagonist voice'
  }
};

interface TTSRequest {
  text: string;
  storyType?: 'bedtime' | 'adventure' | 'fantasy';
  emotion?: string;
  characterType?: keyof typeof CHARACTER_VOICES;
  ssmlEnhanced?: boolean;
}

interface TTSConfig {
  voice: string;
  rate: string;
  pitch: string;
  volume: string;
  emotion: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

console.log("🎙️ NVIDIA RIVA TTS with SSML Emotional Storytelling initialized");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    console.log('🎭 Starting NVIDIA RIVA TTS generation...');
    
    // Parse request
    const { text, storyType = 'fantasy', emotion, characterType = 'narrator', ssmlEnhanced = true }: TTSRequest = await req.json();
    
    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text is required for TTS generation' }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get character voice profile
    const characterVoice = CHARACTER_VOICES[characterType];
    const storyTemplate = SSML_TEMPLATES[storyType];
    
    console.log(`🎯 Generating TTS with character: ${characterType}, story type: ${storyType}, emotion: ${emotion || 'default'}`);

    // Build SSML content for emotional storytelling
    let ssmlContent = text;
    
    if (ssmlEnhanced && storyTemplate) {
      // Apply emotion if specified
      if (emotion && storyTemplate.emotions[emotion]) {
        const emotionTag = storyTemplate.emotions[emotion];
        ssmlContent = `${emotionTag}${text}</prosody>`;
      }
      
      // Wrap in story type template
      ssmlContent = storyTemplate.wrapper.replace('{content}', ssmlContent);
      
      // Add character-specific prosody adjustments
      ssmlContent = ssmlContent.replace(
        '<speak>',
        `<speak><voice name="${characterVoice.voice}"><prosody rate="${characterVoice.rate}" pitch="${characterVoice.pitch}">`
      ).replace('</speak>', '</prosody></voice></speak>');
    }

    console.log('📝 Generated SSML:', ssmlContent.substring(0, 200) + '...');

    // NVIDIA RIVA TTS API call
    const rivaApiKey = Deno.env.get('NVIDIA_RIVA_API_KEY');
    const rivaEndpoint = Deno.env.get('NVIDIA_RIVA_ENDPOINT') || 'https://api.nvcf.nvidia.com/v2/nvcf/pexec/functions';
    
    if (!rivaApiKey) {
      console.error('❌ NVIDIA RIVA API key not configured');
      return new Response(
        JSON.stringify({ 
          error: 'TTS service not configured', 
          code: 'MISSING_RIVA_API_KEY',
          fallback: 'Using browser speech synthesis instead'
        }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const ttsPayload = {
      text: ssmlEnhanced ? ssmlContent : text,
      voice: characterVoice.voice,
      encoding: 'mp3',
      sample_rate: 22050,
      language_code: 'en-US',
      ssml: ssmlEnhanced
    };

    console.log('🚀 Calling NVIDIA RIVA TTS API...');
    
    const rivaResponse = await fetch(`${rivaEndpoint}/tts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${rivaApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify(ttsPayload)
    });

    if (!rivaResponse.ok) {
      console.error('❌ NVIDIA RIVA API error:', rivaResponse.status, rivaResponse.statusText);
      
      // Fallback to basic browser TTS instructions
      return new Response(
        JSON.stringify({ 
          error: 'TTS generation failed',
          fallback: {
            type: 'browser_tts',
            text: text,
            voice: characterVoice.voice,
            rate: parseFloat(characterVoice.rate),
            pitch: characterVoice.pitch,
            message: 'Using browser speech synthesis as fallback'
          }
        }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Get audio data
    const audioBuffer = await rivaResponse.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    console.log(`✅ TTS generated successfully: ${audioBuffer.byteLength} bytes`);
    console.log(`🎭 Character: ${characterType} (${characterVoice.description})`);
    console.log(`🎨 Story type: ${storyType}, Emotion: ${emotion || 'default'}`);
    console.log(`🎙️ SSML enhanced: ${ssmlEnhanced ? 'YES' : 'NO'}`);

    // Return audio data with metadata
    return new Response(
      JSON.stringify({
        success: true,
        audio: {
          data: audioBase64,
          format: 'mp3',
          sampleRate: 22050,
          duration: Math.ceil(text.length / 150) // Rough estimate: 150 chars per second
        },
        metadata: {
          character: characterType,
          characterDescription: characterVoice.description,
          storyType: storyType,
          emotion: emotion || 'default',
          ssmlEnhanced: ssmlEnhanced,
          voice: characterVoice.voice,
          textLength: text.length
        },
        message: `TTS generated with ${characterType} voice in ${storyType} style`
      }),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ TTS Generation Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'TTS generation failed',
        fallback: {
          type: 'browser_tts',
          message: 'Please use browser speech synthesis as fallback'
        }
      }),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});