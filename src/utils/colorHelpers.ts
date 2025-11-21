/**
 * Color manipulation utilities for chatbot theming
 * Handles hex conversion, transparency, and color validation
 */

/**
 * Converts a transparency value (0-1) to hex alpha channel (00-FF)
 * 
 * @param transparency - Number between 0 (fully transparent) and 1 (fully opaque)
 * @returns Hex string representing alpha channel (00-FF)
 * 
 * @example
 * transparencyToHex(0.5)  // Returns "80"
 * transparencyToHex(1)    // Returns "FF"
 * transparencyToHex(0)    // Returns "00"
 */
export const transparencyToHex = (transparency: number): string => {
	// Clamp value between 0 and 1
	const clamped = Math.max(0, Math.min(1, transparency));
	// Convert to 0-255 range and then to hex
	const alpha = Math.round(clamped * 255);
	return alpha.toString(16).padStart(2, "0").toUpperCase();
};

/**
 * Ensures a color string is in proper hex format (#RRGGBB)
 * Handles colors with or without # prefix
 * 
 * @param color - Color string (hex format)
 * @returns Normalized hex color with # prefix
 * 
 * @example
 * normalizeHexColor("FF5733")   // Returns "#FF5733"
 * normalizeHexColor("#FF5733")  // Returns "#FF5733"
 * normalizeHexColor("F57")      // Returns "#F57"
 */
export const normalizeHexColor = (color: string): string => {
	if (!color) return color;
	return color.startsWith("#") ? color : `#${color}`;
};

/**
 * Applies transparency to a hex color by appending alpha channel
 * 
 * @param color - Hex color string (with or without #)
 * @param transparency - Number between 0 and 1
 * @returns Hex color with alpha channel (#RRGGBBAA)
 * 
 * @example
 * applyTransparency("FF5733", 0.5)   // Returns "#FF573380"
 * applyTransparency("#0000FF", 0.8)  // Returns "#0000FFCC"
 */
export const applyTransparency = (color: string, transparency: number): string => {
	if (!color) return color;
	
	const normalized = normalizeHexColor(color);
	const alpha = transparencyToHex(transparency);
	
	// Remove existing alpha channel if present (8-character hex)
	const baseColor = normalized.length === 9 ? normalized.slice(0, 7) : normalized;
	
	return `${baseColor}${alpha}`;
};

/**
 * Validates if a string is a valid hex color
 * Supports both 6-digit (#RRGGBB) and 8-digit (#RRGGBBAA) formats
 * 
 * @param color - Color string to validate
 * @returns True if valid hex color, false otherwise
 * 
 * @example
 * isValidHexColor("#FF5733")    // Returns true
 * isValidHexColor("FF5733")     // Returns true
 * isValidHexColor("#FF573380")  // Returns true
 * isValidHexColor("invalid")    // Returns false
 */
export const isValidHexColor = (color: string): boolean => {
	if (!color) return false;
	const hexPattern = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
	return hexPattern.test(color);
};
