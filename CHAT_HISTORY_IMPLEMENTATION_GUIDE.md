# Chat History Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Flow Integration](#flow-integration)
4. [Implementation Steps](#implementation-steps)
5. [Message Rendering Logic](#message-rendering-logic)
6. [Code Examples](#code-examples)
7. [Testing](#testing)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Overview

### What is Chat History?
**Chat History** is the mechanism that retrieves and displays previous conversation messages when a user returns to the chatbot. This feature enables:
- **Conversation continuity**: Users see their previous messages when reopening the chat
- **Context preservation**: The AI assistant maintains context from prior interactions
- **Seamless user experience**: No need to repeat information across sessions
- **Multi-device support**: History persists across browser sessions via sessionId

### How It Works
1. User opens chatbot → Flow starts at `start` block
2. `getChatHistory()` function is called
3. API request sent with special greeting message (`mytripgreeting`)
4. Backend returns either:
   - **Array of messages**: Previous conversation history
   - **Single message**: Initial greeting (new session)
5. Messages are injected into chat UI using `injectMessage()`
6. Flow transitions to `loop` block for normal conversation

---

## Architecture

### Component Structure
```
src/
├── App.js                      # Flow definition and integration
├── services/
│   └── chatService.js          # getChatHistory() & callAmaliaAPI()
├── hooks/
│   └── useSessionManager.js    # Session tracking for history
└── config/
    └── constants.js            # API endpoints and paths
```

### Data Flow Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                        CHAT HISTORY FLOW                        │
└─────────────────────────────────────────────────────────────────┘

1. ChatBot Component Mounts
   ↓
2. Flow Starts (flowStartTrigger: 'ON_LOAD')
   ↓
3. Flow Enters "start" Block
   ↓
4. getChatHistory() Called
   │
   ├─→ [Special Path: /designer]
   │   └─→ Inject hardcoded messages
   │       └─→ "Welcome!" (bot)
   │       └─→ "Hello AI!" (user)
   │
   └─→ [All Other Paths]
       └─→ callAmaliaAPI() with "mytripgreeting"
           ↓
       ┌───────────────────────────────────────┐
       │   POST to Backend API                 │
       │   Body: {                             │
       │     message: "mytripgreeting",        │
       │     client_id: "session_xxx-path",    │
       │     onboarding_thread_id: null        │
       │   }                                   │
       └───────────────────────────────────────┘
           ↓
       Backend Response Analysis
       │
       ├─→ [Array Response - Has History]
       │   data.response = [
       │     { role: "user", message: "Hello" },
       │     { role: "assistant", message: "Hi there!" },
       │     { role: "user", message: "How are you?" },
       │     { role: "assistant", message: "I'm great!" }
       │   ]
       │   ↓
       │   Loop Through Array
       │   ↓
       │   For Each Message:
       │   ├─→ role === "user"
       │   │   └─→ injectMessage(message, "user")
       │   │
       │   └─→ role === "assistant"
       │       └─→ injectMessage(message)
       │
       └─→ [String Response - New Session]
           data.response = "Welcome! How can I help you today?"
           ↓
           injectMessage(data.response)

5. All Messages Rendered in Chat UI
   ↓
6. Flow Transitions to "loop" Block
   ↓
7. User Can Continue Conversation
```

---

## Flow Integration

### React Chatbotify Flow Structure

The chatbot uses a **flow-based conversation system** where each block defines:
- **message**: Async function that handles logic
- **path**: Function that determines next block

```javascript
const flow = {
	start: {
		message: async (params) => {
			// Initial setup - fetch chat history
		},
		path: () => "loop"  // Always go to loop after start
	},
	loop: {
		message: async (params) => {
			// Handle user messages
		},
		path: () => "loop"  // Stay in loop for conversation
	}
};
```

### Flow Execution Lifecycle

```
┌──────────────────────────────────────────────────────────────┐
│  FLOW LIFECYCLE                                              │
└──────────────────────────────────────────────────────────────┘

Component Mount
   ↓
flowStartTrigger: 'ON_LOAD' → Flow Starts Immediately
   ↓
┌─────────────────────────────────────────────────────────────┐
│ START BLOCK                                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ message: async (params) => {                            │ │
│ │   await getChatHistory(...)                             │ │
│ │ }                                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                          ↓                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ path: () => {                                           │ │
│ │   setHasError(false);                                   │ │
│ │   return "loop";  // Transition to loop                │ │
│ │ }                                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ LOOP BLOCK (Conversation Mode)                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ message: async (params) => {                            │ │
│ │   // User sends message                                 │ │
│ │   const success = await callAmaliaAPI(...)              │ │
│ │   setHasError(!success);                                │ │
│ │ }                                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                          ↓                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ path: () => {                                           │ │
│ │   if (hasError) return "start";  // Retry              │ │
│ │   return "loop";  // Continue conversation             │ │
│ │ }                                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          ↓
              User Continues Chatting...
```

### Key Integration Points

**1. Flow Definition in App.js**
```javascript
const flow = {
	start: {
		message: async (params) => {
			await getChatHistory(params, currentPath, onboardingThreadID, sessionId, hasInjectedInitialMessages);
		},
		path: () => {
			setHasError(false); 
			return "loop";
		},
	},
	loop: {
		message: async (params) => {
			const success = await callAmaliaAPI(params, sessionId, currentPath);
			setHasError(!success);
		},
		path: () => {
			if (hasError) {
				return "start";  // Retry from start on error
			}
			return "loop";  // Continue conversation
		}
	}
};
```

**2. Flow Trigger Configuration**
```javascript
// In defaultChatbotConfig.js
general: {
	flowStartTrigger: 'ON_LOAD'  // Start flow immediately when component mounts
}
```

**3. Params Object Structure**
The `params` object is provided by react-chatbotify and contains:
```javascript
{
	userInput: string,           // User's message text
	injectMessage: Function,     // Function to add messages to chat UI
	onboardingThreadID: string,  // Optional thread identifier
	// ... other chatbot-specific properties
}
```

---

## Implementation Steps

### Step 1: Define Flow in Main Component

**File**: `src/App.js`

```javascript
import React, { useRef, useState } from 'react';
import ChatBot from "react-chatbotify";
import { useSessionManager } from './hooks/useSessionManager';
import { callAmaliaAPI, getChatHistory } from './services/chatService';

const MyChatBot = () => {
	const [hasError, setHasError] = useState(false);
	const hasInjectedInitialMessages = useRef(false);
	
	// Get session ID for history tracking
	const sessionId = useSessionManager();
	const currentPath = useCurrentPath();
	const { onboardingThreadID } = useParentMessaging();

	// Define conversation flow
	const flow = {
		start: {
			message: async (params) => {
				// Fetch and inject chat history
				await getChatHistory(
					params, 
					currentPath, 
					onboardingThreadID, 
					sessionId, 
					hasInjectedInitialMessages
				);
			},
			path: () => {
				setHasError(false); 
				return "loop";  // Move to conversation loop
			},
		},
		loop: {
			message: async (params) => {
				// Handle user messages
				const success = await callAmaliaAPI(params, sessionId, currentPath);
				setHasError(!success);
			},
			path: () => {
				if (hasError) {
					return "start";  // Retry on error
				}
				return "loop";  // Continue conversation
			}
		}
	};

	return (
		<ChatBot 
			flow={flow}
			settings={{
				general: {
					flowStartTrigger: 'ON_LOAD'
				}
			}}
		/>
	);
};

export default MyChatBot;
```

**Key Points:**
- **hasInjectedInitialMessages**: Ref to prevent duplicate message injection
- **start block**: Runs once on load to fetch history
- **loop block**: Handles ongoing conversation
- **Error handling**: Returns to start block on API failure

---

### Step 2: Create Chat History Service

**File**: `src/services/chatService.js`

```javascript
import { API_ENDPOINTS, SPECIAL_PATHS, DEFAULT_PATH } from '../config/constants';

/**
 * Determines the effective path for API calls
 * @param {string} currentPath - Current URL path
 * @returns {string} Effective path for API
 */
const getEffectivePath = (currentPath) => {
	if (!currentPath || currentPath === '/') {
		return DEFAULT_PATH;
	}
	if (currentPath === SPECIAL_PATHS.US_PARKS_FULL) {
		return SPECIAL_PATHS.US_PARKS;
	}
	if (currentPath === SPECIAL_PATHS.AMALIA_FULL) {
		return SPECIAL_PATHS.AMALIA;
	}
	return currentPath;
};

/**
 * Constructs the chat API URL based on the path
 * @param {string} effectivePath - Effective path for the API
 * @returns {string} Complete API URL
 */
const getChatApiUrl = (effectivePath) => {
	return effectivePath === SPECIAL_PATHS.ASSISTANT
		? `${API_ENDPOINTS.CHAT_BASE}/assistant/chat`
		: `${API_ENDPOINTS.CHAT_BASE}${effectivePath}-assistant/chat`;
};

/**
 * Fetches chat history or sends initial greeting
 * @param {Object} params - Parameters object from react-chatbotify
 * @param {Function} params.injectMessage - Function to inject messages
 * @param {string} currentPath - Current URL path
 * @param {string} onboardingThreadID - Thread ID
 * @param {string} sessionId - Session ID
 * @param {Object} hasInjectedRef - Ref to track if initial messages were injected
 * @returns {Promise<void>}
 */
export const getChatHistory = async (params, currentPath, onboardingThreadID, sessionId, hasInjectedRef) => {
	console.log('📜 [getChatHistory] Starting to fetch chat history...');

	// Special handling for designer path
	if (currentPath === SPECIAL_PATHS.DESIGNER) {
		if (!hasInjectedRef.current) {
			await params.injectMessage("Welcome!");
			await params.injectMessage("Hello AI!", "user");
			hasInjectedRef.current = true;
		}
	} else {
		// For all other paths, fetch history from backend
		params.userInput = "mytripgreeting";
		params.onboardingThreadID = onboardingThreadID;
		await callAmaliaAPI(params, sessionId, currentPath);
	}
	
	console.log('✅ [getChatHistory] Chat history fetch completed');
};
```

**Key Points:**
- **Special greeting message**: `"mytripgreeting"` signals backend to return history
- **Path-specific logic**: Designer path uses hardcoded messages
- **Ref tracking**: Prevents duplicate injection on re-renders
- **Delegates to callAmaliaAPI**: Reuses existing API logic

---

### Step 3: Implement API Call with History Support

**File**: `src/services/chatService.js` (continued)

```javascript
/**
 * Calls the Amalia chat API
 * @param {Object} params - Parameters object
 * @param {string} params.userInput - User's message
 * @param {Function} params.injectMessage - Function to inject messages into chat
 * @param {string} params.onboardingThreadID - Thread ID for onboarding
 * @param {string} sessionId - Session ID
 * @param {string} currentPath - Current URL path
 * @returns {Promise<boolean>} Success status
 */
export const callAmaliaAPI = async (params, sessionId, currentPath) => {
	console.log('🚀 [callAmaliaAPI] Starting API call...');

	const effectivePath = getEffectivePath(currentPath);
	const url = getChatApiUrl(effectivePath);
	const clientIdWithPath = `${sessionId || 'unknown_user_chatbotify'}-${effectivePath}`;

	try {
		// Make API request
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				message: params.userInput,
				client_id: clientIdWithPath,
				onboarding_thread_id: params.onboardingThreadID || null,
			}),
		});

		if (!response.ok) {
			throw new Error(`Error: ${response.statusText}`);
		}

		const data = await response.json();

		if (data.response) {
			// *** CRITICAL: Handle both array and string responses ***
			if (Array.isArray(data.response)) {
				// Handle chat history array
				console.log('📚 [callAmaliaAPI] Processing chat history array...');
				for (const messageObj of data.response) {
					const { message, role } = messageObj;
					switch (role) {
						case "user":
							await params.injectMessage(message, "user");
							break;
						case "assistant":
							await params.injectMessage(message);
							break;
						default:
							console.warn(`Unexpected role ${role}`, messageObj);
					}
				}
			} else {
				// Handle single message (string)
				console.log('💬 [callAmaliaAPI] Processing single message...');
				await params.injectMessage(data.response);
			}
			console.log('✅ [callAmaliaAPI] API call completed');
			return true;
		} else {
			throw new Error("Response did not include a reply field");
		}
	} catch (error) {
		console.error(error);
		await params.injectMessage("Unable to connect to the chat service. Please try again.");
		console.log('❌ [callAmaliaAPI] API call failed');
		return false;
	}
};
```

**Key Points:**
- **Response type detection**: Uses `Array.isArray()` to determine response format
- **Array handling**: Loops through messages and injects based on role
- **String handling**: Directly injects single message
- **Error handling**: Shows user-friendly error message on failure

---

## Message Rendering Logic

### Understanding injectMessage()

The `injectMessage()` function is provided by react-chatbotify and has two signatures:

```javascript
// Bot message (no second parameter)
await params.injectMessage("Hello from bot");

