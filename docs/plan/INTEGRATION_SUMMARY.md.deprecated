# Integration Summary: Chat & Handoff System

## TL;DR

You have a **three-tier AI customer engagement platform** where:
1. **Customers** chat via a React widget on travel company websites
2. **AI (OpenAI Assistant)** handles initial conversations with travel expertise
3. **Human operators** take over when customers need personalized help

**Current Status**:
- ✅ **REST-based handoff works** - CRM modal shows when handoff created via API
- ❌ **Conversational handoff broken** - Chat freezes with "Invalid client name"

**Root Cause**: Empty `CLIENTS_JSON` + missing request logging

---

## System Architecture (Visual)

```
┌───────────────────────────────────────────────────────────────────────┐
│                         CUSTOMER FLOW                                  │
└───────────────────────────────────────────────────────────────────────┘

Customer on undiscoveredmountains.com
         │
         │ Opens chat widget
         ↓
┌─────────────────────────────────────────────────────────────────────┐
│  React Chat Widget (Port 5173 Dev / Embedded Prod)                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Component: ChatBot                                            │  │
│  │ - Session Manager (creates session_ID)                        │  │
│  │ - Chat History Loader (gets previous messages)                │  │
│  │ - Message Composer (user input)                               │  │
│  │ - HandoffService (WebSocket for operator messages)            │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
         │                                    ↑
         │ HTTP POST                          │ WebSocket
         │ /tenant-undiscovered-2/chat        │ operator_message
         ↓                                    │
┌─────────────────────────────────────────────────────────────────────┐
│  Assistant Server (Flask Port 8001)                                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Chat Endpoint: /<client_name>/chat                            │  │
│  │ 1. Resolve client/tenant/assistant                            │  │
│  │ 2. Check conversation mode (AI vs Human)                      │  │
│  │ 3. Route accordingly:                                          │  │
│  │    - AI mode: Send to OpenAI Assistant API                    │  │
│  │    - Human mode: Emit to operator via WebSocket               │  │
│  │ 4. Detect handoff triggers in AI response                     │  │
│  │ 5. Create handoff request if needed                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Handoff System                                                 │  │
│  │ - State Machine (conversation_modes in MongoDB)               │  │
│  │ - Handoff Handler (create/accept/decline requests)            │  │
│  │ - WebSocket Server (Socket.IO)                                │  │
│  │ - Redis (queues, presence, mode cache)                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ OpenAI Integration                                             │  │
│  │ - Thread management                                            │  │
│  │ - Run polling (1s intervals)                                   │  │
│  │ - Function calling (40+ travel functions)                     │  │
│  │ - RAG (Weaviate 25+ company knowledge bases)                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
         │                                    ↑
         │ WebSocket                          │ HTTP Proxy
         │ handoff_request                    │ GET/POST/PUT
         │ customer_message                   │ /api/handoff/*
         ↓                                    │
┌─────────────────────────────────────────────────────────────────────┐
│  CRM Monorepo                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Frontend (React Port 5174)                                     │  │
│  │ - HandoffContext (WebSocket manager)                          │  │
│  │ - HandoffModal (Accept/Decline UI)                            │  │
│  │ - ChatDetail (Conversation view)                              │  │
│  │ - OperatorComposer (Message input)                            │  │
│  │ - ModeIndicator (AI/Human badge)                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Express Middleware (Port 3001)                                 │  │
│  │ - Handoff proxy routes                                         │  │
│  │ - JWT authentication                                           │  │
│  │ - Error mapping                                                │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
         │
         │ Operator actions
         ↓
Travel Specialist (Sarah Johnson)
```

---

## Flow 1: Normal AI Chat (Working ✅)

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. Customer Opens Chat Widget                                       │
└─────────────────────────────────────────────────────────────────────┘

Widget creates session: session_1733500000_abc123
Widget calls getChatHistory()
Widget sends: { message: "mytripgreeting", client_id: "session_...", tenant_id: "tenant-undiscovered-2" }

┌─────────────────────────────────────────────────────────────────────┐
│ 2. Assistant Server Processes                                       │
└─────────────────────────────────────────────────────────────────────┘

