# Integration Analysis: Chat & Handoff Flow

## Executive Summary

This document provides a complete analysis of the integration between:
1. **React Chat Widget** (react-chatbotify) - Customer-facing interface
2. **Assistant Server** (Flask) - AI orchestration & handoff coordination
3. **CRM Monorepo** (React + Express) - Operator dashboard

Based on the postmortem and code analysis, the key integration issues identified are:

### Critical Issues Identified

1. **Endpoint Confusion** - Multiple routing patterns causing misrouted requests
2. **Client Resolution Failures** - Empty CLIENTS_JSON causing fallback API lookups
3. **Tenant Naming Drift** - Inconsistent tenant ID formats across systems
4. **Missing Request Logging** - Difficult to trace client/tenant/assistant selection
5. **CORS Wide Open** - Security vulnerability with `cors_allowed_origins='*'`

### Status
- ✅ **Handoff via REST API works** - `/api/handoff/request` triggers CRM modal
- ✅ **WebSocket room joins work** - CRM joins `tenant:tenant-undiscovered-2`
- ✅ **E2E integration tests pass** - Handoff API contracts validated
- ❌ **Conversational trigger fails** - Chat endpoint freezes with "Invalid client name"
- ❌ **Client name resolution** - `CLIENTS_JSON` empty causes timeout

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         CUSTOMER JOURNEY                                  │
└──────────────────────────────────────────────────────────────────────────┘

Customer on Website (e.g., undiscoveredmountains.com)
    │
    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ React Chat Widget (Port 5173 - Dev / Embedded in Production)           │
│ - React 18 + TypeScript + Socket.IO Client                              │
│ - HandoffService manages WebSocket connection                           │
│ - Sends HTTP POST for chat messages                                     │
│ - Listens for operator_message, conversation_mode_changed events        │
└─────────────────────────────────────────────────────────────────────────┘
    │                                           ↑
    │ HTTP POST /tenant-undiscovered-2/chat    │ WebSocket Events
    │ (message, client_id, tenant_id)          │ (operator messages)
    ↓                                           │
┌─────────────────────────────────────────────────────────────────────────┐
│ Assistant Server (Flask - Port 8001)                                    │
│ - OpenAI Assistant API orchestration                                    │
│ - Handoff state machine (Redis + MongoDB)                               │
│ - WebSocket server (Socket.IO)                                          │
│ - Function calling (40+ travel functions)                               │
└─────────────────────────────────────────────────────────────────────────┘
    │                                           ↑
    │ WebSocket Events                          │ HTTP Proxy
    │ (handoff_request, customer_message)       │ (GET/POST/PUT)
    ↓                                           │
┌─────────────────────────────────────────────────────────────────────────┐
│ CRM Monorepo (React - Port 5174, Express - Port 3001)                  │
│ - Operator dashboard (HandoffModal, OperatorComposer)                   │
│ - Express middleware proxies to Assistant Server                        │
│ - Socket.IO client for real-time updates                                │
│ - JWT authentication for operators                                      │
└─────────────────────────────────────────────────────────────────────────┘

