# Tale Forge AI System - Complete Technical Documentation

## Overview
Tale Forge is an interactive storytelling platform that uses AI to generate personalized children's stories with contextual choices and accompanying illustrations. The system combines GPT-4o for text generation and OVH AI endpoints for image generation.

---

## System Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **State Management**: React Query for server state, useState for local state
- **Styling**: Tailwind CSS with custom amber theme
- **Build Tool**: Vite
- **Authentication**: Supabase Auth

### Backend (Supabase Edge Functions)
- **Runtime**: Deno (Edge Functions)
- **Database**: PostgreSQL via Supabase
- **Storage**: Supabase Storage for images
- **AI Services**: OpenAI GPT-4o, OVH AI Endpoints

### Database Schema
```sql
-- Core Tables
stories: id, title, description, user_id, genre, target_age, is_completed, created_at, updated_at
story_segments: id, story_id, position, content, choices, image_url, image_prompt, created_at
```

---

## AI Text Generation Pipeline

### 1. Story Creation (`create-story` function)
**Location**: `E:\Tale-Forge-Reborn-2025\tale-forge\supabase\functions\create-story\index.ts`

#### Process Flow:
1. **Input Validation**: Validates story parameters (title, description, genre, age, difficulty)
2. **AI Prompt Construction**: Creates structured prompt for GPT-4o
3. **Story Generation**: Calls OpenAI API to generate initial story segment
4. **Choice Parsing**: Extracts choices using multiple regex patterns
5. **Image Generation**: Generates illustration via OVH AI
6. **Database Storage**: Saves story and first segment

#### Critical AI Prompt Format:
```javascript
const prompt = `Create an engaging children's story for ${targetAge} age group in the ${genre} genre.

Story Title: ${title}
Story Description: ${description}
Difficulty: ${difficulty}

Generate the opening segment (200-300 words) and exactly 3 choices for what happens next.

Format your response EXACTLY like this:
[STORY]
Your story content here...
[/STORY]

[CHOICES]
1. First choice option
2. Second choice option  
3. Third choice option
[/CHOICES]

[IMAGE_PROMPT]
Detailed visual description for illustration
[/IMAGE_PROMPT]`;
```

#### Choice Parsing Logic (FIXED):
```javascript
// Multiple fallback regex patterns to handle different AI response formats
let choiceMatches = choicesText.match(/^\d+\.\s*(.+?)(?=\n\d+\.|\n*$)/gm);
if (!choiceMatches || choiceMatches.length === 0) {
    choiceMatches = choicesText.match(/\d+\.\s*(.+?)(?=\d+\.|$)/gs);
}
if (!choiceMatches || choiceMatches.length === 0) {
    const lines = choicesText.split('\n').filter(line => line.trim().match(/^\d+\./));
    choiceMatches = lines;
}

// Extract clean choice text
const rawChoices = choiceMatches.map(match => {
    return match.replace(/^\d+\.\s*/, '').trim();
}).filter(choice => choice.length > 0);
```

### 2. Story Continuation (`generate-story-segment` function)
**Location**: `E:\Tale-Forge-Reborn-2025\tale-forge\supabase\functions\generate-story-segment\index.ts`

#### Process Flow:
1. **Context Loading**: Retrieves previous story segments for context
2. **Choice Selection**: Identifies which choice user selected
3. **Contextual Prompt**: Builds prompt with story history and selected choice
4. **AI Generation**: Generates next segment with GPT-4o
5. **Choice Extraction**: Parses new choices for next decision point
6. **Image Generation**: Creates accompanying illustration
7. **Database Update**: Saves new segment

---

## AI Image Generation Pipeline

### Image Service Configuration:
```javascript
// Primary: OVH AI Endpoints
const OVH_API_URL = 'https://b61b2b94-a55b-4c42-85cf-1f0ec32db518.app.gra.ai.cloud.ovh.net';

// Fallback: OpenAI DALL-E
const OPENAI_IMAGE_API = 'https://api.openai.com/v1/images/generations';
```

### Image Generation Process:
1. **Prompt Enhancement**: Adds child-friendly and safety constraints
2. **Primary Generation**: Attempts OVH AI endpoint
3. **Fallback Logic**: Uses OpenAI DALL-E if OVH fails
4. **Storage**: Uploads generated image to Supabase Storage
5. **URL Generation**: Creates public URL for frontend access