Flask receives POST /tenant-undiscovered-2/chat
Resolves assistant_id for "tenant-undiscovered-2"
  ⚠️ PROBLEM: CLIENTS_JSON empty → uses fallback or fails
Creates/retrieves OpenAI thread_id
Returns fast greeting: "Hello! I'm Heidi..."

┌─────────────────────────────────────────────────────────────────────┐
│ 3. Customer Asks Question                                           │
└─────────────────────────────────────────────────────────────────────┘

Customer: "I want to visit the French Alps in July"
Widget sends: { message: "I want to visit...", thread_id: "thread_abc123xyz", ... }

┌─────────────────────────────────────────────────────────────────────┐
│ 4. AI Processes and Responds                                        │
└─────────────────────────────────────────────────────────────────────┘

Flask checks mode: should_route_to_ai() → TRUE (mode = "ai")
Sends to OpenAI Assistant with context:
  - Current date/time
  - URL user is on
  - Handoff instruction (if enabled)
OpenAI responds with travel advice
Flask scans for handoff patterns → NONE FOUND
Returns response to widget

Widget injects AI message
Customer sees: "That sounds wonderful! July is perfect for the French Alps..."

✅ FLOW COMPLETE
```

---

## Flow 2: Handoff to Operator (Broken ❌)

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. Customer Requests Human                                          │
└─────────────────────────────────────────────────────────────────────┘

Customer: "Can I speak with a human?"
Widget sends: { message: "Can I speak...", thread_id: "thread_abc123xyz", ... }

┌─────────────────────────────────────────────────────────────────────┐
│ 2. AI Detects Handoff Trigger (Should Work)                         │
└─────────────────────────────────────────────────────────────────────┘

Flask checks mode: should_route_to_ai() → TRUE
Sends to OpenAI with handoff instruction
OpenAI responds: "[HANDOFF] I understand you'd like to speak..."
Flask runs detect_handoff_trigger():
  ✅ Pattern match found: "speak with"
Flask calls create_handoff_from_ai_response():
  - Creates handoff_requests document
  - Transitions mode to "handoff_pending"
  - Emits handoff_request to CRM
  ❌ PROBLEM: If client resolution fails, this never happens

┌─────────────────────────────────────────────────────────────────────┐
│ 3. CRM Receives Handoff Notification (Should Work)                  │
└─────────────────────────────────────────────────────────────────────┘

CRM WebSocket receives: handoff_request { request_id: "req_123", ... }
HandoffModal opens
Operator sees: "Customer needs help" with Accept/Decline

┌─────────────────────────────────────────────────────────────────────┐
│ 4. Operator Accepts (Working ✅)                                    │
└─────────────────────────────────────────────────────────────────────┘

Operator clicks "Accept"
CRM sends: POST /api/handoff/conversations/thread_abc123xyz/takeover
Express proxies to Flask: POST /api/conversations/thread_abc123xyz/mode
Flask transitions mode to "human"
Emits conversation_mode_changed to widget
Widget shows: "Now chatting with Sarah Johnson"

✅ THIS PART WORKS (via REST API)

┌─────────────────────────────────────────────────────────────────────┐
│ 5. Customer Sends Message in Human Mode (Should Work)               │
└─────────────────────────────────────────────────────────────────────┘

Customer: "Hi Sarah, I want to visit Chamonix"
Widget sends: POST /tenant-undiscovered-2/chat
Flask checks mode: should_route_to_ai() → FALSE (mode = "human")
Flask skips AI, emits customer_message to operator
Returns: { response: "[HUMAN_MODE]" }
Widget shows: "Connecting you with a specialist..."

┌─────────────────────────────────────────────────────────────────────┐
│ 6. Operator Responds (Working ✅)                                   │
└─────────────────────────────────────────────────────────────────────┘

Operator types: "Hi! I'd love to help..."
CRM emits: send_message via WebSocket
Flask emits: operator_message to widget
Widget receives and injects message
Customer sees: "Hi! I'd love to help..."

✅ OPERATOR MESSAGING WORKS
```