Operator (Travel Specialist)
```

---

## Flow 1: Normal AI Chat Conversation

### Step-by-Step Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 1: Customer Opens Widget                                           │
└─────────────────────────────────────────────────────────────────────────┘

Widget Component Mounts
    ↓
useSessionManager creates/retrieves session ID
    session_1733500000_abc123
    ↓
getChatHistory() called on flow.start
    ↓
Sends special greeting message: "mytripgreeting"

┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 2: Chat History Request (HTTP)                                     │
└─────────────────────────────────────────────────────────────────────────┘

Widget → Assistant Server
    POST http://localhost:8001/tenant-undiscovered-2/chat
    Headers: Content-Type: application/json
    Body: {
        "message": "mytripgreeting",
        "client_id": "session_1733500000_abc123-/amalia",
        "tenant_id": "tenant-undiscovered-2",
        "onboarding_thread_id": null
    }

Assistant Server Processing:
    1. Extract client_name from route: "tenant-undiscovered-2"
    2. Look up in CLIENTS_JSON → NOT FOUND (empty dict)
    3. Use OPENAI_API_KEY from environment
    4. Try to resolve assistant_id:
        - Clean client_name: "tenant-undiscovered-2" (strip "-assistant")
        - Call assistant.create_assistant(chat_client, "tenant-undiscovered-2")
        - This queries MongoDB assistants collection OR calls platform API
        - ⚠️ ISSUE: If assistant not found, uses DEFAULT_ASSISTANT_ID fallback
    5. Check if thread_id exists in MongoDB (request_thread collection)
        - If not found, create new OpenAI thread
    6. Special handling for "mytripgreeting":
        - Call get_thread_chat_history()
        - Return array of previous messages if any exist
    7. If no history, return fast greeting (for specific clients like undiscoveredmountains)

Response:
    200 OK
    {
        "thread_id": "thread_abc123xyz",
        "response": "Hello! I'm Heidi, your AI Trip Planner. How can I assist you in planning your next adventure?"
    }

Widget Processing:
    - Receives thread_id → connects HandoffService WebSocket
    - Injects AI message into chat UI

┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 3: Customer Asks Question (HTTP)                                   │
└─────────────────────────────────────────────────────────────────────────┘

Widget → Assistant Server
    POST http://localhost:8001/tenant-undiscovered-2/chat
    Body: {
        "message": "I want to plan a trip to the French Alps in July",
        "client_id": "session_1733500000_abc123-/amalia",
        "tenant_id": "tenant-undiscovered-2",
        "onboarding_thread_id": "thread_abc123xyz"
    }

Assistant Server Processing:
    1. Extract tenant_id from client_name
    2. Check conversation mode via should_route_to_ai():
        - Get mode from state_machine.get_mode_sync(thread_id)
        - If version == 0 (NEW conversation):
            → Use mode_router.get_initial_mode(tenant_id)
            → Check tenant_timeout_config.schedule_mode
            → If "business_hours", check current time against weekly_schedule
            → Return "ai" or "human" based on schedule
        - If mode == "human" or "handoff_pending":
            → Emit customer_message to operators via WebSocket
            → Return "[HUMAN_MODE]" to customer (no AI processing)
    3. If mode == "ai", proceed with OpenAI Assistant:
        - Add message to thread
        - Create run with additional_instructions
        - Add handoff instruction if ENABLE_HUMAN_HANDOFF=true
        - Poll run status (1 second intervals)
        - Execute function calls if requires_action
        - Retrieve final response
    4. After getting AI response:
        - Check for handoff trigger patterns:
            → "[HANDOFF]", "connecting you to", "transfer you to", etc.
        - If detected, call create_handoff_from_ai_response():
            → Create handoff_requests document in MongoDB
            → Transition mode to "handoff_pending"
            → Emit handoff_request event to operators
    5. Save message to Google Sheets (logging)
    6. Emit WebSocket message to tenant room (for CRM visibility)

Response:
    200 OK
    {
        "thread_id": "thread_abc123xyz",
        "response": "That sounds wonderful! July is a perfect time to explore the French Alps. Let me help you plan your adventure. What type of activities are you interested in? Hiking, skiing, cultural tours, or a mix of everything?"
    }

Widget Processing:
    - Inject AI message into chat
    - User continues conversation

┌─────────────────────────────────────────────────────────────────────────┐
│ KEY DECISION POINTS                                                      │
└─────────────────────────────────────────────────────────────────────────┘

At each chat request, the Assistant Server decides:

1. Route to AI or Human?
    - Check conversation_modes collection for current mode
    - If new conversation (version==0), use schedule config
    - If mode == "human", route to operator via WebSocket

2. Trigger handoff?
    - After AI response, scan for handoff patterns
    - If found, create handoff request and notify operators

3. Execute functions?
    - During OpenAI run polling, check for requires_action
    - Execute travel search functions (flights, hotels, cruises)
    - Execute knowledge retrieval (Weaviate vector search)
```

### HTTP Request/Response Contract