### Enhanced Image Prompt:
```javascript
const enhancedPrompt = `${imagePrompt}, child-friendly illustration, bright colors, safe for children, storybook art style, no scary or violent content`;
```

---

## Frontend Data Flow

### 1. Story Loading (`useStory` hook)
**Location**: `E:\Tale-Forge-Reborn-2025\tale-forge\src\utils\performance.tsx`

```typescript
export const useStory = (storyId: string | null) => {
  return useQuery(
    ['story', storyId],
    async () => {
      // Get authentication session
      const { data: { session } } = await supabase.auth.getSession();
      
      // Fetch story via get-story API
      const response = await fetch(`${API_BASE_URL}/get-story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ storyId })
      });
      
      return data.story;
    },
    {
      enabled: !!storyId,
      staleTime: 30000,
      refetchInterval: (data) => {
        // CRITICAL: Only poll for generating stories, not completed ones
        if (data.status === 'generating' || (data.segments && data.segments.length === 0)) {
          return 2000; // Poll every 2 seconds for generating stories
        }
        return false; // Stop polling for completed stories
      }
    }
  );
};
```

### 2. Choice Selection Flow
**Location**: `E:\Tale-Forge-Reborn-2025\tale-forge\src\pages\authenticated\stories\StoryReaderPage.tsx`

```typescript
const handleChoiceSelect = async (choiceId: string) => {
  if (choiceId === 'restart') {
    setCurrentSegmentIndex(0);
    return;
  }

  const choiceIndex = parseInt(choiceId);
  
  generateSegment({ 
    storyId: id!, 
    choiceIndex 
  }, {
    onSuccess: () => {
      // Automatically advance to new segment
      setCurrentSegmentIndex(prev => prev + 1);
    }
  });
};
```

### 3. Image Display Component
**Location**: `E:\Tale-Forge-Reborn-2025\tale-forge\src\components\atoms\StoryImage.tsx`

#### Key Features:
- **Loading States**: Shows skeleton while image loads
- **Error Handling**: Fallback image on load failure
- **Force Visibility**: Multiple DOM manipulation techniques to ensure images appear
- **Intersection Observer**: Detects when image becomes visible (for tab switching)

```typescript
const handleLoad = () => {
  // Force immediate visibility
  if (imgRef.current) {
    imgRef.current.style.opacity = '1';
    imgRef.current.style.display = 'block';
  }
  
  setIsLoading(false);
  onImageLoad?.();
  
  // Force DOM repaint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (imgRef.current) {
        imgRef.current.style.opacity = '1';
        imgRef.current.offsetHeight; // Trigger reflow
      }
    });
  });
};
```

---

## Database Operations

### Story Retrieval (`get-story` function)
**Location**: `E:\Tale-Forge-Reborn-2025\tale-forge\supabase\functions\get-story\index.ts`

```typescript
// Fetch story with all segments
const { data: story, error: storyError } = await supabase
  .from('stories')
  .select('*')
  .eq('id', storyId)
  .single();

const { data: segments, error: segmentsError } = await supabase
  .from('story_segments')
  .select('*')
  .eq('story_id', storyId)
  .order('position', { ascending: true });

// Transform and calculate statistics
const formattedStory = {
  id: story.id,
  title: story.title,
  segments: segments || [],
  estimated_reading_time: Math.max(1, Math.ceil(totalWords / 100))
};
```

---

## Critical Bug Fixes Implemented

### 1. Choice Parsing Fix (RESOLVED)
**Problem**: Generic choices appearing instead of AI-generated ones
**Root Cause**: Broken regex in `create-story` function extracted 0 choices
**Solution**: Multiple fallback regex patterns with comprehensive parsing

**Before (Broken)**:
```javascript
const choiceMatches = choicesText.match(/\d+\.\s*(.+?)(?=\d+\.|$)/g);
```

**After (Fixed)**:
```javascript
// Multiple fallback patterns
let choiceMatches = choicesText.match(/^\d+\.\s*(.+?)(?=\n\d+\.|\n*$)/gm);
if (!choiceMatches) choiceMatches = choicesText.match(/\d+\.\s*(.+?)(?=\d+\.|$)/gs);
if (!choiceMatches) choiceMatches = choicesText.split('\n').filter(line => line.match(/^\d+\./));
```

### 2. Image Display Timing Fix (PARTIAL)
**Problem**: Images load but don't display until page interaction
**Attempted Solutions**:
- Force DOM updates with `requestAnimationFrame`
- Direct style manipulation (`opacity: 1`)
- Intersection Observer for visibility detection
- Trigger reflows with `offsetHeight`

**Status**: Improved but not fully resolved - images may still require interaction to become visible

### 3. Authentication Flow
**Implementation**: Proper Supabase session handling with Bearer tokens
```typescript
const { data: { session } } = await supabase.auth.getSession();
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
  }
});
```

---

## Environment Configuration

### Required Environment Variables:
```bash
# Supabase
VITE_SUPABASE_URL=https://fyihypkigbcmsxyvseca.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI Services
OPENAI_API_KEY=sk-...
OVH_API_KEY=your-ovh-key

