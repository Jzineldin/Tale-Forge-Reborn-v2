// Tale Forge - Generate TTS Edge Function
// This function generates audio narration using ElevenLabs or OVH TTS

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';

// AI Configuration
const AI_CONFIG = {
  elevenlabs: {
    baseUrl: 'https://api.elevenlabs.io/v1',
    accessToken: Deno.env.get('ELEVENLABS_API_KEY'),
    model: 'eleven_turbo_v2_5',
    voices: {
      'JBFqnCBsd6RMkjVDRZzb': { name: 'George', description: 'Warm storytelling voice', age: '7-12', genre: 'adventure' },
      'EXAVITQu4vr4xnSDxMaL': { name: 'Bella', description: 'Gentle female voice for bedtime', age: '3-8', genre: 'bedtime' },
      'VR6AewLTigWG4xSOukaG': { name: 'Arnold', description: 'Enthusiastic voice for action', age: '8-15', genre: 'action' },
      'pNInz6obpgDQGcFmaJgB': { name: 'Adam', description: 'Clear narrator for education', age: '6-12', genre: 'educational' },
      'ODq5zmih8GrVes37Dizd': { name: 'Patrick', description: 'Friendly fantasy voice', age: '5-10', genre: 'fantasy' },
      'IKne3meq5aSn9XLyUdCD': { name: 'Charlie', description: 'Playful humor voice', age: '4-9', genre: 'humor' }
    }
  },
  ovh: {
    ttsUrl: 'https://nvr-tts-en-us.endpoints.kepler.ai.cloud.ovh.net/api/v1/tts/text_to_audio',
    accessToken: Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN')
  }
};

interface TTSRequest {
  text: string;
  storyId?: string;
  segmentId?: string;
  targetAge?: number;
  genre?: string;
  voice?: string;
  provider?: 'elevenlabs' | 'ovh';
}

console.log("Generate TTS function started");

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

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Get request body
    const ttsRequest: TTSRequest = await req.json();

    if (!ttsRequest.text || ttsRequest.text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing or empty text for TTS generation' }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check user's TTS limits/subscription here if needed
    // const { data: userProfile } = await supabase.from('profiles').select('subscription_tier').eq('id', user.id).single();

    const provider = ttsRequest.provider || 'elevenlabs';
    
    let audioBuffer: ArrayBuffer;
    let voiceName: string;
    let estimatedDuration: number;

    if (provider === 'elevenlabs') {
      const result = await generateElevenLabsTTS(ttsRequest);
      audioBuffer = result.audioBuffer;
      voiceName = result.voiceName;
      estimatedDuration = result.estimatedDuration;
    } else {
      const result = await generateOVHTTS(ttsRequest);
      audioBuffer = result.audioBuffer;
      voiceName = result.voiceName;
      estimatedDuration = result.estimatedDuration;
    }

    // Upload audio to Supabase Storage
    const audioUrl = await uploadAudioToSupabase(supabase, audioBuffer, user.id, ttsRequest.text);

    // Log the TTS generation for analytics
    await supabase.from('ai_usage_logs').insert({
      user_id: user.id,
      story_id: ttsRequest.storyId,
      model_id: provider === 'elevenlabs' ? 'eleven-turbo-v2-5' : 'nvr-tts-en-us',
      operation_type: 'tts_generation',
      tokens_used: ttsRequest.text.length, // Characters for TTS
      cost: provider === 'elevenlabs' ? ttsRequest.text.length * 0.0002 : 0,
      success: true
    });

    console.log(`TTS generated successfully using ${provider}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        audioUrl: audioUrl,
        voice: voiceName,
        duration: estimatedDuration,
        provider: provider,
        charactersProcessed: ttsRequest.text.length,
        message: 'TTS generated successfully'
      }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error in generate-tts function:', error);
    
    // Log the error
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      
      await supabase.from('ai_usage_logs').insert({
        user_id: 'unknown',
        operation_type: 'tts_generation',
        success: false,
        error_message: error.message
      });
    } catch (logError) {
      console.error('Failed to log TTS error:', logError);
    }

    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// ElevenLabs TTS Generation
async function generateElevenLabsTTS(request: TTSRequest) {
  if (!AI_CONFIG.elevenlabs.accessToken) {
    throw new Error('ElevenLabs API key not configured');
  }

  // Smart voice selection
  let voiceId = request.voice || selectBestVoice(request.targetAge || 7, request.genre || 'general');
  
  const payload = {
    text: request.text,
    model_id: AI_CONFIG.elevenlabs.model,
    voice_settings: {
      stability: 0.71,
      similarity_boost: 0.5,
      style: 0.0,
      use_speaker_boost: true
    }
  };

  const response = await fetch(`${AI_CONFIG.elevenlabs.baseUrl}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': AI_CONFIG.elevenlabs.accessToken,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
  }

  const audioBuffer = await response.arrayBuffer();
  const wordCount = request.text.split(' ').length;
  const estimatedDuration = Math.ceil((wordCount / 180) * 60); // ElevenLabs is ~180 WPM

  const voiceInfo = AI_CONFIG.elevenlabs.voices[voiceId];
  const voiceName = voiceInfo ? voiceInfo.name : voiceId;

  return {
    audioBuffer,
    voiceName,
    estimatedDuration
  };
}

