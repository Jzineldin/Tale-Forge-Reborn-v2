# ElevenLabs TTS Integration Plan for Tale Forge

## 🎯 Integration Overview
Integrate ElevenLabs Text-to-Speech API to provide voice narration for story segments, with both real-time generation and post-generation options.

## 📋 Implementation Tasks

### Phase 1: Core Integration Setup
1. **API Integration**
   - Set up ElevenLabs API credentials in environment variables
   - Create edge function: `generate-tts-audio`
   - Implement voice selection logic (free voices only)
   - Add error handling and retry logic

2. **Free Voice Selection** (No additional cost)
   Recommended free tier voices for children's stories:
   - **Rachel** - Warm, friendly American female voice (great for narration)
   - **Domi** - Enthusiastic, energetic voice (good for adventure stories)
   - **Bella** - Soft, gentle voice (perfect for bedtime stories)
   - **Antoni** - Clear male voice (good for variety)
   - **Elli** - Young, cheerful voice (relatable for children)
   - **Josh** - Friendly male narrator voice

### Phase 2: Database & Backend Updates
1. **Database Schema**
   - Already have `audio_url` field in `story_segments` table ✓
   - Add `audio_generation_status` field (pending/generating/completed/failed)
   - Add `audio_duration` field for playback timing
   - Add `voice_id` field to track which voice was used

2. **Edge Functions**
   ```typescript
   // generate-tts-audio function structure
   {
     segmentId: string,
     text: string,
     voiceId?: string, // Default to 'rachel'
     userId: string
   }
   ```

### Phase 3: Frontend Components

1. **Story Reader Enhancements**
   - Add TTS generation button for segments without audio
   - Show generation status (spinner while generating)
   - Implement audio playback controls
   - Add voice selection dropdown (for future use)

2. **Story Player Component** (New)
   ```typescript
   interface StoryPlayerProps {
     story: Story;
     segments: StorySegment[];
     onClose: () => void;
   }
   
   Features:
   - Auto-advance to next segment when audio ends
   - Synchronized image display
   - Play/pause controls
   - Progress bar
   - Skip to specific chapter
   - Generate missing audio on-demand
   ```

3. **TTS Controls Component**
   ```typescript
   interface TTSControlsProps {
     segmentId: string;
     hasAudio: boolean;
     isGenerating: boolean;
     onGenerate: () => void;
     onPlay: () => void;
   }
   ```

### Phase 4: User Experience Features

1. **Auto-play Story Mode**
   - Sequential playback of all segments with audio
   - Visual indicators for current segment
   - Automatic image transitions
   - Pause between segments option

2. **Individual Chapter TTS**
   - Generate audio for specific chapters post-creation
   - Bulk generation option (generate all missing)
   - Progress tracking for bulk operations

3. **Credit Management**
   - 3 credits per TTS generation
   - Show credit cost before generation
   - Prevent generation if insufficient credits
   - Track total credits used per story

### Phase 5: API Implementation Details

```typescript
// ElevenLabs API Configuration
const ELEVENLABS_CONFIG = {
  apiKey: process.env.ELEVENLABS_API_KEY,
  apiUrl: 'https://api.elevenlabs.io/v1',
  defaultVoice: 'rachel', // Free tier voice
  modelId: 'eleven_monolingual_v1', // Standard model
  settings: {
    stability: 0.75,        // Consistent narration
    similarity_boost: 0.75,  // Natural sounding
    style: 0.5,             // Balanced expression
    use_speaker_boost: true  // Enhanced clarity
  }
};

// Text preprocessing for better TTS
function preprocessTextForTTS(text: string): string {
  return text
    .replace(/([.!?])\s+/g, '$1 <break time="0.5s"/> ') // Add pauses
    .replace(/,/g, ', <break time="0.2s"/>')             // Short pauses
    .replace(/—/g, '<break time="0.3s"/>')               // Em dash pauses
    .trim();
}
```

### Phase 6: Story Completion Features

1. **End Story Improvements**
   - Clear messaging: "✨ Create Story Finale"
   - Explanation tooltip: "AI will craft a satisfying conclusion"
   - Animation when generating ending
   - Automatic redirect to completion page

