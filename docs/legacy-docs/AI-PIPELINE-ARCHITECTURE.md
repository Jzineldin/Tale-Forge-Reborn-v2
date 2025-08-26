# 🚀 TALE FORGE AI PIPELINE ARCHITECTURE (CLEANED)

*Last Updated: 2025-08-24 after major cleanup removing 12 dead code functions from legacy app*

## 🎯 **CORE AI SERVICES (NEVER CHANGE)**

### **TEXT GENERATION:**
1. **PRIMARY:** GPT-4o (OpenAI) 
2. **FALLBACK:** Meta-Llama-3.3-70B-Instruct (OVH)

### **IMAGE GENERATION:**
- **ALWAYS:** Stable Diffusion XL (OVH SDXL) - NO ALTERNATIVES

### **AUDIO GENERATION:**
- **PRIMARY:** ElevenLabs TTS
- **FALLBACK:** OVH TTS

---

## 📊 **COMPLETE FUNCTION INVENTORY (8 ESSENTIAL FUNCTIONS ONLY)**

### **🤖 AI GENERATION FUNCTIONS:**
1. `generate-story-segment` - Continues interactive stories (GPT-4o → Llama-3.3) ⭐
2. `generate-story-ending` - Creates story conclusions (GPT-4o → Llama-3.3) ⭐
3. `regenerate-image` - Generates/regenerates images (OVH SDXL ALWAYS) ⭐
4. `generate-audio` - Text-to-speech narration (ElevenLabs → OVH TTS) ⭐

### **📚 CRUD FUNCTIONS:**
5. `create-story` - Creates new story + first segment (calls generate-story-segment) ⭐
6. `get-story` - Retrieves story with segments (no AI, field mapping) ⭐
7. `update-story` - Updates story metadata (title, description, etc.) ⭐
8. `delete-story` - Deletes story and related segments ⭐

---

## 🗑️ **REMOVED DEAD CODE (12 FUNCTIONS CLEANED UP):**

### **❌ AI Function Duplicates:**
- ~~`generate-tts`~~ → Use `generate-audio` instead
- ~~`generate-story-image`~~ → Use `regenerate-image` instead  

### **❌ Unused Prompt Management:**
- ~~`get-prompt`, `setup-prompts`, `update-prompt`~~ → Not used in current system
- ~~`regenerate-seeds`~~ → Not called anywhere

### **❌ Test Functions:**
- ~~`test-ovh-ai-simple`, `test-image-generation`, `test-db-schema`~~ → Development only

### **❌ Legacy Payment System:**
- ~~`stripe-create-checkout`, `stripe-webhook`, `customer-portal`~~ → From old app

---

## ⚡ **EXECUTION FLOW:**

### **Story Creation:**
1. User creates story → `create-story`
2. `create-story` → calls `generate-story-segment` (first segment)
3. `generate-story-segment` → GPT-4o (primary) → Llama-3.3 (fallback)
4. Images generated → `regenerate-image` (OVH SDXL always)

### **Story Continuation:**
1. User makes choice → `generate-story-segment` (next segment)
2. User ends story → `generate-story-ending` (conclusion)
3. User requests audio → `generate-audio` (ElevenLabs → OVH TTS)
4. User regenerates image → `regenerate-image` (OVH SDXL always)

### **Story Management:**
- View story → `get-story`
- Edit story → `update-story` 
- Remove story → `delete-story`

---

## 🔧 **CONFIGURATION LOCATIONS:**

### **Text Generation Config:**
`supabase/functions/generate-story-segment/config/ai-config.ts`
```typescript
OPENAI_CONFIG: { model: 'gpt-4o' }      // PRIMARY
OVH_AI_CONFIG: { model: 'Meta-Llama-3_3-70B-Instruct' }  // FALLBACK
```

### **Image Generation Config:**
`supabase/functions/regenerate-image/index.ts`
```typescript
ovhEndpoint: 'https://stable-diffusion-xl.endpoints.kepler.ai.cloud.ovh.net/api/text2image'
```

### **Audio Generation Config:**
`supabase/functions/generate-audio/index.ts` (ElevenLabs primary, OVH TTS fallback)

---

## 🚨 **CRITICAL RULES:**

1. **NEVER CHANGE:** Image generation ALWAYS uses OVH SDXL
2. **TEXT PRIORITY:** GPT-4o first, Llama-3.3 second, no other providers
3. **AUDIO PRIORITY:** ElevenLabs first, OVH TTS second
4. **NO DEAD CODE:** Only 8 functions should exist - anything else is legacy
5. **CONSISTENCY:** All AI functions use same model versions and fallback logic

---

## 🔍 **MONITORING & DEBUGGING:**

All AI functions log provider status:
```
🔍 AI Provider Status: { hasOpenAI: true, hasOVH: true, primaryProvider: 'OpenAI' }
```

**Development Mode:** Creates placeholder content when API keys missing, with clear messaging.
**Production Mode:** Throws proper errors when providers unavailable.

---

## 🎯 **CURRENT STATUS (POST-CLEANUP):**

✅ **PIPELINE COMPLETELY CLEANED:**
- ✅ 12 dead code functions removed
- ✅ 2 missing functions created (update-story, delete-story) 
- ✅ All 8 essential functions verified
- ✅ Clear AI provider hierarchy established
- ✅ No more naming confusion or duplicates

✅ **VERIFIED WORKING:**
- All functions called by frontend exist
- GPT-4o → Llama-3.3 fallback working  
- OVH SDXL image generation working
- ElevenLabs → OVH TTS fallback working

---

## 📱 **FRONTEND INTEGRATION:**

**Functions called by `src/utils/performance.tsx`:**
- `/get-story`, `/create-story`, `/update-story`, `/delete-story`
- `/generate-story-segment`, `/generate-story-ending`
- `/generate-audio`, `/regenerate-image`

**Functions called by `src/utils/realStoryService.ts`:**
- `/create-story`, `/get-story`, `/generate-story-segment`

**All frontend calls now have matching backend functions!** ✅

---

**⚠️ ARCHITECTURE NOW CRYSTAL CLEAR - DO NOT ADD FUNCTIONS WITHOUT UPDATING THIS DOCUMENT ⚠️**