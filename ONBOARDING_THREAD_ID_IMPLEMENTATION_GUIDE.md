# Onboarding Thread ID Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Implementation Steps](#implementation-steps)
4. [Code Examples](#code-examples)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## Overview

### What is onboardingThreadID?

The `onboardingThreadID` is a unique identifier that enables conversation continuity between a parent application and an embedded chatbot widget. It allows the chatbot to maintain context from a previous conversation thread, enabling seamless user experiences across different pages or sessions.

### Use Cases

- **Onboarding Flows**: Continue a guided onboarding conversation across multiple pages
- **Customer Support**: Resume support conversations when users navigate between pages
- **Multi-step Processes**: Maintain context during complex workflows
- **Cross-page Continuity**: Preserve conversation history when embedding the chatbot in different contexts

### Key Benefits

- ✅ Seamless conversation continuity
- ✅ Improved user experience
- ✅ Context preservation across page navigations
- ✅ Flexible integration with parent applications

---

## Architecture

### Component Overview

The onboarding thread ID feature consists of three main components:

```
┌─────────────────────────────────────────────────────────────┐
│                     Parent Application                       │
│  (Sends thread_id via postMessage)                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ postMessage({ type: "thread_id", value: "..." })
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Chatbot Widget (iframe)                   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  useParentMessaging Hook                             │  │
│  │  - Listens for postMessage events                    │  │
│  │  - Extracts onboardingThreadID                       │  │
│  │  - Stores in state                                   │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│                   ▼                                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  App Component                                       │  │
│  │  - Receives onboardingThreadID from hook             │  │
│  │  - Passes to chat flow functions                     │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│                   ▼                                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Chat Service (chatService.js)                       │  │
│  │  - getChatHistory: Uses threadID for initial load    │  │
│  │  - callAmaliaAPI: Sends threadID to backend          │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ POST /chat { onboarding_thread_id: "..." }
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API                             │
│  - Receives onboarding_thread_id                            │
│  - Retrieves conversation history                           │
│  - Continues conversation in same thread                    │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Parent → Widget**: Parent application sends thread ID via `postMessage`
2. **Widget Reception**: `useParentMessaging` hook captures and stores the thread ID
3. **Initial Load**: `getChatHistory` uses thread ID to fetch conversation history
4. **Ongoing Chat**: `callAmaliaAPI` includes thread ID in all API requests
5. **Backend Processing**: API uses thread ID to maintain conversation context

---

## Implementation Steps

### Step 1: Create the Parent Messaging Hook

Create a custom React hook to handle communication with the parent window.

**File**: `src/hooks/useParentMessaging.js`

```javascript
import { useState, useEffect } from 'react';

/**
 * Custom hook to handle messaging with parent window
 * @returns {Object} Object containing onboardingThreadID
 */
export const useParentMessaging = () => {
	const [onboardingThreadID, setOnboardingThreadID] = useState('');

	// Listen for messages from parent
	useEffect(() => {
		const handleMessage = (event) => {
			const { type, value } = event.data || {};
			
			if (type === "thread_id") {
				console.log('📨 Received thread_id from parent:', value);
				setOnboardingThreadID(value);
			} else if (type !== "viewportWidth" && type !== "rchat_widget_state" && type !== "initialWidgetState") {
				console.warn("⚠️ Unknown message type:", type);
			}
		};

		window.addEventListener("message", handleMessage);
		return () => window.removeEventListener("message", handleMessage);
	}, []);

	return { onboardingThreadID };
};
```

**Key Points**:
- Uses `useState` to store the thread ID
- Sets up a `message` event listener on window mount
- Filters for `thread_id` message type
- Cleans up event listener on unmount
- Ignores known system messages to reduce console noise

---

### Step 2: Integrate Hook in Main App Component

Import and use the hook in your main chatbot component.

**File**: `src/App.js`

```javascript
import React, { useRef, useState } from 'react';
import ChatBot from "react-chatbotify";
import { useParentMessaging } from './hooks/useParentMessaging';
import { callAmaliaAPI, getChatHistory } from './services/chatService';

const MyChatBot = () => {
	const [hasError, setHasError] = useState(false);
	const hasInjectedInitialMessages = useRef(false);

	// Get onboardingThreadID from parent window
	const { onboardingThreadID } = useParentMessaging();
	
	// Other hooks and state...
	const sessionId = useSessionManager();
	const currentPath = useCurrentPath();

	// Chat flow configuration
	const flow = {
		start: {
			message: async (params) => {
				// Pass onboardingThreadID to getChatHistory
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
				return "loop";
			},
		},
		loop: {
			message: async (params) => {
				// callAmaliaAPI will receive onboardingThreadID from params
				const success = await callAmaliaAPI(params, sessionId, currentPath);
				setHasError(!success);
			},
			path: () => {
				if (hasError) {
					return "start";
				}
				return "loop";
			}
		}
	};

	return (
		<ChatBot 
			settings={widgetConfig.settings}
			flow={flow}
		/>
	);
};

export default MyChatBot;
```

**Key Points**:
- Import `useParentMessaging` hook
- Destructure `onboardingThreadID` from hook
- Pass thread ID to `getChatHistory` function
- Thread ID flows through the chat flow automatically

---

### Step 3: Update Chat Service Functions

Modify your chat service to handle the onboarding thread ID.

**File**: `src/services/chatService.js`

```javascript
/**
 * Fetches chat history or sends initial greeting
 * @param {Object} params - Parameters object from chatbot
 * @param {Function} params.injectMessage - Function to inject messages
 * @param {string} currentPath - Current URL path
 * @param {string} onboardingThreadID - Thread ID from parent window
 * @param {string} sessionId - Session ID
 * @param {Object} hasInjectedRef - Ref to track if initial messages were injected
 * @returns {Promise<void>}
 */
export const getChatHistory = async (
	params, 
	currentPath, 
	onboardingThreadID, 
	sessionId, 
	hasInjectedRef
) => {
	console.log('📜 [getChatHistory] Starting to fetch chat history...');
	console.log('🔗 [getChatHistory] onboardingThreadID:', onboardingThreadID);

	// For special paths (e.g., designer), use default behavior
	if (currentPath === '/designer') {
		if (!hasInjectedRef.current) {
			await params.injectMessage("Welcome!");
			await params.injectMessage("Hello AI!", "user");
			hasInjectedRef.current = true;
		}
	} else {
		// For normal paths, fetch history with thread ID
		params.userInput = "mytripgreeting";
		params.onboardingThreadID = onboardingThreadID;
		await callAmaliaAPI(params, sessionId, currentPath);
	}
	
	console.log('✅ [getChatHistory] Chat history fetch completed');
};

/**
 * Calls the Amalia chat API
 * @param {Object} params - Parameters object from chatbot
 * @param {string} params.userInput - User's message
 * @param {Function} params.injectMessage - Function to inject messages into chat
 * @param {string} params.onboardingThreadID - Thread ID for onboarding
 * @param {string} sessionId - Session ID
 * @param {string} currentPath - Current URL path
 * @returns {Promise<boolean>} Success status
 */
export const callAmaliaAPI = async (params, sessionId, currentPath) => {
	console.log('🚀 [callAmaliaAPI] Starting API call...');
	console.log('🔗 [callAmaliaAPI] onboardingThreadID:', params.onboardingThreadID);

	const effectivePath = getEffectivePath(currentPath);
	const url = getChatApiUrl(effectivePath);
	const clientIdWithPath = `${sessionId || 'unknown_user_chatbotify'}-${effectivePath}`;

	try {
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
			if (Array.isArray(data.response)) {
				// Handle chat history array
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
				// Handle single message
				await params.injectMessage(data.response);
			}
			console.log('✅ [callAmaliaAPI] API call completed');
			return true;
		} else {
			throw new Error("Response did not include a reply field");
		}
	} catch (error) {
		console.error('❌ [callAmaliaAPI] Error:', error);
		await params.injectMessage("Unable to connect to the chat service. Please try again.");
		return false;
	}
};

