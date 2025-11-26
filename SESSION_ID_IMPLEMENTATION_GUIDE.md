# Session ID Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Implementation Steps](#implementation-steps)
4. [Code Examples](#code-examples)
5. [Testing](#testing)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Overview

### What is a Session ID?
A **Session ID** is a unique identifier that tracks a user's interaction session with the chatbot. It enables:
- **Conversation continuity**: Maintain chat history across page reloads
- **User tracking**: Identify unique users without authentication
- **Analytics**: Track user behavior and engagement patterns
- **API correlation**: Link frontend interactions with backend chat services

### Session ID Format
```
session_<timestamp>_<uuid>
```
Example: `session_1732584240123_a1b2c3d4-e5f6-7890-abcd-ef1234567890`

---

## Architecture

### Component Structure
```
src/
├── hooks/
│   └── useSessionManager.js       # React hook for session management
├── utils/
│   └── sessionHelpers.js          # Core session logic
├── services/
│   └── chatService.js             # API integration with sessionId
└── App.js                         # Main component using sessionId
```

### Data Flow
```
1. App Component Mounts
   ↓
2. useSessionManager Hook Executes
   ↓
3. getOrCreateSessionId() Called
   ↓
4. Check localStorage for existing sessionId
   ↓
5a. Found → Return existing sessionId
5b. Not Found → Generate new sessionId → Save to localStorage
   ↓
6. SessionId Available in App Component
   ↓
7. Pass sessionId to API Calls (callAmaliaAPI, getChatHistory)
   ↓
8. Backend receives client_id with sessionId
```

---

## Implementation Steps

### Step 1: Install Dependencies

```bash
npm install uuid
```

**Why uuid?** The `uuid` library generates RFC4122 compliant universally unique identifiers, ensuring no collisions between sessions.

---

### Step 2: Create Session Helper Utilities

**File**: `src/utils/sessionHelpers.js`

```javascript
import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique session ID
 * @returns {string} Session ID with timestamp and UUID
 */
export const generateSessionId = () => {
	const randomUUID = uuidv4();
	const timestamp = Date.now();
	return `session_${timestamp}_${randomUUID}`;
};

/**
 * Gets or creates a session ID from localStorage
 * @returns {string} Session ID
 */
export const getOrCreateSessionId = () => {
	const existingSessionId = localStorage.getItem('sessionId');
	if (existingSessionId) {
		return existingSessionId;
	}
	
	const newSessionId = generateSessionId();
	localStorage.setItem('sessionId', newSessionId);
	return newSessionId;
};
```

**Key Points:**
- **generateSessionId()**: Creates a new unique identifier combining timestamp and UUID
  - Timestamp: Provides chronological ordering
  - UUID: Ensures uniqueness across different browsers/devices
- **getOrCreateSessionId()**: Implements the "get or create" pattern
  - Checks localStorage first (persistence)
  - Creates new session only if none exists
  - Automatically saves new sessions to localStorage

---

### Step 3: Create Session Manager Hook

**File**: `src/hooks/useSessionManager.js`

```javascript
import { useState, useEffect } from 'react';
import { getOrCreateSessionId } from '../utils/sessionHelpers';

/**
 * Custom hook to manage session ID
 * @returns {string} Session ID
 */
export const useSessionManager = () => {
	const [sessionId, setSessionId] = useState('');

	useEffect(() => {
		const id = getOrCreateSessionId();
		setSessionId(id);
	}, []);

	return sessionId;
};
```

**Key Points:**
- **useState('')**: Initializes with empty string to prevent undefined errors
- **useEffect with empty deps []**: Runs only once on component mount
- **Returns sessionId**: Makes it available to parent component
- **React Hook Pattern**: Encapsulates session logic for reusability

---

### Step 4: Integrate Session ID in Main Component

**File**: `src/App.js`

```javascript
import React from 'react';
import { useSessionManager } from './hooks/useSessionManager';
import { callAmaliaAPI, getChatHistory } from './services/chatService';

const MyChatBot = () => {
	// Get or create session ID
	const sessionId = useSessionManager();

	// Chat flow configuration
	const flow = {
		start: {
			message: async (params) => {
				// Pass sessionId to get chat history
				await getChatHistory(params, currentPath, onboardingThreadID, sessionId, hasInjectedInitialMessages);
			},
			path: () => "loop",
		},
		loop: {
			message: async (params) => {
				// Pass sessionId to API calls
				const success = await callAmaliaAPI(params, sessionId, currentPath);
			},
			path: () => "loop"
		}
	};

	return <ChatBot flow={flow} />;
};

export default MyChatBot;
```

**Key Points:**
- Import `useSessionManager` hook
- Call hook at component level: `const sessionId = useSessionManager();`
- Pass `sessionId` to all API service functions
- SessionId is available throughout component lifecycle

---

### Step 5: Update API Service Layer

**File**: `src/services/chatService.js`

```javascript
/**
 * Calls the Amalia chat API
 * @param {Object} params - Parameters object
 * @param {string} params.userInput - User's message
 * @param {Function} params.injectMessage - Function to inject messages into chat
 * @param {string} sessionId - Session ID
 * @param {string} currentPath - Current URL path
 * @returns {Promise<boolean>} Success status
 */
export const callAmaliaAPI = async (params, sessionId, currentPath) => {
	const effectivePath = getEffectivePath(currentPath);
	const url = getChatApiUrl(effectivePath);
	
	// Construct client_id with sessionId and path
	const clientIdWithPath = `${sessionId || 'unknown_user_chatbotify'}-${effectivePath}`;

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				message: params.userInput,
				client_id: clientIdWithPath,  // Include sessionId here
				onboarding_thread_id: params.onboardingThreadID || null,
			}),
		});

		if (!response.ok) {
			throw new Error(`Error: ${response.statusText}`);
		}

		const data = await response.json();
		
		if (data.response) {
			await params.injectMessage(data.response);
			return true;
		} else {
			throw new Error("Response did not include a reply field");
		}
	} catch (error) {
		console.error(error);
		await params.injectMessage("Unable to connect to the chat service. Please try again.");
		return false;
	}
};

/**
 * Fetches chat history or sends initial greeting
 * @param {Object} params - Parameters object
 * @param {Function} params.injectMessage - Function to inject messages
 * @param {string} currentPath - Current URL path
 * @param {string} onboardingThreadID - Thread ID
 * @param {string} sessionId - Session ID
 * @param {Object} hasInjectedRef - Ref to track if initial messages were injected
 * @returns {Promise<void>}
 */
export const getChatHistory = async (params, currentPath, onboardingThreadID, sessionId, hasInjectedRef) => {
	// Use sessionId for fetching chat history
	params.userInput = "mytripgreeting";
	params.onboardingThreadID = onboardingThreadID;
	await callAmaliaAPI(params, sessionId, currentPath);
};
```

**Key Points:**
- **client_id construction**: Combines sessionId with path for context-aware tracking
- **Fallback value**: Uses `'unknown_user_chatbotify'` if sessionId is empty
- **Consistent parameter passing**: All API functions receive sessionId
- **Backend integration**: SessionId sent as `client_id` in request body

---

## Code Examples

### Example 1: Basic Integration (Minimal Setup)

```javascript
// App.js
import React from 'react';
import { useSessionManager } from './hooks/useSessionManager';

function App() {
	const sessionId = useSessionManager();
	
	const sendMessage = async (message) => {
		const response = await fetch('/api/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				message: message,
				session_id: sessionId
			})
		});
		return response.json();
	};
	
	return <div>Session ID: {sessionId}</div>;
}
```

---

### Example 2: Session Reset Functionality

```javascript
// sessionHelpers.js - Add this function
/**
 * Clears the current session and generates a new one
 * @returns {string} New session ID
 */
export const resetSession = () => {
	localStorage.removeItem('sessionId');
	const newSessionId = generateSessionId();
	localStorage.setItem('sessionId', newSessionId);
	return newSessionId;
};

// Usage in component
import { resetSession } from './utils/sessionHelpers';

const handleResetChat = () => {
	const newSessionId = resetSession();
	setSessionId(newSessionId);
	// Clear chat history UI
};
```

---

### Example 3: Session Expiration (Advanced)

```javascript
// sessionHelpers.js - Enhanced version with expiration
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const getOrCreateSessionId = () => {
	const sessionData = localStorage.getItem('sessionData');
	
	if (sessionData) {
		const { sessionId, timestamp } = JSON.parse(sessionData);
		const now = Date.now();
		
		// Check if session is still valid
		if (now - timestamp < SESSION_DURATION) {
			return sessionId;
		}
	}
	
	// Create new session
	const newSessionId = generateSessionId();
	const sessionData = {
		sessionId: newSessionId,
		timestamp: Date.now()
	};
	localStorage.setItem('sessionData', JSON.stringify(sessionData));
	return newSessionId;
};
```

---

### Example 4: Multi-Tab Session Sharing

```javascript
// sessionHelpers.js - Add storage event listener
export const useSessionSync = () => {
	const [sessionId, setSessionId] = useState('');
	
	useEffect(() => {
		// Initial load
		const id = getOrCreateSessionId();
		setSessionId(id);
		
		// Listen for changes from other tabs
		const handleStorageChange = (e) => {
			if (e.key === 'sessionId' && e.newValue) {
				setSessionId(e.newValue);
			}
		};
		
		window.addEventListener('storage', handleStorageChange);
		return () => window.removeEventListener('storage', handleStorageChange);
	}, []);
	
	return sessionId;
};
```

---

## Testing

### Manual Testing Checklist

#### Test 1: New Session Creation
1. Open browser DevTools → Application → Local Storage
2. Clear all localStorage data
3. Refresh the page
4. **Expected**: New sessionId appears in localStorage
5. **Verify**: SessionId format matches `session_<timestamp>_<uuid>`

#### Test 2: Session Persistence
1. Note the current sessionId from localStorage
2. Refresh the page multiple times
3. **Expected**: SessionId remains unchanged
4. **Verify**: Same sessionId used across page reloads

#### Test 3: API Integration
1. Open browser DevTools → Network tab
2. Send a chat message
3. Inspect the POST request to chat API
4. **Expected**: Request body contains `client_id` with sessionId
5. **Verify**: Format is `session_<timestamp>_<uuid>-<path>`

#### Test 4: Multiple Browser Sessions
1. Open the app in Browser A
2. Note sessionId in localStorage
3. Open the app in Browser B (different browser or incognito)
4. **Expected**: Different sessionId in Browser B
5. **Verify**: Each browser has unique sessionId

---

### Automated Testing

**File**: `src/utils/sessionHelpers.test.js`

```javascript
import { generateSessionId, getOrCreateSessionId } from './sessionHelpers';

describe('Session Helpers', () => {
	beforeEach(() => {
		localStorage.clear();
	});
	
	test('generateSessionId creates valid format', () => {
		const sessionId = generateSessionId();
		expect(sessionId).toMatch(/^session_\d+_[a-f0-9-]{36}$/);
	});
	
	test('getOrCreateSessionId creates new session when none exists', () => {
		const sessionId = getOrCreateSessionId();
		expect(sessionId).toBeTruthy();
		expect(localStorage.getItem('sessionId')).toBe(sessionId);
	});
	
	test('getOrCreateSessionId returns existing session', () => {
		const firstSessionId = getOrCreateSessionId();
		const secondSessionId = getOrCreateSessionId();
		expect(firstSessionId).toBe(secondSessionId);
	});
	
	test('each generated sessionId is unique', () => {
		const id1 = generateSessionId();
		const id2 = generateSessionId();
		expect(id1).not.toBe(id2);
	});
});
```

**Run tests:**
```bash
npm test
```

---

## Best Practices

### 1. Error Handling
Always provide fallback values when sessionId might be empty:

```javascript
const clientId = sessionId || 'anonymous_user';
```

### 2. Privacy Considerations
- SessionIds are stored in localStorage (client-side only)
- No personally identifiable information (PII) in sessionId
- Clear sessions on logout if authentication is added

### 3. Performance
- Session lookup is synchronous (localStorage is fast)
- Hook runs only once per component mount
- No unnecessary re-renders

### 4. Debugging
Add console logs during development:

```javascript
export const getOrCreateSessionId = () => {
	const existingSessionId = localStorage.getItem('sessionId');
	if (existingSessionId) {
		console.log('📋 Using existing session:', existingSessionId);
		return existingSessionId;
	}
	
	const newSessionId = generateSessionId();
	localStorage.setItem('sessionId', newSessionId);
	console.log('🆕 Created new session:', newSessionId);
	return newSessionId;
};
```

### 5. Security
- Don't expose sessionId in URLs (use localStorage)
- Validate sessionId format on backend
- Implement rate limiting per sessionId
- Consider session expiration for long-running apps

---

## Troubleshooting

### Issue 1: SessionId is Empty String

**Symptoms**: API calls fail, `client_id` is `undefined-path`

**Causes**:
- Hook not called at component level
- Component renders before useEffect completes

**Solution**:
```javascript
// Add loading state
const sessionId = useSessionManager();

if (!sessionId) {
	return <div>Loading...</div>;
}
```

---

### Issue 2: SessionId Changes on Every Reload

**Symptoms**: Chat history lost, new session each time

**Causes**:
- localStorage not persisting (private browsing mode)
- localStorage being cleared by another script

**Solution**:
```javascript
// Check if localStorage is available
const isLocalStorageAvailable = () => {
	try {
		const test = '__test__';
		localStorage.setItem(test, test);
		localStorage.removeItem(test);
		return true;
	} catch (e) {
		return false;
	}
};

export const getOrCreateSessionId = () => {
	if (!isLocalStorageAvailable()) {
		console.warn('localStorage not available, using session storage');
		// Fallback to sessionStorage or in-memory storage
	}
	// ... rest of implementation
};
```

---

### Issue 3: Multiple Sessions in Different Tabs

**Symptoms**: Each tab has different sessionId

**Expected Behavior**: This is normal! Each tab should have its own session.

**If you want shared sessions**: Use the multi-tab sync example from Code Examples section.

---

### Issue 4: UUID Import Error

**Symptoms**: `Module not found: Can't resolve 'uuid'`

**Solution**:
```bash
npm install uuid
# or
yarn add uuid
```

---

## Advanced Features

### Feature 1: Session Analytics

```javascript
// Track session metrics
export const trackSessionMetrics = (sessionId) => {
	const metrics = {
		sessionId,
		startTime: Date.now(),
		messageCount: 0,
		lastActivity: Date.now()
	};
	
	localStorage.setItem('sessionMetrics', JSON.stringify(metrics));
};

export const updateSessionActivity = () => {
	const metrics = JSON.parse(localStorage.getItem('sessionMetrics') || '{}');
	metrics.lastActivity = Date.now();
	metrics.messageCount = (metrics.messageCount || 0) + 1;
	localStorage.setItem('sessionMetrics', JSON.stringify(metrics));
};
```

---

### Feature 2: Session Migration

```javascript
// Migrate anonymous session to authenticated user
export const migrateSession = (userId) => {
	const anonymousSessionId = localStorage.getItem('sessionId');
	
	// Send to backend to link sessions
	fetch('/api/migrate-session', {
		method: 'POST',
		body: JSON.stringify({
			anonymous_session_id: anonymousSessionId,
			user_id: userId
		})
	});
	
	// Update sessionId with user identifier
	const newSessionId = `user_${userId}_${Date.now()}`;
	localStorage.setItem('sessionId', newSessionId);
	return newSessionId;
};
```

---

### Feature 3: Session Backup

```javascript
// Backup session to server
export const backupSession = async (sessionId) => {
	const sessionData = {
		sessionId,
		timestamp: Date.now(),
		chatHistory: localStorage.getItem('chatHistory'),
		preferences: localStorage.getItem('userPreferences')
	};
	
	await fetch('/api/backup-session', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(sessionData)
	});
};
```

---

## Summary

### What You've Implemented
✅ Unique session ID generation using UUID  
✅ Persistent storage using localStorage  
✅ React hook for easy integration  
✅ API integration with session tracking  
✅ Fallback handling for edge cases  

### Key Files Created
1. `src/utils/sessionHelpers.js` - Core session logic
2. `src/hooks/useSessionManager.js` - React hook wrapper
3. Updated `src/services/chatService.js` - API integration
4. Updated `src/App.js` - Component integration

### Next Steps
- Implement session expiration if needed
- Add session analytics tracking
- Consider backend session validation
- Add user authentication migration path

---

## Quick Reference

### Import Statements
```javascript
// In App.js
import { useSessionManager } from './hooks/useSessionManager';

// In other utilities
import { getOrCreateSessionId, generateSessionId } from './utils/sessionHelpers';
```

### Usage Pattern
```javascript
const sessionId = useSessionManager();
// sessionId is available after first render
```

### localStorage Key
```javascript
localStorage.getItem('sessionId')  // Read
localStorage.setItem('sessionId', value)  // Write
localStorage.removeItem('sessionId')  // Clear
```

---

**Document Version**: 1.0  
**Last Updated**: November 2024  
**Compatibility**: React 18+, Modern Browsers with localStorage support