// User message (second parameter = "user")
await params.injectMessage("Hello from user", "user");
```

### Array Response Processing

When the backend returns an array of messages (chat history):

```javascript
// Backend response structure
{
	"response": [
		{ "role": "user", "message": "What's the weather?" },
		{ "role": "assistant", "message": "It's sunny today!" },
		{ "role": "user", "message": "Should I bring an umbrella?" },
		{ "role": "assistant", "message": "No need, it's clear skies!" }
	]
}
```

**Processing Logic:**

```javascript
if (Array.isArray(data.response)) {
	// Loop through each message in chronological order
	for (const messageObj of data.response) {
		const { message, role } = messageObj;
		
		switch (role) {
			case "user":
				// Inject as user message (appears on right side)
				await params.injectMessage(message, "user");
				break;
				
			case "assistant":
				// Inject as bot message (appears on left side)
				await params.injectMessage(message);
				break;
				
			default:
				// Log unexpected roles for debugging
				console.warn(`Unexpected role ${role}`, messageObj);
		}
	}
}
```

**Visual Result in Chat UI:**

```
┌────────────────────────────────────────────────┐
│  Chat History Rendered                         │
├────────────────────────────────────────────────┤
│                                                │
│  [User Avatar]  What's the weather?            │
│                                                │
│  It's sunny today!  [Bot Avatar]               │
│                                                │
│  [User Avatar]  Should I bring an umbrella?    │
│                                                │
│  No need, it's clear skies!  [Bot Avatar]      │
│                                                │
└────────────────────────────────────────────────┘
```

### String Response Processing

When the backend returns a single string (new session):

```javascript
// Backend response structure
{
	"response": "Welcome! How can I help you today?"
}
```

**Processing Logic:**

```javascript
else {
	// Single string response - inject as bot message
	await params.injectMessage(data.response);
}
```

**Visual Result in Chat UI:**

```
┌────────────────────────────────────────────────┐
│  New Session Greeting                          │
├────────────────────────────────────────────────┤
│                                                │
│  Welcome! How can I help you today?            │
│  [Bot Avatar]                                  │
│                                                │
└────────────────────────────────────────────────┘
```

### Message Injection Order

**Important**: Messages are injected **sequentially** using `await`:

```javascript
for (const messageObj of data.response) {
	// Wait for each message to be injected before moving to next
	await params.injectMessage(message, role === "user" ? "user" : undefined);
}
```

This ensures:
- ✅ Messages appear in chronological order
- ✅ No race conditions
- ✅ Smooth rendering animation
- ✅ Proper message threading

---

## Code Examples

### Example 1: Basic Chat History Integration

```javascript
// Minimal setup for chat history
import React, { useRef } from 'react';
import ChatBot from "react-chatbotify";

