# API Contracts Quick Reference

## Overview

This document provides a quick reference for all API contracts between the Chat Widget, Assistant Server, and CRM.

---

## System Endpoints Summary

| System | Port | Base URL (Dev) | Base URL (Prod) |
|--------|------|----------------|-----------------|
| Chat Widget | 5173 | http://localhost:5173 | (embedded in customer site) |
| Assistant Server | 8001 | http://localhost:8001 | https://chats.mytrip.ai |
| CRM Frontend | 5174 | http://localhost:5174 | https://crm.mytrip.ai |
| CRM API (Express) | 3001 | http://localhost:3001 | https://api.mytrip.ai |
| PayloadCMS | 3000 | http://localhost:3000 | https://platform.mytrip.ai |

---

## HTTP API Contracts

### 1. Chat Endpoint (Widget → Assistant Server)

**Endpoint**: `POST /<client_name>/chat`

**Example**: `POST /tenant-undiscovered-2/chat`

**Request**:
```json
{
  "message": "I want to plan a trip to the French Alps",
  "client_id": "session_1733500000_abc123-/amalia",
  "tenant_id": "tenant-undiscovered-2",
  "onboarding_thread_id": "thread_abc123xyz",  // null for new conversation
  "url": "https://undiscoveredmountains.com/destinations/alps",  // optional
  "origin": "Web Chat",  // optional
  "flag": false  // optional
}
```

**Response (Success)**:
```json
{
  "thread_id": "thread_abc123xyz",
  "response": "That sounds wonderful! July is perfect for the French Alps..."
}
```

**Response (Human Mode)**:
```json
{
  "thread_id": "thread_abc123xyz",
  "response": "[HUMAN_MODE]"
}
```

**Response (Chat History)**:
```json
{
  "thread_id": "thread_abc123xyz",
  "response": [
    { "role": "user", "message": "Hello" },
    { "role": "assistant", "message": "Hi! I'm Heidi..." }
  ]
}
```

**Special Messages**:
- `"mytripgreeting"` - Triggers chat history return (if exists)
- `"qrtesting"` - Returns QR code instructions
- `"/start"`, `"Hello"`, `"Hi"` - Fast greeting responses

**Errors**:
- `400` - Invalid client name, missing parameters
- `500` - OpenAI API failure, database error

---

### 2. Handoff Endpoints (CRM → Assistant Server via Express)

All handoff endpoints are proxied through Express middleware at `/api/handoff/*`

#### Get Conversation Mode

**Endpoint**: `GET /api/handoff/conversations/:threadId/mode`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
X-Tenant-ID: tenant-undiscovered-2
```

**Response**:
```json
{
  "mode": "ai | human | hybrid | handoff_pending | cooldown_ai",
  "mode_version": 1,
  "operator_id": "user_67890",  // if in human mode
  "operator_name": "Sarah Johnson"  // if in human mode
}
```

#### Take Over Conversation

**Endpoint**: `POST /api/handoff/conversations/:threadId/takeover`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request**:
```json
{
  "operator_id": "user_67890",
  "operator_name": "Sarah Johnson"
}
```

**Response**:
```json
{
  "mode": "human",
  "mode_version": 2,
  "operator_id": "user_67890",
  "operator_name": "Sarah Johnson",
  "previous_mode": "ai"
}
```

#### Release to AI

**Endpoint**: `POST /api/handoff/conversations/:threadId/release`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Response**:
```json
{
  "mode": "cooldown_ai",
  "mode_version": 3,
  "previous_mode": "human"
}
```

#### List Operators

**Endpoint**: `GET /api/handoff/operators`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
X-Tenant-ID: tenant-undiscovered-2
```

**Query Params** (optional):
- `tenant_id` - Filter by tenant
- `status` - Filter by status (online, offline, available, busy)

