/**
 * Defines the brand tokens for customizable theming.
 * These tokens allow SaaS designers to customize the chatbot appearance
 * without modifying code, and can be stored in a database.
 */
export type BrandTokens = {
	/** Primary color for bot elements (buttons, bot bubble outline) */
	primary: string;
	/** Secondary accent color */
	secondary: string;
	/** User bubble outline color */
	userAccent: string;
	/** Primary text color */
	textPrimary: string;
	/** Secondary text color */
	textSecondary: string;
	/** Glass surface transparency (0-1) */
	surfaceAlpha: number;
	/** Backdrop blur strength in pixels */
	blurPx: number;
	/** Font family stack */
	fontFamily: string;
};

/**
 * Default brand tokens matching the current MyTrip theme.
 */
export const defaultBrandTokens: BrandTokens = {
	primary: "#79C1B3",
	secondary: "#79C1B3",
	userAccent: "#998167",
	textPrimary: "#333333",
	textSecondary: "#666666",
	surfaceAlpha: 0.75,
	blurPx: 20,
	fontFamily: "'Lato', 'Avenir', 'Helvetica Neue', sans-serif",
};

/**
 * Validates and clamps brand token values to safe ranges.
 * @param tokens - Partial brand tokens to validate
 * @returns Validated brand tokens with defaults for missing values
 */
export const validateBrandTokens = (tokens: Partial<BrandTokens>): BrandTokens => {
	return {
		primary: tokens.primary || defaultBrandTokens.primary,
		secondary: tokens.secondary || defaultBrandTokens.secondary,
		userAccent: tokens.userAccent || defaultBrandTokens.userAccent,
		textPrimary: tokens.textPrimary || defaultBrandTokens.textPrimary,
		textSecondary: tokens.textSecondary || defaultBrandTokens.textSecondary,
		surfaceAlpha: Math.max(0, Math.min(1, tokens.surfaceAlpha ?? defaultBrandTokens.surfaceAlpha)),
		blurPx: Math.max(0, Math.min(50, tokens.blurPx ?? defaultBrandTokens.blurPx)),
		fontFamily: tokens.fontFamily || defaultBrandTokens.fontFamily,
	};
};