---

## Key Integration Points

### 1. Widget → Assistant Server (HTTP)

**Endpoint**: `POST /tenant-undiscovered-2/chat`

**Critical Data**:
- `client_id`: Session ID (format: `session_TIMESTAMP_RANDOM-/path`)
- `tenant_id`: Tenant identifier (e.g., `tenant-undiscovered-2`)
- `thread_id`: OpenAI thread (null for new conversations)

**Issues**:
- ❌ client_name resolution fails if `CLIENTS_JSON` empty
- ❌ No logging of which assistant is used
- ❌ Hangs on assistant lookup timeout

---

### 2. Assistant Server → Widget (WebSocket)

**Events Sent to Widget**:
- `operator_message` - Human operator's response
- `conversation_mode_changed` - AI ↔ Human mode switch
- `typing_indicator` - Operator typing status

**Room**: `thread:thread_abc123xyz`

**Connection**: Widget HandoffService auto-connects when thread_id received

**Issues**:
- ✅ Works correctly when connection established

---

### 3. Assistant Server → CRM (WebSocket)

**Events Sent to CRM**:
- `handoff_request` - New handoff created
- `conversation_mode_changed` - Mode transition
- `customer_message` - Customer message in human mode

**Room**: `tenant:tenant-undiscovered-2`

**Connection**: CRM HandoffContext connects on mount

**Issues**:
- ✅ Works correctly
- ⚠️ Tenant naming must match exactly

---

### 4. CRM → Assistant Server (HTTP via Express)

**Endpoints Used**:
- `POST /api/handoff/conversations/:threadId/takeover`
- `POST /api/handoff/conversations/:threadId/release`
- `GET /api/handoff/conversations/:threadId/mode`

**Proxy**: Express middleware forwards to Flask

**Issues**:
- ✅ Works correctly
- ✅ E2E tests pass

---

### 5. CRM → Assistant Server (WebSocket)

**Events Sent**:
- `send_message` - Operator sends message
- `take_over` - Operator takes control
- `release_to_ai` - Return to AI
- `typing` - Typing indicator

**Auth**: JWT token in Socket.IO `auth` object

**Issues**:
- ✅ Works correctly

---

## Critical Issues Breakdown

### Issue #1: Client Resolution Failure (High Priority 🔴)

**Symptom**:
```
Chat request → "Invalid client name" or hangs
```

**Root Cause**:
```python
clients_json_str = os.getenv("CLIENTS_JSON")  # Returns "" or None
clients = json.loads(clients_json_str)  # Fails or returns {}
client_cfg = clients.get("tenant-undiscovered-2")  # Returns None
# Falls back to assistant.create_assistant() which may timeout
```

**Fix**:

Tenant configuration must be resolved **dynamically from MongoDB**, not hardcoded in `.env`:

```python
# In app.py - Dynamic tenant resolution from MongoDB
def get_tenant_config(tenant_id: str) -> dict:
    """
    Resolve tenant configuration from MongoDB.
    Never hardcode tenant configs in .env - they change per logged-in client.
    """
    assistant_doc = db.assistants.find_one({"tenant_id": tenant_id})
    
    if not assistant_doc:
        logger.warning(f"Tenant '{tenant_id}' not found in MongoDB")
        return {
            "api_key": os.getenv("OPENAI_API_KEY"),
            "assistant_id": os.getenv("DEFAULT_ASSISTANT_ID")
        }
    
    return {
        "api_key": assistant_doc.get("api_key", os.getenv("OPENAI_API_KEY")),
        "assistant_id": assistant_doc["assistant_id"]
    }
```

**Test**:
```bash
curl -X POST http://localhost:8001/tenant-undiscovered-2/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","client_id":"test_123","tenant_id":"tenant-undiscovered-2"}'

# Should return 200 OK with greeting
```

---

### Issue #2: Missing Request Logging (High Priority 🔴)

**Symptom**:
```
Can't diagnose why requests fail
No visibility into assistant resolution
```