# Application
API_BASE_URL=https://fyihypkigbcmsxyvseca.supabase.co/functions/v1
```

### AI Model Configuration:
- **Text Generation**: GPT-4o (NOT gpt-4o-mini)
- **Image Generation**: OVH AI endpoints with OpenAI DALL-E fallback
- **Max Tokens**: 1000 for story segments
- **Temperature**: 0.8 for creative writing

---

## Troubleshooting Guide

### Issue: Generic Choices Appearing
**Symptoms**: Choices like "Continue the adventure" instead of contextual options
**Diagnosis**: 
1. Check Supabase logs for "🎯 Extracted X choices"
2. If "Extracted 0 choices", choice parsing failed
3. Look for "⚠️ Using fallback choices"

**Solution**: Verify choice parsing regex in `create-story/index.ts`

### Issue: Images Not Displaying
**Symptoms**: "Creating illustration..." spinner never resolves
**Diagnosis**:
1. Check browser console for image load events
2. Look for "🖼️ Image loaded successfully" without visual update
3. Check network tab for successful image requests

**Solution**: 
1. Verify image URL accessibility
2. Check React re-render issues
3. Try manual page refresh/interaction

### Issue: Story Generation Hanging
**Symptoms**: Story stays in "generating" status indefinitely
**Diagnosis**:
1. Check OpenAI API key validity
2. Verify network connectivity to AI endpoints
3. Check Supabase function logs

**Solution**:
1. Verify environment variables
2. Check AI service status
3. Review error logs in Supabase dashboard

### Issue: Authentication Errors
**Symptoms**: "No authentication session found"
**Diagnosis**:
1. Check localStorage for Supabase session
2. Verify JWT token validity
3. Check session expiration

**Solution**:
1. Re-authenticate user
2. Refresh session token
3. Clear localStorage and re-login

---

## Performance Optimizations

### 1. React Query Caching
- Stories cached for 30 seconds (`staleTime`)
- Automatic background refetching for generating stories
- Cache invalidation on mutations

### 2. Image Loading
- Lazy loading with intersection observer
- Skeleton loading states
- Error fallback images

### 3. Database Queries
- Single query for story with segments
- Indexed queries on `story_id` and `position`
- Calculated statistics (reading time, word count)

---

## Deployment Checklist

### Frontend Deployment:
1. Build with `npm run build`
2. Deploy to hosting platform (Vercel, Netlify)
3. Set environment variables
4. Verify API endpoints

### Backend Deployment:
1. Deploy Edge Functions to Supabase
2. Set Edge Function secrets
3. Test authentication flow
4. Verify AI service connectivity

### Database Setup:
1. Run migrations for required tables
2. Set up RLS policies
3. Create storage buckets for images
4. Configure CORS settings

---

## Monitoring and Logs

### Key Log Messages to Monitor:
```
✅ Story created with ID: [story-id]
🎯 Extracted [N] choices: [choice-array]
⚠️ Using fallback choices - AI parsing completely failed
🖼️ Image loaded successfully: [image-url]
❌ OpenAI request failed: [error-message]
```

### Critical Alerts:
- Choice parsing failures (0 choices extracted)
- AI service unavailability
- Authentication token expiration
- Image generation failures

---

## Future Improvements

### 1. Image Display Issue Resolution
- Implement proper React Suspense boundaries
- Use intersection observer more effectively  
- Consider CSS-only loading states

### 2. AI Reliability
- Implement retry logic for AI failures
- Add AI response validation
- Improve prompt engineering

### 3. Performance
- Implement proper caching strategies
- Optimize database queries
- Add CDN for image delivery

### 4. User Experience
- Add progress indicators
- Implement offline support
- Add story saving/bookmarking

---

*Last Updated: January 2025*
*System Status: Choices ✅ Working | Images ⚠️ Partially Working*