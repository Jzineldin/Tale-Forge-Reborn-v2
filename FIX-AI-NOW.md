# 🚨 CRITICAL: Fix AI Pipeline NOW

## Issue: Your AI isn't working because you have FAKE API keys!

### Step 1: Get Real API Keys

#### Option A: OpenAI (Recommended - Most Reliable)
1. Go to: https://platform.openai.com/api-keys
2. Create a new API key
3. Copy it (starts with `sk-proj-`)

#### Option B: OVH AI Endpoints (Free Alternative)
1. Go to: https://endpoints.ai.cloud.ovh.net/
2. Create an account
3. Get your access token

#### Option C: Anthropic Claude (Best Quality)
1. Go to: https://console.anthropic.com/
2. Create API key
3. Copy it (starts with `sk-ant-`)

### Step 2: Update Your Environment Files

**Local Development (.env):**
```bash
# Replace with your REAL keys
OPENAI_API_KEY=sk-proj-YOUR_REAL_KEY_HERE
OVH_AI_ENDPOINTS_ACCESS_TOKEN=YOUR_REAL_OVH_TOKEN_HERE
ANTHROPIC_API_KEY=sk-ant-YOUR_REAL_KEY_HERE
```

**Supabase Edge Functions (.env):**
```bash
# In supabase/functions/.env
OPENAI_API_KEY=sk-proj-YOUR_REAL_KEY_HERE
OVH_AI_ENDPOINTS_ACCESS_TOKEN=YOUR_REAL_OVH_TOKEN_HERE
```

### Step 3: Deploy to Production

```bash
# Set secrets in Supabase
supabase secrets set OPENAI_API_KEY=sk-proj-YOUR_REAL_KEY_HERE
supabase secrets set OVH_AI_ENDPOINTS_ACCESS_TOKEN=YOUR_REAL_OVH_TOKEN

# Deploy functions
supabase functions deploy generate-story-segment
supabase functions deploy generate-story-seeds
```

### Step 4: Test It Works

```bash
# Test locally
curl -X POST http://localhost:54321/functions/v1/generate-story-segment \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Test story generation"}'
```

## Current Status:
- ❌ OpenAI: Using fake key `sk-test-dummy-key-for-local-testing-only`
- ❌ OVH: No token configured
- ❌ Result: 100% AI failure rate

## After Fix:
- ✅ OpenAI: Real API key working
- ✅ OVH: Fallback ready
- ✅ Result: AI generation working!