**Endpoint**: `POST /<client_name>/chat`

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "message": "string (user input)",
  "client_id": "string (session_id-path format)",
  "tenant_id": "string (tenant identifier)",
  "onboarding_thread_id": "string | null (existing thread)",
  "url": "string | null (optional - page user is on)",
  "origin": "string (default: 'Web Chat')",
  "flag": "boolean (default: false)"
}
```

**Response** (Success - 200 OK):
```json
{
  "thread_id": "string (OpenAI thread ID)",
  "response": "string | array | '[HUMAN_MODE]'"
}
```

**Response Types**:
1. **String**: Normal AI response text
2. **Array**: Chat history (for "mytripgreeting" request)
   ```json
   [
     { "role": "user", "message": "Hello" },
     { "role": "assistant", "message": "Hi there!" }
   ]
   ```
3. **"[HUMAN_MODE]"**: Indicates operator will respond via WebSocket

**Error Responses**:
- `400 Bad Request` - Invalid client name, missing parameters
- `500 Internal Server Error` - OpenAI API failure, database error

---

## Flow 2: Handoff to Operator

### Step-by-Step Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 1: Customer Requests Human Help                                    │
└─────────────────────────────────────────────────────────────────────────┘

Customer types: "Can I speak with a human?"
    ↓
Widget → Assistant Server
    POST http://localhost:8001/tenant-undiscovered-2/chat
    Body: {
        "message": "Can I speak with a human?",
        "client_id": "session_1733500000_abc123-/amalia",
        "tenant_id": "tenant-undiscovered-2",
        "onboarding_thread_id": "thread_abc123xyz"
    }

┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 2: AI Processes Request & Detects Handoff Trigger                  │
└─────────────────────────────────────────────────────────────────────────┘

Assistant Server Processing:
    1. Check should_route_to_ai() → mode == "ai" (currently AI mode)
    2. Send message to OpenAI Assistant with handoff instruction:
        """
        IMPORTANT - Human Handoff Protocol:
        If the customer explicitly asks to speak with a human, respond with:
        "[HANDOFF] I understand you'd like to speak with one of our travel specialists.
        Let me connect you with a member of our team who can better assist you."
        """
    3. OpenAI responds with handoff marker:
        "I'd be happy to connect you with one of our travel specialists who can assist you personally. Let me transfer you now."
    4. After getting response, run detect_handoff_trigger():
        - Regex patterns check for:
            ✓ "connect you to", "transfer you to", "speak with agent"
            ✓ "[HANDOFF]", "[TRANSFER_TO_HUMAN]"
        - Pattern matches → should_trigger = True
    5. Call create_handoff_from_ai_response():
        - Get handoff_handler instance
        - Call handler.create_request():
            a. Generate request_id (UUID)
            b. Create handoff_requests document in MongoDB:
                {
                    "request_id": "req_123",
                    "thread_id": "thread_abc123xyz",
                    "tenant_id": "tenant-undiscovered-2",
                    "status": "pending",
                    "reason": "AI indicated handoff: connect you to",
                    "customer_name": "session_1733500000_abc123-/amalia",
                    "context_summary": "Customer message: Can I speak with a human?",
                    "priority": 0,
                    "created_at": "2025-12-06T10:30:00Z",
                    "timeout_at": "2025-12-06T10:35:00Z"  // 5 min default
                }
            c. Transition conversation mode:
                - state_machine.transition_mode(thread_id, "handoff_pending")
                - Updates conversation_modes collection
            d. Add to Redis queue:
                - ZADD queue:tenant-undiscovered-2 <timestamp> req_123
            e. Emit handoff_request event via WebSocket:
                socketio.emit('handoff_request', {
                    'request_id': 'req_123',
                    'thread_id': 'thread_abc123xyz',
                    'tenant_id': 'tenant-undiscovered-2',
                    'customer_name': 'session_1733500000_abc123-/amalia',
                    'reason': 'AI indicated handoff: connect you to',
                    'queue_position': 1,
                    'timestamp': '2025-12-06T10:30:00Z'
                }, room="tenant:tenant-undiscovered-2")
    6. Return AI response to customer

Response to Widget:
    200 OK
    {
        "thread_id": "thread_abc123xyz",
        "response": "I'd be happy to connect you with one of our travel specialists who can assist you personally. Let me transfer you now."
    }

┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 3: CRM Operator Receives Handoff Notification (WebSocket)          │
└─────────────────────────────────────────────────────────────────────────┘

CRM Frontend (HandoffContext) is subscribed to WebSocket:
    - Connected to: http://localhost:8001
    - Joined room: "tenant:tenant-undiscovered-2"
    - Listening for: handoff_request event

Event Received:
    handoff_request {
        request_id: "req_123",
        thread_id: "thread_abc123xyz",
        tenant_id: "tenant-undiscovered-2",
        customer_name: "session_1733500000_abc123-/amalia",
        reason: "AI indicated handoff: connect you to",
        queue_position: 1,
        timestamp: "2025-12-06T10:30:00Z"
    }

CRM Processing:
    1. HandoffContext receives event
    2. Triggers HandoffModal to open
    3. Modal displays:
        - Customer name
        - Reason for handoff
        - Queue position
        - Accept / Decline buttons
        - Countdown timer (5 minutes until timeout)

┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 4: Operator Accepts Handoff                                        │
└─────────────────────────────────────────────────────────────────────────┘

Operator clicks "Accept"
    ↓
CRM → Express Middleware
    POST http://localhost:3001/api/handoff/conversations/thread_abc123xyz/takeover
    Headers: {
        Authorization: "Bearer <JWT_TOKEN>",
        Content-Type: "application/json"
    }
    Body: {
        "operator_id": "user_67890",
        "operator_name": "Sarah Johnson"
    }

Express Middleware (handoff.js):
    1. Validates JWT token
    2. Extracts tenant_id from token
    3. Proxies request to Assistant Server:
        POST http://localhost:8001/api/conversations/thread_abc123xyz/mode
        Body: {
            "mode": "human",
            "operator_id": "user_67890",
            "operator_name": "Sarah Johnson"
        }

Assistant Server Processing (handoff/routes.py):
    1. Get handoff_handler
    2. Call handler.accept_request():
        a. Validate request exists and is pending
        b. Update handoff_requests document:
            - status: "accepted"
            - operator_id: "user_67890"
            - accepted_at: "2025-12-06T10:30:15Z"
        c. Transition conversation mode:
            - state_machine.transition_mode(thread_id, "human", operator_id)
            - Updates conversation_modes:
                {
                    "thread_id": "thread_abc123xyz",
                    "tenant_id": "tenant-undiscovered-2",
                    "mode": "human",
                    "operator_id": "user_67890",
                    "operator_name": "Sarah Johnson",
                    "version": 2,
                    "updated_at": "2025-12-06T10:30:15Z"
                }
        d. Remove from Redis queue
        e. Emit conversation_mode_changed event:
            socketio.emit('conversation_mode_changed', {
                'thread_id': 'thread_abc123xyz',
                'mode': 'human',
                'operator_id': 'user_67890',
                'operator_name': 'Sarah Johnson',
                'mode_version': 2,
                'changed_at': '2025-12-06T10:30:15Z'
            }, room="thread:thread_abc123xyz")
        f. Emit handoff_resolved event to CRM:
            socketio.emit('handoff_resolved', {
                'request_id': 'req_123',
                'status': 'accepted',
                'operator_id': 'user_67890',
                'operator_name': 'Sarah Johnson'
            }, room="tenant:tenant-undiscovered-2")

Response to CRM:
    200 OK
    {
        "mode": "human",
        "mode_version": 2,
        "operator_id": "user_67890",
        "operator_name": "Sarah Johnson",
        "previous_mode": "handoff_pending"
    }

CRM Processing:
    - Close HandoffModal
    - Navigate to ChatDetail view for thread_abc123xyz
    - Show OperatorComposer (message input)
    - Display mode indicator: "HUMAN" badge

Widget Processing (receives WebSocket event):
    - HandoffService receives conversation_mode_changed
    - Updates internal state (mode = "human")
    - May show indicator: "Now chatting with Sarah Johnson"

┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 5: Customer Sends Message While Operator Connected                 │
└─────────────────────────────────────────────────────────────────────────┘

Customer types: "Hi Sarah, I want to visit Chamonix"
    ↓
Widget → Assistant Server
    POST http://localhost:8001/tenant-undiscovered-2/chat
    Body: {
        "message": "Hi Sarah, I want to visit Chamonix",
        "client_id": "session_1733500000_abc123-/amalia",
        "tenant_id": "tenant-undiscovered-2",
        "onboarding_thread_id": "thread_abc123xyz"
    }

Assistant Server Processing:
    1. Check should_route_to_ai(thread_id):
        - Get mode → "human"
        - should_ai = False
        - mode_info = { mode: "human", operator_id: "user_67890", ... }
    2. Since mode == "human", SKIP AI processing
    3. Emit customer_message to operators via WebSocket:
        socketio.emit('customer_message', {
            'thread_id': 'thread_abc123xyz',
            'message_id': 'msg_customer_456',
            'content': 'Hi Sarah, I want to visit Chamonix',
            'timestamp': '2025-12-06T10:31:00Z',
            'tenant_id': 'tenant-undiscovered-2',
            'customer_name': 'session_1733500000_abc123-/amalia'
        }, room="thread:thread_abc123xyz")
    4. Return "[HUMAN_MODE]" response

Response to Widget:
    200 OK
    {
        "thread_id": "thread_abc123xyz",
        "response": "[HUMAN_MODE]"
    }

Widget Processing:
    - Receives "[HUMAN_MODE]"
    - Shows: "Connecting you with a travel specialist..."
    - Waits for operator_message via WebSocket

CRM Processing:
    - Receives customer_message event
    - Displays in ChatDetail conversation view
    - Shows message in chat thread with customer avatar

┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 6: Operator Sends Response (WebSocket)                             │
└─────────────────────────────────────────────────────────────────────────┘

Operator types in OperatorComposer: "Hi! I'd love to help you plan your Chamonix trip!"
    ↓
Operator clicks Send
    ↓
CRM emits via WebSocket:
    socket.emit('send_message', {
        thread_id: 'thread_abc123xyz',
        text: "Hi! I'd love to help you plan your Chamonix trip!",
        sender_id: 'user_67890',
        sender_name: 'Sarah Johnson'
    })

Assistant Server WebSocket Handler (handoff/websocket_events.py):
    @socketio.on('send_message')
    def handle_send_message(data):
        1. Validate operator is authenticated
        2. Rate limit check (30 messages/min)
        3. Input sanitization (Bleach XSS filter)
        4. Generate message_id
        5. Emit operator_message to customer:
            socketio.emit('operator_message', {
                'message_id': 'msg_op_789',
                'thread_id': 'thread_abc123xyz',
                'text': "Hi! I'd love to help you plan your Chamonix trip!",
                'sender': 'operator',
                'sender_id': 'user_67890',
                'sender_name': 'Sarah Johnson',
                'seq': 1,
                'timestamp': '2025-12-06T10:31:30Z'
            }, room="thread:thread_abc123xyz")
        6. Save to OpenAI thread (optional):
            chat_client.beta.threads.messages.create(
                thread_id='thread_abc123xyz',
                role='assistant',
                content="Hi! I'd love to help you plan your Chamonix trip!"
            )
        7. Log to Google Sheets

Widget Processing (HandoffService):
    1. Receives operator_message event
    2. Checks thread_id matches
    3. Deduplicates by message_id
    4. Calls onOperatorMessageCallbacks
    5. Flow block receives callback
    6. Injects message: params.injectMessage(text)
    7. Customer sees message in chat UI

Customer sees:
    [Bot Avatar] "Hi! I'd love to help you plan your Chamonix trip!"
```

