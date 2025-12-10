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
 * Helper function to determine if widget should be in embedded mode.
 * Checks chatType field from new schema.
 * 
 * @param chatDesign - The chatDesign object from the API response
 * @returns true if embedded mode, false if popup mode
 */
const isEmbeddedMode = (chatDesign: any): boolean => {
	return chatDesign?.chatType === "embedded";
};

/**
 * Helper function to determine initial open state based on device and mode.
 * For popup mode, checks desktopBehavior.initialState (defaults to desktop for now).
 * For embedded mode, always returns true (embedded is always "open").
 * 
 * @param chatDesign - The chatDesign object from the API response
 * @returns true if should be initially open, false otherwise
 */
const getInitialOpenState = (chatDesign: any): boolean => {
	if (isEmbeddedMode(chatDesign)) {
		return true; // Embedded mode is always "open"
	}
	
	// Popup mode: check desktop behavior (can be enhanced to detect mobile)
	const initialState = chatDesign?.desktopBehavior?.initialState || 
	                     chatDesign?.onPageLoadDisplay || // Fallback to old field
	                     "closed"; // Default to closed
	
	return initialState === "open";
};

/**
 * Maps full API widget configuration to chatbot settings.
 * Supports both new schema (chatType, embeddedDimensions, desktopBehavior, mobileBehavior)
 * and legacy schema (onPageLoadDisplay) for backward compatibility.
 * 
 * @param apiData - The full widget configuration from the API
 * @returns Object with branding tokens and other settings
 */
