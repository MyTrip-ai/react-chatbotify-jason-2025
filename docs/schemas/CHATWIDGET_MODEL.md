# ChatWidget Model Documentation

## Overview

The ChatWidget model defines the configuration and styling for chat widgets that can be embedded on websites or displayed as popup widgets. This model supports multi-tenant architecture and provides extensive customization options for appearance and behavior.

**Model Location**: `apps/express_middleware/src/models/chatwidget.model.js`

**Collection Name**: `ChatWidget`

---

## Table of Contents

1. [Core Fields](#core-fields)
2. [General Settings](#general-settings)
3. [Button Design](#button-design)
4. [Chat Design](#chat-design)
   - [Appearance Modes](#appearance-modes)
   - [Embedded Mode Settings](#embedded-mode-settings)
   - [Popup/Widget Mode Settings](#popupwidget-mode-settings)
   - [General Chat Appearance](#general-chat-appearance)
5. [Field Reference](#field-reference)
6. [Migration Guide](#migration-guide)
7. [Usage Examples](#usage-examples)

---

## Core Fields

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Display name for the chat widget |
| `endpoint` | String | API endpoint for the chat widget |
| `tenantId` | String | Tenant identifier for multi-tenant isolation |

### Optional Core Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `enabled` | Boolean | `true` | Whether the widget is active |
| `assistantId` | String | - | Associated AI assistant identifier |

### Automatic Fields

| Field | Type | Description |
|-------|------|-------------|
| `createdAt` | Date | Auto-generated timestamp (creation) |
| `updatedAt` | Date | Auto-generated timestamp (last update) |

---

## General Settings

Nested under `generalSettings` object:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `hideWhenOffline` | Boolean | `false` | Hide widget when service is offline |
| `defaultHelloMessage` | String | `"Hi! How can we help you?"` | Initial greeting message |

---

## Button Design

Nested under `buttonDesign` object. Controls the appearance of the chat button/trigger.

### Online State

| Field | Type | Default | Options | Description |
|-------|------|---------|---------|-------------|
| `position` | String | `"right"` | `left`, `right` | Screen position of the button |
| `image` | String | `""` | - | Custom image URL for button |
| `backgroundColor` | String | `"#000"` | - | Button background color (hex) |
| `icon` | String | `"chat"` | - | Icon identifier for button |
| `iconColor` | String | `"#fff"` | - | Icon color (hex) |

### Offline State

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `offlineImage` | String | `""` | Custom image URL when offline |
| `offlineIcon` | String | `"offline"` | Icon identifier when offline |
| `offlineIconColor` | String | `"#999"` | Icon color when offline (hex) |
| `backgroundColorOffline` | String | `"#ccc"` | Background color when offline (hex) |

---

## Chat Design

Nested under `chatDesign` object. This is the main configuration section for chat appearance and behavior.

### Appearance Modes

The widget supports two distinct appearance modes, controlled by the `chatType` field:

| Field | Type | Default | Options | Description |
|-------|------|---------|---------|-------------|
| `chatType` | String | `"popup"` | `embedded`, `popup` | Determines widget display mode |

#### Mode Descriptions

- **`embedded`**: Chat interface is embedded directly into the page layout
- **`popup`**: Chat appears as a floating popup/widget (traditional chat widget behavior)

---

### Embedded Mode Settings

**Applies when**: `chatType === "embedded"`

Nested under `chatDesign.embeddedDimensions`:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `height` | Number | No | Height in pixels for embedded chat |
| `width` | Number | No | Width in pixels for embedded chat |

**Example**:
```javascript
{
  chatType: "embedded",
  embeddedDimensions: {
    height: 800,
    width: 600
  }
}
```

---

### Popup/Widget Mode Settings

**Applies when**: `chatType === "popup"`

The popup mode provides separate configurations for desktop and mobile devices, allowing responsive behavior.

#### Desktop Behavior

Nested under `chatDesign.desktopBehavior`:

| Field | Type | Default | Options | Description |
|-------|------|---------|---------|-------------|
| `initialState` | String | `"open"` | `open`, `closed` | Initial display state on page load |
| `popupDimensions.height` | Number | `600` | - | Popup height in pixels |
| `popupDimensions.width` | Number | `400` | - | Popup width in pixels |
| `callout` | Boolean | `false` | - | Show callout/tooltip |
| `calloutText` | String | `""` | - | Text for callout message |

#### Mobile Behavior

Nested under `chatDesign.mobileBehavior`:

| Field | Type | Default | Options | Description |
|-------|------|---------|---------|-------------|
| `initialState` | String | `"open"` | `open`, `closed` | Initial display state on page load |
| `popupDimensions.height` | Number | `600` | - | Popup height in pixels |
| `popupDimensions.width` | Number | `400` | - | Popup width in pixels |
| `callout` | Boolean | `false` | - | Show callout/tooltip |
| `calloutText` | String | `""` | - | Text for callout message |

**Example**:
```javascript
{
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
    callout: false,
    calloutText: ""
  }
}
```

---

### General Chat Appearance

These settings apply to **both** embedded and popup modes.

#### Colors & Text

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `backgroundColor` | String | `"#fff"` | Main chat background color |
| `botTextColor` | String | `"#000"` | Bot message text color |
| `userTextColor` | String | `"#333"` | User message text color |
| `userBackgroundColor` | String | `"#fff"` | User message bubble background |
| `botBackgroundColor` | String | `"#f4f4f4"` | Bot message bubble background |
| `chatClosedColor` | String | `"#000"` | Color when chat is closed |
| `headerText` | String | `"AI Assistant"` | Chat header title |

#### Images & Assets

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `botAvatar` | String | `""` | URL for bot avatar image |
| `chatWidgetyLogo` | String | `""` | URL for widget logo |
| `chatAvatarImage` | String | `""` | URL for chat avatar |
| `chatButtonImage` | String | `""` | URL for custom chat button |

#### UI Behavior

| Field | Type | Default | Options | Description |
|-------|------|---------|---------|-------------|
| `showMessageIndicator` | Boolean | `true` | - | Show typing/message indicators |
| `chatButtonType` | String | `"text"` | `text`, `image` | Button display type |
| `placement` | String | `"right"` | `left`, `right` | Chat window placement |
| `transparency` | Number | `1` | `0` to `1` | Overall transparency (0=transparent, 1=opaque) |
| `calloutButtonText` | String | `"Chat with us"` | - | Default callout button text |

#### Theme Configuration

**Primary Theme** (`chatDesign.primaryTheme`):

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `color` | String | `"#FFCA00"` | Primary theme color (hex) |
| `transparency` | Number | `100` | Theme transparency (0-100) |

**Secondary Theme** (`chatDesign.secondaryTheme`):

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `color` | String | `"#7E69AB"` | Secondary theme color (hex) |
| `transparency` | Number | `100` | Theme transparency (0-100) |

---

## Field Reference

### Complete Schema Structure

```javascript
{
  // Core fields
  name: String (required),
  endpoint: String (required),
  enabled: Boolean,
  tenantId: String (required),
  assistantId: String,

  // General settings
  generalSettings: {
    hideWhenOffline: Boolean,
    defaultHelloMessage: String
  },

  // Button design
  buttonDesign: {
    position: String,
    image: String,
    backgroundColor: String,
    icon: String,
    iconColor: String,
    offlineImage: String,
    offlineIcon: String,
    offlineIconColor: String,
    backgroundColorOffline: String
  },

  // Chat design
  chatDesign: {
    chatType: String,
    
    // Embedded mode
    embeddedDimensions: {
      height: Number,
      width: Number
    },
    
    // Popup mode - Desktop
    desktopBehavior: {
      initialState: String,
      popupDimensions: {
        height: Number,
        width: Number
      },
      callout: Boolean,
      calloutText: String
    },
    
    // Popup mode - Mobile
    mobileBehavior: {
      initialState: String,
      popupDimensions: {
        height: Number,
        width: Number
      },
      callout: Boolean,
      calloutText: String
    },
    
    // General appearance (all modes)
    backgroundColor: String,
    botTextColor: String,
    userTextColor: String,
    botAvatar: String,
    chatWidgetyLogo: String,
    chatAvatarImage: String,
    chatButtonImage: String,
    calloutButtonText: String,
    showMessageIndicator: Boolean,
    chatButtonType: String,
    primaryTheme: {
      color: String,
      transparency: Number
    },
    secondaryTheme: {
      color: String,
      transparency: Number
    },
    chatClosedColor: String,
    userBackgroundColor: String,
    botBackgroundColor: String,
    headerText: String,
    placement: String,
    transparency: Number
  },

  // Timestamps (auto-generated)
  createdAt: Date,
  updatedAt: Date
}
```

---

## Migration Guide

### Breaking Changes

The following fields have been **removed/refactored**:

1. **`chatDesign.onPageLoadDisplay`** → Replaced by:
   - `chatDesign.desktopBehavior.initialState`
   - `chatDesign.mobileBehavior.initialState`

2. **`chatDesign.popupDimensions`** → Replaced by:
   - `chatDesign.desktopBehavior.popupDimensions`
   - `chatDesign.mobileBehavior.popupDimensions`

### Migration Script

If you have existing chat widgets, you'll need to migrate the data. Here's a migration approach:

```javascript
// Migration example for existing documents
async function migrateChatWidgets() {
  const widgets = await ChatWidget.find({
    'chatDesign.onPageLoadDisplay': { $exists: true }
  });

  for (const widget of widgets) {
    const updates = {};
    
    // Migrate onPageLoadDisplay
    if (widget.chatDesign.onPageLoadDisplay) {
      updates['chatDesign.desktopBehavior.initialState'] = widget.chatDesign.onPageLoadDisplay;
      updates['chatDesign.mobileBehavior.initialState'] = widget.chatDesign.onPageLoadDisplay;
    }
    
    // Migrate popupDimensions
    if (widget.chatDesign.popupDimensions) {
      updates['chatDesign.desktopBehavior.popupDimensions'] = {
        height: widget.chatDesign.popupDimensions.desktopHeight || 600,
        width: widget.chatDesign.popupDimensions.desktopWidth || 400
      };
      updates['chatDesign.mobileBehavior.popupDimensions'] = {
        height: widget.chatDesign.popupDimensions.desktopHeight || 600,
        width: widget.chatDesign.popupDimensions.desktopWidth || 400
      };
    }
    
    // Set default values for new fields
    updates['chatDesign.desktopBehavior.callout'] = false;
    updates['chatDesign.desktopBehavior.calloutText'] = '';
    updates['chatDesign.mobileBehavior.callout'] = false;
    updates['chatDesign.mobileBehavior.calloutText'] = '';
    
    await ChatWidget.updateOne({ _id: widget._id }, { $set: updates });
  }
}
```

### Backward Compatibility Notes

- **New fields are optional**: Existing widgets will work with default values
- **Old field access**: Code accessing old fields will need updates
- **API responses**: Frontend code should be updated to use new field paths

---

## Usage Examples

### Creating an Embedded Widget

```javascript
const embeddedWidget = {
  name: "Support Chat - Embedded",
  endpoint: "https://api.example.com/chat",
  tenantId: "tenant_123",
  enabled: true,
  
  generalSettings: {
    hideWhenOffline: false,
    defaultHelloMessage: "Welcome! How can we assist you?"
  },
  
  chatDesign: {
    chatType: "embedded",
    embeddedDimensions: {
      height: 800,
      width: 600
    },
    backgroundColor: "#ffffff",
    headerText: "Customer Support"
  }
};

await ChatWidget.create(embeddedWidget);
```

### Creating a Popup Widget with Different Desktop/Mobile Behavior

```javascript
const popupWidget = {
  name: "Sales Chat - Popup",
  endpoint: "https://api.example.com/sales-chat",
  tenantId: "tenant_456",
  enabled: true,
  
  buttonDesign: {
    position: "right",
    backgroundColor: "#0066cc",
    icon: "chat",
    iconColor: "#ffffff"
  },
  
  chatDesign: {
    chatType: "popup",
    
    // Desktop: starts closed with callout
    desktopBehavior: {
      initialState: "closed",
      popupDimensions: {
        height: 700,
        width: 450
      },
      callout: true,
      calloutText: "Questions? We're here to help!"
    },
    
    // Mobile: starts open, no callout
    mobileBehavior: {
      initialState: "open",
      popupDimensions: {
        height: 600,
        width: 350
      },
      callout: false,
      calloutText: ""
    },
    
    // Appearance
    backgroundColor: "#f9f9f9",
    headerText: "Sales Team",
    primaryTheme: {
      color: "#0066cc",
      transparency: 100
    }
  }
};

await ChatWidget.create(popupWidget);
```

### Updating Widget Behavior

```javascript
// Update desktop behavior only
await ChatWidget.findByIdAndUpdate(widgetId, {
  'chatDesign.desktopBehavior.initialState': 'open',
  'chatDesign.desktopBehavior.callout': true,
  'chatDesign.desktopBehavior.calloutText': 'New promotion available!'
});

// Switch from popup to embedded
await ChatWidget.findByIdAndUpdate(widgetId, {
  'chatDesign.chatType': 'embedded',
  'chatDesign.embeddedDimensions': {
    height: 900,
    width: 700
  }
});
```

### Querying Widgets by Type

```javascript
// Find all embedded widgets
const embeddedWidgets = await ChatWidget.find({
  'chatDesign.chatType': 'embedded'
});

// Find popup widgets with callouts enabled on desktop
const calloutWidgets = await ChatWidget.find({
  'chatDesign.chatType': 'popup',
  'chatDesign.desktopBehavior.callout': true
});
```

---

## API Endpoints

The ChatWidget model is accessed through the following REST endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chatwidgets` | List all widgets (with optional limit) |
| GET | `/api/chatwidgets/:id` | Get specific widget by ID |
| POST | `/api/chatwidgets` | Create new widget |
| PUT | `/api/chatwidgets/:id` | Update existing widget |
| DELETE | `/api/chatwidgets/:id` | Delete widget |
| POST | `/api/chatwidgets/upload-image` | Upload widget image to S3 |

**Controller Location**: `apps/express_middleware/src/controllers/chatwidget.controller.js`

---

## Best Practices

1. **Always specify chatType**: Explicitly set `chatType` to avoid confusion
2. **Device-specific optimization**: Use different settings for desktop vs mobile
3. **Callout usage**: Use callouts sparingly to avoid annoying users
4. **Dimension testing**: Test popup dimensions on various screen sizes
5. **Color contrast**: Ensure text colors have sufficient contrast with backgrounds
6. **Tenant isolation**: Always include `tenantId` for proper multi-tenant separation
7. **Image optimization**: Compress images before uploading to S3
8. **Validation**: Validate dimensions are reasonable (e.g., not larger than viewport)

---

## Related Documentation

- **Controller**: `apps/express_middleware/src/controllers/chatwidget.controller.js`
- **Model**: `apps/express_middleware/src/models/chatwidget.model.js`
- **S3 Upload**: See `uploadWidgetImage` function for image handling
- **Multi-tenant Architecture**: See tenant database connection management

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2025-12-08 | Added embedded/popup mode separation, desktop/mobile behaviors, callout features |
| 1.0 | - | Initial schema with basic popup configuration |

---

## Support

For questions or issues with the ChatWidget model, please contact the development team or refer to the main project documentation.