**Response**:
```json
{
  "operators": [
    {
      "operator_id": "user_67890",
      "operator_name": "Sarah Johnson",
      "status": "available",
      "active_conversations": 2,
      "last_seen": "2025-12-06T10:30:00Z"
    }
  ]
}
```

#### Get Available Operator Count

**Endpoint**: `GET /api/handoff/operators/available/count`

**Response**:
```json
{
  "count": 5,
  "tenant_id": "tenant-undiscovered-2"
}
```

#### Update Operator Status

**Endpoint**: `PUT /api/handoff/operators/:operatorId/status`

**Request**:
```json
{
  "status": "available | busy | offline",
  "tenant_id": "tenant-undiscovered-2"
}
```

**Response**:
```json
{
  "operator_id": "user_67890",
  "status": "available",
  "updated_at": "2025-12-06T10:30:00Z"
}
```

#### Get Pending Handoff Requests

**Endpoint**: `GET /api/handoff/requests/pending`

**Query Params**:
- `tenant_id` - Filter by tenant

**Response**:
```json
{
  "requests": [
    {
      "request_id": "req_123",
      "thread_id": "thread_abc123xyz",
      "tenant_id": "tenant-undiscovered-2",
      "customer_name": "session_1733500000_abc123",
      "reason": "Customer requested human assistance",
      "priority": 0,
      "created_at": "2025-12-06T10:30:00Z",
      "timeout_at": "2025-12-06T10:35:00Z"
    }
  ]
}
```

#### Get Specific Handoff Request

**Endpoint**: `GET /api/handoff/requests/:requestId`

**Response**:
```json
{
  "request_id": "req_123",
  "thread_id": "thread_abc123xyz",
  "tenant_id": "tenant-undiscovered-2",
  "status": "pending | accepted | declined | expired",
  "customer_name": "session_1733500000_abc123",
  "reason": "Customer requested human assistance",
  "priority": 0,
  "created_at": "2025-12-06T10:30:00Z",
  "timeout_at": "2025-12-06T10:35:00Z",
  "operator_id": "user_67890",  // if accepted
  "accepted_at": "2025-12-06T10:30:15Z"  // if accepted
}
```

#### Get Timeout Schedule Config

**Endpoint**: `GET /api/handoff/config/timeout-schedule`

**Query Params**:
- `tenant_id` - Tenant identifier

**Response**:
```json
{
  "tenant_id": "tenant-undiscovered-2",
  "schedule_mode": "business_hours | ai_always | human_always",
  "default_timeout_seconds": 300,
  "weekly_schedule": {
    "monday": { "start": "09:00", "end": "17:00", "timeout_seconds": 300 },
    "tuesday": { "start": "09:00", "end": "17:00", "timeout_seconds": 300 },
    // ... rest of week
  }
}
```

#### Update Timeout Schedule Config

**Endpoint**: `PUT /api/handoff/config/timeout-schedule`

**Request**:
```json
{
  "tenant_id": "tenant-undiscovered-2",
  "schedule_mode": "business_hours",
  "default_timeout_seconds": 600,
  "weekly_schedule": {
    "monday": { "start": "09:00", "end": "17:00", "timeout_seconds": 300 }
  }
}
```

**Response**:
```json
{
  "tenant_id": "tenant-undiscovered-2",
  "schedule_mode": "business_hours",
  "updated_at": "2025-12-06T10:30:00Z"
}
```

---

## WebSocket Events (Socket.IO)

### Connection

**Server URL**:
- Dev: `http://localhost:8001`
- Prod: `https://chats.mytrip.ai`

**Transports**: `["websocket", "polling"]`

**Authentication**:
- Widget: Unauthenticated (customer-facing)
- CRM: JWT token in `auth` object (operator-facing)

### Room Joining

**Event**: `join_room`

**Format 1** (by room name):
```json
{
  "room": "tenant:tenant-undiscovered-2"
}
```

**Format 2** (by thread ID):
```json
{
  "thread_id": "thread_abc123xyz"
}
```

