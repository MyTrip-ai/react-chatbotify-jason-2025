# Available URL Parameters
Here are all the URL parameters you can use for testing:

## Widget Mode & Display
- chatType - "embedded" or "popup" (NEW - preferred)
- embedded - "true" or "false" (LEGACY - still works)

## Dimensions
- width - Chat window width in pixels (e.g., "600")
- height - Chat window height in pixels (e.g., "800")
- maxWidth - Maximum width in pixels
- maxHeight - Maximum height in pixels


## Branding & Colors
- primaryColor - Primary theme color as hex (e.g., "FF5733" or "#FF5733")
- secondaryColor - Secondary theme color as hex
- transparency - Color transparency 0 to 1 (e.g., "0.8")


## Content & Assets
- title - Header title text
- avatar - Bot avatar URL (sets bot bubble, chat button, and header avatar)
- logoUrl - Header logo URL (specific override)
- avatarUrl - Bot bubble avatar URL (specific override)
- chatButtonImageUrl - Chat button icon URL (specific override)


## Authentication
- token - JWT token for fetching widget config from API
- Example Test URLs
- bash

# URL examples
## Test embedded mode with custom dimensions
?chatType=embedded&width=600&height=800

## Test popup mode with branding
?chatType=popup&primaryColor=FF5733&secondaryColor=7E69AB&title=Support%20Chat

## Test with custom avatar
?chatType=embedded&avatar=https://example.com/avatar.png&width=500

## Test legacy embedded parameter
?embedded=true&width=700&height=900

## Test with transparency
?primaryColor=FF5733&transparency=0.8

## Combine multiple parameters
?chatType=embedded&width=600&height=800&primaryColor=0066cc&title=My%20Assistant