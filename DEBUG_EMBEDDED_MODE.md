# Debug Guide for Embedded Mode

## Debug Logs Added

I've added comprehensive console logging throughout the embedded mode flow. When you load the page with `?embedded=true`, you should see these logs in the browser console:

### 1. URL Parameter Extraction
```
🔗 [useURLParams] URL: http://localhost:3000/?embedded=true
🔗 [useURLParams] Search string: ?embedded=true
🔗 [useURLParams] Extracted params: { embedded: "true", ... }
🔗 [useURLParams] Embedded value: "true"
```

### 2. API Mapper (URL Override Application)
```
🔧 [apiMapper] Applying embedded override
🔧 [apiMapper] urlParams.embedded: "true"
🔧 [apiMapper] Converting to boolean: true
🔧 [apiMapper] overriddenConfig.general.embedded: true
🔧 [apiMapper] Final overriddenConfig: { general: { embedded: true }, ... }
```

### 3. Settings Merge in AppWithDatabaseConfig
```
⚙️ [Settings Merge] Starting settings merge...
⚙️ [Settings Merge] dbConfig: { general: { embedded: true }, ... }
⚙️ [Settings Merge] dbConfig.general: { embedded: true }
⚙️ [Settings Merge] dbConfig.general.embedded: true
⚙️ [Settings Merge] mergedSettings: { general: { embedded: true }, ... }
⚙️ [Settings Merge] mergedSettings.general: { embedded: true }
⚙️ [Settings Merge] mergedSettings.general.embedded: true
```

### 4. Style Selection
```
🎨 [Style Selection] Selecting styles...
🎨 [Style Selection] mergedSettings.general?.embedded: true
🎨 [Style Selection] Using: EMBEDDED styles
```

### 5. Button Builder
```
🔘 [buttonBuilder] Building button config...
🔘 [buttonBuilder] settings.general?.embedded: true
🔘 [buttonBuilder] buttonDisabledMap: { CLOSE_CHAT_BUTTON: true, ... }
🔘 [buttonBuilder] CLOSE_CHAT_BUTTON disabled: true
```

## Testing Steps

1. **Start the dev server:**
   ```bash
   npm start
   ```

2. **Open browser with dev tools:**
   - Navigate to: `http://localhost:3000/?embedded=true`
   - Open Developer Tools (F12 or Cmd+Option+I)
   - Go to Console tab

3. **Check the logs:**
   - Look for the emoji prefixes: 🔗, 🔧, ⚙️, 🎨, 🔘
   - Verify each step shows `embedded: true`
   - If any step shows `embedded: false` or `undefined`, that's where the issue is

4. **Visual verification:**
   - ✅ No floating chat button in bottom-right corner
   - ✅ No X (close) button in the header
   - ✅ Chatbot should fill the width of its container
   - ✅ No tooltip on hover

## Common Issues & Solutions

### Issue 1: URL parameter not detected
**Symptoms:** 
- `🔗 [useURLParams] Embedded value: undefined`

**Solution:**
- Make sure URL has `?embedded=true` (not `?embedded=1` or other values)
- Check for typos in the URL
- Try refreshing the page

### Issue 2: Config override not applied
**Symptoms:**
- `🔧 [apiMapper] Applying embedded override` log is missing
- `urlParams.embedded` is undefined in apiMapper

**Solution:**
- Check if `useURLParams` is returning the embedded parameter
- Verify the parameter is being passed to `applyURLParamOverrides`

### Issue 3: Settings merge losing embedded value
**Symptoms:**
- `⚙️ [Settings Merge] dbConfig.general.embedded: true`
- But `⚙️ [Settings Merge] mergedSettings.general.embedded: false`

**Solution:**
- The spread operator might be overwriting the value
- Check the order of object spreading in `mergedSettings`

### Issue 4: Button still showing
**Symptoms:**
- `🔘 [buttonBuilder] CLOSE_CHAT_BUTTON disabled: false`
- Close button is visible

**Solution:**
- Check if settings are being passed correctly to the ChatBot component
- Verify the settings object structure

## Quick Test URLs

Test both modes side-by-side:

- **Floating Mode:** http://localhost:3000/
- **Embedded Mode:** http://localhost:3000/?embedded=true

## Expected Console Output (Success Case)

When everything works correctly, you should see:

```
🔗 [useURLParams] Embedded value: "true"
🔧 [apiMapper] overriddenConfig.general.embedded: true
⚙️ [Settings Merge] mergedSettings.general.embedded: true
🎨 [Style Selection] Using: EMBEDDED styles
🔘 [buttonBuilder] CLOSE_CHAT_BUTTON disabled: true
```

## Removing Debug Logs

Once you've verified everything works, you can remove the debug logs by searching for:
- `console.log("🔗`
- `console.log("🔧`
- `console.log("⚙️`
- `console.log("🎨`
- `console.log("🔘`

And deleting those lines.
