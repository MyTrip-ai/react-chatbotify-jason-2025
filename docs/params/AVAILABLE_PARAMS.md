# Available URL Parameters

Complete list of all URL parameters supported by the chatbot widget.

---

## Widget Mode & Display

### `chatType`
- **Type**: `string`
- **Values**: `"embedded"` or `"popup"`
- **Description**: Widget display mode (NEW - preferred method)
- **Example**: `?chatType=embedded`

### `embedded`
- **Type**: `string`
- **Values**: `"true"` or `"false"`
- **Description**: Enable embedded mode (LEGACY - still works for backward compatibility)
- **Example**: `?embedded=true`
- **Note**: `chatType` takes priority if both are specified

---

## Dimensions

### `width`
- **Type**: `string` (pixels)
- **Description**: Chat window width
- **Example**: `?width=600`

### `height`
- **Type**: `string` (pixels)
- **Description**: Chat window height
- **Example**: `?height=800`

### `maxWidth`
- **Type**: `string` (pixels)
- **Description**: Maximum chat window width
- **Example**: `?maxWidth=1200`

### `maxHeight`
- **Type**: `string` (pixels)
- **Description**: Maximum chat window height
- **Example**: `?maxHeight=900`

---

## Branding & Colors

### `primaryColor`
- **Type**: `string` (hex color)
- **Description**: Primary theme color (with or without #)
- **Example**: `?primaryColor=FF5733` or `?primaryColor=%23FF5733`

### `secondaryColor`
- **Type**: `string` (hex color)
- **Description**: Secondary theme color (with or without #)
- **Example**: `?secondaryColor=7E69AB`

### `transparency`
- **Type**: `string` (decimal 0-1)
- **Description**: Color transparency/opacity
- **Example**: `?transparency=0.8`

---

## Content & Text

### `title`
- **Type**: `string`
- **Description**: Header title text
- **Example**: `?title=Support%20Chat`
- **Note**: Use URL encoding for spaces (%20)

### `titleFont`
- **Type**: `string` (font family)
- **Description**: Font family for the header title
- **Example**: `?titleFont=Arial` or `?titleFont=Roboto,sans-serif`
- **Note**: Can include fallback fonts separated by commas

---

## Assets & Images

### `avatar`
- **Type**: `string` (URL)
- **Description**: Bot avatar URL (sets bot bubble, chat button, and header avatar)
- **Example**: `?avatar=https://example.com/avatar.png`
- **Note**: This is a universal avatar that applies to all locations

### `logoUrl`
- **Type**: `string` (URL)
- **Description**: Header logo URL (specific override for header only)
- **Example**: `?logoUrl=https://example.com/logo.png`

### `avatarUrl`
- **Type**: `string` (URL)
- **Description**: Bot bubble avatar URL (specific override for chat bubbles)
- **Example**: `?avatarUrl=https://example.com/bot-avatar.png`

### `chatButtonImageUrl`
- **Type**: `string` (URL)
- **Description**: Chat button icon URL (specific override for floating button)
- **Example**: `?chatButtonImageUrl=https://example.com/button-icon.png`

---

## Authentication

### `token`
- **Type**: `string` (JWT)
- **Description**: JWT token for fetching widget configuration from API
- **Example**: `?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Note**: Used to authenticate and load widget config from database

---

## Example Test URLs

### Test Embedded Mode with Custom Dimensions
```
?chatType=embedded&width=600&height=800
```

### Test Popup Mode with Branding
```
?chatType=popup&primaryColor=FF5733&secondaryColor=7E69AB&title=Support%20Chat
```

### Test with Custom Avatar
```
?chatType=embedded&avatar=https://example.com/avatar.png&width=500
```

### Test with Custom Title Font
```
?titleFont=Arial&title=Customer%20Support
```

### Test Multiple Parameters
```
?chatType=embedded&width=700&height=900&primaryColor=2C3E50&secondaryColor=3498DB&title=Help%20Center&titleFont=Roboto&transparency=0.9
```

### Test with Token (Load from Database)
```
?token=your_jwt_token_here
```

### Test Legacy Embedded Mode
```
?embedded=true&width=600&height=800
```

---

## Parameter Priority

When the same setting is defined in multiple places, the priority is:

1. **URL Parameters** (highest priority)
2. **Database Configuration** (loaded via token)
3. **Theme Defaults** (fallback)

### Example
If database has `primaryColor: "#FF0000"` and URL has `?primaryColor=00FF00`, the final color will be `#00FF00` (URL wins).

---

## Notes

- All parameters are **optional**
- Parameters are **case-sensitive**
- Use **URL encoding** for special characters (e.g., spaces = `%20`, `#` = `%23`)
- Multiple parameters are separated by `&`
- Font families can include fallbacks: `?titleFont=Roboto,Arial,sans-serif`
- Colors can be specified with or without `#`: `FF5733` or `%23FF5733`