**Fix**:
```python
# Add structured logging
import logging
import json

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
    # Log every request
    logger.info(json.dumps({
        'event': 'chat_request',
        'client_name': client_name,
        'tenant_id': data.get('tenant_id'),
        'client_id': data.get('client_id'),
        'has_thread': bool(data.get('onboarding_thread_id'))
    }))

    # Log assistant resolution
    logger.info(json.dumps({
        'event': 'assistant_resolved',
        'client_name': client_name,
        'assistant_id': assistant_id,
        'source': 'CLIENTS_JSON' if client_cfg else 'fallback'
    }))
```

**Test**:
```bash
# Check logs after request
tail -f chat_requests.log
```

---

### Issue #3: Tenant Naming Drift (Medium Priority 🟡)

**Symptom**:
```
WebSocket rooms don't match
handoff_request events not received
```

**Root Cause**:
```
Flask uses: "tenant-undiscovered-2" or "undiscoveredmountains-assistant"
CRM joins: "tenant:tenant-undiscovered-2"
Widget uses: "tenant-undiscovered-2"
```

**Fix**:
```python
# Create single source of truth
TENANT_CONFIGS = {
    'tenant-undiscovered-2': {
        'socket_room': 'tenant:tenant-undiscovered-2',
        'aliases': ['undiscoveredmountains', 'undiscoveredmountains-assistant']
    }
}

def normalize_tenant_id(client_name: str) -> str:
    clean = client_name.replace('-assistant', '')
    if clean in TENANT_CONFIGS:
        return clean
    for tid, cfg in TENANT_CONFIGS.items():
        if clean in cfg.get('aliases', []):
            return tid
    return clean
```

**Test**:
```python
# Verify room names match
print(normalize_tenant_id("undiscoveredmountains-assistant"))
# Should print: "tenant-undiscovered-2"

# CRM joins: tenant:tenant-undiscovered-2
# Flask emits to: tenant:tenant-undiscovered-2
# ✅ Match!
```

---

### Issue #4: CORS Wide Open (Security 🔒)

**Symptom**:
```python
CORS(app)  # Allows ALL origins
socketio = SocketIO(app, cors_allowed_origins='*')
```

**Fix**:
```python
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:5174').split(',')

CORS(app, origins=ALLOWED_ORIGINS)
socketio = SocketIO(app, cors_allowed_origins=ALLOWED_ORIGINS, async_mode='gevent')
```

```.env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3001
```

---

## Quick Fix Action Plan

### Step 1: Verify MongoDB Tenant Configuration (15 minutes)

```bash
# Check MongoDB for tenant configuration
mongosh
use assistant_chats
db.assistants.find({tenant_id: "tenant-undiscovered-2"})
```

If no document exists, insert one:
```javascript
db.assistants.insertOne({
  tenant_id: "tenant-undiscovered-2",
  assistant_id: "asst_your_assistant_id",
  display_name: "Undiscovered Mountains",
  created_at: new Date()
})
```

Test:
```bash
# Restart Flask
python app.py

# Test in another terminal
curl -X POST http://localhost:8001/tenant-undiscovered-2/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","client_id":"test_123","tenant_id":"tenant-undiscovered-2"}'
```

Expected: `200 OK` with greeting message

---

### Step 2: Add Logging (15 minutes)

See Issue #2 above - add structured logging to app.py

Test:
```bash
# Make request
curl -X POST http://localhost:8001/tenant-undiscovered-2/chat ...

# Check logs
tail -f chat_requests.log

# Should see:
# {"event":"chat_request","client_name":"tenant-undiscovered-2",...}
# {"event":"assistant_resolved","assistant_id":"asst_abc123",...}
```

---

### Step 3: Test Conversational Handoff (10 minutes)

```bash
# 1. Start Flask (Terminal 1)
python app.py

# 2. Start Widget (Terminal 2)
cd /home/jason/Documents/react-chatbotify-jason-2025
npm run start

# 3. Start CRM (Terminal 3)
cd /home/jason/Documents/SaaSMonorepo-tw-main
cd apps/tailwind_frontend
npm run dev

# 4. Open widget in browser
# Visit: http://localhost:5173

# 5. Type in widget:
"Can I speak with a human?"

# 6. Check Flask logs for:
# [detect_handoff_trigger] ✅ MATCH FOUND
# [create_handoff_from_ai_response] Creating handoff request...
# ✅ Handoff request created: req_123

# 7. Check CRM browser (http://localhost:5174)
# Should see HandoffModal popup

# ✅ SUCCESS if modal appears
```

