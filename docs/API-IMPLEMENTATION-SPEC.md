# Missing API Endpoints Implementation Specification

## 📋 Overview

This document specifies all missing API endpoints that are causing E2E tests to be skipped. These endpoints are expected by the test suite and need to be implemented for full functionality.

**Total Missing Endpoints:** 7 critical API endpoints  
**Impact:** 17 skipped tests (7 API tests + dependent UI tests)

---

## 🚨 Critical API Endpoints

### 1. Health Check Endpoint

**Endpoint:** `GET /api/health`  
**Purpose:** Basic API health monitoring  
**Test File:** `tests/e2e/api.spec.ts:23`

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-25T20:00:00.000Z",
  "uptime": 12345
}
```

**Implementation:** `supabase/functions/health/index.ts`
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime?.() || 0)
  };

  return new Response(JSON.stringify(healthData), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    status: 200
  });
});
```

### 2. Story Creation API

**Endpoint:** `POST /api/stories`  
**Purpose:** Create new interactive stories  
**Test File:** `tests/e2e/api.spec.ts:32`

**Expected Request Body:**
```json
{
  "characterName": "API Test Character",
  "theme": "adventure",
  "lesson": "teamwork", 
  "setting": "space",
  "ageGroup": "7-9"
}
```

**Expected Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "characterName": "API Test Character",
  "theme": "adventure",
  "lesson": "teamwork",
  "setting": "space", 
  "ageGroup": "7-9",
  "status": "draft",
  "createdAt": "2025-08-25T20:00:00.000Z",
  "updatedAt": "2025-08-25T20:00:00.000Z"
}
```

**Validation Rules:**
- `characterName`: Required, string, 1-50 characters
- `theme`: Required, enum: `['adventure', 'friendship', 'learning', 'family']`
- `lesson`: Required, string, 1-200 characters
- `setting`: Required, string, 1-100 characters
- `ageGroup`: Required, enum: `['4-6', '7-9', '10-12']`

**Implementation:** `supabase/functions/stories/index.ts`
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'POST') {
    try {
      const { characterName, theme, lesson, setting, ageGroup } = await req.json();
      
      // Validate required fields
      if (!characterName || !theme || !lesson || !setting || !ageGroup) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }), 
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Get user from JWT
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Authorization required' }), 
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabase
        .from('stories')
        .insert([{
          character_name: characterName,
          theme,
          lesson,
          setting,
          age_group: ageGroup,
          status: 'draft'
        }])
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({
        id: data.id,
        characterName: data.character_name,
        theme: data.theme,
        lesson: data.lesson,
        setting: data.setting,
        ageGroup: data.age_group,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 201
      });

    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Internal server error' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return new Response('Method not allowed', { status: 405 });
});
```

### 3. Story List API

**Endpoint:** `GET /api/stories`  
**Purpose:** Get all user's stories  
**Test File:** `tests/e2e/api.spec.ts:52`

**Expected Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "characterName": "Test Character",
    "theme": "adventure",
    "lesson": "teamwork",
    "setting": "space",
    "ageGroup": "7-9",
    "status": "published",
    "createdAt": "2025-08-25T20:00:00.000Z",
    "imageUrl": "https://example.com/story-image.jpg"
  }
]
```

### 4. Story Retrieval API

**Endpoint:** `GET /api/stories/:id`  
**Purpose:** Get specific story by ID  
**Test File:** `tests/e2e/api.spec.ts:61`

**Expected Response (Success):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "characterName": "Test Character",
  "theme": "adventure",
  "lesson": "teamwork", 
  "setting": "space",
  "ageGroup": "7-9",
  "content": "Once upon a time in a galaxy far away...",
  "choices": [
    {
      "id": "choice-1",
      "text": "Explore the mysterious planet",
      "consequence": "You discover a hidden alien civilization"
    }
  ],
  "status": "published",
  "createdAt": "2025-08-25T20:00:00.000Z"
}
```

**Expected Response (Not Found):**
```json
{
  "error": "Story not found",
  "code": "STORY_NOT_FOUND"
}
```
**HTTP Status:** `404`

### 5. Request Validation API

**Endpoint:** `POST /api/stories` (with invalid data)  
**Purpose:** Validate request body and return meaningful errors  
**Test File:** `tests/e2e/api.spec.ts:66`

