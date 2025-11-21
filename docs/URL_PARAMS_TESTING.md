# URL Parameters Testing Guide

## Overview

The chatbot now supports URL parameter overrides that allow you to customize the appearance and configuration without modifying the database or code.

## Supported URL Parameters

| Parameter | Type | Description | Example Value |
|-----------|------|-------------|---------------|
| `token` | string | Authorization token (overrides hardcoded token) | `abc123xyz` |
| `avatar` | string | Bot avatar URL (sets bot, button, and header) | `https://example.com/bot.png` |
| `logoUrl` | string | Header logo URL (overrides header avatar only) | `https://example.com/logo.png` |
| `avatarUrl` | string | Bot bubble avatar URL (overrides bot avatar only) | `https://example.com/avatar.png` |
| `chatButtonImageUrl` | string | Chat button icon URL | `https://example.com/button.png` |
| `primaryColor` | string | Primary theme color (hex without #) | `FF5733` |
| `secondaryColor` | string | Secondary theme color (hex without #) | `3498DB` |
| `title` | string | Header title text | `My Custom Bot` |
| `transparency` | number | Color transparency (0-1) | `0.8` |

## Priority Order

Configuration is applied in this order (lowest to highest priority):

1. **Default Configuration** - Hardcoded defaults
2. **Database Configuration** - Fetched via API token
3. **URL Parameters** - Override specific properties ⭐ **HIGHEST PRIORITY**

## Testing Examples

### Example 1: Change Colors

```
http://localhost:5173/?primaryColor=FF5733&secondaryColor=3498DB
```

**Expected Result:**
- Primary color changes to orange (#FF5733)
- Secondary color changes to blue (#3498DB)

### Example 2: Change Colors with Transparency

```
http://localhost:5173/?primaryColor=FF5733&transparency=0.5
```

**Expected Result:**
- Primary color becomes semi-transparent orange (#FF573380)
- Secondary color also gets 50% transparency applied

### Example 3: Change Title

```
http://localhost:5173/?title=Welcome%20to%20Support
```

**Expected Result:**
- Header title changes to "Welcome to Support"

### Example 4: Change Avatar (All)

```
http://localhost:5173/?avatar=https://i.pravatar.cc/150?img=1
```

**Expected Result:**
- Bot bubble avatar changes
- Chat button icon changes
- Header avatar changes
- All three use the same image

### Example 5: Change Specific Avatars

```
http://localhost:5173/?logoUrl=https://i.pravatar.cc/150?img=1&avatarUrl=https://i.pravatar.cc/150?img=2&chatButtonImageUrl=https://i.pravatar.cc/150?img=3
```

**Expected Result:**
- Header logo: Image 1
- Bot bubble avatar: Image 2
- Chat button icon: Image 3

### Example 6: Use Different Token

```
http://localhost:5173/?token=your-custom-token-here
```

**Expected Result:**
- Fetches configuration using the provided token instead of hardcoded one

### Example 7: Full Customization

```
http://localhost:5173/?token=abc123&primaryColor=2ECC71&secondaryColor=E74C3C&transparency=0.9&title=Custom%20Chat&avatar=https://i.pravatar.cc/150?img=5
```

**Expected Result:**
- Uses custom token
- Green primary color with 90% opacity
- Red secondary color with 90% opacity
- Title: "Custom Chat"
- Custom avatar for bot, button, and header

## How to Test

1. **Start the development server:**
   ```bash
   npm start
   ```

2. **Open browser with URL parameters:**
   - Base URL: `http://localhost:5173/`
   - Add parameters: `http://localhost:5173/?primaryColor=FF5733&title=Test`

3. **Check browser console:**
   - Look for logs showing URL parameters detected
   - Verify config after URL overrides is applied

4. **Verify visual changes:**
   - Colors should match hex values provided
   - Title should update in header
   - Avatars should load from provided URLs

## Debugging

### Check Console Logs

The following logs will appear in browser console:

```
🚀 AppWithDatabaseConfig component mounted
📊 Initial state - configLoaded: false
🔗 URL Parameters: { primaryColor: "FF5733", title: "Test", ... }
🔄 Starting loadConfig...
🔑 Token source: URL parameter | Hardcoded
📡 Calling fetchWidgetConfigByToken...
📦 Config received from database: {...}
🔗 Applying URL parameter overrides...
✨ Config after URL overrides: {...}
✅ Branding loaded: {...}
```

### Common Issues

1. **Colors not changing:**
   - Ensure hex color is valid (6 characters, no #)
   - Check console for validation errors

2. **Images not loading:**
   - Verify URL is accessible
   - Check CORS policy if loading from external domain

3. **Title not updating:**
   - Ensure URL encoding for spaces (`%20`)
   - Check console logs to verify parameter was parsed

4. **Transparency not working:**
   - Value must be between 0 and 1
   - Must provide color parameter along with transparency

## Implementation Files

- **Hook:** `src/hooks/useURLParams.ts` - Extracts URL parameters
- **Utilities:** `src/utils/colorHelpers.ts` - Color manipulation
- **Mapper:** `src/utils/apiMapper.ts` - Applies URL overrides
- **Component:** `src/AppWithDatabaseConfig.tsx` - Main integration

## Next Steps

Potential enhancements:
- Add localStorage persistence for widget state
- Add static path-based configurations
- Add more customization parameters
- Add URL parameter validation UI