const SimpleChatBot = () => {
	const hasInjected = useRef(false);
	
	const flow = {
		start: {
			message: async (params) => {
				if (!hasInjected.current) {
					// Simulate fetching history
					const history = await fetchChatHistory();
					
					// Inject messages
					for (const msg of history) {
						await params.injectMessage(msg.text, msg.sender);
					}
					
					hasInjected.current = true;
				}
			},
			path: () => "loop"
		},
		loop: {
			message: async (params) => {
				// Handle new messages
				await params.injectMessage("Response to: " + params.userInput);
			},
			path: () => "loop"
		}
	};
	
	return <ChatBot flow={flow} />;
};
```

---

### Example 2: Conditional History Loading

```javascript
// Load history only for returning users
export const getChatHistory = async (params, sessionId, hasInjectedRef) => {
	if (hasInjectedRef.current) {
		console.log('History already loaded, skipping...');
		return;
	}
	
	// Check if this is a new session
	const isNewSession = sessionId.includes('_' + Date.now());
	
	if (isNewSession) {
		// New user - show welcome message
		await params.injectMessage("Welcome! I'm here to help.");
	} else {
		// Returning user - fetch history
		const response = await fetch('/api/chat-history', {
			method: 'POST',
			body: JSON.stringify({ session_id: sessionId })
		});
		
		const data = await response.json();
		
		if (data.messages && data.messages.length > 0) {
			// Show history indicator
			await params.injectMessage("--- Previous Conversation ---");
			
			// Inject historical messages
			for (const msg of data.messages) {
				await params.injectMessage(msg.text, msg.role);
			}
			
			// Show continuation indicator
			await params.injectMessage("--- Continuing Conversation ---");
		}
	}
	
	hasInjectedRef.current = true;
};
```

---

### Example 3: History with Pagination

```javascript
// Load history in chunks for better performance
export const getChatHistory = async (params, sessionId, hasInjectedRef) => {
	if (hasInjectedRef.current) return;
	
	const MESSAGES_PER_PAGE = 10;
	let page = 0;
	let hasMore = true;
	
	while (hasMore) {
		const response = await fetch('/api/chat-history', {
			method: 'POST',
			body: JSON.stringify({
				session_id: sessionId,
				page: page,
				limit: MESSAGES_PER_PAGE
			})
		});
		
		const data = await response.json();
		
		if (data.messages && data.messages.length > 0) {
			for (const msg of data.messages) {
				await params.injectMessage(msg.text, msg.role);
			}
			
			hasMore = data.has_more;
			page++;
		} else {
			hasMore = false;
		}
	}
	
	hasInjectedRef.current = true;
};
```

---

### Example 4: History with Timestamps

```javascript
// Display timestamps for historical messages
export const callAmaliaAPI = async (params, sessionId, currentPath) => {
	const response = await fetch(apiUrl, {
		method: 'POST',
		body: JSON.stringify({
			message: params.userInput,
			client_id: sessionId
		})
	});
	
	const data = await response.json();
	
	if (Array.isArray(data.response)) {
		for (const messageObj of data.response) {
			const { message, role, timestamp } = messageObj;
			
			// Format message with timestamp
			const formattedMessage = timestamp 
				? `[${new Date(timestamp).toLocaleTimeString()}] ${message}`
				: message;
			
			await params.injectMessage(
				formattedMessage, 
				role === "user" ? "user" : undefined
			);
		}
	}
};
```

---

### Example 5: Error Recovery with History

```javascript
// Retry history loading on failure
export const getChatHistory = async (params, sessionId, hasInjectedRef, maxRetries = 3) => {
	if (hasInjectedRef.current) return;
	
	let attempts = 0;
	let success = false;
	
	while (attempts < maxRetries && !success) {
		try {
			params.userInput = "mytripgreeting";
			const result = await callAmaliaAPI(params, sessionId, currentPath);
			
			if (result) {
				success = true;
				hasInjectedRef.current = true;
			} else {
				attempts++;
				if (attempts < maxRetries) {
					await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
				}
			}
		} catch (error) {
			console.error(`History load attempt ${attempts + 1} failed:`, error);
			attempts++;
		}
	}
	
	if (!success) {
		await params.injectMessage("Unable to load chat history. Starting fresh conversation.");
		hasInjectedRef.current = true;
	}
};
```

---

## Testing

### Manual Testing Checklist

#### Test 1: New Session (No History)
1. Clear browser localStorage
2. Open chatbot
3. **Expected**: Single welcome message appears
4. **Verify**: No previous messages shown
5. **Check Network Tab**: Response is a string, not array

#### Test 2: Returning Session (With History)
1. Send 2-3 messages in chatbot
2. Close and reopen browser tab
3. **Expected**: Previous messages reappear
4. **Verify**: Messages in correct order (chronological)
5. **Check Network Tab**: Response is an array of message objects

#### Test 3: Array Response Rendering
1. Open browser DevTools → Network tab
2. Reload page to trigger history fetch
3. Find the API request to `/chat` endpoint
4. **Expected Response Format**:
```json
{
	"response": [
		{ "role": "user", "message": "First message" },
		{ "role": "assistant", "message": "First response" }
	]
}
```
5. **Verify in UI**: 
   - User messages on right
   - Bot messages on left
   - Correct avatars displayed

#### Test 4: Mixed Message Types
1. Have a conversation with various message types:
   - Plain text
   - Multi-line messages
   - Messages with special characters
2. Reload page
3. **Expected**: All message types render correctly
4. **Verify**: No formatting issues or broken characters

#### Test 5: Long History
1. Send 20+ messages
2. Reload page
3. **Expected**: All messages load
4. **Verify**: 
   - No duplicate messages
   - Scroll position at bottom
   - Performance is acceptable

#### Test 6: Error Handling
1. Disconnect internet
2. Reload page
3. **Expected**: Error message shown
4. **Verify**: User can still interact after reconnecting

---

### Automated Testing

**File**: `src/services/chatService.test.js`

```javascript
import { callAmaliaAPI, getChatHistory } from './chatService';