export const mapApiToConfig = (apiData: any) => {
	const branding = mapChatDesignToBrandTokens(apiData.chatDesign);
	const chatDesign = apiData.chatDesign;
	const generalSettings = apiData.generalSettings;
	
	// Determine if embedded mode from chatType field
	const embedded = isEmbeddedMode(chatDesign);
	
	// Get dimensions based on mode
	let dimensions = {};
	if (embedded && chatDesign?.embeddedDimensions) {
		// Embedded mode: use embeddedDimensions
		const embWidth = chatDesign.embeddedDimensions.width;
		const embHeight = chatDesign.embeddedDimensions.height;
		dimensions = {
			width: embWidth ? `${embWidth}px` : undefined,
			height: embHeight ? `${embHeight}px` : undefined,
		};
	} else if (!embedded && chatDesign?.desktopBehavior?.popupDimensions) {
		// Popup mode: use desktopBehavior.popupDimensions (can be enhanced for mobile detection)
		const popupDims = chatDesign.desktopBehavior.popupDimensions;
		dimensions = {
			width: popupDims.width ? `${popupDims.width}px` : undefined,
			height: popupDims.height ? `${popupDims.height}px` : undefined,
		};
	}
	
	return {
		branding,
		header: {
			title: chatDesign?.headerText || "Chat",
			avatar: chatDesign?.chatWidgetyLogo,
			showAvatar: !!chatDesign?.chatWidgetyLogo,
			fontFamily: chatDesign?.headerFont, // Font family for title
		},
		botBubble: {
			avatar: chatDesign?.botAvatar,
			showAvatar: !!chatDesign?.botAvatar,
			dangerouslySetInnerHtml: true, // Always enable HTML rendering for bot messages
		},
		userBubble: {
			showAvatar: false, // Can be configured if needed
		},
		chatWindow: {
			defaultOpen: getInitialOpenState(chatDesign),
			showMessageIndicator: chatDesign?.showMessageIndicator,
		},
		general: {
			defaultHelloMessage: generalSettings?.defaultHelloMessage,
			embedded: embedded, // Set embedded mode from chatType
		},
		chatButton: {
			icon: chatDesign?.chatButtonImage, // Map chatButtonImage from database to chat button icon
		},
		// Store dimensions from database (will be merged with URL overrides later)
		chatWindowSize: Object.keys(dimensions).length > 0 ? dimensions : undefined,
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
 * - titleFont: Overrides header title font family
 * - transparency: Applied to color values (0-1 range)
 * - chatType: Widget display mode ("embedded" or "popup") - NEW, aligns with database schema
 * - embedded: Enables embedded mode ("true" or "false") - LEGACY, use chatType instead
 * - width: Chat window width in pixels (e.g., "600")
 * - height: Chat window height in pixels (e.g., "700")
 * - maxWidth: Maximum chat window width in pixels
 * - maxHeight: Maximum chat window height in pixels
 * 
 * @param config - Base configuration (from database or defaults)
 * @param urlParams - URL parameters extracted from query string
 * @returns Configuration with URL parameter overrides applied
 * 
 * @example
 * // URL: ?embedded=true&width=600&height=700&primaryColor=FF5733
 * const config = applyURLParamOverrides(baseConfig, urlParams);
 * // config.general.embedded = true
 * // config.chatWindowSize.width = "600px"
 * // config.chatWindowSize.height = "700px"
 * // config.branding.primary = "#FF5733"
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
	
	// Apply title font override
	if (urlParams.titleFont) {
		overriddenConfig.header = overriddenConfig.header || {};
		overriddenConfig.header.fontFamily = urlParams.titleFont;
	}
	
	// Apply embedded mode override
	// URL parameter takes priority over database chatType field
	// Support both legacy "embedded" param and new "chatType" param
	if (urlParams.chatType !== undefined) {
		// New chatType parameter (preferred)
		console.log("🔧 [apiMapper] Applying chatType override from URL");
		console.log("🔧 [apiMapper] urlParams.chatType:", urlParams.chatType);
		overriddenConfig.general = overriddenConfig.general || {};
		overriddenConfig.general.embedded = urlParams.chatType === "embedded";
		console.log("🔧 [apiMapper] overriddenConfig.general.embedded:", overriddenConfig.general.embedded);
	} else if (urlParams.embedded !== undefined) {
		// Legacy embedded parameter (for backward compatibility)
		console.log("🔧 [apiMapper] Applying embedded override from URL (legacy param)");
		console.log("🔧 [apiMapper] urlParams.embedded:", urlParams.embedded);
		console.log("🔧 [apiMapper] Converting to boolean:", urlParams.embedded === "true");
		overriddenConfig.general = overriddenConfig.general || {};
		overriddenConfig.general.embedded = urlParams.embedded === "true";
		console.log("🔧 [apiMapper] overriddenConfig.general.embedded:", overriddenConfig.general.embedded);
	}
	
	// Apply size overrides (width, height, maxWidth, maxHeight)
	// These are stored in a special chatWindowSize object that will be applied to styles later
	if (urlParams.width || urlParams.height || urlParams.maxWidth || urlParams.maxHeight) {
		console.log("🔧 [apiMapper] Applying size overrides");
		overriddenConfig.chatWindowSize = overriddenConfig.chatWindowSize || {};
		
		if (urlParams.width) {
			overriddenConfig.chatWindowSize.width = `${urlParams.width}px`;
			console.log("🔧 [apiMapper] width:", overriddenConfig.chatWindowSize.width);
		}
		if (urlParams.height) {
			overriddenConfig.chatWindowSize.height = `${urlParams.height}px`;
			console.log("🔧 [apiMapper] height:", overriddenConfig.chatWindowSize.height);
		}
		if (urlParams.maxWidth) {
			overriddenConfig.chatWindowSize.maxWidth = `${urlParams.maxWidth}px`;
			console.log("🔧 [apiMapper] maxWidth:", overriddenConfig.chatWindowSize.maxWidth);
		}
		if (urlParams.maxHeight) {
			overriddenConfig.chatWindowSize.maxHeight = `${urlParams.maxHeight}px`;
			console.log("🔧 [apiMapper] maxHeight:", overriddenConfig.chatWindowSize.maxHeight);
		}
	}
	
	console.log("🔧 [apiMapper] Final overriddenConfig:", overriddenConfig);
	return overriddenConfig;
};