**Room Naming Conventions**:
- Tenant room: `tenant:<tenant_id>` (for handoff_request events)
- Thread room: `thread:<thread_id>` (for customer/operator messages)
- Alternative: `conversation:<thread_id>` (compatibility)

---

### Server → Client Events

#### 1. handoff_request (to tenant room)

**Room**: `tenant:tenant-undiscovered-2`

**Who Receives**: CRM operators

**Payload**:
```json
{
  "request_id": "req_123",
  "thread_id": "thread_abc123xyz",
  "tenant_id": "tenant-undiscovered-2",
  "customer_name": "session_1733500000_abc123",
  "reason": "AI indicated handoff: connect you to",
  "queue_position": 1,
  "timestamp": "2025-12-06T10:30:00Z"
}
```

**Trigger**: Customer asks for human, AI detects handoff pattern

**CRM Action**: Show HandoffModal with Accept/Decline buttons

---

#### 2. conversation_mode_changed (to thread room)

**Room**: `thread:thread_abc123xyz`

**Who Receives**: Widget (customer), CRM (operator)

**Payload**:
```json
{
  "thread_id": "thread_abc123xyz",
  "mode": "human",
  "operator_id": "user_67890",
  "operator_name": "Sarah Johnson",
  "mode_version": 2,
  "changed_at": "2025-12-06T10:30:15Z"
}
```

**Trigger**: Operator accepts/declines, releases to AI, schedule change

**Widget Action**: Update UI to show operator name

**CRM Action**: Update mode indicator badge

---

#### 3. operator_message (to thread room)

**Room**: `thread:thread_abc123xyz`

**Who Receives**: Widget (customer)

**Payload**:
```json
{
  "message_id": "msg_op_789",
  "thread_id": "thread_abc123xyz",
  "text": "Hi! I'd love to help you plan your Chamonix trip!",
  "sender": "operator",
  "sender_id": "user_67890",
  "sender_name": "Sarah Johnson",
  "seq": 1,
  "timestamp": "2025-12-06T10:31:30Z"
}
```

**Trigger**: Operator sends message via `send_message` event

**Widget Action**: Inject message into chat UI

**Deduplication**: Use `message_id` to prevent duplicates

---

#### 4. customer_message (to thread room)

**Room**: `thread:thread_abc123xyz`

**Who Receives**: CRM (operator)

**Payload**:
```json
{
  "thread_id": "thread_abc123xyz",
  "message_id": "msg_customer_456",
  "content": "Hi Sarah, I want to visit Chamonix",
  "timestamp": "2025-12-06T10:31:00Z",
  "tenant_id": "tenant-undiscovered-2",
  "customer_name": "session_1733500000_abc123"
}
```

**Trigger**: Customer sends message while in human mode

**CRM Action**: Display in ChatDetail conversation view

---

#### 5. typing_indicator (to thread room)

**Room**: `thread:thread_abc123xyz`

**Who Receives**: Widget (customer), CRM (operator)

**Payload**:
```json
{
  "thread_id": "thread_abc123xyz",
  "sender": "operator",
  "sender_name": "Sarah Johnson",
  "is_typing": true
}
```

**Trigger**: Operator starts/stops typing

**Widget Action**: Show "Sarah is typing..." indicator

---

#### 6. handoff_resolved (to tenant room)

**Room**: `tenant:tenant-undiscovered-2`

**Who Receives**: CRM operators

**Payload**:
```json
{
  "request_id": "req_123",
  "status": "accepted",
  "operator_id": "user_67890",
  "operator_name": "Sarah Johnson"
}
```

**Trigger**: Operator accepts or declines handoff request

**CRM Action**: Close HandoffModal, navigate to conversation

---

#### 7. handoff_expired (to tenant room)

**Room**: `tenant:tenant-undiscovered-2`

**Who Receives**: CRM operators

**Payload**:
```json
{
  "request_id": "req_123",
  "thread_id": "thread_abc123xyz",
  "reason": "timeout"
}
```

