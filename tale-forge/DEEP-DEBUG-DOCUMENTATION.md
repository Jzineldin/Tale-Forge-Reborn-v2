# Deep Debug New Story - Complete Documentation

## Overview

The `deep-debug-new-story.js` script is a browser-based diagnostic tool designed to troubleshoot issues in the Tale Forge story generation system. It specifically targets problems where the AI generates generic, low-quality story choices instead of contextual, story-specific options.

## Purpose

This debugging script helps identify whether story generation issues originate from:
- **Backend AI Processing**: Problems with AI model responses or story generation logic
- **Frontend Caching**: Issues with data caching or state management in the React application
- **API Communication**: Network, authentication, or data transmission problems

## Architecture

### Core Components

#### 1. Authentication Handler (`getAuthToken()`)
```javascript
function getAuthToken()
```

**Purpose**: Extracts Supabase authentication tokens from browser localStorage

**Process**:
1. Scans localStorage for keys containing 'supabase' or 'sb-'
2. Attempts to parse each value as JSON
3. Extracts `access_token` from parsed objects
4. Returns first valid token found or null

**Security Note**: This function handles potential JSON parsing errors gracefully but doesn't validate token format or expiry.

#### 2. Main Diagnostic Engine (`deepDebugNewStory()`)
```javascript
async function deepDebugNewStory()
```

**Purpose**: Orchestrates the complete diagnostic workflow

**Workflow**:
1. **Authentication Check**: Validates auth token availability
2. **Story Retrieval**: Fetches story data via API call
3. **Choice Analysis**: Examines choices for generic patterns
4. **Issue Detection**: Creates test story if problems found
5. **UI Comparison**: Compares database vs displayed choices
6. **Final Diagnosis**: Provides actionable conclusions

### Data Flow

```
Browser localStorage → getAuthToken() → API Authentication
                                      ↓
Story API Call → JSON Response → Choice Analysis → Generic Detection?
                                                        ↓
                                                   Yes → Test Story Creation
                                                        ↓
DOM Query → Choice Extraction → Database Comparison → Final Diagnosis
```

## API Integration

### Endpoints Used

#### 1. Get Story (`/functions/v1/get-story`)
- **Method**: POST
- **Purpose**: Retrieves existing story data
- **Payload**: `{ storyId: string }`
- **Response**: Story object with segments and choices

#### 2. Create Story (`/functions/v1/create-story`)
- **Method**: POST  
- **Purpose**: Creates test story for issue reproduction
- **Payload**: Complete story configuration object
- **Response**: New story with first segment data

### Authentication
- Uses Supabase Bearer token authentication
- Includes hardcoded anon API key (security concern)
- Tokens extracted from localStorage dynamically

## Diagnostic Logic

### Generic Choice Detection

The script identifies problematic "generic" choices using pattern matching:

```javascript
const genericPatterns = [
  'Continue the adventure',
  'Explore a different path', 
  'Try something unexpected',
  'Make a brave decision',
  'Explore somewhere new',
  'Try something different'
];
```

**Detection Method**: 
- Uses nested `Array.some()` to check if any choice contains generic patterns
- Case-sensitive string matching with `includes()`
- Triggers remediation flow when generic choices detected

### Issue Classification

| Scenario | Database Choices | UI Choices | Diagnosis |
|----------|-----------------|------------|-----------|
| Backend Issue | Generic | Generic | AI generation failing |
| Frontend Issue | Contextual | Generic | Caching/display problem |
| Inconsistent | Mixed results | Variable | Intermittent backend failure |
| Working | Contextual | Contextual | No issue detected |

## DOM Analysis

### Element Selection
```javascript
document.querySelectorAll('[class*="choice"], [class*="Button"], button')
```

**Selection Criteria**:
- Elements with 'choice' in className
- Elements with 'Button' in className  
- All button elements

### Content Filtering

The script filters displayed choices by:
- **Length**: Must be > 10 characters
- **Exclusions**: Removes 'End Story', 'Read Again', 'Generate Audio', 'main menu'
- **Prefix Removal**: Strips A/B/C prefixes from choice text

## Performance Characteristics

### Time Complexity
- **Auth Token Retrieval**: O(n) where n = localStorage keys
- **Generic Detection**: O(m×p) where m = choices, p = patterns
- **DOM Processing**: O(d) where d = DOM elements

### Space Complexity
- **Memory Usage**: O(s) where s = story content size
- **DOM Storage**: O(d) for DOM element references

### Network Usage
- **Minimum**: 1 API call (get-story)
- **Maximum**: 2 API calls (get-story + create-story)
- **Payload Size**: ~500B for get-story, ~2KB for create-story

## Error Handling

### Network Errors
```javascript
try {
  const response = await fetch(url, options);
  // Handle response
} catch (error) {
  console.log('❌ Error debugging new story:', error.message);
}
```

### Authentication Failures
- Graceful degradation when no token found
- No retry logic for expired tokens
- Error logging without sensitive data exposure

### Malformed Data
- JSON parsing errors handled silently
- Missing object properties use optional chaining
- Array operations protected with length checks

## Security Analysis

### Critical Vulnerabilities

#### 1. API Key Exposure
```javascript
'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```
**Risk**: Public API key enables unauthorized access
**Impact**: HIGH - Potential data breach or service abuse