describe('Chat History', () => {
	let mockParams;
	
	beforeEach(() => {
		mockParams = {
			injectMessage: jest.fn(),
			userInput: '',
			onboardingThreadID: null
		};
		
		global.fetch = jest.fn();
	});
	
	test('handles array response correctly', async () => {
		const mockResponse = {
			response: [
				{ role: 'user', message: 'Hello' },
				{ role: 'assistant', message: 'Hi there!' }
			]
		};
		
		global.fetch.mockResolvedValue({
			ok: true,
			json: async () => mockResponse
		});
		
		await callAmaliaAPI(mockParams, 'session_123', '/assistant');
		
		expect(mockParams.injectMessage).toHaveBeenCalledTimes(2);
		expect(mockParams.injectMessage).toHaveBeenNthCalledWith(1, 'Hello', 'user');
		expect(mockParams.injectMessage).toHaveBeenNthCalledWith(2, 'Hi there!');
	});
	
	test('handles string response correctly', async () => {
		const mockResponse = {
			response: 'Welcome!'
		};
		
		global.fetch.mockResolvedValue({
			ok: true,
			json: async () => mockResponse
		});
		
		await callAmaliaAPI(mockParams, 'session_123', '/assistant');
		
		expect(mockParams.injectMessage).toHaveBeenCalledTimes(1);
		expect(mockParams.injectMessage).toHaveBeenCalledWith('Welcome!');
	});
	
	test('getChatHistory prevents duplicate injection', async () => {
		const hasInjectedRef = { current: true };
		
		await getChatHistory(mockParams, '/assistant', null, 'session_123', hasInjectedRef);
		
		// Should not call API if already injected
		expect(global.fetch).not.toHaveBeenCalled();
	});
	
	test('handles API errors gracefully', async () => {
		global.fetch.mockRejectedValue(new Error('Network error'));
		
		const result = await callAmaliaAPI(mockParams, 'session_123', '/assistant');
		
		expect(result).toBe(false);
		expect(mockParams.injectMessage).toHaveBeenCalledWith(
			expect.stringContaining('Unable to connect')
		);
	});
});
```

**Run tests:**
```bash
npm test chatService.test.js
```

---

## Best Practices

### 1. Use Refs to Prevent Duplicate Injection

```javascript
// ✅ CORRECT: Use ref to track injection
const hasInjectedInitialMessages = useRef(false);