**Trigger**: Handoff request times out (default 5 minutes)

**CRM Action**: Remove from pending list, show notification

---

### Client → Server Events

#### 1. send_message (operator sends message)

**Sender**: CRM operator

**Auth Required**: Yes (JWT)

**Payload**:
```json
{
  "thread_id": "thread_abc123xyz",
  "text": "Hi! I'd love to help you plan your trip!",
  "sender_id": "user_67890",
  "sender_name": "Sarah Johnson"
}
```

**Server Action**:
1. Validate auth + rate limit (30 msgs/min)
2. Sanitize text (XSS protection)
3. Emit `operator_message` to thread room
4. Save to OpenAI thread (optional)
5. Log to Google Sheets

---

#### 2. take_over (operator takes control)

**Sender**: CRM operator

**Auth Required**: Yes (JWT)

**Payload**:
```json
{
  "thread_id": "thread_abc123xyz",
  "operator_id": "user_67890",
  "operator_name": "Sarah Johnson"
}
```

**Server Action**:
1. Transition mode to "human"
2. Update conversation_modes collection
3. Emit `conversation_mode_changed` to thread room

---

#### 3. release_to_ai (operator returns to AI)

**Sender**: CRM operator

**Auth Required**: Yes (JWT)

**Payload**:
```json
{
  "thread_id": "thread_abc123xyz"
}
```

**Server Action**:
1. Transition mode to "cooldown_ai"
2. Emit `conversation_mode_changed` to thread room

---

#### 4. typing / send_typing (typing indicator)

**Sender**: CRM operator

**Payload**:
```json
{
  "thread_id": "thread_abc123xyz",
  "is_typing": true
}
```

**Server Action**:
1. Rate limit check (100 events/min)
2. Emit `typing_indicator` to thread room

---

#### 5. accept_handoff (operator accepts request)

**Sender**: CRM operator

**Auth Required**: Yes (JWT)

**Payload**:
```json
{
  "request_id": "req_123",
  "operator_id": "user_67890",
  "operator_name": "Sarah Johnson"
}
```

**Server Action**:
1. Update handoff_requests: status="accepted"
2. Transition mode to "human"
3. Remove from Redis queue
4. Emit `handoff_resolved` to tenant room
5. Emit `conversation_mode_changed` to thread room

---

#### 6. decline_handoff (operator declines request)

**Sender**: CRM operator

**Auth Required**: Yes (JWT)

**Payload**:
```json
{
  "request_id": "req_123",
  "operator_id": "user_67890",
  "reason": "Currently at capacity"
}
```

**Server Action**:
1. Update handoff_requests: status="declined"
2. Keep mode as "handoff_pending"
3. Re-queue for other operators
4. Emit `handoff_resolved` to tenant room

---

#### 7. update_status (operator status change)

**Sender**: CRM operator

**Auth Required**: Yes (JWT)

**Payload**:
```json
{
  "operator_id": "user_67890",
  "status": "available | busy | offline"
}
```

**Server Action**:
1. Update Redis presence
2. Emit `operator_status_changed` to tenant room

---

## MongoDB Collections

### conversation_modes (Assistant Server)

**Purpose**: Track current mode for each conversation

```javascript
{
  "_id": ObjectId("..."),
  "thread_id": "thread_abc123xyz",
  "tenant_id": "tenant-undiscovered-2",
  "mode": "human",  // ai | human | hybrid | handoff_pending | cooldown_ai
  "operator_id": "user_67890",
  "operator_name": "Sarah Johnson",
  "version": 2,  // Optimistic locking
  "created_at": ISODate("2025-12-06T10:00:00Z"),
  "updated_at": ISODate("2025-12-06T10:30:15Z")
}
```

**Indexes**:
- `{ thread_id: 1 }` (unique)
- `{ tenant_id: 1, updated_at: -1 }`

---

### handoff_requests (Assistant Server)