---

## Success Criteria

### ✅ Normal Chat Works
- Customer opens widget → sees greeting
- Customer asks question → gets AI response
- Messages appear in chat history
- Session persists across page reloads

### ✅ Handoff Trigger Works
- Customer types "Can I speak with a human?"
- AI responds with handoff message
- Flask detects pattern and creates handoff request
- CRM HandoffModal appears within 1 second
- Modal shows customer name, reason, queue position

### ✅ Operator Accept Works
- Operator clicks "Accept"
- Mode changes to "human" within 1 second
- Widget shows "Now chatting with [Operator Name]"
- Modal closes, navigates to ChatDetail

### ✅ Operator Messaging Works
- Customer sends message in human mode
- Operator sees message in CRM within 1 second
- Operator types response and clicks Send
- Customer sees operator message within 1 second
- Typing indicators work both ways

### ✅ Release to AI Works
- Operator clicks "Release to AI"
- Mode changes to "cooldown_ai"
- Customer's next message goes to AI
- AI responds normally

---

## Files Modified

**Priority 1 (Required)**:
1. MongoDB `assistants` collection
   - Ensure tenant documents exist with `tenant_id` and `assistant_id`
   - Flask server resolves configuration dynamically from here

2. `/home/jason/Documents/Python-Projects-Assistant-Server--cleanup-branch/app.py`
   - Add structured logging (lines ~1846-1875)
   - Add safe defaults for client resolution
   - Optional: Add CORS restrictions

**Priority 2 (Recommended)**:
3. `/home/jason/Documents/Python-Projects-Assistant-Server--cleanup-branch/tenant_config.py` (new file)
   - Centralized tenant configuration
   - Tenant ID normalization function

---

## Related Documentation

Created in this analysis:
1. `INTEGRATION_ANALYSIS.md` - Complete integration analysis with data flows
2. `API_CONTRACTS_QUICK_REFERENCE.md` - All API contracts and WebSocket events
3. `INTEGRATION_SUMMARY.md` - This file (executive summary)

Existing documentation:
1. `postmortem.md` - Original failure analysis (Dec 5, 2025)
2. `docs/prd-human-operator-extension.md` - Product requirements
3. `docs/mvp-plan-human-operator.md` - MVP scope
4. `docs/integration-plan-human-operator.md` - Original integration plan

---

## Contact Points

**Key Functions to Debug**:
- `chat()` in `app.py:1838` - Main chat endpoint
- `should_route_to_ai()` in `handoff/chat_integration.py:46` - Mode routing
- `detect_handoff_trigger()` in `handoff/chat_integration.py:102` - Pattern detection
- `create_handoff_from_ai_response()` in `handoff/chat_integration.py:136` - Handoff creation

**Key Files**:
- Widget: `/home/jason/Documents/react-chatbotify-jason-2025/src/services/chatService.ts`
- Widget: `/home/jason/Documents/react-chatbotify-jason-2025/src/services/HandoffService.ts`
- Flask: `/home/jason/Documents/Python-Projects-Assistant-Server--cleanup-branch/app.py`
- Flask: `/home/jason/Documents/Python-Projects-Assistant-Server--cleanup-branch/handoff/chat_integration.py`
- CRM: `/home/jason/Documents/SaaSMonorepo-tw-main/apps/express_middleware/src/routes/handoff.js`

---

## Next Steps

1. **Fix client resolution** (30 min) → Enables chat endpoint to work
2. **Add logging** (15 min) → Enables debugging
3. **Test end-to-end** (10 min) → Verify conversational handoff works
4. **Optional: Fix CORS** (10 min) → Security improvement
5. **Optional: Add monitoring** (future) → Production readiness

**Estimated Time to Working System**: ~1 hour