### WebSocket Events Contract

**Server → Client Events**

1. **handoff_request** (to tenant room)
```json
{
  "request_id": "string (UUID)",
  "thread_id": "string",
  "tenant_id": "string",
  "customer_name": "string",
  "reason": "string",
  "queue_position": "number",
  "timestamp": "string (ISO 8601)"
}
```

2. **conversation_mode_changed** (to thread room)
```json
{
  "thread_id": "string",
  "mode": "ai | human | hybrid | handoff_pending | cooldown_ai",
  "operator_id": "string | null",
  "operator_name": "string | null",
  "mode_version": "number",
  "changed_at": "string (ISO 8601)"
}
```

3. **operator_message** (to thread room)
```json
{
  "message_id": "string (UUID)",
  "thread_id": "string",
  "text": "string",
  "sender": "operator",
  "sender_id": "string",
  "sender_name": "string",
  "seq": "number",
  "timestamp": "string (ISO 8601)"
}
```

4. **customer_message** (to thread room, for operators)
```json
{
  "thread_id": "string",
  "message_id": "string (UUID)",
  "content": "string",
  "timestamp": "string (ISO 8601)",
  "tenant_id": "string",
  "customer_name": "string"
}
```

5. **typing_indicator** (to thread room)
```json
{
  "thread_id": "string",
  "sender": "operator | customer",
  "sender_name": "string | null",
  "is_typing": "boolean"
}
```

