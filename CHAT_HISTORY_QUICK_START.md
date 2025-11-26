# Chat History - Quick Start Guide

## What Was Implemented

The chatbot now automatically loads previous conversation messages when a user returns to the chat. This works by:

1. **On chatbot load** → Sends special greeting message (`mytripgreeting`) to backend
2. **Backend responds** with either:
   - Array of previous messages (returning user)
   - Single greeting message (new user)
3. **Messages are displayed** in chronological order
4. **User continues** conversation normally

## How to Test

### Test 1: New User (No History)
```bash
# 1. Clear browser localStorage
localStorage.clear()

# 2. Refresh page
# 3. Expected: Single welcome message from bot
```

### Test 2: Returning User (With History)
```bash
# 1. Send a few messages in the chat
# 2. Close browser tab
# 3. Reopen the same URL
# 4. Expected: Previous messages appear in order
```

### Test 3: Check Network Request
```bash
# 1. Open DevTools → Network tab
# 2. Refresh page
# 3. Find POST request to: /amalia-assistant/chat
# 4. Check Request Body:
{
  "message": "mytripgreeting",
  "client_id": "session_xxx-/amalia",
  "onboarding_thread_id": null
}
# 5. Check Response:
# - Array: [{ role: "user", message: "..." }, { role: "assistant", message: "..." }]
# - String: "Welcome! How can I help you?"
```

## Key Files

### 1. `src/config/constants.ts`
API endpoints and configuration:
```typescript
export const API_ENDPOINTS = {
  CHAT_BASE: "https://chats.mytrip.ai"
};

export const GREETING_MESSAGE = "mytripgreeting";
```

### 2. `src/services/chatService.ts`
Main chat functions:
```typescript
// Fetch chat history
getChatHistory(params, currentPath, onboardingThreadID, sessionId, hasInjectedRef)

// Call API with user message
callAmaliaAPI(params, sessionId, currentPath)
```

### 3. `src/AppWithDatabaseConfig.tsx`
Flow structure:
```typescript
const flow = {
  start: {
    message: async (params) => {
      await getChatHistory(...); // Load history
    },
    path: () => "loop"
  },
  loop: {
    message: async (params) => {
      await callAmaliaAPI(...); // Handle messages
    },
    path: () => "loop"
  }
};
```

## Backend API Contract

### Request Format
```json
POST /amalia-assistant/chat
{
  "message": "mytripgreeting",
  "client_id": "session_1732644000000_abc123-/amalia",
  "onboarding_thread_id": null
}
```

### Response Format - New User
```json
{
  "response": "Welcome! How can I help you plan your trip today?"
}
```

### Response Format - Returning User
```json
{
  "response": [
    { "role": "user", "message": "I want to visit Costa Rica" },
    { "role": "assistant", "message": "Great choice! Costa Rica is beautiful..." },
    { "role": "user", "message": "What's the best time to visit?" },
    { "role": "assistant", "message": "The dry season from December to April..." }
  ]
}
```

## Console Logging

Watch for these logs to debug:
```
📜 [getChatHistory] Starting to fetch chat history...
🚀 [callAmaliaAPI] Starting API call...
📚 [callAmaliaAPI] Processing chat history array...
💬 [callAmaliaAPI] Injecting message - Role: user, Message: ...
💬 [callAmaliaAPI] Injecting message - Role: assistant, Message: ...
✅ [callAmaliaAPI] API call completed successfully
🎬 [Flow] Entering start block - fetching chat history...
✅ [Flow] Chat history loaded, transitioning to loop...
🔄 [Flow] In loop block - processing user message...
```

## Troubleshooting

### Issue: No history appears
**Check:**
- Session ID in localStorage: `localStorage.getItem('sessionId')`
- Network request includes correct `client_id`
- Backend returns array (not string) for returning users

### Issue: Duplicate messages
**Check:**
- `hasInjectedInitialMessages.current` is being set to `true`
- Flow only runs `start` block once

### Issue: Messages in wrong order
**Check:**
- Backend returns messages in chronological order
- `await` is used in message injection loop

### Issue: Error message appears
**Check:**
- Backend API is accessible
- Network connection is stable
- API endpoint URL is correct

## Configuration Options

### Change API Endpoint
Edit `src/config/constants.ts`:
```typescript
export const API_ENDPOINTS = {
  CHAT_BASE: "https://your-api.com"
};
```

### Change Greeting Message
Edit `src/config/constants.ts`:
```typescript
export const GREETING_MESSAGE = "your-custom-greeting";
```

### Disable Chat History
Edit `src/AppWithDatabaseConfig.tsx`:
```typescript
const mergedSettings = {
  // ...
  general: {
    flowStartTrigger: 'ON_PAGE_INTERACT' // Change from 'ON_LOAD'
  }
};
```

## Session Management

### How Sessions Work
- Session ID generated on first visit: `session_1732644000000_abc123`
- Stored in localStorage: `localStorage.getItem('sessionId')`
- Persists across browser sessions
- Cleared when localStorage is cleared

### Client ID Format
```
{sessionId}-{effectivePath}

Examples:
- session_1732644000000_abc123-/amalia
- session_1732644000000_abc123-/us-parks
- session_1732644000000_abc123-/assistant
```

### Reset Session
```javascript
localStorage.removeItem('sessionId');
location.reload();
```

## Next Steps

1. ✅ Implementation complete
2. 🧪 Test with backend API
3. 📊 Monitor console logs
4. 🐛 Fix any issues
5. 🚀 Deploy to production

## Support

For issues or questions:
- Check console logs for error messages
- Review `CHAT_HISTORY_IMPLEMENTATION_GUIDE.md` for detailed documentation
- Review `CHAT_HISTORY_IMPLEMENTATION_SUMMARY.md` for implementation details
