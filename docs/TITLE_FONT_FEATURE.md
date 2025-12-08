# Title Font Customization Feature

**Date**: December 8, 2025  
**Status**: ✅ Implemented

---

## Overview

This feature allows you to customize the font family of the chat widget's header title. The font can be set via:
1. **Database configuration** (persistent)
2. **URL parameter** (temporary override)

---

## Usage

### 1. URL Parameter (Quick Testing)

Add the `titleFont` parameter to your URL:

```
# Example with Google Fonts
?titleFont=Roboto

# Example with system fonts
?titleFont=Arial

# Example with multiple fallbacks
?titleFont=Roboto,sans-serif

# Combined with other parameters
?chatType=embedded&title=Support&titleFont=Poppins
```

**Supported Font Formats**:
- Single font: `?titleFont=Arial`
- Font with fallbacks: `?titleFont=Roboto,sans-serif`
- Font with spaces (URL encoded): `?titleFont=Open%20Sans`

---

### 2. Database Configuration (Persistent)

Add the `headerFont` field to your ChatWidget document in the database.

#### Database Schema Location

**Collection**: `ChatWidget`  
**Field Path**: `chatDesign.headerFont`  
**Type**: `String`  
**Optional**: Yes

#### Database Structure

```javascript
{
  name: "My Chat Widget",
  endpoint: "https://api.example.com/chat",
  tenantId: "tenant_123",
  
  chatDesign: {
    chatType: "embedded",
    headerText: "Customer Support",
    headerFont: "Roboto, sans-serif",  // ← ADD THIS FIELD
    
    // ... other chatDesign fields
  }
}
```

---

## Database Model Update

You need to add the `headerFont` field to your ChatWidget model schema.

### Location
`apps/express_middleware/src/models/chatwidget.model.js`

### Add to Schema

In the `chatDesign` nested object, add:

```javascript
chatDesign: {
  // ... existing fields
  
  headerText: {
    type: String,
    default: "AI Assistant"
  },
  
  // ADD THIS NEW FIELD
  headerFont: {
    type: String,
    default: undefined,  // Optional field, no default
    trim: true
  },
  
  // ... other fields
}
```

### Complete Example

```javascript
const chatDesignSchema = new Schema({
  // ... other chatDesign fields
  
  headerText: {
    type: String,
    default: "AI Assistant"
  },
  
  headerFont: {
    type: String,
    trim: true,
    // Optional: Add validation for common font families
    validate: {
      validator: function(v) {
        // Allow empty or valid font family strings
        if (!v) return true;
        // Basic validation: allow letters, numbers, spaces, commas, hyphens
        return /^[a-zA-Z0-9\s,\-]+$/.test(v);
      },
      message: props => `${props.value} is not a valid font family!`
    }
  },
  
  backgroundColor: {
    type: String,
    default: "#fff"
  },
  
  // ... other fields
});
```

---

## Implementation Details

### Frontend Flow

1. **URL Parameter Extraction** (`useURLParams.ts`)
   - Extracts `titleFont` from URL query string
   - Type: `string | undefined`

2. **Database Mapping** (`apiMapper.ts`)
   - Maps `chatDesign.headerFont` from database to `header.fontFamily`
   - Applies URL parameter override if present
   - Priority: URL param > Database value

3. **Style Application** (`AppWithDatabaseConfig.tsx`)
   - Applies `fontFamily` to `headerStyle` CSS property
   - Merges with existing header styles

### Configuration Priority

1. **URL Parameter** (`?titleFont=...`) - Highest priority
2. **Database Field** (`chatDesign.headerFont`)
3. **Theme Default** (from `myTripTheme.tsx`)

---

## Testing

### Test Cases

#### 1. Test URL Parameter
```bash
# Test with single font
http://localhost:5173/?titleFont=Arial

# Test with Google Font
http://localhost:5173/?titleFont=Roboto

# Test with fallbacks
http://localhost:5173/?titleFont=Poppins,sans-serif

# Test with title and font
http://localhost:5173/?title=Support%20Chat&titleFont=Montserrat
```

