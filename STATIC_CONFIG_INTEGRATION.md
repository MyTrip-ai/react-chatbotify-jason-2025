# Static Path Configuration Integration

## Overview

The static path configuration system has been successfully integrated into the React Chatbotify widget. This allows you to define chatbot configurations for specific URL paths without needing database entries.

## Configuration Priority Order

The system now follows the documented priority order:

```
1. Default Config (defaultChatbotConfig.js) - Fallback
   ↓
2. Static Path Config (chatbotConfig.js) - If path matches
   ↓
3. Database Config (API) - If token available
   ↓
4. URL Parameters - Override specific properties
```

## Files Created/Modified

### New Files

1. **`src/hooks/useStaticConfig.ts`**
   - Custom hook to retrieve static configuration based on URL path
   - Returns configuration from `chatbotConfig.js` if path matches
   - Returns `defaultChatbotConfig.js` if no path or root path
   - Returns `null` if path doesn't match any static config (allows database lookup)

2. **`src/hooks/useCurrentPath.ts`** (included in useStaticConfig.ts)
   - Extracts and returns current URL path without leading slash

3. **`src/utils/staticConfigMapper.ts`**
   - Maps static configuration format to app configuration format
   - Extracts branding tokens from static config settings
   - Handles JSX elements in config (header.title, footer.text, etc.)

### Modified Files

1. **`src/AppWithDatabaseConfig.tsx`**
   - Integrated static configuration loading
   - Implemented proper priority order
   - Added logic to check static config before attempting database fetch

## How It Works

### URL Path Routing

The system automatically detects the URL path and loads the appropriate configuration:

#### Example 1: Static Path Configuration
```
URL: http://localhost:3002/coastlinetravel

Flow:
1. useStaticConfig extracts "coastlinetravel"
2. Finds chatbotConfig.coastlinetravel
3. Maps to app format using staticConfigMapper
4. Applies URL parameter overrides
5. Renders chatbot with coastlinetravel configuration
```

#### Example 2: Database Configuration
```
URL: http://localhost:3002/686f2d8101f78ff2b397c172

Flow:
1. useStaticConfig extracts "686f2d8101f78ff2b397c172"
2. No match in chatbotConfig (returns null)
3. Attempts to fetch token from API using ID
4. Fetches configuration from database
5. Applies URL parameter overrides
6. Renders chatbot with database configuration
```

#### Example 3: Default Configuration
```
URL: http://localhost:3002/ (root)

Flow:
1. useStaticConfig detects root path
2. Returns defaultChatbotConfig
3. Maps to app format
4. Applies URL parameter overrides
5. Renders chatbot with default configuration
```

### Configuration Mapping

The static configs (from `chatbotConfig.js` and `defaultChatbotConfig.js`) use the old react-chatbotify format with nested settings. The `staticConfigMapper` converts this to the app's expected format:

**Static Config Format:**
```javascript
{
  message: "Hello!",
  settings: {
    general: { primaryColor: "#030842" },
    header: { title: <div>Title</div>, avatar: "..." },
    botBubble: { avatar: "..." },
    // ... more settings
  }
}
```

**Mapped App Format:**
```javascript
{
  branding: { primary: "#030842", ... },
  general: { defaultHelloMessage: "Hello!", ... },
  header: { title: <div>Title</div>, avatar: "..." },
  botBubble: { avatar: "..." },
  // ... more properties
}
```

## Available Static Paths

Based on `chatbotConfig.js`, the following paths are available:

- `/coastlinetravel` - Coastline Travel AI Assistant
- `/amalia` - Amalia travel assistant
- `/assistant` - MyTrip.AI Assistant Designer
- `/antarctica` - Antarctica Cruise (Sir Ernest Shackleton)
- `/luxurycruisecollection` - Luxury Cruise Collection
- `/southamericatours` - South America Tours
- `/chatdarwin` - Chat Darwin
- `/latinexcursions` - Latin Excursions
- `/widgety` - Widgety

## Testing

### Test Static Configuration
```bash
# Test coastlinetravel config
http://localhost:3002/coastlinetravel

# Test amalia config
http://localhost:3002/amalia

# Test default config (root)
http://localhost:3002/
```

### Test with URL Parameters
```bash
# Override primary color
http://localhost:3002/amalia?primaryColor=FF5733

# Override title and avatar
http://localhost:3002/coastlinetravel?title=Custom%20Title&avatar=https://example.com/avatar.png

# Enable embedded mode with custom size
http://localhost:3002/assistant?embedded=true&width=600&height=700
```

### Test Database Configuration
```bash
# Use database config with assistant ID
http://localhost:3002/686f2d8101f78ff2b397c172

# Use database config with token parameter
http://localhost:3002/?token=your-jwt-token-here
```

## JSX Elements Support

The static configs contain JSX elements (React components) in fields like `header.title` and `footer.text`. The system properly handles these:

```javascript
// Static config with JSX
header: {
  title: <div style={{ cursor: 'pointer', fontSize: '20px' }}>
    My Custom Title
  </div>
}

// This is preserved and rendered correctly in the app
```

## Debugging

The system includes extensive console logging to help debug configuration loading:

```javascript
console.log("🗺️ Static config available:", !!staticConfig);
console.log("📍 Current path:", currentPath);
console.log("✅ Using static configuration for path:", currentPath);
console.log("✨ Final config source:", configSource);
```

Look for these emoji-prefixed logs in the browser console to understand which configuration source is being used.

## Benefits

1. **No Database Required**: Define configurations directly in code for known paths
2. **Fast Loading**: No API calls needed for static configs
3. **Easy Testing**: Quickly test different configurations by changing URL path
4. **Fallback Support**: Gracefully falls back to database or default config
5. **URL Override**: All configs support URL parameter overrides
6. **Type Safety**: TypeScript support for configuration structure

## Migration Notes

If you have existing database configurations, they will continue to work. The system only uses static configs when:
1. The URL path matches a key in `chatbotConfig.js`, OR
2. The URL is root path (uses `defaultChatbotConfig.js`)

For assistant IDs or unknown paths, the system automatically attempts database lookup.

## Future Enhancements

Potential improvements for the static configuration system:

1. **Regex Path Matching**: Support patterns like `/travel/*`
2. **Config Merging**: Merge static and database configs instead of overriding
3. **Hot Reloading**: Reload configs without page refresh in development
4. **Config Validation**: Validate static configs at build time
5. **Config Editor**: Visual editor for static configurations