**Client → Server Events**

1. **join_room** (connect to rooms)
```json
{
  "room": "string (tenant:X or thread:Y format)"
}
// OR
{
  "thread_id": "string"
}
```

2. **send_message** (operator sends message)
```json
{
  "thread_id": "string",
  "text": "string",
  "sender_id": "string",
  "sender_name": "string"
}
```

3. **take_over** (operator takes control)
```json
{
  "thread_id": "string",
  "operator_id": "string",
  "operator_name": "string"
}
```

4. **release_to_ai** (operator returns to AI)
```json
{
  "thread_id": "string"
}
```

5. **typing** / **send_typing** (typing indicator)
```json
{
  "thread_id": "string",
  "is_typing": "boolean"
}
```

---

## Integration Issues & Solutions

### Issue 1: Endpoint Confusion ⚠️

**Problem**: Multiple endpoint patterns causing misrouted requests
- `/amalia/chat`
- `/<client>/chat`
- `/<client>-assistant/chat`
- `/api/...`

**Root Cause**:
- Widget uses dynamic path-based routing: `${effectivePath}-assistant/chat`
- Flask route is `/<client_name>/chat` which accepts any pattern
- No enforcement of canonical endpoint per tenant

**Impact**:
- Requests to wrong endpoints fail with "Invalid client name"
- Time wasted debugging which endpoint to use