**Test Request (Invalid):**
```json
{
  "theme": "adventure"
  // Missing: characterName, lesson, setting, ageGroup
}
```

**Expected Response:**
```json
{
  "error": "Validation failed",
  "details": {
    "characterName": "Character name is required",
    "lesson": "Lesson is required", 
    "setting": "Setting is required",
    "ageGroup": "Age group is required"
  }
}
```
**HTTP Status:** `400`

### 6. Rate Limiting API

**Endpoint:** Any API endpoint with excessive requests  
**Purpose:** Protect API from abuse  
**Test File:** `tests/e2e/api.spec.ts:81`

**Implementation:** Apply rate limiting middleware
```typescript
// Rate limit: 10 requests per minute per IP/user
const rateLimitMap = new Map();

function rateLimit(req: Request): boolean {
  const clientId = req.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 10;

  const clientRequests = rateLimitMap.get(clientId) || [];
  const recentRequests = clientRequests.filter((time: number) => now - time < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return false; // Rate limited
  }
  
  recentRequests.push(now);
  rateLimitMap.set(clientId, recentRequests);
  return true;
}
```

**Expected Response (Rate Limited):**
```json
{
  "error": "Too many requests",
  "retryAfter": 60
}
```
**HTTP Status:** `429`

### 7. Performance Monitoring API

**Endpoint:** Any API endpoint  
**Purpose:** Ensure API response times are reasonable  
**Test File:** `tests/e2e/api.spec.ts:98`

**Requirement:** All API endpoints must respond within 5 seconds
**Current Test:** Measures response time and expects < 5000ms

---

## 📊 Database Schema Requirements

### Stories Table

**SQL Migration:** `supabase/migrations/xxx_create_stories_table.sql`

```sql
-- Create stories table
CREATE TABLE stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  character_name TEXT NOT NULL CHECK (length(character_name) >= 1 AND length(character_name) <= 50),
  theme TEXT NOT NULL CHECK (theme IN ('adventure', 'friendship', 'learning', 'family')),
  lesson TEXT NOT NULL CHECK (length(lesson) >= 1 AND length(lesson) <= 200),
  setting TEXT NOT NULL CHECK (length(setting) >= 1 AND length(setting) <= 100),
  age_group TEXT NOT NULL CHECK (age_group IN ('4-6', '7-9', '10-12')),
  content TEXT DEFAULT '',
  choices JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Users can only access their own stories
CREATE POLICY "Users can manage their own stories" ON stories
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX stories_user_id_idx ON stories(user_id);
CREATE INDEX stories_status_idx ON stories(status);
CREATE INDEX stories_created_at_idx ON stories(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER stories_updated_at
  BEFORE UPDATE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

---

## 🔧 Implementation Priority

### Phase 1: Basic CRUD (Immediate - Required for Tests)
1. **Health Check** - Basic API functionality test
2. **POST /api/stories** - Story creation with validation
3. **GET /api/stories** - Story listing
4. **GET /api/stories/:id** - Individual story retrieval
5. **Database Migration** - Create stories table

### Phase 2: Production Features (Next Sprint)
1. **Rate Limiting** - API protection
2. **Error Handling** - Comprehensive error responses  
3. **Logging** - API usage tracking
4. **Authentication Middleware** - JWT verification
5. **Input Sanitization** - XSS protection

### Phase 3: Advanced Features (Future)
1. **Story Generation AI Integration**
2. **Image Generation API**
3. **Story Sharing API**  
4. **Pagination & Filtering**
5. **Webhook Support**

---

## ✅ Testing Checklist

After implementing these APIs, the following tests should pass:

- [ ] `should get health check` - GET /api/health returns 200
- [ ] `should create a story via API` - POST /api/stories creates story  
- [ ] `should get story list` - GET /api/stories returns array
- [ ] `should handle 404 for non-existent story` - GET /api/stories/fake-id returns 404
- [ ] `should validate request body` - POST with invalid data returns 400
- [ ] `should test rate limiting` - Multiple requests return 429
- [ ] `should measure API response time` - All endpoints respond < 5000ms

**Expected Result:** 17 currently skipped tests should start passing