**Purpose**: Track handoff requests and their lifecycle

```javascript
{
  "_id": ObjectId("..."),
  "request_id": "req_123",
  "thread_id": "thread_abc123xyz",
  "tenant_id": "tenant-undiscovered-2",
  "status": "accepted",  // pending | accepted | declined | expired
  "reason": "AI indicated handoff: connect you to",
  "customer_name": "session_1733500000_abc123",
  "context_summary": "Customer message: Can I speak with a human?",
  "priority": 0,
  "created_at": ISODate("2025-12-06T10:30:00Z"),
  "timeout_at": ISODate("2025-12-06T10:35:00Z"),
  "operator_id": "user_67890",
  "accepted_at": ISODate("2025-12-06T10:30:15Z"),
  "resolved_at": ISODate("2025-12-06T10:30:15Z")
}
```

**Indexes**:
- `{ timeout_at: 1 }` (for inactivity monitor)
- `{ status: 1, timeout_at: 1 }`

---

### request_thread (Assistant Server)

**Purpose**: Map user IDs to OpenAI thread IDs

```javascript
{
  "_id": ObjectId("..."),
  "request_id": "session_1733500000_abc123-/amalia",
  "thread_id": "thread_abc123xyz",
  "client_name": "tenant-undiscovered-2",
  "created_at": ISODate("2025-12-06T10:00:00Z")
}
```

---

### request_response (Assistant Server)

**Purpose**: Message history (chat transcript)

```javascript
{
  "_id": ObjectId("..."),
  "thread_id": "thread_abc123xyz",
  "role": "user | assistant",
  "content": "I want to plan a trip to the French Alps",
  "timestamp": ISODate("2025-12-06T10:30:00Z"),
  "origin": "Web Chat"
}
```

---

### tenant_timeout_config (Assistant Server)

**Purpose**: Per-tenant timeout and schedule configuration

```javascript
{
  "_id": ObjectId("..."),
  "tenant_id": "tenant-undiscovered-2",
  "schedule_mode": "business_hours",  // ai_always | business_hours | human_always
  "default_timeout_seconds": 300,
  "weekly_schedule": {
    "monday": { "start": "09:00", "end": "17:00", "timeout_seconds": 300 },
    "tuesday": { "start": "09:00", "end": "17:00", "timeout_seconds": 300 },
    "wednesday": { "start": "09:00", "end": "17:00", "timeout_seconds": 300 },
    "thursday": { "start": "09:00", "end": "17:00", "timeout_seconds": 300 },
    "friday": { "start": "09:00", "end": "17:00", "timeout_seconds": 300 },
    "saturday": null,  // Closed
    "sunday": null     // Closed
  },
  "timezone": "America/New_York",
  "updated_at": ISODate("2025-12-06T10:00:00Z")
}
```

---

## Redis Keys

### Mode Cache

**Key**: `mode:{thread_id}`

**Value**: JSON string
```json
{
  "mode": "human",
  "operator_id": "user_67890",
  "version": 2
}
```

**TTL**: 3600 seconds (1 hour)

---

### Operator Presence

**Key**: `presence:{tenant_id}:{operator_id}`

**Value**: JSON string
```json
{
  "status": "available",
  "last_heartbeat": "2025-12-06T10:30:00Z"
}
```

**TTL**: 30 seconds (requires heartbeat)

---

### Handoff Queue

**Key**: `queue:{tenant_id}`

**Type**: Sorted Set

**Members**: `request_id` scored by timestamp

**Commands**:
- `ZADD queue:tenant-undiscovered-2 1733500200 req_123`
- `ZRANGE queue:tenant-undiscovered-2 0 -1` (get all pending)

---

### Rate Limiting

**Key**: `rate_limit:{socket_id}`

**Type**: Counter

**TTL**: 60 seconds (1 minute window)

**Limits**:
- 100 events/min (general)
- 30 messages/min (send_message)

---

## Configuration Quick Reference

