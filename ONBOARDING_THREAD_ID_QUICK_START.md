# Onboarding Thread ID - Quick Start Guide

## Overview

The onboarding thread ID feature enables conversation continuity between a parent application and the embedded chatbot widget. This allows users to resume conversations across different pages or sessions.

## Implementation Status

✅ **IMPLEMENTED** - The feature is fully implemented and ready to use.

### Components Implemented

1. **`useParentMessaging` Hook** (`src/hooks/useParentMessaging.ts`)
   - Listens for `postMessage` events from parent window
   - Extracts and stores `onboardingThreadID`
   - Filters out known system messages

2. **`AppWithDatabaseConfig` Component** (`src/AppWithDatabaseConfig.tsx`)
   - Uses `useParentMessaging` hook
   - Passes thread ID to chat flow
   - Integrates with existing session management

3. **`chatService` Functions** (`src/services/chatService.ts`)
   - `getChatHistory`: Receives thread ID and passes to API
   - `callAmaliaAPI`: Sends thread ID to backend as `onboarding_thread_id`
   - Handles both single messages and message arrays (for history)

## How to Use

### For Parent Applications

Send the thread ID to the chatbot widget using `postMessage`:

```javascript
// Find the chatbot iframe
const chatbotIframe = document.querySelector('iframe[src*="your-chatbot-url"]');

// Send thread ID
if (chatbotIframe && chatbotIframe.contentWindow) {
    chatbotIframe.contentWindow.postMessage({
        type: 'thread_id',
        value: 'thread_1234567890_abc123'
    }, '*');
}
```

### Example Integration

See `PARENT_INTEGRATION_EXAMPLE.html` for a complete working example.

## Data Flow

```
Parent Window
    │
    │ postMessage({ type: "thread_id", value: "..." })
    │
    ▼
useParentMessaging Hook
    │
    │ onboardingThreadID state
    │
    ▼
AppWithDatabaseConfig
    │
    │ Pass to flow
    │
    ▼
getChatHistory / callAmaliaAPI
    │
    │ params.onboardingThreadID
    │
    ▼
Backend API
    │
    │ POST { onboarding_thread_id: "..." }
    │
    ▼
Conversation History Retrieved
```

## API Request Format

The chatbot sends the thread ID to your backend API:

```json
{
  "message": "user message",
  "client_id": "session_id-path",
  "onboarding_thread_id": "thread_1234567890_abc123"
}
```

## Backend Response Format

### For Initial Load (with history)

```json
{
  "response": [
    { "role": "user", "message": "Hello" },
    { "role": "assistant", "message": "Hi there!" },
    { "role": "user", "message": "How are you?" },
    { "role": "assistant", "message": "I'm doing great!" }
  ]
}
```

### For New Messages

```json
{
  "response": "This is the bot's response"
}
```

## Testing

### Manual Testing

1. Open `PARENT_INTEGRATION_EXAMPLE.html` in a browser
2. Click "Generate New Thread ID"
3. Click "Send Thread ID to Chatbot"
4. Start a conversation in the chatbot
5. Check browser console for logs:
   - `📨 [useParentMessaging] Received thread_id from parent`
   - `🔗 [getChatHistory] onboardingThreadID: thread_...`
   - `🔗 [callAmaliaAPI] onboardingThreadID: thread_...`

### Verify in Network Tab

1. Open DevTools → Network tab
2. Send a message in the chatbot
3. Find the POST request to your chat API
4. Check the request payload includes `onboarding_thread_id`

## Console Logging

The implementation includes comprehensive logging:

- `📨` Message received from parent
- `🔗` Thread ID being used
- `📜` Chat history operations
- `🚀` API calls

## Security Considerations

### Production Recommendations

1. **Validate message origin** in `useParentMessaging.ts`:

```typescript
const handleMessage = (event: MessageEvent) => {
    // Validate origin
    const allowedOrigins = ['https://yourapp.com'];
    if (!allowedOrigins.includes(event.origin)) {
        return;
    }
    // ... rest of handler
};
```

2. **Use specific target origin** when sending from parent:

```javascript
iframe.contentWindow.postMessage({
    type: 'thread_id',
    value: threadId
}, 'https://your-chatbot-domain.com'); // Instead of '*'
```

## Troubleshooting

### Thread ID not received

**Check:**
- Iframe is fully loaded before sending message
- Message format is correct: `{ type: 'thread_id', value: '...' }`
- Console shows `📨 Received thread_id from parent` log

**Solution:**
```javascript
// Wait for iframe to load
iframe.addEventListener('load', () => {
    setTimeout(() => {
        sendThreadIdToChatbot();
    }, 500);
});
```

### Thread ID not in API request

**Check:**
- Console shows `🔗 [callAmaliaAPI] onboardingThreadID: ...`
- Network tab shows `onboarding_thread_id` in request body

**Solution:**
- Verify `params.onboardingThreadID` is set in `getChatHistory`
- Check that `callAmaliaAPI` receives the params object

### History not loading

**Check:**
- Backend returns array format: `{ response: [{ role, message }, ...] }`
- Console shows `📚 Processing chat history array...`

**Solution:**
- Ensure backend returns proper array format for history
- Verify each message has `role` and `message` properties

## Files Modified/Created

### Created
- ✅ `src/hooks/useParentMessaging.ts` - Parent messaging hook
- ✅ `PARENT_INTEGRATION_EXAMPLE.html` - Example integration
- ✅ `ONBOARDING_THREAD_ID_QUICK_START.md` - This file

### Modified
- ✅ `src/AppWithDatabaseConfig.tsx` - Added hook usage
- ✅ `src/services/chatService.ts` - Added logging
- ✅ `src/types/Params.ts` - Already had `onboardingThreadID` property

## Next Steps

1. **Test the implementation** using `PARENT_INTEGRATION_EXAMPLE.html`
2. **Update your backend** to handle `onboarding_thread_id` parameter
3. **Integrate into your parent application** using the example code
4. **Add security measures** for production (origin validation)

## Support

For detailed implementation guide, see `ONBOARDING_THREAD_ID_IMPLEMENTATION_GUIDE.md`

---

**Status:** ✅ Feature fully implemented and ready for testing
**Last Updated:** November 26, 2025
