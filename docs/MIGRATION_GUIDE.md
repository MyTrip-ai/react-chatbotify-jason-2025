# Migration Guide: ChatWidget Schema Updates

## Overview

This guide documents the migration from the legacy ChatWidget schema to the new schema that supports distinct **embedded** and **popup** modes with device-specific configurations.

**Date**: December 8, 2025  
**Version**: 2.0

---

## What Changed?

### New Schema Structure

The ChatWidget model now uses a more structured approach to define widget appearance:

#### 1. **chatType Field** (NEW)
- **Location**: `chatDesign.chatType`
- **Values**: `"embedded"` | `"popup"`
- **Purpose**: Explicitly defines the widget display mode

#### 2. **Embedded Mode Configuration** (NEW)
- **Location**: `chatDesign.embeddedDimensions`
- **Fields**:
  - `height` (Number): Height in pixels
  - `width` (Number): Width in pixels

#### 3. **Popup Mode Configuration** (NEW)
- **Desktop Behavior**: `chatDesign.desktopBehavior`
  - `initialState`: `"open"` | `"closed"`
  - `popupDimensions.height`: Number (pixels)
  - `popupDimensions.width`: Number (pixels)
  - `callout`: Boolean
  - `calloutText`: String

- **Mobile Behavior**: `chatDesign.mobileBehavior`
  - Same structure as desktop behavior
  - Allows different configurations for mobile devices

### Deprecated Fields

| Old Field | New Field | Status |
|-----------|-----------|--------|
| `chatDesign.onPageLoadDisplay` | `chatDesign.desktopBehavior.initialState` & `chatDesign.mobileBehavior.initialState` | **Deprecated** (still supported for backward compatibility) |
| `chatDesign.popupDimensions` | `chatDesign.desktopBehavior.popupDimensions` & `chatDesign.mobileBehavior.popupDimensions` | **Deprecated** |

---

## Frontend Implementation Changes

### What Was Updated

#### 1. **apiMapper.ts**

**New Helper Functions**:
```typescript
// Determines if widget is in embedded mode
const isEmbeddedMode = (chatDesign: any): boolean => {
  return chatDesign?.chatType === "embedded";
};

// Gets initial open state based on mode and device
const getInitialOpenState = (chatDesign: any): boolean => {
  if (isEmbeddedMode(chatDesign)) {
    return true; // Embedded is always "open"
  }
  
  // Popup mode: check desktop/mobile behavior
  const initialState = chatDesign?.desktopBehavior?.initialState || 
                       chatDesign?.onPageLoadDisplay || // Fallback
                       "closed";
  
  return initialState === "open";
};
```

**Updated mapApiToConfig**:
- Now reads `chatType` field to determine mode
- Extracts dimensions from `embeddedDimensions` or `desktopBehavior.popupDimensions`
- Sets `general.embedded` based on `chatType`
- Falls back to legacy `onPageLoadDisplay` if new fields are missing

**Updated applyURLParamOverrides**:
- Supports new `chatType` URL parameter (`"embedded"` or `"popup"`)
- Maintains backward compatibility with legacy `embedded` parameter (`"true"` or `"false"`)
- Priority: `chatType` > `embedded` (legacy)

#### 2. **useURLParams.ts**

**New URL Parameter**:
```typescript
export type URLParams = {
  // ... existing params
  chatType?: string; // NEW: "embedded" or "popup"
  embedded?: string; // LEGACY: "true" or "false"
  // ... other params
};
```

---

## Backward Compatibility

### ✅ Fully Backward Compatible

The implementation maintains **full backward compatibility**:

1. **Legacy Database Fields**: If `onPageLoadDisplay` exists but new fields don't, it will be used
2. **Legacy URL Parameter**: `?embedded=true` still works (converted to `chatType=embedded`)
3. **No Breaking Changes**: Existing widgets continue to work without modification

### Migration Path

You have **two options**:

#### Option 1: Gradual Migration (Recommended)
- Keep existing widgets as-is
- New widgets use the new schema
- Update widgets individually when needed