**Solution**:
```python
# In app.py - Add strict route validation
VALID_CLIENTS = [
    'tenant-undiscovered-2',
    'happygringo-assistant',
    'undiscoveredmountains-assistant',
    # ... more clients
]

@app.route('/<client_name>/chat', methods=['POST'])
def chat(client_name):
    if client_name not in VALID_CLIENTS:
        return jsonify({
            "error": "Invalid client name",
            "valid_clients": VALID_CLIENTS
        }), 400
    # ... rest of handler
```

```typescript
// In widget constants.ts - Document canonical endpoints
export const CANONICAL_ENDPOINTS = {
  'tenant-undiscovered-2': 'http://localhost:8001/tenant-undiscovered-2/chat',
  'production': 'https://chats.mytrip.ai/tenant-undiscovered-2/chat'
};
```

### Issue 2: Client Resolution Failures ❌

**Problem**: `CLIENTS_JSON` empty causes fallback to platform API lookup
```python
clients_json_str = os.getenv("CLIENTS_JSON")  # Returns ""
clients = json.loads(clients_json_str)  # {}
client_cfg = clients.get(client_name)  # None
```

**Root Cause**:
- `.env` file missing or `CLIENTS_JSON` not set
- Fallback logic calls `assistant.create_assistant()` which may timeout
- No default assistant configured

**Impact**:
- Chat requests hang for 10-30 seconds
- "Invalid client name" errors
- Server logs show assistant lookup failures

**Solution**:

Tenant configuration must be resolved **dynamically from the database** (MongoDB `assistants` collection), not hardcoded in `.env`. The Flask server should:

```python
# In app.py - Dynamic tenant resolution from MongoDB
def get_tenant_config(tenant_id: str) -> dict:
    """
    Resolve tenant configuration from MongoDB.
    Never hardcode tenant configs in .env - they change per logged-in client.
    """
    # Query MongoDB assistants collection
    assistant_doc = db.assistants.find_one({"tenant_id": tenant_id})
    
    if not assistant_doc:
        logger.warning(f"⚠️ Tenant '{tenant_id}' not found in MongoDB")
        # Use system-wide default (not tenant-specific)
        return {
            "api_key": os.getenv("OPENAI_API_KEY"),
            "assistant_id": os.getenv("DEFAULT_ASSISTANT_ID")
        }
    
    logger.info(f"✅ Tenant '{tenant_id}' resolved from MongoDB")
    return {
        "api_key": assistant_doc.get("api_key", os.getenv("OPENAI_API_KEY")),
        "assistant_id": assistant_doc["assistant_id"]
    }
```

**Note**: `CLIENTS_JSON` in `.env` is only for local development fallback, NOT for production tenant configuration.

### Issue 3: Tenant Naming Drift 🔄

**Problem**: Inconsistent tenant ID formats across systems
- Flask: `tenant-undiscovered-2` vs `tenant-undiscovered-2-assistant`
- CRM room: `tenant:tenant-undiscovered-2`
- Widget: `tenant_id: "tenant-undiscovered-2"`

**Root Cause**:
- Dynamic suffix addition/removal (`client_name.replace('-assistant', '')`)
- No single source of truth for tenant IDs
- Implicit extraction rules differ between components