/**
 * Helper function to get effective path
 * @param {string} currentPath - Current URL path
 * @returns {string} Effective path for API
 */
const getEffectivePath = (currentPath) => {
	// Remove leading slash and get path
	const path = currentPath.replace(/^\//, '');
	return path || 'default';
};

/**
 * Constructs the chat API URL based on the path
 * @param {string} effectivePath - Effective path for the API
 * @returns {string} Complete API URL
 */
const getChatApiUrl = (effectivePath) => {
	const baseUrl = 'https://chats.mytrip.ai';
	return effectivePath === 'assistant'
		? `${baseUrl}/assistant/chat`
		: `${baseUrl}/${effectivePath}-assistant/chat`;
};
```

**Key Points**:
- `getChatHistory` receives `onboardingThreadID` as parameter
- Attaches thread ID to `params.onboardingThreadID`
- `callAmaliaAPI` extracts thread ID from params
- Sends thread ID to backend as `onboarding_thread_id`
- Handles both single messages and message arrays (for history)
- Uses `|| null` to send null if thread ID is empty

---

### Step 4: Parent Application Integration

The parent application needs to send the thread ID to the chatbot widget.

**Example Parent Implementation**:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Parent Application</title>
</head>
<body>
    <h1>My Application</h1>
    
    <!-- Chatbot widget will be injected here -->
    <script>
        // Configuration for the chatbot widget
        window.rchatSettings = {
            slug: 'mycompany'  // Your chatbot slug
        };
    </script>
    
    <!-- Load the chatbot widget launcher -->
    <script src="https://rchat.mytrip.ai/widget/launch.js"></script>
    
    <script>
        // Function to send thread ID to chatbot
        function sendThreadIdToChatbot(threadId) {
            // Find the chatbot iframe
            const chatbotIframe = document.querySelector('iframe[src*="rchat.mytrip.ai"]');
            
            if (chatbotIframe && chatbotIframe.contentWindow) {
                // Send thread ID via postMessage
                chatbotIframe.contentWindow.postMessage({
                    type: 'thread_id',
                    value: threadId
                }, '*');
                
                console.log('✅ Sent thread_id to chatbot:', threadId);
            } else {
                console.warn('⚠️ Chatbot iframe not found');
            }
        }
        
        // Example: Send thread ID after iframe loads
        window.addEventListener('load', () => {
            // Wait for iframe to be ready
            setTimeout(() => {
                // Get thread ID from your application logic
                const threadId = getOnboardingThreadId(); // Your function
                
                if (threadId) {
                    sendThreadIdToChatbot(threadId);
                }
            }, 1000);
        });
        
        // Example function to get thread ID
        function getOnboardingThreadId() {
            // Option 1: From URL parameter
            const urlParams = new URLSearchParams(window.location.search);
            const threadId = urlParams.get('thread_id');
            
            // Option 2: From localStorage
            // const threadId = localStorage.getItem('onboarding_thread_id');
            
            // Option 3: From your backend/session
            // const threadId = window.userSession?.threadId;
            
            return threadId;
        }
    </script>
</body>
</html>
```

**Alternative: Dynamic Thread ID Updates**

If you need to update the thread ID dynamically (e.g., when user starts a new onboarding flow):

```javascript
class ChatbotController {
    constructor() {
        this.chatbotIframe = null;
        this.findChatbotIframe();
    }
    
    findChatbotIframe() {
        // Wait for iframe to be available
        const checkIframe = setInterval(() => {
            this.chatbotIframe = document.querySelector('iframe[src*="rchat.mytrip.ai"]');
            if (this.chatbotIframe) {
                clearInterval(checkIframe);
                console.log('✅ Chatbot iframe found');
            }
        }, 500);
    }
    
    sendThreadId(threadId) {
        if (this.chatbotIframe && this.chatbotIframe.contentWindow) {
            this.chatbotIframe.contentWindow.postMessage({
                type: 'thread_id',
                value: threadId
            }, '*');
            console.log('✅ Thread ID sent:', threadId);
        } else {
            console.error('❌ Chatbot iframe not available');
        }
    }
    
    updateThreadId(newThreadId) {
        this.sendThreadId(newThreadId);
    }
}

// Usage
const chatbot = new ChatbotController();

// Send initial thread ID
chatbot.sendThreadId('thread_12345');

// Update thread ID when needed
document.getElementById('startNewOnboarding').addEventListener('click', () => {
    const newThreadId = generateNewThreadId(); // Your function
    chatbot.updateThreadId(newThreadId);
});
```

---

### Step 5: Backend API Integration

Your backend API needs to handle the `onboarding_thread_id` parameter.

**Example Backend Implementation (Node.js/Express)**:

```javascript
// POST /chat endpoint
app.post('/chat', async (req, res) => {
    const { message, client_id, onboarding_thread_id } = req.body;
    
    console.log('Received chat request:', {
        message,
        client_id,
        onboarding_thread_id
    });
    
    try {
        let conversationHistory = [];
        let threadId = onboarding_thread_id;
        
        // If onboarding_thread_id is provided, retrieve conversation history
        if (onboarding_thread_id) {
            conversationHistory = await getConversationHistory(onboarding_thread_id);
            console.log(`Retrieved ${conversationHistory.length} messages from thread ${onboarding_thread_id}`);
        } else {
            // Create new thread if no thread ID provided
            threadId = await createNewThread(client_id);
            console.log(`Created new thread: ${threadId}`);
        }
        
        // Add user message to history
        conversationHistory.push({
            role: 'user',
            message: message
        });
        
        // Generate AI response using conversation history
        const aiResponse = await generateAIResponse(conversationHistory);
        
        // Save message and response to thread
        await saveToThread(threadId, message, aiResponse);
        
        // Return response
        res.json({
            response: aiResponse,
            thread_id: threadId
        });
        
    } catch (error) {
        console.error('Error processing chat:', error);
        res.status(500).json({
            error: 'Failed to process chat message'
        });
    }
});

// Helper function to get conversation history
async function getConversationHistory(threadId) {
    // Query your database for messages in this thread
    const messages = await db.query(
        'SELECT role, message FROM chat_messages WHERE thread_id = ? ORDER BY created_at ASC',
        [threadId]
    );
    
    return messages.map(msg => ({
        role: msg.role,
        message: msg.message
    }));
}

// Helper function to create new thread
async function createNewThread(clientId) {
    const threadId = generateUniqueId(); // Your ID generation logic
    
    await db.query(
        'INSERT INTO chat_threads (thread_id, client_id, created_at) VALUES (?, ?, NOW())',
        [threadId, clientId]
    );
    
    return threadId;
}

// Helper function to save messages to thread
async function saveToThread(threadId, userMessage, aiResponse) {
    await db.query(
        'INSERT INTO chat_messages (thread_id, role, message, created_at) VALUES (?, ?, ?, NOW()), (?, ?, ?, NOW())',
        [threadId, 'user', userMessage, threadId, 'assistant', aiResponse]
    );
}
```

**Database Schema Example**:

```sql
-- Chat threads table
CREATE TABLE chat_threads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    thread_id VARCHAR(255) UNIQUE NOT NULL,
    client_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_thread_id (thread_id),
    INDEX idx_client_id (client_id)
);

-- Chat messages table
CREATE TABLE chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    thread_id VARCHAR(255) NOT NULL,
    role ENUM('user', 'assistant') NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_thread_id (thread_id),
    FOREIGN KEY (thread_id) REFERENCES chat_threads(thread_id) ON DELETE CASCADE
);
```

---

## Code Examples

### Complete Integration Example

Here's a complete example showing all components working together:

**1. Parent Application (index.html)**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Onboarding Flow</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
        }
        .step {
            background: #f5f5f5;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
        }
        button {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>
    <h1>Welcome to Our Onboarding</h1>
    
    <div class="step">
        <h2>Step 1: Start Onboarding</h2>
        <p>Click below to start your onboarding conversation.</p>
        <button onclick="startOnboarding()">Start Onboarding</button>
    </div>
    
    <div class="step">
        <h2>Step 2: Continue on Next Page</h2>
        <p>After chatting, you can continue on another page.</p>
        <button onclick="goToNextPage()">Go to Next Page</button>
    </div>
    
    <div id="status"></div>
    
    <!-- Chatbot Configuration -->
    <script>
        window.rchatSettings = {
            slug: 'mycompany'
        };
    </script>
    
    <!-- Load Chatbot Widget -->
    <script src="https://rchat.mytrip.ai/widget/launch.js"></script>
    
    <!-- Onboarding Logic -->
    <script>
        let currentThreadId = null;
        
        function startOnboarding() {
            // Create new thread ID
            currentThreadId = 'thread_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            // Save to localStorage for persistence
            localStorage.setItem('onboarding_thread_id', currentThreadId);
            
            // Send to chatbot
            sendThreadIdToChatbot(currentThreadId);
            
            // Update status
            document.getElementById('status').innerHTML = 
                `<p style="color: green;">✅ Onboarding started! Thread ID: ${currentThreadId}</p>`;
        }
        
        function goToNextPage() {
            if (!currentThreadId) {
                currentThreadId = localStorage.getItem('onboarding_thread_id');
            }
            
            if (currentThreadId) {
                // Navigate to next page with thread ID
                window.location.href = `next-page.html?thread_id=${currentThreadId}`;
            } else {
                alert('Please start onboarding first!');
            }
        }
        
        function sendThreadIdToChatbot(threadId) {
            const chatbotIframe = document.querySelector('iframe[src*="rchat.mytrip.ai"]');
            
            if (chatbotIframe && chatbotIframe.contentWindow) {
                chatbotIframe.contentWindow.postMessage({
                    type: 'thread_id',
                    value: threadId
                }, '*');
                console.log('✅ Sent thread_id to chatbot:', threadId);
            } else {
                // Retry after a delay if iframe not ready
                setTimeout(() => sendThreadIdToChatbot(threadId), 500);
            }
        }
        
        // Check for existing thread on page load
        window.addEventListener('load', () => {
            const savedThreadId = localStorage.getItem('onboarding_thread_id');
            const urlParams = new URLSearchParams(window.location.search);
            const urlThreadId = urlParams.get('thread_id');
            
            currentThreadId = urlThreadId || savedThreadId;
            
            if (currentThreadId) {
                setTimeout(() => {
                    sendThreadIdToChatbot(currentThreadId);
                    document.getElementById('status').innerHTML = 
                        `<p style="color: blue;">🔄 Continuing thread: ${currentThreadId}</p>`;
                }, 1000);
            }
        });
    </script>
</body>
</html>
```

**2. Next Page (next-page.html)**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Onboarding - Step 2</title>
</head>
<body>
    <h1>Onboarding - Step 2</h1>
    <p>Your conversation continues here!</p>
    
    <button onclick="window.location.href='index.html'">Back to Step 1</button>
    
    <script>
        window.rchatSettings = {
            slug: 'mycompany'
        };
    </script>
    
    <script src="https://rchat.mytrip.ai/widget/launch.js"></script>
    
    <script>
        // Get thread ID from URL or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const threadId = urlParams.get('thread_id') || localStorage.getItem('onboarding_thread_id');
        
        if (threadId) {
            // Wait for iframe to load
            setTimeout(() => {
                const chatbotIframe = document.querySelector('iframe[src*="rchat.mytrip.ai"]');
                if (chatbotIframe && chatbotIframe.contentWindow) {
                    chatbotIframe.contentWindow.postMessage({
                        type: 'thread_id',
                        value: threadId
                    }, '*');
                    console.log('✅ Continuing thread:', threadId);
                }
            }, 1000);
        }
    </script>
</body>
</html>
```

---

## Testing

### Manual Testing Checklist

#### Test 1: Basic Thread ID Reception

1. **Setup**: Open browser console
2. **Action**: Load parent page with chatbot
3. **Verify**: 
   - Check console for "📨 Received thread_id from parent"
   - Verify thread ID value is correct

#### Test 2: API Request Includes Thread ID

1. **Setup**: Open Network tab in DevTools
2. **Action**: Send a message in the chatbot
3. **Verify**:
   - Find POST request to chat API
   - Check request payload includes `onboarding_thread_id`
   - Verify value matches sent thread ID

#### Test 3: Conversation Continuity

1. **Setup**: Start conversation with thread ID
2. **Action**: 
   - Send several messages
   - Navigate to different page
   - Send thread ID again
3. **Verify**:
   - Previous conversation loads
   - Context is maintained
   - No duplicate messages

#### Test 4: Missing Thread ID Handling

1. **Setup**: Load chatbot without sending thread ID
2. **Action**: Send a message
3. **Verify**:
   - Chatbot works normally
   - `onboarding_thread_id` is null in API request
   - New conversation starts

### Automated Testing

**Test File**: `src/hooks/useParentMessaging.test.js`

```javascript
import { renderHook, act } from '@testing-library/react-hooks';
import { useParentMessaging } from './useParentMessaging';

describe('useParentMessaging', () => {
    test('should initialize with empty thread ID', () => {
        const { result } = renderHook(() => useParentMessaging());
        expect(result.current.onboardingThreadID).toBe('');
    });
    
    test('should update thread ID when receiving message', () => {
        const { result } = renderHook(() => useParentMessaging());
        
        act(() => {
            window.postMessage({
                type: 'thread_id',
                value: 'test_thread_123'
            }, '*');
        });
        
        expect(result.current.onboardingThreadID).toBe('test_thread_123');
    });
    
    test('should ignore non-thread_id messages', () => {
        const { result } = renderHook(() => useParentMessaging());
        
        act(() => {
            window.postMessage({
                type: 'other_message',
                value: 'some_value'
            }, '*');
        });
        
        expect(result.current.onboardingThreadID).toBe('');
    });
});
```

**Test File**: `src/services/chatService.test.js`

```javascript
import { callAmaliaAPI, getChatHistory } from './chatService';

// Mock fetch
global.fetch = jest.fn();

describe('chatService', () => {
    beforeEach(() => {
        fetch.mockClear();
    });
    
    test('callAmaliaAPI should include onboarding_thread_id in request', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ response: 'Hello!' })
        });
        
        const params = {
            userInput: 'Hi',
            injectMessage: jest.fn(),
            onboardingThreadID: 'thread_123'
        };
        
        await callAmaliaAPI(params, 'session_1', '/test');
        
        expect(fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                body: expect.stringContaining('"onboarding_thread_id":"thread_123"')
            })
        );
    });
    
    test('callAmaliaAPI should send null when thread ID is empty', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ response: 'Hello!' })
        });
        
        const params = {
            userInput: 'Hi',
            injectMessage: jest.fn(),
            onboardingThreadID: ''
        };
        
        await callAmaliaAPI(params, 'session_1', '/test');
        
        expect(fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                body: expect.stringContaining('"onboarding_thread_id":null')
            })
        );
    });
});
```

### Integration Testing Script

```javascript
// integration-test.js
// Run with: node integration-test.js

const puppeteer = require('puppeteer');

async function testOnboardingThreadID() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    // Intercept network requests
    await page.setRequestInterception(true);
    let chatRequest = null;
    
    page.on('request', request => {
        if (request.url().includes('/chat')) {
            chatRequest = request.postData();
        }
        request.continue();
    });
    
    // Navigate to test page
    await page.goto('http://localhost:3000');
    
    // Wait for iframe
    await page.waitForSelector('iframe');
    
    // Send thread ID via postMessage
    await page.evaluate(() => {
        const iframe = document.querySelector('iframe');
        iframe.contentWindow.postMessage({
            type: 'thread_id',
            value: 'test_thread_12345'
        }, '*');
    });
    
    // Wait and verify
    await page.waitForTimeout(2000);
    
    // Check if request includes thread ID
    if (chatRequest && chatRequest.includes('test_thread_12345')) {
        console.log('✅ Test passed: Thread ID included in request');
    } else {
        console.log('❌ Test failed: Thread ID not found in request');
    }
    
    await browser.close();
}

testOnboardingThreadID();
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Thread ID Not Received

**Symptoms**:
- Console shows no "Received thread_id" message
- `onboardingThreadID` remains empty

**Solutions**:

1. **Check iframe timing**:
```javascript
// Wait for iframe to be fully loaded
window.addEventListener('load', () => {
    setTimeout(() => {
        sendThreadIdToChatbot(threadId);
    }, 1000); // Increase delay if needed
});
```

2. **Verify postMessage target**:
```javascript
// Make sure you're targeting the correct iframe
const iframe = document.querySelector('iframe[src*="rchat.mytrip.ai"]');
console.log('Iframe found:', iframe); // Should not be null

if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage({
        type: 'thread_id',
        value: threadId
    }, '*'); // Use specific origin in production: 'https://rchat.mytrip.ai'
}
```

3. **Check for CORS issues**:
```javascript
// In useParentMessaging.js, add origin validation
const handleMessage = (event) => {
    // In production, validate origin
    // if (event.origin !== 'https://yourparentdomain.com') return;
    
    console.log('Message received from:', event.origin);
    const { type, value } = event.data || {};
    // ...
};
```

#### Issue 2: Thread ID Not Sent to API

**Symptoms**:
- Thread ID received but not in API request
- Backend doesn't see `onboarding_thread_id`

**Solutions**:

1. **Verify params flow**:
```javascript
// In getChatHistory, add logging
export const getChatHistory = async (params, currentPath, onboardingThreadID, sessionId, hasInjectedRef) => {
    console.log('getChatHistory params:', params);
    console.log('onboardingThreadID:', onboardingThreadID);
    
    params.onboardingThreadID = onboardingThreadID;
    console.log('params after assignment:', params);
    
    await callAmaliaAPI(params, sessionId, currentPath);
};
```

2. **Check API request**:
```javascript
// In callAmaliaAPI, log the request body
const requestBody = {
    message: params.userInput,
    client_id: clientIdWithPath,
    onboarding_thread_id: params.onboardingThreadID || null,
};
console.log('API request body:', JSON.stringify(requestBody, null, 2));
```

#### Issue 3: Conversation History Not Loading

**Symptoms**:
- Thread ID sent correctly
- API receives thread ID
- But history doesn't appear

**Solutions**:

1. **Verify backend returns array**:
```javascript
// Backend should return array for history
{
    "response": [
        { "role": "user", "message": "Hello" },
        { "role": "assistant", "message": "Hi there!" }
    ]
}
```

2. **Check message injection**:
```javascript
// In callAmaliaAPI, verify array handling
if (Array.isArray(data.response)) {
    console.log('Processing history array:', data.response.length, 'messages');
    for (const messageObj of data.response) {
        console.log('Injecting message:', messageObj);
        // ...
    }
}
```

3. **Verify hasInjectedRef**:
```javascript
// Make sure ref isn't blocking re-injection
export const getChatHistory = async (params, currentPath, onboardingThreadID, sessionId, hasInjectedRef) => {
    console.log('hasInjectedRef.current:', hasInjectedRef.current);
    
    // For paths with thread ID, don't use the ref check
    if (currentPath === '/designer') {
        if (!hasInjectedRef.current) {
            // ...
        }
    } else {
        // Don't check hasInjectedRef here
        params.userInput = "mytripgreeting";
        params.onboardingThreadID = onboardingThreadID;
        await callAmaliaAPI(params, sessionId, currentPath);
    }
};
```

#### Issue 4: Multiple Threads Created

**Symptoms**:
- New thread created on each page load
- Conversation doesn't continue

**Solutions**:

1. **Persist thread ID**:
```javascript
// Store in localStorage
function startOnboarding() {
    const threadId = generateThreadId();
    localStorage.setItem('onboarding_thread_id', threadId);
    sendThreadIdToChatbot(threadId);
}