const flow = {
	start: {
		message: async (params) => {
			if (!hasInjectedInitialMessages.current) {
				await getChatHistory(...);
				hasInjectedInitialMessages.current = true;
			}
		}
	}
};

// ❌ WRONG: Using state causes re-renders
const [hasInjected, setHasInjected] = useState(false);
```

### 2. Always Await injectMessage()

```javascript
// ✅ CORRECT: Sequential injection
for (const msg of messages) {
	await params.injectMessage(msg.text, msg.role);
}

// ❌ WRONG: Parallel injection causes order issues
messages.forEach(msg => {
	params.injectMessage(msg.text, msg.role);
});
```

### 3. Handle Both Response Types

```javascript
// ✅ CORRECT: Check response type
if (Array.isArray(data.response)) {
	// Handle array
} else {
	// Handle string
}

// ❌ WRONG: Assume response type
for (const msg of data.response) {  // Crashes if string!
	// ...
}
```

### 4. Validate Message Structure

```javascript
// ✅ CORRECT: Validate before processing
if (Array.isArray(data.response)) {
	for (const messageObj of data.response) {
		if (messageObj.message && messageObj.role) {
			await params.injectMessage(messageObj.message, 
				messageObj.role === "user" ? "user" : undefined
			);
		} else {
			console.warn('Invalid message structure:', messageObj);
		}
	}
}
```

### 5. Add Logging for Debugging

```javascript
// ✅ CORRECT: Comprehensive logging
export const getChatHistory = async (...) => {
	console.log('📜 [getChatHistory] Starting...');
	console.log('SessionId:', sessionId);
	console.log('CurrentPath:', currentPath);
	
	// ... logic ...
	
	console.log('✅ [getChatHistory] Completed');
};
```

### 6. Implement Error Boundaries

```javascript
// ✅ CORRECT: Graceful error handling
try {
	if (Array.isArray(data.response)) {
		for (const messageObj of data.response) {
			try {
				await params.injectMessage(messageObj.message, messageObj.role);
			} catch (msgError) {
				console.error('Failed to inject message:', msgError);
				// Continue with next message
			}
		}
	}
} catch (error) {
	console.error('History loading failed:', error);
	await params.injectMessage('Unable to load chat history.');
}
```

---

## Troubleshooting

### Issue 1: Messages Appear in Wrong Order

**Symptoms**: Chat history shows messages out of sequence

**Causes**:
- Missing `await` in message injection loop
- Backend returning unsorted messages

**Solution**:
```javascript
// Ensure await is used
for (const messageObj of data.response) {
	await params.injectMessage(messageObj.message, messageObj.role);
}