#### Option 2: Bulk Migration
- Run a migration script to update all widgets at once
- See [Database Migration](#database-migration) section

---

## Usage Examples

### Database Configuration

#### Example 1: Embedded Widget
```javascript
{
  name: "Support Chat - Embedded",
  endpoint: "https://api.example.com/chat",
  tenantId: "tenant_123",
  
  chatDesign: {
    chatType: "embedded",
    embeddedDimensions: {
      height: 800,
      width: 600
    },
    backgroundColor: "#ffffff",
    headerText: "Customer Support"
  }
}
```

#### Example 2: Popup Widget with Device-Specific Behavior
```javascript
{
  name: "Sales Chat - Popup",
  endpoint: "https://api.example.com/sales",
  tenantId: "tenant_456",
  
  chatDesign: {
    chatType: "popup",
    
    desktopBehavior: {
      initialState: "closed",
      popupDimensions: {
        height: 700,
        width: 450
      },
      callout: true,
      calloutText: "Need help? Chat with us!"
    },
    
    mobileBehavior: {
      initialState: "open",
      popupDimensions: {
        height: 600,
        width: 350
      },
      callout: false
    }
  }
}
```

### URL Parameter Overrides

#### New chatType Parameter (Recommended)
```
# Embedded mode
?chatType=embedded&width=600&height=800

# Popup mode
?chatType=popup&width=400&height=600
```

#### Legacy embedded Parameter (Still Supported)
```
# Embedded mode
?embedded=true&width=600&height=800

# Popup mode (floating)
?embedded=false&width=400&height=600
```

---

## Database Migration

If you want to migrate existing widgets to the new schema:

### Migration Script Example

```javascript
async function migrateChatWidgets() {
  const widgets = await ChatWidget.find({
    'chatDesign.onPageLoadDisplay': { $exists: true }
  });

  for (const widget of widgets) {
    const updates = {};
    
    // Set default chatType (assume popup for existing widgets)
    updates['chatDesign.chatType'] = 'popup';
    
    // Migrate onPageLoadDisplay to initialState
    if (widget.chatDesign.onPageLoadDisplay) {
      const initialState = widget.chatDesign.onPageLoadDisplay;
      updates['chatDesign.desktopBehavior.initialState'] = initialState;
      updates['chatDesign.mobileBehavior.initialState'] = initialState;
    }
    
    // Migrate popupDimensions
    if (widget.chatDesign.popupDimensions) {
      const dims = widget.chatDesign.popupDimensions;
      updates['chatDesign.desktopBehavior.popupDimensions'] = {
        height: dims.desktopHeight || 600,
        width: dims.desktopWidth || 400
      };
      updates['chatDesign.mobileBehavior.popupDimensions'] = {
        height: dims.mobileHeight || dims.desktopHeight || 600,
        width: dims.mobileWidth || dims.desktopWidth || 400
      };
    }
    
    // Set default callout values
    updates['chatDesign.desktopBehavior.callout'] = false;
    updates['chatDesign.desktopBehavior.calloutText'] = '';
    updates['chatDesign.mobileBehavior.callout'] = false;
    updates['chatDesign.mobileBehavior.calloutText'] = '';
    
    await ChatWidget.updateOne({ _id: widget._id }, { $set: updates });
    console.log(`Migrated widget: ${widget.name}`);
  }
  
  console.log(`Migration complete. ${widgets.length} widgets updated.`);
}
```

---

## Testing Checklist

### Frontend Testing

- [ ] **Embedded mode from database**: Widget with `chatType: "embedded"` displays correctly
- [ ] **Popup mode from database**: Widget with `chatType: "popup"` displays correctly
- [ ] **Legacy widgets**: Widgets without `chatType` still work (fallback to `onPageLoadDisplay`)
- [ ] **URL override - new param**: `?chatType=embedded` overrides database config
- [ ] **URL override - legacy param**: `?embedded=true` still works
- [ ] **Dimension handling**: `embeddedDimensions` and `popupDimensions` are applied correctly
- [ ] **Size URL overrides**: `?width=600&height=800` overrides database dimensions

### Database Testing

- [ ] **Create embedded widget**: New widget with `chatType: "embedded"` saves correctly
- [ ] **Create popup widget**: New widget with `chatType: "popup"` saves correctly
- [ ] **Update existing widget**: Updating `chatType` changes widget behavior
- [ ] **Query by chatType**: Can filter widgets by `chatType` field

---

## Configuration Priority Order

The system applies configuration in this order (highest priority first):

1. **URL Parameters** (e.g., `?chatType=embedded&width=600`)
2. **Database Configuration** (new schema: `chatType`, `embeddedDimensions`, etc.)
3. **Database Configuration** (legacy schema: `onPageLoadDisplay` - fallback)
4. **Default Values** (hardcoded defaults in theme files)

---

## Troubleshooting

### Issue: Widget not displaying in embedded mode

**Check**:
1. Database has `chatType: "embedded"` OR URL has `?chatType=embedded` or `?embedded=true`
2. `AppWithDatabaseConfig.tsx` is checking `mergedSettings.general?.embedded`
3. Styles are correctly switching between `myTripEmbeddedStyles` and `myTripFloatingStyles`

**Debug**:
```javascript
console.log("chatType from DB:", apiData.chatDesign.chatType);
console.log("embedded mode:", config.general.embedded);
console.log("Using styles:", config.general.embedded ? "EMBEDDED" : "FLOATING");
```

### Issue: Dimensions not applying

**Check**:
1. Database has correct dimensions in `embeddedDimensions` or `desktopBehavior.popupDimensions`
2. `apiMapper` is extracting dimensions correctly
3. `AppWithDatabaseConfig` is applying `chatWindowSize` to styles

**Debug**:
```javascript
console.log("Dimensions from DB:", chatDesign.embeddedDimensions || chatDesign.desktopBehavior?.popupDimensions);
console.log("Mapped dimensions:", config.chatWindowSize);
console.log("Final styles:", chatbotStyles.chatWindowStyle);
```

### Issue: Legacy widgets not working

**Check**:
1. `getInitialOpenState` function has fallback to `onPageLoadDisplay`
2. No errors in console about missing fields
3. Default values are being applied

---

## Support

For questions or issues:
1. Check the [ChatWidget Model Documentation](./schemas/CHATWIDGET_MODEL.md)
2. Review console logs for debug information
3. Contact the development team

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2025-12-08 | Added chatType, embedded/popup mode separation, device-specific behaviors |
| 1.0 | - | Initial implementation with basic popup configuration |