#### 2. Test Database Configuration

**Create a test widget**:
```javascript
// MongoDB or API request
{
  name: "Font Test Widget",
  endpoint: "https://api.example.com/chat",
  tenantId: "tenant_123",
  chatDesign: {
    chatType: "popup",
    headerText: "Custom Font Test",
    headerFont: "Georgia, serif"
  }
}
```

**Access the widget**:
```
http://localhost:5173/{widget-id-or-path}
```

#### 3. Test Priority (URL Override)

**Database has**: `headerFont: "Arial"`  
**URL has**: `?titleFont=Roboto`  
**Expected Result**: Title uses Roboto (URL wins)

---

## Using Google Fonts

If you want to use Google Fonts, you need to load them first.

### Option 1: Add to index.html

```html
<!-- In public/index.html -->
<head>
  <!-- ... other tags -->
  
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
</head>
```

Then use in URL or database:
```
?titleFont=Roboto
```

### Option 2: Dynamic Loading (Advanced)

You could implement dynamic font loading based on the `headerFont` value, but this is more complex and not currently implemented.

---

## Examples

### Example 1: Professional Sans-Serif
```javascript
{
  chatDesign: {
    headerText: "Customer Support",
    headerFont: "Inter, system-ui, sans-serif"
  }
}
```

### Example 2: Elegant Serif
```javascript
{
  chatDesign: {
    headerText: "Concierge Service",
    headerFont: "Playfair Display, Georgia, serif"
  }
}
```

### Example 3: Modern Rounded
```javascript
{
  chatDesign: {
    headerText: "Help Center",
    headerFont: "Poppins, Helvetica, sans-serif"
  }
}
```

### Example 4: System Fonts (Fast Loading)
```javascript
{
  chatDesign: {
    headerText: "Support",
    headerFont: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  }
}
```

---

## Console Debugging

When the font is applied, you'll see these console logs:

```
🔤 [Font Override] Applying header font family: Roboto, sans-serif
🔤 [Font Override] Updated headerStyle: { fontFamily: "Roboto, sans-serif", ... }
```

---

## API Response Example

When fetching widget config from the API, the response should include:

```json
{
  "docs": [
    {
      "chatDesign": {
        "chatType": "embedded",
        "headerText": "Customer Support",
        "headerFont": "Roboto, sans-serif",
        "backgroundColor": "#ffffff",
        ...
      },
      ...
    }
  ]
}
```

---

## Troubleshooting

### Font Not Applying

**Check**:
1. Font is loaded (check browser DevTools > Network tab)
2. Font name is spelled correctly
3. Console shows the font override log
4. Browser supports the font

**Debug**:
```javascript
// In browser console
console.log(document.querySelector('.rcb-chat-header').style.fontFamily);
```

### Font Looks Different Than Expected

**Possible Causes**:
- Font not loaded (using fallback)
- Font weight not loaded (only specific weights work)
- Browser doesn't support the font

**Solution**:
- Always include fallback fonts: `"Roboto, Arial, sans-serif"`
- Load multiple font weights if needed
- Test in different browsers

---

## Related Files

### Modified Files
1. `src/hooks/useURLParams.ts` - Added `titleFont` parameter
2. `src/utils/apiMapper.ts` - Added `headerFont` mapping and URL override
3. `src/AppWithDatabaseConfig.tsx` - Added font style application

### Database Files (You Need to Update)
1. `apps/express_middleware/src/models/chatwidget.model.js` - Add `headerFont` field

---

## Summary

✅ **Frontend**: Fully implemented and ready to use  
⚠️ **Backend**: You need to add `headerFont` field to the ChatWidget model

### Quick Start

1. **Add to database model**:
   ```javascript
   headerFont: { type: String, trim: true }
   ```

2. **Test with URL**:
   ```
   ?titleFont=Roboto
   ```

3. **Add to database documents**:
   ```javascript
   chatDesign: { headerFont: "Roboto, sans-serif" }
   ```

That's it! 🎉