// Or sort messages by timestamp
const sortedMessages = data.response.sort((a, b) => 
	new Date(a.timestamp) - new Date(b.timestamp)
);
```

---

### Issue 2: Duplicate Messages on Reload

**Symptoms**: Same messages appear multiple times

**Causes**:
- Ref not properly tracking injection
- Flow restarting unexpectedly

**Solution**:
```javascript
// Check ref before injecting
if (hasInjectedRef.current) {
	console.log('Already injected, skipping...');
	return;
}

// Set ref immediately after starting injection
hasInjectedRef.current = true;
await getChatHistory(...);
```

---

### Issue 3: History Not Loading

**Symptoms**: Only welcome message appears, no history

**Causes**:
- SessionId not being sent correctly
- Backend not finding session
- API endpoint incorrect

**Solution**:
```javascript
// Add debug logging
console.log('Requesting history with:', {
	message: params.userInput,
	client_id: clientIdWithPath,
	sessionId: sessionId
});

// Verify API response
const data = await response.json();
console.log('API Response:', data);
console.log('Is Array?', Array.isArray(data.response));
```

---

### Issue 4: TypeError: Cannot Read 'message'

**Symptoms**: Error when processing response array

**Causes**:
- Backend returning unexpected structure
- Missing null checks

**Solution**:
```javascript
// Add validation
if (Array.isArray(data.response)) {
	for (const messageObj of data.response) {
		if (!messageObj || typeof messageObj !== 'object') {
			console.warn('Invalid message object:', messageObj);
			continue;
		}
		
		const { message, role } = messageObj;
		if (!message) {
			console.warn('Message text is missing:', messageObj);
			continue;
		}
		
		await params.injectMessage(message, role === "user" ? "user" : undefined);
	}
}
```

---

### Issue 5: Flow Not Starting

**Symptoms**: Chat history never loads, flow doesn't execute

**Causes**:
- `flowStartTrigger` not set correctly
- Component not mounting properly

**Solution**:
```javascript
// Verify flow trigger in config
settings: {
	general: {
		flowStartTrigger: 'ON_LOAD'  // Must be ON_LOAD
	}
}

