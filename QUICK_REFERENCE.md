# Quick Reference - URL Parameters

> Operator handoff contracts, integration, and troubleshooting docs are now canonicalized in the chat server repo:  
> `/home/jason/Documents/Python-Projects-Assistant-Server--cleanup-branch/docs/README.md`  
> Widget pointer: `docs/plan/API_CONTRACTS_README.md`

## All Supported URL Parameters

### Mode
```
?embedded=true              Enable embedded mode (no floating button, no close button)
```

### Size (pixels)
```
?width=600                  Fixed width
?height=700                 Fixed height
?maxWidth=1200              Maximum width constraint
?maxHeight=900              Maximum height constraint
```

### Branding
```
?primaryColor=FF5733        Primary theme color (hex without #)
?secondaryColor=491d8d      Secondary theme color (hex without #)
?transparency=0.8           Color transparency (0-1)
```

### Content
```
?title=Support%20Chat       Header title (URL encoded)
?avatar=https://...         Bot avatar URL
?logoUrl=https://...        Header logo URL
?avatarUrl=https://...      Bot bubble avatar URL
```

### Authentication
```
?token=your-jwt-token       JWT authentication token
```

## Common Combinations

### Embedded with Custom Size
```
http://localhost:3000/?embedded=true&width=600&height=700
```

### Embedded with Branding
```
http://localhost:3000/?embedded=true&primaryColor=FF5733&title=Support
```

### Full Customization
```
http://localhost:3000/?embedded=true&width=600&height=700&primaryColor=FF5733&secondaryColor=491d8d&title=Support%20Chat&transparency=0.8
```

### Responsive Embedded
```
http://localhost:3000/?embedded=true&maxWidth=1000&maxHeight=800
```

## Size Presets

| Preset | URL Parameters | Use Case |
|--------|---------------|----------|
| **Compact** | `width=350&height=500` | Sidebar, mobile |
| **Standard** | `width=550&height=650` | Default embedded |
| **Large** | `width=800&height=800` | Main content area |
| **Wide** | `width=1000&height=600` | Horizontal layout |
| **Tall** | `width=400&height=900` | Vertical panel |

## Testing URLs

Copy and paste these to test different configurations:

**Basic embedded:**
```
http://localhost:3000/?embedded=true
```

**Small chatbot:**
```
http://localhost:3000/?embedded=true&width=350&height=450
```

**Large chatbot:**
```
http://localhost:3000/?embedded=true&width=800&height=900
```

**Custom branded:**
```
http://localhost:3000/?embedded=true&width=600&height=700&primaryColor=2563eb&title=Help%20Center
```

**Responsive:**
```
http://localhost:3000/?embedded=true&maxWidth=1200&maxHeight=800
```

## Iframe Template

```html
<iframe 
  src="http://localhost:3000/?embedded=true&width=600&height=700"
  style="width: 100%; height: 700px; border: none;"
  allow="microphone"
  title="AI Assistant">
</iframe>
```

## Debug Console Logs

Look for these emojis in browser console:

- 🔗 URL parameter extraction
- 🔧 API mapper (config overrides)
- ⚙️ Settings merge
- 🎨 Style selection
- 📏 Size overrides
- 🔘 Button configuration

## Notes

- All size values are in pixels (don't include "px" in URL)
- Colors should be hex without the # symbol
- Title should be URL encoded (spaces = %20)
- Multiple parameters are separated by &
- First parameter uses ? before it
