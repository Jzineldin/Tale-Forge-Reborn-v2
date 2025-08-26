# 🔌 Easy Mode Backend Integration Guide

## Backend Architecture Overview

### ✅ **Backend is Ready!**
The backend already supports everything needed for Easy Mode:

1. **Story Creation Function** (`/create-story`)
   - Accepts `story_type`: 'short' | 'medium' | 'long'
   - Handles credit calculation automatically
   - Stores all template data in `generation_settings` JSONB field
   - Triggers AI generation for first segment

2. **Database Schema** (`stories` table)
   - `generation_settings` JSONB stores all template/easy mode data
   - `target_age` field for age group
   - `genre` field for story type
   - `title`, `description` for basic info

3. **Credit System**
   - Automatic cost calculation based on story length
   - Credit spending/refunding built-in
   - Different costs for short/medium/long stories

## 🎯 Easy Mode to Backend Mapping

### Step 1: Difficulty → Backend Fields

```typescript
// Easy Mode Selection
const DIFFICULTY_TO_BACKEND = {
  'short': {
    story_type: 'short',
    words_per_chapter: 60,    // 40-80 words
    target_age: 5,             // Ages 4-6
    age_group: '4-6',
    chapters: 1
  },
  'medium': {
    story_type: 'medium',
    words_per_chapter: 125,   // 100-150 words
    target_age: 7,             // Ages 6-9
    age_group: '7-9',
    chapters: 2
  },
  'long': {
    story_type: 'long',
    words_per_chapter: 180,   // 160-200 words
    target_age: 10,            // Ages 9-12
    age_group: '10-12',
    chapters: 3
  }
};
```

### Step 2: Genre → Backend Fields

```typescript
// Genre mapping (already compatible)
const GENRE_MAP = {
  'FANTASY': 'fantasy',
  'SCI-FI': 'scifi',
  'ADVENTURE': 'adventure',
  'MYSTERY': 'mystery',
  'FAIRYTALE': 'fairytale',
  'ANIMALS': 'animals',
  'EDUCATION': 'educational',
  'FUNNY': 'humor',
  'NATURE': 'nature'
};
```

### Step 3: Character & Story Seed → Backend Fields

```typescript
interface EasyModeData {
  // From UI
  difficulty: 'short' | 'medium' | 'long';
  genre: string;
  characterName: string;
  characterTraits: string[];
  storySeed: string;  // AI generated or user modified
}

// Convert to Backend Format
function convertToBackendFormat(easyMode: EasyModeData) {
  const difficulty = DIFFICULTY_TO_BACKEND[easyMode.difficulty];
  
  return {
    // Required fields
    title: generateTitle(easyMode),  // Auto-generate from seed
    genre: GENRE_MAP[easyMode.genre],
    age_group: difficulty.age_group,
    
    // Story configuration
    story_type: difficulty.story_type,
    target_age: difficulty.target_age,
    words_per_chapter: difficulty.words_per_chapter,
    
    // Character data
    child_name: easyMode.characterName,
    characters: [{
      id: 'main',
      name: easyMode.characterName,
      role: 'protagonist',
      traits: easyMode.characterTraits,
      description: `A ${easyMode.characterTraits.join(', ')} child`
    }],
    
    // Story elements (from AI seed)
    theme: extractTheme(easyMode.storySeed),
    setting: extractSetting(easyMode.storySeed),
    conflict: extractConflict(easyMode.storySeed),
    quest: easyMode.storySeed,  // Use full seed as quest/premise
    
    // Optional but recommended
    additional_details: easyMode.storySeed,
    atmosphere: getAtmosphereForGenre(easyMode.genre),
    moral_lesson: getDefaultMoralForAge(difficulty.target_age),
    
    // Feature flags
    include_images: true,
    include_audio: true
  };
}
```

## 🔄 Complete API Flow

### 1. Generate Story Seed (Optional)

```typescript
// Frontend: Generate AI story seed
async function generateStorySeed(genre: string, age: number) {
  // Option 1: Use OpenAI directly from frontend (not recommended)
  // Option 2: Create a simple edge function for seed generation
  // Option 3: Use predefined seeds with variations
  
  const seeds = STORY_SEEDS[genre];
  return seeds[Math.floor(Math.random() * seeds.length)];
}
```

### 2. Create Story API Call

```typescript
// Frontend: Create story with Easy Mode data
async function createEasyModeStory(easyModeData: EasyModeData) {
  const { user } = useAuth();
  
  // Convert Easy Mode to backend format
  const storyData = convertToBackendFormat(easyModeData);
  
  // Call existing story service
  const response = await fetch(`${SUPABASE_URL}/functions/v1/create-story`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify(storyData)
  });
  
  if (!response.ok) {
    // Handle errors (insufficient credits, etc.)
    const error = await response.json();
    throw new Error(error.message);
  }
  
  const story = await response.json();
  
  // Navigate to story reader
  navigate(`/story/${story.id}`);
}
```

### 3. Backend Processing (Already Implemented)

```typescript
// Backend: create-story/index.ts (existing)
// 1. Validates user authentication ✅
// 2. Normalizes age group ✅
// 3. Checks user credits ✅
// 4. Creates story in database ✅
// 5. Spends credits ✅
// 6. Generates first segment ✅
// 7. Returns story object ✅
```

