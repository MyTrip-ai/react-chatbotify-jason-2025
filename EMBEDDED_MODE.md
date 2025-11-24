# Embedded Mode Documentation

## Overview

The chatbot supports two display modes:
- **Floating Mode** (default): Chatbot appears as a floating button in the bottom-right corner
- **Embedded Mode**: Chatbot is embedded inline within a page container

## URL Parameter

You can enable embedded mode by adding `?embedded=true` to the URL:

```
http://localhost:3000?embedded=true
```

## How It Works

1. **URL Parameter Extraction** (`src/hooks/useURLParams.ts`)
   - Reads `embedded` parameter from URL query string
   - Returns `"true"` or `undefined`

2. **Configuration Override** (`src/utils/apiMapper.ts`)
   - `applyURLParamOverrides()` converts the string to boolean
   - Sets `config.general.embedded = true` when URL has `?embedded=true`

3. **Settings Merge** (`src/AppWithDatabaseConfig.tsx`)
   - Merges URL parameter overrides with database config
   - Priority: URL params > Database config > Default settings

4. **Style Selection** (`src/AppWithDatabaseConfig.tsx`)
   - Dynamically selects styles based on `mergedSettings.general.embedded`
   - Embedded: `myTripEmbeddedStyles()` - relative positioning, no button
   - Floating: `myTripFloatingStyles()` - fixed positioning, floating button

## Testing Embedded Mode

### Method 1: Direct URL (Quickest)

1. Start the dev server:
   ```bash
   npm start
   ```

2. Open browser to:
   ```
   http://localhost:3000?embedded=true
   ```

3. You should see:
   - ✅ No floating chat button
   - ✅ No close button in header
   - ✅ Chatbot fills the container width
   - ✅ Relative positioning (not fixed)

### Method 2: Using Demo HTML File

1. Start the dev server:
   ```bash
   npm start
   ```

2. Open `embed-demo.html` in your browser
   - The file contains a full website mockup
   - Chatbot is embedded in an iframe with `?embedded=true`
   - Shows how the chatbot looks within a real website

### Method 3: Toggle Between Modes

Compare both modes by visiting:
- Floating: `http://localhost:3000`
- Embedded: `http://localhost:3000?embedded=true`

## Differences Between Modes

| Feature | Floating Mode | Embedded Mode |
|---------|--------------|---------------|
| Chat Button | ✅ Visible | ❌ Hidden |
| Tooltip | ✅ Visible | ❌ Hidden |
| Close Button | ✅ Visible | ❌ Hidden |
| Position | Fixed (bottom-right) | Relative (in container) |
| Width | 420px | 100% |
| Height | 580px | auto |
| Z-Index | 10000 | none |
| Box Shadow | Yes | No |

## Code References

### Settings Configuration
```typescript
// src/themes/myTripTheme.tsx
export const myTripFloatingSettings = (branding) => ({
  general: { embedded: false }
});

export const myTripEmbeddedSettings = (branding) => ({
  general: { embedded: true }
});
```

### Styles Configuration
```typescript
// src/themes/myTripTheme.tsx
export const myTripEmbeddedStyles = (branding) => ({
  chatWindowStyle: {
    position: "relative",
    width: "100%",
    height: "auto",
    boxShadow: "none",
  },
  chatButtonStyle: {
    display: "none",
  },
});
```

### URL Parameter Support
```typescript
// src/hooks/useURLParams.ts
export type URLParams = {
  embedded?: string;
  // ... other params
};

// src/utils/apiMapper.ts
if (urlParams.embedded !== undefined) {
  overriddenConfig.general = overriddenConfig.general || {};
  overriddenConfig.general.embedded = urlParams.embedded === "true";
}
```

## Integration Example

To embed the chatbot in your own website:

```html
<div style="width: 600px; height: 700px; border: 1px solid #ccc;">
  <iframe 
    src="http://localhost:3000?embedded=true"
    width="100%" 
    height="100%" 
    frameborder="0"
    allow="microphone">
  </iframe>
</div>
```

## Additional URL Parameters

You can combine `embedded=true` with other URL parameters:

```
http://localhost:3000?embedded=true&primaryColor=FF5733&title=Support%20Chat
```

Supported parameters:
- `embedded` - Enable embedded mode
- `token` - Authentication token
- `avatar` - Bot avatar URL
- `logoUrl` - Header logo URL
- `primaryColor` - Primary theme color
- `secondaryColor` - Secondary theme color
- `title` - Header title
- `transparency` - Color transparency (0-1)

## Troubleshooting

**Issue**: Chatbot still shows floating button in embedded mode
- **Solution**: Check browser console for the `embedded` setting value
- Verify URL has `?embedded=true` (not `?embedded=1` or other values)

**Issue**: Iframe not loading
- **Solution**: Ensure dev server is running on port 3000
- Check for CORS issues in browser console

**Issue**: Styles not applying correctly
- **Solution**: Clear browser cache and hard reload (Cmd+Shift+R / Ctrl+Shift+R)
