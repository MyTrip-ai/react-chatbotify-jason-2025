import { BrandTokens, defaultBrandTokens, validateBrandTokens } from "../types/BrandTokens";
import { URLParams } from "../hooks/useURLParams";
import { applyTransparency, normalizeHexColor, isValidHexColor } from "./colorHelpers";

/**
 * Maps API chatDesign data to BrandTokens.
 * Uses existing database fields and provides defaults for missing fields.
 * 
 * @param chatDesign - The chatDesign object from the API response
 * @returns Validated BrandTokens
 */
export const mapChatDesignToBrandTokens = (chatDesign: any): BrandTokens => {
	const tokens: Partial<BrandTokens> = {
		primary: chatDesign?.primaryTheme?.color,
		secondary: chatDesign?.secondaryTheme?.color,
		userAccent: chatDesign?.userBackgroundColor,
		textPrimary: chatDesign?.botTextColor,
		textSecondary: chatDesign?.textSecondaryColor || chatDesign?.chatClosedColor,
		surfaceAlpha: chatDesign?.transparency,
		// Use defaults for fields not yet in database
		blurPx: chatDesign?.blurStrength ?? defaultBrandTokens.blurPx,
		fontFamily: chatDesign?.fontFamily ?? defaultBrandTokens.fontFamily,
	};

	return validateBrandTokens(tokens);
};

/**
 * Maps full API widget configuration to chatbot settings.
 * 
 * @param apiData - The full widget configuration from the API
 * @returns Object with branding tokens and other settings
 */
export const mapApiToConfig = (apiData: any) => {
	const branding = mapChatDesignToBrandTokens(apiData.chatDesign);
	const chatDesign = apiData.chatDesign;
	const generalSettings = apiData.generalSettings;
	
	return {
		branding,
		header: {
			title: chatDesign?.headerText || "Chat",
			avatar: chatDesign?.chatWidgetyLogo,
			showAvatar: !!chatDesign?.chatWidgetyLogo,
		},
		botBubble: {
			avatar: chatDesign?.botAvatar,
			showAvatar: !!chatDesign?.botAvatar,
		},
		userBubble: {
			showAvatar: false, // Can be configured if needed
		},
		chatWindow: {
			defaultOpen: chatDesign?.onPageLoadDisplay === "open",
			showMessageIndicator: chatDesign?.showMessageIndicator,
		},
		general: {
			defaultHelloMessage: generalSettings?.defaultHelloMessage,
		},
		chatButton: {
			// Can add button customization here if needed
		}
	};
};

/**
 * Applies URL parameter overrides to configuration.
 * URL parameters take priority over database configuration.
 * 
 * Priority order (lowest to highest):
 * 1. Database config
 * 2. URL parameters (override specific properties)
 * 
 * Supported URL parameters:
 * - avatar: Overrides bot avatar, chat button icon, and header avatar
 * - logoUrl: Overrides header avatar specifically
 * - avatarUrl: Overrides bot bubble avatar specifically
 * - chatButtonImageUrl: Overrides chat button icon specifically
 * - primaryColor: Overrides primary theme color (with transparency)
 * - secondaryColor: Overrides secondary theme color (with transparency)
 * - title: Overrides header title text
 * - transparency: Applied to color values (0-1 range)
 * 
 * @param config - Base configuration (from database or defaults)
 * @param urlParams - URL parameters extracted from query string
 * @returns Configuration with URL parameter overrides applied
 * 
 * @example
 * // URL: ?primaryColor=FF5733&transparency=0.8&title=My%20Bot
 * const config = applyURLParamOverrides(baseConfig, urlParams);
 * // config.branding.primary = "#FF5733CC" (with 80% transparency)
 * // config.header.title = "My Bot"
 */
export const applyURLParamOverrides = (config: any, urlParams: URLParams) => {
	// Create a deep copy to avoid mutating the original config
	const overriddenConfig = JSON.parse(JSON.stringify(config));
	
	// Parse transparency value (0-1)
	const transparency = urlParams.transparency ? parseFloat(urlParams.transparency) : null;
	
	// Apply avatar overrides (avatar param overrides multiple fields)
	if (urlParams.avatar) {
		// avatar param sets bot avatar, chat button icon, and header avatar
		overriddenConfig.botBubble = overriddenConfig.botBubble || {};
		overriddenConfig.botBubble.avatar = urlParams.avatar;
		overriddenConfig.botBubble.showAvatar = true;
		
		overriddenConfig.chatButton = overriddenConfig.chatButton || {};
		overriddenConfig.chatButton.icon = urlParams.avatar;
		
		overriddenConfig.header = overriddenConfig.header || {};
		overriddenConfig.header.avatar = urlParams.avatar;
		overriddenConfig.header.showAvatar = true;
	}
	
	// logoUrl specifically overrides header avatar
	if (urlParams.logoUrl) {
		overriddenConfig.header = overriddenConfig.header || {};
		overriddenConfig.header.avatar = urlParams.logoUrl;
		overriddenConfig.header.showAvatar = true;
	}
	
	// avatarUrl specifically overrides bot bubble avatar
	if (urlParams.avatarUrl) {
		overriddenConfig.botBubble = overriddenConfig.botBubble || {};
		overriddenConfig.botBubble.avatar = urlParams.avatarUrl;
		overriddenConfig.botBubble.showAvatar = true;
	}
	
	// chatButtonImageUrl specifically overrides chat button icon
	if (urlParams.chatButtonImageUrl) {
		overriddenConfig.chatButton = overriddenConfig.chatButton || {};
		overriddenConfig.chatButton.icon = urlParams.chatButtonImageUrl;
	}
	
	// Apply color overrides with transparency
	if (urlParams.primaryColor && isValidHexColor(urlParams.primaryColor)) {
		overriddenConfig.branding = overriddenConfig.branding || {};
		const color = normalizeHexColor(urlParams.primaryColor);
		overriddenConfig.branding.primary = transparency !== null 
			? applyTransparency(color, transparency)
			: color;
	}
	
	if (urlParams.secondaryColor && isValidHexColor(urlParams.secondaryColor)) {
		overriddenConfig.branding = overriddenConfig.branding || {};
		const color = normalizeHexColor(urlParams.secondaryColor);
		overriddenConfig.branding.secondary = transparency !== null
			? applyTransparency(color, transparency)
			: color;
	}
	
	// Apply title override
	if (urlParams.title) {
		overriddenConfig.header = overriddenConfig.header || {};
		overriddenConfig.header.title = urlParams.title;
	}
	
	return overriddenConfig;
};
