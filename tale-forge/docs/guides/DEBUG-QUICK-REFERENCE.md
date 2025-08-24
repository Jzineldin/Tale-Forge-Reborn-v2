# Deep Debug New Story - Quick Reference Guide

## 🚀 Quick Start

### 1. Update Story ID
```javascript
const newStoryId = 'your-actual-story-id-here';
```

### 2. Run in Browser Console
- Press F12 → Console tab
- Paste entire script
- Watch for diagnostic output

### 3. Key Output Indicators

| Symbol | Meaning | Action |
|--------|---------|---------|
| ✅ | Success/Good state | Continue monitoring |
| ❌ | Problem detected | Investigate further |
| 🔍 | Diagnostic step | Wait for completion |
| 🧪 | Test creation | Backend testing in progress |

## 📊 Diagnostic Flow

```
Auth Check → Story Fetch → Choice Analysis → Issue Detection → DOM Compare → Diagnosis
```

## 🔧 Common Fixes

### Backend Issues (Generic Choices)
```bash
# Check Supabase function logs
supabase functions logs generate-story-segment

# Verify AI model configuration
# Check API rate limits
# Review prompt templates
```

### Frontend Issues (Display Mismatch)  
```bash
# Clear React state
localStorage.clear()

# Hard refresh
Ctrl+Shift+R

# Check Redux/state management
```

### Authentication Issues
```bash
# Re-login to refresh tokens
# Check localStorage for auth data
# Verify API permissions
```

## 🐛 Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "No auth token found" | Not logged in | Login again |
| "Failed to fetch story" | API/Network issue | Check connection, verify story ID |
| "Generic choices detected" | AI model issue | Check backend logs |
| "Database and display don't match" | Frontend cache | Clear cache, refresh |

## ⚡ Performance Tips

- Limit to debugging sessions only
- Close browser tabs after use  
- Don't run on production
- Monitor network usage

## 🔒 Security Notes

- Contains hardcoded API keys (development only)
- Accesses localStorage tokens
- Not suitable for production use
- Use only in controlled environments

## 📋 Test Commands

```bash
# Run all tests
npm test -- --config=jest.config.debug.js

# Run with coverage  
npm test -- --coverage --config=jest.config.debug.js

# Run integration tests only
npm test deep-debug-integration.test.js
```

## 🔍 Debugging Checklist

- [ ] Story ID updated to current session
- [ ] User authenticated in browser
- [ ] Network connection stable
- [ ] Console cleared before running
- [ ] Full script execution completed
- [ ] Final diagnosis reviewed

## 📞 Support

For issues with this debugging script:
1. Check error messages in console
2. Verify story ID is correct
3. Confirm authentication status
4. Review network connectivity
5. Consult full documentation: `DEEP-DEBUG-DOCUMENTATION.md`

---
*Quick Reference v1.1 - Keep this handy during debugging sessions*