// OVH TTS Generation
async function generateOVHTTS(request: TTSRequest) {
  if (!AI_CONFIG.ovh.accessToken) {
    throw new Error('OVH AI access token not configured');
  }

  let selectedVoice = 'English-US.Female-1';
  if (request.targetAge && request.targetAge <= 6 && request.genre === 'bedtime') {
    selectedVoice = 'English-US.Female-Calm';
  } else if (request.genre === 'adventure') {
    selectedVoice = 'English-US.Male-Happy';
  }

  const payload = {
    encoding: 1,
    language_code: 'en-US',
    sample_rate_hz: 22050,
    text: request.text,
    voice_name: selectedVoice
  };

  const response = await fetch(AI_CONFIG.ovh.ttsUrl, {
    method: 'POST',
    headers: {
      'accept': 'application/octet-stream',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_CONFIG.ovh.accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OVH TTS API error: ${response.status} - ${errorText}`);
  }

  const audioBuffer = await response.arrayBuffer();
  const wordCount = request.text.split(' ').length;
  const estimatedDuration = Math.ceil((wordCount / 150) * 60); // OVH is ~150 WPM

  return {
    audioBuffer,
    voiceName: selectedVoice,
    estimatedDuration
  };
}

// Smart voice selection for ElevenLabs
function selectBestVoice(targetAge: number, genre: string): string {
  const voices = AI_CONFIG.elevenlabs.voices;
  
  // Find best match by age and genre
  for (const [voiceId, voiceInfo] of Object.entries(voices)) {
    const [minAge, maxAge] = voiceInfo.age.split('-').map(a => parseInt(a));
    
    if (targetAge >= minAge && targetAge <= maxAge && 
        (voiceInfo.genre === genre || genre.includes(voiceInfo.genre))) {
      return voiceId;
    }
  }
  
  // Fallback by age only
  for (const [voiceId, voiceInfo] of Object.entries(voices)) {
    const [minAge, maxAge] = voiceInfo.age.split('-').map(a => parseInt(a));
    if (targetAge >= minAge && targetAge <= maxAge) {
      return voiceId;
    }
  }
  
  return 'JBFqnCBsd6RMkjVDRZzb'; // George - default storytelling voice
}

// Upload audio to Supabase Storage
async function uploadAudioToSupabase(supabase: any, audioBuffer: ArrayBuffer, userId: string, text: string): Promise<string> {
  const fileName = `tts-${userId}-${Date.now()}.mp3`;
  const filePath = `audio/${fileName}`;
  
  try {
    const { error: uploadError } = await supabase.storage
      .from('story-assets')
      .upload(filePath, audioBuffer, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading audio to Supabase Storage:', uploadError);
      throw new Error('Failed to upload audio file');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('story-assets')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadAudioToSupabase:', error);
    throw new Error('Failed to upload audio to storage');
  }
}