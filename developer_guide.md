# MyTrip Chatbot Developer Guide

This document explains how the current glassmorphic theme is wired up, which colors and fonts it uses, and how to adapt it so a SaaS designer can update the look (colors + transparency) without touching code.

## 1. Current design touchpoints

| Area | File(s) | Key values |
| --- | --- | --- |
| Global palette + fonts | `src/components/ChatBotContainer.css` | CSS custom props for background, teal accents, text colors, CTA button colors, font-face (Lato/Avenir) |
| Glass surfaces (window, input, bubbles, options) | `src/themes/myTripTheme.tsx`, `src/components/ChatBotContainer.css`, `src/components/ChatBotInput/ChatBotInput.css`, `src/components/ChatBotBody/*` | `rgba(255, 255, 255, 0.75)` backgrounds + blur radius |
| Brand accents | `src/themes/myTripTheme.tsx`, `src/components/ChatBotBody/UserMessage/UserMessage.tsx`, `src/components/ChatBotBody/BotMessage/BotMessage.tsx`, `src/components/ChatBotBody/BotOptions/BotOptions.css` | `#79C1B3`, `#998167`, teal borders |
| Default button set | `src/constants/internal/DefaultSettings.tsx` | Chat-input buttons include `VOICE_MESSAGE_BUTTON`, `SEND_MESSAGE_BUTTON`, etc. |

## 2. Recommended theming structure

1. **Define a token shape** (e.g. `BrandTokens`):
   ```ts
   export type BrandTokens = {
     primary: string;       // teal buttons/bot outline
     secondary: string;     // secondary accent
     userAccent: string;    // user bubble outline
     textPrimary: string;
     textSecondary: string;
     surfaceAlpha: number; // 0–1 transparency
     blurPx: number;        // backdrop-filter strength
     fontFamily: string;
   };
   ```

2. **Surface tokens via settings** – extend `Settings.general` or add `settings.branding` so the SaaS designer can inject token values. Example:
   ```ts
   const branding = settings.branding ?? defaultBranding;
   const surface = `rgba(255, 255, 255, ${branding.surfaceAlpha ?? 0.75})`;
   const blur = `blur(${branding.blurPx ?? 20}px)`;
   ```

3. **Apply tokens to existing styles:**
   - `glassChatWindow`, `translucentInput`, bubble styles, quick replies → use `surface` + `blur`.
   - Borders → use `branding.primary` / `branding.userAccent`.
   - Text colors → map to `branding.textPrimary`, `branding.textSecondary`.
   - Font-family → fallback to `branding.fontFamily` when available.

4. **Expose CSS variables** so custom tokens can also be adjusted via runtime stylesheets:
   ```css
   :root {
     --rcb-primary: #7AC1B4;
     --rcb-user-accent: #998167;
     --rcb-surface-alpha: 0.75;
     --rcb-blur: 20px;
   }

   .rcb-chat-window {
     background: rgba(255, 255, 255, var(--rcb-surface-alpha));
     backdrop-filter: blur(var(--rcb-blur));
     border: 1px solid var(--rcb-primary);
   }
   ```
   Inject overrides at runtime (e.g., a `<style>` tag or setting `styleRootRef.current.innerHTML` in `ChatBot`).

5. **Validation** – clamp `surfaceAlpha` between 0 and 1 and provide defaults for missing values.

## 3. Removing/adding controls programmatically

The chat input buttons are determined by `settings.chatInput.buttons` in `DefaultSettings`. To remove the microphone (voice) button globally, ensure `settings.voice?.disabled === true` **or** simply omit `Button.VOICE_MESSAGE_BUTTON` from that array.

---

## Implementation checklist

1. Add `BrandTokens` type + defaults.
2. Extend settings/theme to consume tokens instead of hard-coded hex + rgba values.
3. Replace literals in components (`UserMessage`, `BotMessage`, etc.) with props/variables derived from tokens.
4. Update SaaS UI to emit brand tokens and pass them into the embed snippet.
5. (Optional) Expose CSS variables for no-rebuild updates.

With the above in place, designers can change colors/transparency purely via configuration.