### Environment Variables (.env)

**Required**:
```bash
# OpenAI
OPENAI_API_KEY=sk-proj-...

# MongoDB
MONGO_USER=ubuntu
MONGO_PASSWORD=mongoPass3421

# Redis
REDIS_URL=redis://localhost:6379/0

# Handoff
ENABLE_HUMAN_HANDOFF=true
JWT_SECRET=your-secret-key-change-in-production
```

**Optional**:
```bash
# System-wide fallback (NOT for per-tenant config!)
# Per-tenant configuration is resolved dynamically from MongoDB assistants collection
DEFAULT_ASSISTANT_ID=asst_fallback_123

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174

# External APIs
AMADEUS_API_KEY=...
WEAVIATE_URL=http://localhost:8080
```

**Tenant Configuration** (MongoDB `assistants` collection):
```javascript
// Tenants are configured in MongoDB, NOT in .env
db.assistants.insertOne({
  tenant_id: "tenant-undiscovered-2",
  assistant_id: "asst_abc123",
  display_name: "Undiscovered Mountains"
})
```

---

### Widget Configuration (constants.ts)

**Development**:
```typescript
CHAT_BASE: "http://localhost:8001"
HANDOFF_SERVER: "http://localhost:8001"
TENANT_ID: "tenant-undiscovered-2"
```

**Production**:
```typescript
CHAT_BASE: "https://chats.mytrip.ai"
HANDOFF_SERVER: "https://chats.mytrip.ai"
TENANT_ID: "mytrip-ai"
```

---

### CRM Configuration

**Express Middleware (.env)**:
```bash
ASSISTANT_SERVER_URL=http://localhost:8001  # or https://chats.mytrip.ai
AUTH_MODE=bypass  # For local dev only
NODE_ENV=development
```

---

## Common Debugging Commands

### Check Flask Health
```bash
curl http://localhost:8001/health
```

### Test Chat Endpoint
```bash
curl -X POST http://localhost:8001/tenant-undiscovered-2/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello",
    "client_id": "test_user_123",
    "tenant_id": "tenant-undiscovered-2"
  }'
```

### Create Test Handoff
```bash
python trigger_handoff.py
```

### Check MongoDB Conversation Mode
```bash
mongosh
use assistant_chats
db.conversation_modes.findOne({ thread_id: "thread_abc123xyz" })
```

### Check Redis Mode Cache
```bash
redis-cli
GET mode:thread_abc123xyz
```

### Check Redis Queue
```bash
redis-cli
ZRANGE queue:tenant-undiscovered-2 0 -1 WITHSCORES
```

---

## Error Codes Reference

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 400 | Bad Request | Invalid client_name, missing parameters |
| 401 | Unauthorized | Missing/invalid JWT token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Thread ID not found, assistant not found |
| 409 | Conflict | Mode version mismatch (optimistic locking) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | OpenAI API failure, database error |
| 502 | Bad Gateway | Assistant Server unreachable |
| 504 | Gateway Timeout | Assistant Server timeout |

---

## Rate Limits

| Operation | Limit | Window |
|-----------|-------|--------|
| Chat requests | No limit (controlled by OpenAI) | - |
| WebSocket events | 100 events | 1 minute |
| send_message | 30 messages | 1 minute |
| Handoff requests | 10 requests | 1 minute |

---

## Security Headers

### Required for All Requests

```
Content-Type: application/json
```

### Required for CRM Requests

```
Authorization: Bearer <JWT_TOKEN>
X-Tenant-ID: <tenant_id>
```

### JWT Token Payload

```json
{
  "iat": 1733500000,
  "exp": 1733503600,
  "email": "operator@undiscoveredmountains.com",
  "roles": ["admin", "operator"],
  "tenants": [
    {
      "tenant": "tenant_id_from_mongodb",
      "roles": ["admin"]
    }
  ]
}
```

---

This quick reference should cover all the API contracts you need for integrating the three systems!
