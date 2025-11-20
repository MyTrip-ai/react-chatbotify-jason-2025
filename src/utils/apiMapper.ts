import { BrandTokens, defaultBrandTokens, validateBrandTokens } from "../types/BrandTokens";

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