**Impact**:
- WebSocket room joins fail (wrong room name)
- Handoff requests not received by CRM
- Mode changes not reflected in widget

**Solution**:
```python
# Create tenant_config.py - Single source of truth
TENANT_CONFIGS = {
    'tenant-undiscovered-2': {
        'display_name': 'Undiscovered Mountains',
        'assistant_id': 'asst_abc123',
        'socket_room': 'tenant:tenant-undiscovered-2',
        'aliases': ['undiscoveredmountains', 'undiscoveredmountains-assistant']
    },
    'mytrip-ai': {
        'display_name': 'MyTrip.AI',
        'assistant_id': 'asst_xyz789',
        'socket_room': 'tenant:mytrip-ai',
        'aliases': ['amalia', 'assistant']
    }
}

def normalize_tenant_id(client_name: str) -> str:
    """Normalize any client name variant to canonical tenant ID."""
    # Remove common suffixes
    clean = client_name.replace('-assistant', '').replace('_assistant', '')

    # Check if it's already a tenant ID
    if clean in TENANT_CONFIGS:
        return clean

    # Check aliases
    for tenant_id, config in TENANT_CONFIGS.items():
        if clean in config.get('aliases', []):
            return tenant_id

    # Fallback
    return clean
```

Use consistently:
```python
# In app.py
tenant_id = normalize_tenant_id(client_name)
print(f'   Canonical tenant_id: {tenant_id}')
```

```typescript
// In widget constants.ts
export const TENANT_CONFIG = {
  'tenant-undiscovered-2': {
    displayName: 'Undiscovered Mountains',
    socketRoom: 'tenant:tenant-undiscovered-2'
  }
};
```

### Issue 4: Missing Request Logging 📝

**Problem**: No visibility into client/tenant/assistant resolution
- Difficult to diagnose which assistant is being used
- Can't trace why requests fail
- No audit trail for handoff creation

**Solution**:
```python
# In app.py - Add structured logging at key points

import logging
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler('chat_requests.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@app.route('/<client_name>/chat', methods=['POST'])
def chat(client_name):
    request_id = str(uuid.uuid4())

    # Log incoming request
    logger.info(json.dumps({
        'event': 'chat_request_received',
        'request_id': request_id,
        'client_name': client_name,
        'client_id': data.get('client_id'),
        'tenant_id': data.get('tenant_id'),
        'has_thread_id': bool(data.get('onboarding_thread_id')),
        'message_preview': user_input[:50] if user_input else None
    }))

    # Log assistant resolution
    logger.info(json.dumps({
        'event': 'assistant_resolved',
        'request_id': request_id,
        'client_name': client_name,
        'assistant_id': assistant_id,
        'api_key_source': 'CLIENTS_JSON' if client_cfg else 'OPENAI_API_KEY',
        'fallback_used': assistant_id == os.getenv('DEFAULT_ASSISTANT_ID')
    }))

    # Log mode check
    logger.info(json.dumps({
        'event': 'mode_check',
        'request_id': request_id,
        'thread_id': thread_id,
        'mode': mode_info.get('mode') if mode_info else 'ai',
        'routed_to': 'operator' if not should_ai else 'ai'
    }))

    # Log handoff creation
    if handoff_result:
        logger.info(json.dumps({
            'event': 'handoff_created',
            'request_id': request_id,
            'handoff_request_id': handoff_result.get('request_id'),
            'thread_id': thread_id,
            'tenant_id': tenant_id,
            'reason': handoff_result.get('reason')
        }))
```

### Issue 5: CORS Wide Open 🔓

**Problem**: Security vulnerability
```python
CORS(app)  # Allows all origins
socketio = SocketIO(app, cors_allowed_origins='*')
```

**Impact**:
- Any website can make requests to the API
- WebSocket connections from unauthorized origins
- Potential for CSRF attacks

**Solution**:
```python
# In app.py
from flask_cors import CORS

ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:5174').split(',')

CORS(app, origins=ALLOWED_ORIGINS, supports_credentials=True)

socketio = SocketIO(
    app,
    cors_allowed_origins=ALLOWED_ORIGINS,
    async_mode='gevent'
)
```

```.env
# Production
ALLOWED_ORIGINS=https://widget.mytrip.ai,https://crm.mytrip.ai,https://undiscoveredmountains.com

# Development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3001
```

---

## Testing the Integration

### Test Scenario 1: Normal Chat Flow