2. **Story Completion Page**
   - Story statistics (chapters, words, credits used)
   - Name/rename story option
   - Generate missing audio option
   - Share to public library button
   - Download options (text, images, audio)
   - "Create Another Story" CTA

### Phase 7: Public Library Features

1. **Sharing System**
   - Add "Share to Library" button on completion
   - Privacy settings (public/private)
   - Content moderation flags
   - Author attribution

2. **Library Enhancements**
   - Sort by: Date, Popularity, Age Group, Genre
   - Filter by: Has Audio, Completed, Genre
   - Search functionality
   - Preview mode (first segment only)

### Phase 8: Download Features

1. **Export Options**
   - PDF with images
   - Text file (.txt)
   - Image bundle (.zip)
   - Audio files (if generated)
   - Complete story package (.zip)

## 🔧 Technical Implementation

### Edge Function: generate-tts-audio
```typescript
export async function generateTTSAudio(
  text: string,
  voiceId: string = 'rachel'
): Promise<{ audioUrl: string, duration: number }> {
  // Clean and prepare text
  const processedText = preprocessTextForTTS(text);
  
  // Call ElevenLabs API
  const response = await fetch(
    `${ELEVENLABS_CONFIG.apiUrl}/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_CONFIG.apiKey
      },
      body: JSON.stringify({
        text: processedText,
        model_id: ELEVENLABS_CONFIG.modelId,
        voice_settings: ELEVENLABS_CONFIG.settings
      })
    }
  );
  
  // Upload to Supabase Storage
  const audioBuffer = await response.arrayBuffer();
  const audioUrl = await uploadToStorage(audioBuffer);
  
  return { audioUrl, duration: calculateDuration(audioBuffer) };
}
```

## 📊 Cost Analysis

### ElevenLabs Free Tier
- 10,000 characters/month free
- Average segment: ~150 words ≈ 750 characters
- ~13 segments free per month

### Credit Costs
- 3 credits per TTS generation
- Average story (5 segments): 15 credits
- Encourage selective TTS generation

## 🚀 Deployment Steps

1. **Environment Setup**
   ```bash
   # Add to .env
   ELEVENLABS_API_KEY=your_api_key_here
   ```

2. **Database Migration**
   ```sql
   ALTER TABLE story_segments 
   ADD COLUMN audio_generation_status TEXT DEFAULT 'pending',
   ADD COLUMN audio_duration INTEGER,
   ADD COLUMN voice_id TEXT DEFAULT 'rachel';
   ```

3. **Deploy Edge Functions**
   ```bash
   supabase functions deploy generate-tts-audio
   ```

4. **Frontend Deployment**
   - Update StoryReaderPage with TTS controls
   - Add StoryPlayer component
   - Update story completion flow

## 📝 Testing Plan

1. **Unit Tests**
   - Text preprocessing functions
   - Credit deduction logic
   - Audio URL validation

2. **Integration Tests**
   - ElevenLabs API calls
   - Storage upload
   - Database updates

3. **E2E Tests**
   - Generate audio for segment
   - Play story with auto-advance
   - Download story with audio

## 🎨 UI/UX Considerations

1. **Visual Feedback**
   - Spinning icon during generation
   - Progress bar for bulk operations
   - Success animations
   - Error messages with retry options

2. **Accessibility**
   - Keyboard controls for player
   - Screen reader support
   - Captions/subtitles sync
   - Variable playback speed

## 📈 Success Metrics

- TTS generation success rate > 95%
- Average generation time < 3 seconds
- User satisfaction with voice quality
- Increased story completion rates
- Higher engagement with audio stories

## 🔄 Future Enhancements

1. **Premium Features**
   - Custom voice selection
   - Voice cloning (parent's voice)
   - Multiple voices per story
   - Sound effects integration

2. **Advanced Features**
   - Real-time streaming TTS
   - Offline audio caching
   - Background music
   - Interactive audio stories

This plan provides a comprehensive roadmap for integrating ElevenLabs TTS into Tale Forge, focusing on user experience, performance, and cost-effectiveness.