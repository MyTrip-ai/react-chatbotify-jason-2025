/**
 * Maps static configuration from chatbotConfig.js/defaultChatbotConfig.js
 * to the format expected by AppWithDatabaseConfig
 * 
 * Static configs use the old react-chatbotify format with nested settings,
 * while the app expects a flatter structure with branding tokens.
 */

import { BrandTokens, defaultBrandTokens } from "../types/BrandTokens";

/**
 * Extracts branding tokens from static config settings
 * 
 * @param staticConfig - Configuration from chatbotConfig.js or defaultChatbotConfig.js
 * @returns BrandTokens object
 */
export const extractBrandingFromStaticConfig = (staticConfig: any): BrandTokens => {
	const settings = staticConfig?.settings;
	
	if (!settings) {
		return defaultBrandTokens;
	}
	
	return {
		primary: settings.general?.primaryColor || defaultBrandTokens.primary,
		secondary: settings.general?.secondaryColor || defaultBrandTokens.secondary,
		userAccent: defaultBrandTokens.userAccent, // Not in static config
		textPrimary: defaultBrandTokens.textPrimary, // Not in static config
		textSecondary: defaultBrandTokens.textSecondary, // Not in static config
		surfaceAlpha: defaultBrandTokens.surfaceAlpha, // Not in static config
		blurPx: defaultBrandTokens.blurPx, // Not in static config
		fontFamily: settings.general?.fontFamily || defaultBrandTokens.fontFamily,
	};
};

/**
 * Safely extracts a value if it's a string, otherwise returns undefined
 * This prevents JSX elements from breaking the config
 */
const safeExtractString = (value: any): string | undefined => {
	try {
		// Only return if it's a string
		if (typeof value === 'string') {
			return value;
		}
		// Ignore JSX elements, objects, etc.
		return undefined;
	} catch (error) {
		console.warn('[staticConfigMapper] Error extracting value:', error);
		return undefined;
	}
};

/**
 * Maps static configuration to the format expected by the app
 * 
 * @param staticConfig - Configuration from chatbotConfig.js or defaultChatbotConfig.js
 * @returns Mapped configuration object
 */
export const mapStaticConfigToAppConfig = (staticConfig: any) => {
	if (!staticConfig) {
		return null;
	}
	
	const settings = staticConfig.settings;
	const branding = extractBrandingFromStaticConfig(staticConfig);
	
	// Safely extract header title (only if it's a string)
	const headerTitle = safeExtractString(settings?.header?.title);
	
	// Safely extract footer text (only if it's a string)
	const footerText = safeExtractString(settings?.footer?.text);
	
	return {
		branding,
		header: {
			// Only include title if it's a plain string (not JSX)
			...(headerTitle ? { title: headerTitle } : {}),
			avatar: settings?.header?.avatar,
			showAvatar: settings?.header?.showAvatar ?? true,
			buttons: settings?.header?.buttons,
		},
		botBubble: {
			avatar: settings?.botBubble?.avatar,
			showAvatar: settings?.botBubble?.showAvatar ?? true,
			simStream: settings?.botBubble?.simStream,
			streamSpeed: settings?.botBubble?.streamSpeed,
			dangerouslySetInnerHtml: settings?.botBubble?.dangerouslySetInnerHtml,
		},
		userBubble: {
			showAvatar: settings?.userBubble?.showAvatar ?? false,
			avatar: settings?.userBubble?.avatar,
			animate: settings?.userBubble?.animate,
			simStream: settings?.userBubble?.simStream,
		},
		chatWindow: {
			defaultOpen: settings?.chatWindow?.defaultOpen ?? false,
			showScrollbar: settings?.chatWindow?.showScrollbar,
			autoJumpToBottom: settings?.chatWindow?.autoJumpToBottom,
			showMessagePrompt: settings?.chatWindow?.showMessagePrompt,
			messagePromptText: settings?.chatWindow?.messagePromptText,
		},
		chatButton: {
			icon: settings?.chatButton?.icon,
		},
		general: {
			defaultHelloMessage: staticConfig.message,
			primaryColor: settings?.general?.primaryColor,
			secondaryColor: settings?.general?.secondaryColor,
			fontFamily: settings?.general?.fontFamily,
			showHeader: settings?.general?.showHeader,
			showFooter: settings?.general?.showFooter,
			embedded: settings?.general?.embedded,
			flowStartTrigger: settings?.general?.flowStartTrigger,
		},
		footer: {
			// Only include text if it's a plain string (not JSX)
			...(footerText ? { text: footerText } : {}),
			buttons: settings?.footer?.buttons,
		},
		chatHistory: settings?.chatHistory,
		chatInput: settings?.chatInput,
		device: settings?.device,
		notification: settings?.notification,
		tooltip: settings?.tooltip,
	};
};
