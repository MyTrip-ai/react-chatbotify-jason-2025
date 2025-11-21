# Settings Flow Documentation

## Overview

This document explains how the React Chatbotify widget retrieves and applies settings, including the priority order when multiple configuration sources are available.

---

## Table of Contents

1. [Configuration Sources](#configuration-sources)
2. [Priority Order](#priority-order)
3. [Detailed Flow](#detailed-flow)
4. [Widget State Priority](#widget-state-priority)
5. [URL Parameters Override](#url-parameters-override)
6. [Code Examples](#code-examples)

---

## Configuration Sources

The widget can receive configuration from multiple sources:

1. **Default Configuration** (`defaultChatbotConfig.js`)
   - Hardcoded fallback configuration
   - Used when no other configuration is available

2. **Static Configuration** (`chatbotConfig.js`)
   - Path-based static configurations (e.g., `coastlinetravel`, `amalia`)
   - Manually defined configurations for specific paths

3. **Database/API Configuration**
   - Fetched from Express Middleware API using a token
   - Retrieved from Payload Backend using an assistant ID
   - Mapped from API response to chatbot format via `configMapper.js`

4. **URL Parameters**
   - Query string parameters that override specific settings
   - Applied on top of the base configuration

5. **LocalStorage**
   - User's saved preferences (primarily for widget open/closed state)
   - Highest priority for state management

---

## Priority Order

### For Base Configuration (Lowest to Highest Priority)

```
1. Default Config (defaultChatbotConfig.js)
   ↓
2. Static Config (chatbotConfig.js) - if path matches
   ↓
3. Database Config (API) - if token or ID available
   ↓
4. URL Parameters - override specific properties
```

### For Widget Open/Closed State (Lowest to Highest Priority)

```
1. Default (closed)
   ↓
2. Database Configuration (onPageLoadDisplay)
   ↓
3. URL Parameter (?onPageLoadDisplay=open)
   ↓
4. LocalStorage (user's last preference) - HIGHEST PRIORITY
```

---

## Detailed Flow

### Step 1: Initialize with Default Configuration

The widget starts with `defaultChatbotConfig` as the base configuration.

**File:** `my-chatbot-app/src/hooks/useWidgetConfig.js`
```javascript
const [widgetConfig, setWidgetConfig] = useState(defaultChatbotConfig);
```

### Step 2: Determine Configuration Source

The `useWidgetConfig` hook determines which configuration to load based on available parameters:

#### Priority 1: Token-based Configuration

If a `token` URL parameter exists, fetch configuration from Express Middleware:

```javascript
// Priority 1: If token exists, use it
if (token) {
    config = await fetchWidgetConfigByToken(token);
}
```

**API Endpoint:** `${EXPRESS_MIDDLEWARE}/api/chatwidgets`
- Headers: `Authorization: Bearer ${token}`
- Response: Widget configuration from database
- Mapping: `mapApiToConfig()` converts API response to chatbot format

#### Priority 2: Static Path Configuration

If no token but `currentPath` matches a key in `chatbotConfig.js`:

```javascript
// Priority 2: Check if currentPath exists in chatbotConfig
const cleanedPath = currentPath.replace(/^\//, '');

if (cleanedPath && chatbotConfig[cleanedPath]) {
    config = chatbotConfig[cleanedPath];
}
```

**Example paths:**
- `/coastlinetravel` → Uses `chatbotConfig.coastlinetravel`
- `/amalia` → Uses `chatbotConfig.amalia`

#### Priority 3: Fetch Token by ID

If no token and path not in static config, attempt to fetch token using the path as an ID:

```javascript
// Priority 3: Try to fetch token by currentPath ID
config = await fetchTokenById(cleanedPath);
```

**API Endpoint:** `${PAYLOAD_BACKEND}/api/assistants/token-by-id`
- Method: POST
- Body: `{ id: cleanedPath }`
- Response: `{ token: "..." }`
- Then fetches widget config using the returned token

### Step 3: Apply URL Parameters

After base configuration is loaded, URL parameters override specific properties:

**File:** `my-chatbot-app/src/hooks/useWidgetConfig.js` (lines 130-185)

URL parameters are applied in this order:

1. **avatar** - Overrides bot avatar, chat button icon, and header avatar
2. **logoUrl** - Overrides header avatar specifically
3. **avatarUrl** - Overrides bot bubble avatar
4. **chatButtonImageUrl** - Overrides chat button icon
5. **primaryColor** - Overrides primary theme color (with transparency)
6. **secondaryColor** - Overrides secondary theme color (with transparency)
7. **title** - Overrides header title text
8. **transparency** - Applied to color values (0-1 range)

**Example:**
```
?token=abc123&primaryColor=FF5733&transparency=0.8&title=My%20Custom%20Bot
```

### Step 4: Widget State Management

The widget's open/closed state follows a separate priority system managed by `useWidgetState` hook:

**File:** `my-chatbot-app/src/hooks/useWidgetState.js`

```javascript
// Priority 1: LocalStorage (user's last preference)
const savedState = localStorage.getItem("rchat_widget_state");
if (savedState === "open" || savedState === "closed") {
    setIsOpen(savedState === "open");
    return;
}

// Priority 2: URL parameter
if (urlOnPageLoadDisplay !== null) {
    setIsOpen(urlOnPageLoadDisplay.toLowerCase() === 'open');
    return;
}

// Priority 3: Database configuration
if (dbDefaultState !== null) {
    setIsOpen(dbDefaultState);
    return;
}

// Priority 4: Default fallback (closed)
setIsOpen(false);
```

---

## Widget State Priority

The widget state (open/closed) is handled separately from other settings to respect user preferences:

### Priority Levels

| Priority | Source | Description | Override Behavior |
|----------|--------|-------------|-------------------|
| **1 (Highest)** | LocalStorage | User's last interaction | Always wins - respects user choice |
| **2** | URL Parameter | `?onPageLoadDisplay=open` | Overrides DB and default |
| **3** | Database Config | `onPageLoadDisplay` field | Overrides default only |
| **4 (Lowest)** | Default | Hardcoded `false` (closed) | Used when nothing else is set |

### State Persistence

When the user opens or closes the widget:
1. State is saved to `localStorage` with key `rchat_widget_state`
2. Message is posted to parent window: `{ type: "rchat_widget_state", value: "open" | "closed" }`
3. On next page load, localStorage value takes priority

---

## URL Parameters Override

### Available URL Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `token` | string | Authorization token for API config | `?token=abc123` |
| `skipInitialStateCheck` | boolean | Skip initial state validation | `?skipInitialStateCheck=true` |
| `avatar` | string | Bot avatar URL | `?avatar=https://...` |
| `logoUrl` | string | Header logo URL | `?logoUrl=https://...` |
| `avatarUrl` | string | Bot bubble avatar URL | `?avatarUrl=https://...` |
| `chatButtonImageUrl` | string | Chat button icon URL | `?chatButtonImageUrl=https://...` |
| `primaryColor` | string | Primary theme color (hex) | `?primaryColor=FF5733` |
| `secondaryColor` | string | Secondary theme color (hex) | `?secondaryColor=3498DB` |
| `title` | string | Header title text | `?title=My%20Bot` |
| `onPageLoadDisplay` | string | Initial state: "open" or "closed" | `?onPageLoadDisplay=open` |
| `transparency` | number | Color transparency (0-1) | `?transparency=0.8` |

### Color Handling with Transparency

When both color and transparency are provided:

1. Color is converted to hex format (if named color)
2. Transparency (0-1) is converted to hex (00-FF)
3. Alpha channel is appended to color: `#RRGGBBAA`

**Example:**
```
?primaryColor=blue&transparency=0.5
→ #0000FF80 (blue with 50% transparency)
```

---

## Code Examples

### Example 1: Token-based Configuration

```javascript
// URL: https://example.com/?token=mytoken123

// Flow:
// 1. useURLParams extracts token
// 2. useWidgetConfig calls fetchWidgetConfigByToken(token)
// 3. API returns configuration
// 4. mapApiToConfig converts to chatbot format
// 5. URL params applied on top
```

### Example 2: Static Path Configuration

```javascript
// URL: https://example.com/amalia

// Flow:
// 1. useCurrentPath extracts "amalia"
// 2. useWidgetConfig checks chatbotConfig["amalia"]
// 3. Found! Uses static config
// 4. URL params applied on top
```

### Example 3: ID-based Configuration

```javascript
// URL: https://example.com/67890abcdef

// Flow:
// 1. useCurrentPath extracts "67890abcdef"
// 2. useWidgetConfig checks chatbotConfig["67890abcdef"] - not found
// 3. Calls fetchTokenById("67890abcdef")
// 4. API returns token
// 5. Fetches config using token
// 6. URL params applied on top
```

### Example 4: Full URL Override

```javascript
// URL: https://example.com/amalia?primaryColor=FF5733&title=Custom%20Title&onPageLoadDisplay=open

// Flow:
// 1. Base config from chatbotConfig.amalia
// 2. primaryColor overridden to #FF5733
// 3. title overridden to "Custom Title"
// 4. Widget opens on load (unless user previously closed it)
```

### Example 5: User Preference Override

```javascript
// Scenario: User previously closed the widget
// localStorage: rchat_widget_state = "closed"
// URL: ?onPageLoadDisplay=open
// Database: defaultOpen = true

// Result: Widget stays CLOSED (localStorage wins)
```

---

## Configuration Mapping

### API to Chatbot Config Mapping

**File:** `my-chatbot-app/src/utils/configMapper.js`

The `mapApiToConfig` function maps database fields to chatbot settings:

| API Field | Chatbot Setting | Notes |
|-----------|----------------|-------|
| `generalSettings.defaultHelloMessage` | `message` | Initial greeting |
| `chatDesign.chatButtonImage` | `settings.chatButton.icon` | Button icon |
| `chatDesign.botAvatar` | `settings.botBubble.avatar` | Bot avatar |
| `chatDesign.chatWidgetyLogo` | `settings.header.avatar` | Header logo |
| `chatDesign.chatAvatarImage` | `settings.userBubble.avatar` | User avatar |
| `chatDesign.onPageLoadDisplay` | `settings.chatWindow.defaultOpen` | "open" → true |
| `chatDesign.primaryTheme.color` | `settings.general.primaryColor` | With transparency |
| `chatDesign.secondaryTheme.color` | `settings.general.secondaryColor` | With transparency |
| `chatDesign.transparency` | Applied to colors | 0-1 → hex alpha |
| `chatDesign.headerText` or `name` | `settings.header.title` | Header text |

---

## Summary

### Configuration Priority (Simplified)

```
Default Config
    ↓ (overridden by)
Static Path Config (if path matches)
    ↓ (overridden by)
Database/API Config (if token/ID available)
    ↓ (overridden by)
URL Parameters (specific properties only)
```

### State Priority (Simplified)

```
Default (closed)
    ↓ (overridden by)
Database Config
    ↓ (overridden by)
URL Parameter
    ↓ (overridden by)
LocalStorage (user preference) ← ALWAYS WINS
```

### Key Takeaways

1. **LocalStorage always wins** for widget state - respects user interaction
2. **URL parameters override** specific visual properties but not the base config
3. **Token-based config** has priority over static path config
4. **Default config** is the ultimate fallback
5. **Transparency** is applied to colors from both API and URL parameters

---

## Related Files

- `my-chatbot-app/src/hooks/useWidgetConfig.js` - Main configuration logic
- `my-chatbot-app/src/hooks/useWidgetState.js` - State management with priority
- `my-chatbot-app/src/hooks/useURLParams.js` - URL parameter extraction
- `my-chatbot-app/src/utils/configMapper.js` - API to config mapping
- `my-chatbot-app/src/utils/colorHelpers.js` - Color and transparency utilities
- `my-chatbot-app/src/defaultChatbotConfig.js` - Default configuration
- `my-chatbot-app/src/chatbotConfig.js` - Static path configurations
- `my-chatbot-app/src/App.js` - Main component integration
