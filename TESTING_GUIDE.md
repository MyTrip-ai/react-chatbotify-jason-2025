# Testing Guide: Database-Driven Branding

## Quick Start Testing

### Step 1: Get Your Auth Token

You need a valid JWT token from your API. Get it by:

1. **From your admin panel** - Log in and copy the token from browser DevTools (Application > Local Storage)
2. **From Postman/API client** - Make a login request and copy the token
3. **Ask your backend team** - Get a test token for your tenant

### Step 2: Configure the Token

Open `src/AppWithDatabaseConfig.tsx` and replace line 54:

```typescript
const token = "YOUR_ACTUAL_TOKEN_HERE";
```

With your actual token:

```typescript
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // Your real token
```

### Step 3: Ensure Your API is Running

Make sure your Express middleware is running on `http://localhost:3001` (or update the URL in `.env`)

```bash
# In your backend directory
npm start
```

### Step 4: Start the Dev Server

```bash
npm run start
```

### Step 5: Check the Console

Open browser DevTools (F12) and look for:

✅ **Success:**
```
👀 Data received: {...}
✅ Branding loaded from database: {primary: "#0a0009", ...}
```

⚠️ **Using Defaults:**
```
⚠️ Using default branding
```

❌ **Error:**
```
Failed to fetch widget config: Error fetching chat widgets: ...
```

## Testing Different Scenarios

### Scenario 1: Test with Database Colors

1. In your admin panel, change the colors in `chatDesign`:
   - `primaryTheme.color` → `#FF0000` (red)
   - `transparency` → `0.9` (more opaque)

2. Refresh the page

3. You should see:
   - Red borders on bot bubbles
   - Red primary accents
   - More opaque glass surfaces

### Scenario 2: Test Without Token (Fallback)

1. In `AppWithDatabaseConfig.tsx`, set:
   ```typescript
   const token = "invalid-token";
   ```

2. Refresh the page

3. You should see:
   - Console warning: `⚠️ Using default branding`
   - Chatbot renders with default MyTrip theme

### Scenario 3: Test with URL Parameter

1. In `AppWithDatabaseConfig.tsx`, uncomment lines 59-61:
   ```typescript
   const urlParams = new URLSearchParams(window.location.search);
   const token = urlParams.get("token") || "your-token-here";
   ```

2. Comment out line 54

3. Visit: `http://localhost:3000/?token=YOUR_TOKEN_HERE`

## Alternative: Test Without Real API

If you don't have the API running, you can test with mock data:

### Option 1: Mock the Fetch Function

In `AppWithDatabaseConfig.tsx`, replace the `fetchWidgetConfigByToken` function:

```typescript
const fetchWidgetConfigByToken = async (token: string) => {
	// Mock response for testing
	console.log("🧪 Using mock data (no API call)");
	
	const mockApiData = {
		chatDesign: {
			primaryTheme: { color: "#FF5733" },
			secondaryTheme: { color: "#C70039" },
			userBackgroundColor: "#900C3F",
			botTextColor: "#000000",
			chatClosedColor: "#666666",
			transparency: 0.85,
			headerText: "Test Bot"
		}
	};
	
	return mapApiToConfig(mockApiData);
};
```

### Option 2: Directly Set Branding

In `AppWithDatabaseConfig.tsx`, replace the useEffect:

```typescript
useEffect(() => {
	// Mock branding for testing
	const mockBranding: BrandTokens = {
		primary: "#FF5733",
		secondary: "#C70039",
		userAccent: "#900C3F",
		textPrimary: "#000000",
		textSecondary: "#666666",
		surfaceAlpha: 0.85,
		blurPx: 25,
		fontFamily: "'Roboto', sans-serif"
	};
	
	setBranding(mockBranding);
	setConfigLoaded(true);
	console.log("🧪 Using mock branding:", mockBranding);
}, []);
```

## Troubleshooting

### Issue: "Failed to fetch chat widgets"

**Causes:**
- API not running
- Wrong API URL
- Invalid token
- CORS issues

**Solutions:**
1. Check API is running: `curl http://localhost:3001/api/chatwidgets`
2. Verify `.env` has correct `REACT_APP_API_URL`
3. Check token is valid (not expired)
4. Enable CORS on your backend

### Issue: "Using default branding" (when you expect database colors)

**Causes:**
- API returned empty data
- Token doesn't have access to widgets
- Database has no widget configuration

**Solutions:**
1. Check browser Network tab for API response
2. Verify token has correct permissions
3. Check database has widget data for your tenant

### Issue: Colors not changing

**Causes:**
- Browser cache
- CSS specificity issues
- Wrong branding fields in database

**Solutions:**
1. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Check console for branding object values
3. Verify database fields match expected schema

## Expected Console Output

### Successful Load:
```
👀 Data received: {
  "_id": "68ed791e7a889b695b9f4fcf",
  "chatDesign": {
    "primaryTheme": {"color": "#0a0009"},
    "transparency": 0.85,
    ...
  }
}
✅ Branding loaded from database: {
  primary: "#0a0009",
  secondary: "#0a0009",
  userAccent: "#7E69AB",
  textPrimary: "#333333",
  textSecondary: "#666666",
  surfaceAlpha: 0.85,
  blurPx: 20,
  fontFamily: "'Lato', 'Avenir', 'Helvetica Neue', sans-serif"
}
```

### Using Defaults:
```
Failed to fetch widget config: Error: ...
⚠️ Using default branding
```

## Switching Back to Normal App

When done testing, restore the original entry point:

In `src/devIndex.tsx`:
```typescript
import App from "./App";
// import App from "./AppWithDatabaseConfig";
```

## Next Steps

Once database integration is working:
1. Test with different tenants (different tokens)
2. Update colors in admin panel and verify changes
3. Add the missing DB fields (`blurStrength`, `fontFamily`) for full control
4. Integrate into your production embed script