## 📊 Data Flow Diagram

```
EASY MODE UI                    BACKEND                        DATABASE
────────────                    ─────────                      ──────────
                                                              
1. Select Difficulty ─────┐                                  
   (short/medium/long)    │                                  
                          │                                  
2. Pick Genre ────────────┤                                  
   (fantasy/scifi/etc)    │                                  
                          │                                  
3. Enter Character ───────┤                                  
   (name + traits)        │                                  
                          ↓                                  
                    [Transform Data]                         
                          │                                  
                          ↓                                  
4. Create Story ──────> /create-story ────> stories table   
                              │              - id            
                              │              - title         
                              │              - genre         
                              │              - generation_settings
                              │                (all Easy Mode data)
                              ↓                              
                        Check Credits                        
                              │                              
                              ↓                              
                        Spend Credits ────> credit_transactions
                              │                              
                              ↓                              
                    Generate First Segment                   
                              │                              
                              ↓                              
                     /generate-story-segment ──> story_segments
                              │                   - content  
                              │                   - choices  
                              ↓                   - image_url
                        Return Story ID                      
                              │                              
5. Navigate to Reader ────────┘                              
```

## 🎨 UI Component Implementation

### EasyModeFlow Component

```typescript
// src/components/organisms/story-creation/EasyModeFlow.tsx
import { useState } from 'react';
import { useCreateStory } from '@/utils/storyHooks';
import { useNavigate } from 'react-router-dom';

export function EasyModeFlow() {
  const [step, setStep] = useState(1);
  const [difficulty, setDifficulty] = useState<'short' | 'medium' | 'long'>('medium');
  const [genre, setGenre] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [characterTraits, setCharacterTraits] = useState<string[]>([]);
  const [storySeed, setStorySeed] = useState('');
  
  const { mutate: createStory, isLoading } = useCreateStory();
  const navigate = useNavigate();
  
  const handleCreateStory = async () => {
    const storyData = convertToBackendFormat({
      difficulty,
      genre,
      characterName,
      characterTraits,
      storySeed
    });
    
    createStory(storyData, {
      onSuccess: (story) => {
        navigate(`/story/${story.id}`);
      },
      onError: (error) => {
        // Handle error (show toast, etc.)
        console.error('Failed to create story:', error);
      }
    });
  };
  
  // Render steps based on current step
  return (
    <div className="easy-mode-container">
      {step === 1 && <DifficultySelector onSelect={setDifficulty} />}
      {step === 2 && <GenreSelector onSelect={setGenre} />}
      {step === 3 && <CharacterSetup 
        onNameChange={setCharacterName}
        onTraitsChange={setCharacterTraits}
        onSeedChange={setStorySeed}
      />}
      
      <NavigationButtons 
        onBack={() => setStep(step - 1)}
        onNext={() => step < 3 ? setStep(step + 1) : handleCreateStory()}
        isLastStep={step === 3}
        isLoading={isLoading}
      />
    </div>
  );
}
```

## 🚀 Quick Implementation Checklist

### Frontend Tasks
- [ ] Create `EasyModeFlow` component
- [ ] Create `DifficultySelector` component
- [ ] Create `GenreSelector` component  
- [ ] Create `CharacterSetup` component
- [ ] Add Easy Mode to `/create` page mode selection
- [ ] Implement data transformation function
- [ ] Add loading/progress UI
- [ ] Handle error states

### Backend Tasks (Already Done ✅)
- [x] Story creation endpoint accepts all fields
- [x] Credit calculation for different story types
- [x] Database stores all generation settings
- [x] AI generation triggered automatically

### Integration Tasks
- [ ] Test Easy Mode → Backend flow
- [ ] Verify credit spending
- [ ] Test story generation
- [ ] Ensure navigation to reader works

## 🔑 Key Backend Endpoints

### Create Story
```
POST /functions/v1/create-story
Authorization: Bearer {token}

Body: {
  title: string,
  genre: string,
  age_group: string,
  story_type: 'short' | 'medium' | 'long',
  child_name: string,
  characters: Array,
  theme: string,
  setting: string,
  conflict: string,
  quest: string,
  // ... other optional fields
}

Response: {
  id: string,
  title: string,
  // ... story object
}
```

### Generate Segment (Called Automatically)
```
POST /functions/v1/generate-story-segment
Authorization: Bearer {token}

Body: {
  storyId: string,
  choiceIndex?: number,
  templateContext: object  // Passed from generation_settings
}
```

## 💡 Implementation Tips

1. **Use Existing Hooks**: The `useCreateStory` hook already handles the API call
2. **Transform at UI Layer**: Convert Easy Mode data to backend format in the component
3. **Progressive Enhancement**: Start with basic functionality, add AI seeds later
4. **Error Handling**: Show clear messages for insufficient credits
5. **Loading States**: Show progress during story generation (30-60 seconds)

## 🎯 Summary

The backend is **fully ready** for Easy Mode! You just need to:
1. Build the 3-step UI flow
2. Transform Easy Mode selections to backend format
3. Call the existing `/create-story` endpoint
4. Navigate to the story reader

No backend changes needed - everything is already set up and working!