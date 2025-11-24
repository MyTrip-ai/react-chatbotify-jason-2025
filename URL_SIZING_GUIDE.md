# URL Parameter Sizing Guide

## Overview

You can now control the chatbot's size dynamically using URL parameters. This is especially useful when embedding the chatbot in different contexts with different size requirements.

## Size Parameters

| Parameter | Description | Example | Default |
|-----------|-------------|---------|---------|
| `width` | Fixed width in pixels | `width=600` | `100%` (embedded) or `420px` (floating) |
| `height` | Fixed height in pixels | `height=700` | `auto` (embedded) or `580px` (floating) |
| `maxWidth` | Maximum width constraint | `maxWidth=1200` | None |
| `maxHeight` | Maximum height constraint | `maxHeight=900` | None |

**Note:** Values are automatically converted to pixels (e.g., `width=600` becomes `600px`)

## Usage Examples

### Example 1: Fixed Size Chatbot

Create a chatbot with specific dimensions:

```
http://localhost:3000/?embedded=true&width=600&height=700
```

**Result:**
- Width: 600px
- Height: 700px
- Perfect for: Fixed-size iframes or containers

### Example 2: Responsive with Constraints

Allow the chatbot to be responsive but limit maximum size:

```
http://localhost:3000/?embedded=true&maxWidth=1000&maxHeight=800
```

**Result:**
- Width: 100% (up to 1000px max)
- Height: auto (up to 800px max)
- Perfect for: Responsive layouts with size limits

### Example 3: Height-Only Control

Set only the height, let width fill the container:

```
http://localhost:3000/?embedded=true&height=500
```

**Result:**
- Width: 100% (fills container)
- Height: 500px
- Perfect for: Full-width embedded chatbots with consistent height

### Example 4: Width-Only Control

Set only the width, let height adjust to content:

```
http://localhost:3000/?embedded=true&width=400
```

**Result:**
- Width: 400px
- Height: auto (adjusts to content)
- Perfect for: Narrow sidebars or panels

### Example 5: All Size Parameters

Use all size parameters for maximum control:

```
http://localhost:3000/?embedded=true&width=600&height=700&maxWidth=1200&maxHeight=900
```

**Result:**
- Base width: 600px (can grow to 1200px max)
- Base height: 700px (can grow to 900px max)
- Perfect for: Complex responsive layouts

## Combining with Other Parameters

Size parameters work seamlessly with all other URL parameters:

```
http://localhost:3000/?embedded=true&width=600&height=700&primaryColor=FF5733&title=Support%20Chat&transparency=0.8
```

This creates a chatbot that is:
- 600px wide × 700px tall
- With custom primary color (#FF5733)
- Custom title ("Support Chat")
- 80% transparency on colors

## Iframe Integration

### Basic Iframe with URL Sizing

```html
<iframe 
  src="http://localhost:3000/?embedded=true&width=600&height=700"
  frameborder="0"
  allow="microphone">
</iframe>
```

### Responsive Iframe Container

```html
<div style="width: 100%; max-width: 800px; margin: 0 auto;">
  <iframe 
    src="http://localhost:3000/?embedded=true&maxWidth=800&height=600"
    style="width: 100%; height: 600px; border: none;"
    allow="microphone">
  </iframe>
</div>
```

### Multiple Sizes for Different Breakpoints

You can dynamically change the URL based on screen size:

```javascript
const getChatbotUrl = () => {
  const baseUrl = 'http://localhost:3000/?embedded=true';
  
  if (window.innerWidth < 768) {
    // Mobile: smaller size
    return `${baseUrl}&width=350&height=500`;
  } else if (window.innerWidth < 1024) {
    // Tablet: medium size
    return `${baseUrl}&width=500&height=600`;
  } else {
    // Desktop: larger size
    return `${baseUrl}&width=700&height=800`;
  }
};

// Set iframe src
document.getElementById('chatbot-iframe').src = getChatbotUrl();
```

## How It Works

1. **URL Parameter Extraction** (`useURLParams.ts`)
   - Reads `width`, `height`, `maxWidth`, `maxHeight` from URL
   - Returns them as strings (e.g., "600")

2. **Configuration Override** (`apiMapper.ts`)
   - Converts strings to CSS values (e.g., "600" → "600px")
   - Stores in `config.chatWindowSize` object

3. **Style Application** (`AppWithDatabaseConfig.tsx`)
   - Merges size overrides into `chatWindowStyle`
   - Applied on top of base embedded/floating styles

4. **Final Render**
   - ChatBot component receives styles with custom dimensions
   - Renders with specified size

## CSS Priority

The size parameters override the default styles in this order:

1. **Base theme styles** (embedded or floating)
2. **URL parameter overrides** ← Applied here
3. **Inline styles** (if any)

So URL parameters will override theme defaults but can still be overridden by inline styles if needed.

## Testing Different Sizes

Try these URLs to see different sizes:

**Small chatbot:**
```
http://localhost:3000/?embedded=true&width=350&height=450
```

**Medium chatbot:**
```
http://localhost:3000/?embedded=true&width=550&height=650
```

**Large chatbot:**
```
http://localhost:3000/?embedded=true&width=800&height=900
```

**Extra wide:**
```
http://localhost:3000/?embedded=true&width=1000&height=600
```

**Extra tall:**
```
http://localhost:3000/?embedded=true&width=400&height=1000
```

## Best Practices

### 1. Use Constraints for Responsive Design
```
?embedded=true&maxWidth=1200&maxHeight=800
```
Better than fixed sizes for responsive layouts.

### 2. Match Container Size
If embedding in a fixed container, match the URL parameters to container size:
```html
<div style="width: 600px; height: 700px;">
  <iframe src="...?embedded=true&width=600&height=700"></iframe>
</div>
```

### 3. Consider Mobile
For mobile-responsive sites, use smaller dimensions or max constraints:
```
?embedded=true&maxWidth=400&height=500
```

### 4. Test Different Sizes
Always test your chosen dimensions to ensure:
- Content is readable
- Messages don't overflow
- Input area is accessible
- Buttons are clickable

## Common Size Presets

Here are some recommended size combinations:

**Compact (sidebar):**
```
?embedded=true&width=350&height=500
```

**Standard (default):**
```
?embedded=true&width=550&height=650
```

**Large (main content):**
```
?embedded=true&width=800&height=800
```

**Full height (side panel):**
```
?embedded=true&width=400&height=100vh
```
Note: `100vh` won't work via URL param, use container CSS instead.

## Troubleshooting

**Size not applying:**
- Check console for `📏 [Size Override]` logs
- Verify URL parameters are spelled correctly
- Ensure values are numbers (no "px" suffix in URL)

**Chatbot too small/large:**
- Adjust the pixel values in URL
- Consider using `maxWidth`/`maxHeight` instead of fixed `width`/`height`

**Size conflicts with container:**
- URL parameters set the chatbot's internal size
- Container CSS controls the iframe size
- Make sure they match or use `width: 100%; height: 100%` in iframe CSS