// Add mount logging
useEffect(() => {
	console.log('ChatBot component mounted');
	console.log('Flow should start now...');
}, []);
```

---

## Advanced Features

### Feature 1: History Compression

```javascript
// Compress long history for better performance
export const compressHistory = (messages) => {
	const MAX_MESSAGES = 50;
	
	if (messages.length <= MAX_MESSAGES) {
		return messages;
	}
	
	// Keep first 10 and last 40 messages
	const firstMessages = messages.slice(0, 10);
	const lastMessages = messages.slice(-40);
	
	return [
		...firstMessages,
		{ role: 'system', message: `--- ${messages.length - 50} messages hidden ---` },
		...lastMessages
	];
};
```

---

### Feature 2: History Search

```javascript
// Add search functionality to history
export const searchHistory = async (searchTerm, sessionId) => {
	const response = await fetch('/api/search-history', {
		method: 'POST',
		body: JSON.stringify({
			session_id: sessionId,
			query: searchTerm
		})
	});
	
	const data = await response.json();
	return data.matches;
};
```

---

### Feature 3: History Export

```javascript
// Export chat history to file
export const exportHistory = async (sessionId) => {
	const response = await fetch('/api/chat-history', {
		method: 'POST',
		body: JSON.stringify({ session_id: sessionId })
	});
	
	const data = await response.json();
	
	// Convert to text format
	const historyText = data.messages
		.map(msg => `[${msg.role}]: ${msg.message}`)
		.join('\n\n');
	
	// Download as file
	const blob = new Blob([historyText], { type: 'text/plain' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `chat-history-${sessionId}.txt`;
	a.click();
};
```

---

## Summary

### What You've Implemented
✅ Chat history retrieval on chatbot load  
✅ Flow-based integration with start/loop blocks  
✅ Array response handling for multiple messages  
✅ String response handling for single messages  
✅ Role-based message injection (user vs assistant)  
✅ Sequential message rendering with proper order  
✅ Error handling and fallback messages  
✅ Duplicate prevention using refs  

### Key Files
1. **src/App.js** - Flow definition and integration
2. **src/services/chatService.js** - getChatHistory() and callAmaliaAPI()
3. **src/config/constants.js** - API endpoints and paths

### Critical Concepts
- **Flow blocks**: start (history) → loop (conversation)
- **injectMessage()**: Function to add messages to UI
- **Array vs String**: Backend can return either format
- **Role-based rendering**: "user" vs "assistant" messages
- **Sequential injection**: Always use `await` in loops

---

## Quick Reference

### Flow Structure
```javascript
const flow = {
	start: {
		message: async (params) => { /* fetch history */ },
		path: () => "loop"
	},
	loop: {
		message: async (params) => { /* handle messages */ },
		path: () => "loop"
	}
};
```

### Message Injection
```javascript
// Bot message
await params.injectMessage("Hello");

// User message
await params.injectMessage("Hi", "user");
```

### Response Handling
```javascript
if (Array.isArray(data.response)) {
	// History: loop and inject
	for (const msg of data.response) {
		await params.injectMessage(msg.message, msg.role === "user" ? "user" : undefined);
	}
} else {
	// Single message: inject directly
	await params.injectMessage(data.response);
}
```

---

**Document Version**: 1.0  
**Last Updated**: November 2024  
**Compatibility**: react-chatbotify 2.0+, React 18+