#### 2. Unvalidated localStorage Access
```javascript
const keys = Object.keys(localStorage).filter(k => 
  k.includes('supabase') || k.includes('sb-')
);
```
**Risk**: No validation of localStorage content
**Impact**: MEDIUM - Potential token injection or manipulation

#### 3. DOM Content Processing
```javascript
const text = button.textContent?.trim();
```
**Risk**: Direct DOM content usage without sanitization
**Impact**: LOW - XSS if DOM compromised

### Recommendations

1. **Use Environment Variables**: Store API keys securely
2. **Implement Token Validation**: Verify token format and expiry
3. **Add Content Sanitization**: Sanitize all DOM content
4. **Implement CSP Headers**: Add Content Security Policy
5. **Add Rate Limiting**: Prevent API abuse

## Usage Instructions

### Prerequisites
- Modern browser with developer console access
- Active Tale Forge session with valid authentication
- Story ID from recent story creation attempt

### Execution Steps

1. **Update Story ID**: 
   ```javascript
   const newStoryId = 'your-story-id-here';
   ```

2. **Open Browser Console**: F12 or right-click → Inspect → Console

3. **Execute Script**: Copy and paste entire script, or load via script tag

4. **Monitor Output**: Watch for diagnostic messages and conclusions

### Interpreting Results

#### Success Indicators
- ✅ Contextual choices found
- ✅ Database and display match
- ✅ Test story has good choices

#### Problem Indicators  
- ❌ Generic choices detected
- ❌ Database and display mismatch
- ❌ Consistent backend failures

#### Diagnostic Messages
- `Backend issue confirmed` → AI generation problem
- `Frontend cache issue` → React state management problem
- `Inconsistent behavior` → Intermittent backend issues

## Testing

### Test Suite Components

#### 1. Unit Tests (`deep-debug-new-story.test.js`)
- Function-level testing for all core components
- Mock-based testing for external dependencies
- Error condition and edge case coverage

#### 2. Integration Tests (`deep-debug-integration.test.js`)
- End-to-end workflow testing
- Real API simulation scenarios
- Performance and security testing

#### 3. Test Utilities (`debug-test-utilities.js`)
- Mock data generators
- Helper functions for test setup
- Performance measurement tools

### Running Tests

```bash
# Run all debug tests
npm test -- --config=jest.config.debug.js

# Run with coverage
npm test -- --coverage --config=jest.config.debug.js

# Run specific test file
npm test deep-debug-new-story.test.js
```

### Coverage Goals
- **Branches**: 80%+
- **Functions**: 80%+
- **Lines**: 80%+
- **Statements**: 80%+

## Performance Optimization

### Current Issues
1. **Inefficient DOM Queries**: Multiple querySelectorAll calls
2. **Nested Loop Complexity**: O(m×p) generic choice detection
3. **String Operations**: Repeated text processing in loops
4. **No Request Timeouts**: Potential hanging requests

### Optimization Strategies

#### 1. Cache DOM Queries
```javascript
const choiceButtons = document.querySelectorAll('[class*="choice"], [class*="Button"], button');
// Use cached result multiple times
```

#### 2. Pre-compile Patterns
```javascript
const genericPatterns = [
  /continue.+adventure/i,
  /explore.+different.+path/i,
  // More efficient regex patterns
];
```

#### 3. Batch Operations
```javascript
const displayedChoices = Array.from(currentChoiceButtons)
  .map(button => button.textContent?.trim())
  .filter(text => text && text.length > 10)
  .map(text => text.replace(/^[ABC]/, ''));
```

#### 4. Add Request Timeouts
```javascript
const controller = new AbortController();
setTimeout(() => controller.abort(), 10000);

fetch(url, { 
  ...options, 
  signal: controller.signal 
});
```

## Maintenance

### Regular Updates Needed

1. **Story ID**: Update hardcoded ID for current debugging session
2. **Generic Patterns**: Add new patterns as they're discovered
3. **API Endpoints**: Update URLs if backend changes
4. **DOM Selectors**: Update selectors if UI changes

### Monitoring

- **API Response Times**: Track fetch() duration
- **Error Rates**: Monitor failed requests
- **Generic Choice Frequency**: Track detection rates
- **DOM Query Performance**: Monitor selection times

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Initial | Basic story debugging functionality |
| 1.1 | Current | Added test story creation, DOM comparison |

## Troubleshooting

### Common Issues

#### "No auth token found"
- **Cause**: User not logged in or localStorage cleared
- **Solution**: Refresh page and log in again

#### "Failed to fetch story"
- **Cause**: Network issues, invalid story ID, or API down
- **Solution**: Check network, verify story ID, try different story

#### "Generic choices detected"
- **Cause**: AI model issues or backend configuration problems
- **Solution**: Check backend logs, verify AI model settings

### Debug Mode

Enable additional logging by modifying:
```javascript
const DEBUG_MODE = true;
if (DEBUG_MODE) {
  console.log('Debug info:', data);
}
```

## Contributing

### Code Style
- Use clear, descriptive variable names
- Add comprehensive error handling
- Include performance considerations
- Follow existing console logging format

### Testing Requirements
- Unit tests for new functions
- Integration tests for new workflows
- Performance tests for optimization changes
- Security tests for sensitive operations

### Documentation Updates
- Update this README for functional changes
- Add JSDoc comments for new functions
- Update troubleshooting section for new issues
- Include performance impact analysis

---

*This documentation is maintained alongside the debugging script. Last updated: 2025-01-20*