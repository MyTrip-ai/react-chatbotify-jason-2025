# Phase 1: Token-Based Theming Implementation

## Overview

Phase 1 of the token-based theming system has been successfully implemented. This allows the chatbot to be styled dynamically using brand tokens that can be fetched from a database.

## What Was Implemented

### 1. **BrandTokens Type System** (`src/types/BrandTokens.ts`)

Created a comprehensive type definition for customizable brand tokens:

```typescript
export type BrandTokens = {
  primary: string;        // Bot elements color (#79C1B3)
  secondary: string;      // Secondary accent
  userAccent: string;     // User bubble outline (#998167)
  textPrimary: string;    // Primary text color
  textSecondary: string;  // Secondary text color
  surfaceAlpha: number;   // Glass transparency (0-1)
  blurPx: number;         // Backdrop blur strength
  fontFamily: string;     // Font stack
};
```

**Features:**
- Default tokens matching current MyTrip theme
- Validation function that clamps values to safe ranges
- Full TypeScript support

### 2. **Extended Settings Type** (`src/types/Settings.ts`)

Added `branding` property to the Settings interface:

```typescript
export type Settings = {
  branding?: BrandTokens;
  // ... other settings
};
```

### 3. **Refactored Theme System** (`src/themes/myTripTheme.tsx`)

Converted all hardcoded styles to dynamic functions that accept BrandTokens:

**Before:**
```typescript
const glassChatWindow: CSSProperties = {
  background: "rgba(255, 255, 255, 0.75)",
  backdropFilter: "blur(20px)",
};
```

**After:**
```typescript
const glassChatWindow = (branding: BrandTokens): CSSProperties => ({
  background: `rgba(255, 255, 255, ${branding.surfaceAlpha})`,
  backdropFilter: `blur(${branding.blurPx}px)`,
});
```

**Refactored exports:**
- `myTripFloatingSettings(branding)` - Function that returns settings
- `myTripFloatingStyles(branding)` - Function that returns styles
- `myTripEmbeddedSettings(branding)` - Function for embedded mode
- `myTripEmbeddedStyles(branding)` - Styles for embedded mode

### 4. **API Mapping Utility** (`src/utils/apiMapper.ts`)

Created utilities to map your existing database schema to BrandTokens:

```typescript
export const mapChatDesignToBrandTokens = (chatDesign: any): BrandTokens
export const mapApiToConfig = (apiData: any)
```

**Database Field Mapping:**
- `chatDesign.primaryTheme.color` → `primary`
- `chatDesign.secondaryTheme.color` → `secondary`
- `chatDesign.userBackgroundColor` → `userAccent`
- `chatDesign.botTextColor` → `textPrimary`
- `chatDesign.chatClosedColor` → `textSecondary`
- `chatDesign.transparency` → `surfaceAlpha`
- Default values for `blurPx` and `fontFamily` (not yet in DB)

### 5. **Database Integration Example** (`src/AppWithDatabaseConfig.tsx`)

Complete example showing how to fetch and apply database configuration:

```typescript
const fetchWidgetConfigByToken = async (token: string) => {
  const response = await fetch(`${API_URL}/api/chatwidgets`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return mapApiToConfig(data.docs[0]);
};
```

### 6. **Updated App.tsx**

Modified to use the new token-based system with default branding.

## How to Use

### Option 1: Use Default Branding (Current Behavior)

```typescript
import { defaultBrandTokens } from "./types/BrandTokens";
import { myTripFloatingSettings, myTripFloatingStyles } from "./themes/myTripTheme";

<ChatBot
  flow={flow}
  settings={myTripFloatingSettings(defaultBrandTokens)}
  styles={myTripFloatingStyles(defaultBrandTokens)}
/>
```

### Option 2: Use Custom Branding

```typescript
import { BrandTokens } from "./types/BrandTokens";

const customBranding: BrandTokens = {
  primary: "#FF5733",
  secondary: "#C70039",
  userAccent: "#900C3F",
  textPrimary: "#000000",
  textSecondary: "#666666",
  surfaceAlpha: 0.85,
  blurPx: 25,
  fontFamily: "'Roboto', sans-serif",
};

<ChatBot
  flow={flow}
  settings={myTripFloatingSettings(customBranding)}
  styles={myTripFloatingStyles(customBranding)}
/>
```