```bash
# Terminal 1: Start Assistant Server
cd /home/jason/Documents/Python-Projects-Assistant-Server--cleanup-branch
source venv/bin/activate
python app.py

# Terminal 2: Start Widget
cd /home/jason/Documents/react-chatbotify-jason-2025
npm run start

# Terminal 3: Test with curl
curl -X POST http://localhost:8001/tenant-undiscovered-2/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello",
    "client_id": "test_user_123",
    "tenant_id": "tenant-undiscovered-2",
    "onboarding_thread_id": null
  }'

# Expected Response:
# {
#   "thread_id": "thread_...",
#   "response": "Hello! I'm Heidi, your AI Trip Planner..."
# }
```

### Test Scenario 2: Handoff Request via REST

```bash
# Use the trigger_handoff.py script
cd /home/jason/Documents/Python-Projects-Assistant-Server--cleanup-branch
python trigger_handoff.py

# This creates a handoff request directly via the handoff handler
# Check CRM should show HandoffModal popup
```

### Test Scenario 3: Conversational Handoff Trigger

```bash
# In widget, type:
"Can I speak with a human?"

# Expected Flow:
# 1. Widget sends message to Flask
# 2. Flask sends to OpenAI → AI responds with [HANDOFF]
# 3. Flask detects pattern → creates handoff_request
# 4. Flask emits handoff_request event to CRM
# 5. CRM shows HandoffModal
# 6. Operator clicks Accept
# 7. Mode changes to "human"
# 8. Customer's next message goes to operator via WebSocket
```

### Debugging Checklist

When handoff doesn't work:

1. **Check Flask is running**
   ```bash
   curl http://localhost:8001/health
   # Should return 200 OK
   ```

2. **Check CLIENTS_JSON is populated**
   ```bash
   # In Flask logs, look for:
   # "CLIENTS_JSON lookup: FOUND" (not "NOT FOUND")
   ```

3. **Check tenant_id is correct**
   ```bash
   # In Flask logs, look for:
   # "tenant_id (extracted): tenant-undiscovered-2"
   ```

4. **Check WebSocket room joins**
   ```bash
   # In Flask logs, look for:
   # "🔗 Socket {sid} joined room: tenant:tenant-undiscovered-2"
   ```

5. **Check handoff trigger detection**
   ```bash
   # In Flask logs, look for:
   # "[detect_handoff_trigger] ✅ MATCH FOUND"
   ```

6. **Check CRM is connected**
   ```bash
   # In browser console (CRM):
   # "[HandoffService] ✅ Connected to handoff server"
   ```

---

## Next Steps

### Immediate Fixes (Priority 1)

1. ✅ **Stabilize client resolution** (from postmortem)
   - Set `DEFAULT_ASSISTANT_ID` in `.env`
   - Populate `CLIENTS_JSON` with tenant-undiscovered-2 config
   - Add fallback logic that doesn't call remote API

2. ✅ **Add request logging** (from postmortem)
   - Log client_name, tenant_id, assistant_id for every request
   - Add structured JSON logging for traceability

3. ✅ **Enforce canonical endpoint** (from postmortem)
   - Document that widget should use `/tenant-undiscovered-2/chat`
   - Add validation to reject invalid client names early

4. ✅ **Fix CORS** (security)
   - Restrict to known origins only
   - Test widget still works after CORS restriction

### Enhancements (Priority 2)

1. **Streaming responses**
   - Use OpenAI streaming API for faster perceived response times
   - Emit chunks via WebSocket instead of polling

2. **Rate limiting**
   - Add Flask-Limiter to chat endpoint (10 requests/min per IP)
   - Already implemented for handoff WebSocket events

3. **Better error handling**
   - Return specific error codes (400, 404, 500)
   - Include actionable error messages

4. **Monitoring**
   - Add OpenTelemetry tracing
   - Track handoff accept/decline rates
   - Monitor AI vs human mode distribution

---

## Conclusion

The integration between the three systems is architecturally sound, but needs stabilization in these areas:

1. **Client Resolution** - Use defaults, avoid remote lookups
2. **Logging** - Add structured logging at all decision points
3. **Tenant Naming** - Enforce canonical tenant IDs everywhere
4. **Security** - Restrict CORS and add rate limiting

Once these fixes are in place, the conversational handoff trigger should work reliably, matching the success of the REST-based handoff flow.