// Retrieve on page load
window.addEventListener('load', () => {
    const threadId = localStorage.getItem('onboarding_thread_id');
    if (threadId) {
        sendThreadIdToChatbot(threadId);
    }
});
```

2. **Use URL parameters**:
```javascript
// Pass thread ID in URL
function navigateToNextStep(threadId) {
    window.location.href = `next-step.html?thread_id=${threadId}`;
}

// Read from URL
const urlParams = new URLSearchParams(window.location.search);
const threadId = urlParams.get('thread_id');
```

#### Issue 5: Security Concerns with postMessage

**Symptoms**:
- Security warnings
- Concerns about message origin

**Solutions**:

1. **Validate message origin**:
```javascript
// In useParentMessaging.js
const handleMessage = (event) => {
    // Validate origin in production
    const allowedOrigins = [
        'https://yourparentdomain.com',
        'https://www.yourparentdomain.com'
    ];
    
    if (!allowedOrigins.includes(event.origin)) {
        console.warn('Message from unauthorized origin:', event.origin);
        return;
    }
    
    const { type, value } = event.data || {};
    // ...
};
```

2. **Use specific target origin**:
```javascript
// In parent application
iframe.contentWindow.postMessage({
    type: 'thread_id',
    value: threadId
}, 'https://rchat.mytrip.ai'); // Specific origin instead of '*'
```

### Debug Mode

Add a debug mode to help troubleshoot issues:

```javascript
// In useParentMessaging.js
export const useParentMessaging = (debug = false) => {
    const [onboardingThreadID, setOnboardingThreadID] = useState('');

    useEffect(() => {
        const handleMessage = (event) => {
            if (debug) {
                console.log('🔍 [DEBUG] Message received:', {
                    origin: event.origin,
                    data: event.data
                });
            }
            
            const { type, value } = event.data || {};
            
            if (type === "thread_id") {
                if (debug) {
                    console.log('🔍 [DEBUG] Setting thread ID:', value);
                }
                setOnboardingThreadID(value);
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [debug]);

    if (debug) {
        console.log('🔍 [DEBUG] Current thread ID:', onboardingThreadID);
    }

    return { onboardingThreadID };
};

// Usage in App.js
const { onboardingThreadID } = useParentMessaging(true); // Enable debug mode
```

---

## Best Practices

### 1. Thread ID Generation

Generate unique, collision-resistant thread IDs:

```javascript
function generateThreadId() {
    // Combine timestamp with random string
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const threadId = `thread_${timestamp}_${random}`;
    return threadId;
}

// Alternative: Use UUID
import { v4 as uuidv4 } from 'uuid';
const threadId = `thread_${uuidv4()}`;
```

### 2. Error Handling

Always handle errors gracefully:

```javascript
export const callAmaliaAPI = async (params, sessionId, currentPath) => {
    try {
        // API call logic...
    } catch (error) {
        console.error('❌ [callAmaliaAPI] Error:', error);
        
        // User-friendly error message
        await params.injectMessage(
            "I'm having trouble connecting right now. Please try again in a moment."
        );
        
        // Optional: Send error to monitoring service
        // sendToErrorTracking(error, { threadId: params.onboardingThreadID });
        
        return false;
    }
};
```

### 3. Performance Optimization

Avoid unnecessary re-renders and API calls:

```javascript
// Use useCallback for message handler
import { useState, useEffect, useCallback } from 'react';

export const useParentMessaging = () => {
    const [onboardingThreadID, setOnboardingThreadID] = useState('');

    const handleMessage = useCallback((event) => {
        const { type, value } = event.data || {};
        
        if (type === "thread_id") {
            setOnboardingThreadID(value);
        }
    }, []);

    useEffect(() => {
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [handleMessage]);

    return { onboardingThreadID };
};
```

### 4. Security

Implement proper security measures:

```javascript
// 1. Validate origin
const ALLOWED_ORIGINS = [
    'https://yourapp.com',
    'https://www.yourapp.com',
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null
].filter(Boolean);

const handleMessage = (event) => {
    if (!ALLOWED_ORIGINS.includes(event.origin)) {
        console.warn('Rejected message from:', event.origin);
        return;
    }
    // Process message...
};

// 2. Sanitize thread ID
function sanitizeThreadId(threadId) {
    // Only allow alphanumeric, hyphens, and underscores
    return threadId.replace(/[^a-zA-Z0-9_-]/g, '');
}

// 3. Validate thread ID format
function isValidThreadId(threadId) {
    // Check format: thread_timestamp_random
    const pattern = /^thread_\d+_[a-z0-9]+$/;
    return pattern.test(threadId);
}
```

### 5. Logging and Monitoring

Implement comprehensive logging:

```javascript
// Create a logger utility
const logger = {
    info: (message, data) => {
        console.log(`ℹ️ [INFO] ${message}`, data);
        // Send to monitoring service
    },
    error: (message, error, data) => {
        console.error(`❌ [ERROR] ${message}`, error, data);
        // Send to error tracking service
    },
    debug: (message, data) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`🔍 [DEBUG] ${message}`, data);
        }
    }
};

// Use in code
export const callAmaliaAPI = async (params, sessionId, currentPath) => {
    logger.info('Starting API call', {
        threadId: params.onboardingThreadID,
        sessionId,
        currentPath
    });
    
    try {
        // API logic...
        logger.info('API call successful', { threadId: params.onboardingThreadID });
    } catch (error) {
        logger.error('API call failed', error, {
            threadId: params.onboardingThreadID,
            sessionId
        });
    }
};
```

---

## Additional Resources

### Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-chatbotify": "^2.0.0-beta.26"
  }
}
```

### Environment Variables

```bash
# .env file
REACT_APP_CHAT_API_URL=https://chats.mytrip.ai
REACT_APP_ALLOWED_ORIGINS=https://yourapp.com,https://www.yourapp.com
```

### File Structure

```
my-chatbot-app/
├── src/
│   ├── hooks/
│   │   ├── useParentMessaging.js      # Thread ID reception
│   │   ├── useSessionManager.js        # Session management
│   │   └── useCurrentPath.js           # Path detection
│   ├── services/
│   │   └── chatService.js              # API calls with thread ID
│   ├── config/
│   │   └── constants.js                # Configuration constants
│   └── App.js                          # Main component
├── widget/
│   └── launch.js                       # Widget launcher script
├── public/
│   └── index.html                      # HTML template
└── package.json
```

---

## Summary

The onboarding thread ID feature enables seamless conversation continuity across pages and sessions. Key components:

1. **useParentMessaging Hook**: Receives thread ID from parent via postMessage
2. **Chat Service**: Sends thread ID to backend API
3. **Backend API**: Uses thread ID to retrieve and maintain conversation history
4. **Parent Application**: Sends thread ID to chatbot widget

By following this guide, you can integrate the onboarding thread ID feature into any React chatbot application, providing users with a continuous and contextual conversation experience.