### Option 3: Fetch from Database (Recommended)

```typescript
import { useState, useEffect } from "react";
import { mapApiToConfig } from "./utils/apiMapper";

function App() {
  const [branding, setBranding] = useState(defaultBrandTokens);

  useEffect(() => {
    const loadConfig = async () => {
      const token = localStorage.getItem("authToken");
      const config = await fetchWidgetConfigByToken(token);
      if (config?.branding) {
        setBranding(config.branding);
      }
    };
    loadConfig();
  }, []);

  return (
    <ChatBot
      settings={myTripFloatingSettings(branding)}
      styles={myTripFloatingStyles(branding)}
    />
  );
}
```

## Testing the Implementation

### 1. Test with Default Branding

```bash
npm start
```

The chatbot should render with the default MyTrip theme.

### 2. Test with Custom Branding

Modify `src/App.tsx` to use custom tokens:

```typescript
const customBranding: BrandTokens = {
  ...defaultBrandTokens,
  primary: "#FF0000",
  surfaceAlpha: 0.9,
  blurPx: 30,
};
```

You should see:
- Red primary color on borders and bot bubbles
- More opaque glass surfaces (0.9 vs 0.75)
- Stronger blur effect (30px vs 20px)

### 3. Test with Database Integration

1. Set up your API endpoint in `.env`:
   ```
   REACT_APP_API_URL=http://localhost:3000
   ```

2. Use `AppWithDatabaseConfig.tsx` as your main component

3. Ensure your database has the required fields in `chatDesign`

## Database Schema Compatibility

### ✅ Currently Supported (from your DB)

- `primaryTheme.color` → Primary color
- `secondaryTheme.color` → Secondary color
- `userBackgroundColor` → User accent color
- `botTextColor` → Text primary color
- `chatClosedColor` → Text secondary color (repurposed)
- `transparency` → Surface alpha

### ⚠️ Using Defaults (not in DB yet)

- `blurPx` → Defaults to 20px
- `fontFamily` → Defaults to Lato/Avenir

### 🔧 Optional Future Additions

To enable full control, add these fields to your database schema:

```javascript
{
  "chatDesign": {
    "blurStrength": 20,              // NEW
    "fontFamily": "'Lato', sans-serif", // NEW
    "textSecondaryColor": "#666666"  // NEW (better semantics)
  }
}
```

## Files Created/Modified

### Created:
1. `src/types/BrandTokens.ts` - Token type and validation
2. `src/utils/apiMapper.ts` - Database mapping utilities
3. `src/AppWithDatabaseConfig.tsx` - Database integration example
4. `PHASE1_IMPLEMENTATION.md` - This documentation

### Modified:
1. `src/types/Settings.ts` - Added branding property
2. `src/themes/myTripTheme.tsx` - Refactored to use tokens
3. `src/App.tsx` - Updated to use token-based theme

## Benefits Achieved

✅ **Database-Driven Styling** - Colors and transparency can be changed via database  
✅ **No Code Deployment** - Designers update DB, changes reflect immediately  
✅ **Type Safety** - Full TypeScript support with validation  
✅ **Backward Compatible** - Existing code works with default tokens  
✅ **Multi-Tenant Ready** - Each tenant can have unique branding  
✅ **Validation Built-In** - Values are clamped to safe ranges  

## Next Steps (Future Phases)

### Phase 2: CSS Variables (Optional)
Implement runtime CSS variable injection for instant updates without page reload.

### Phase 3: Admin Panel Integration
Build UI in your admin panel to edit branding tokens with live preview.

### Phase 4: Database Schema Extension
Add `blurStrength` and `fontFamily` fields to database for complete control.

## Support

For questions or issues with the implementation, refer to:
- `developer_guide.md` - Original design proposal
- `src/types/BrandTokens.ts` - Token definitions
- `src/utils/apiMapper.ts` - Database mapping logic
