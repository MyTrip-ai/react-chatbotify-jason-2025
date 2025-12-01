/**
 * API Configuration Constants
 * Centralized configuration for API endpoints and special paths
 */

/**
 * API Endpoints
 * Base URLs for different API services
 */
export const API_ENDPOINTS = {
	// Main chat API base URL
	CHAT_BASE: "https://chats.mytrip.ai",
	// CHAT_BASE: "http://localhost:8001",
	// Express middleware endpoint (if needed)
	EXPRESS_MIDDLEWARE: import.meta.env.VITE_API_URL || "http://localhost:3001",
	// Token service endpoint (if needed)
	// TOKEN_SERVICE: "http://localhost:3000"
	TOKEN_SERVICE: "https://stagingplatform.mytrip.ai"
};

/**
 * Special Paths
 * Paths that require special handling in the application
 */
export const SPECIAL_PATHS = {
	// Designer path - uses hardcoded messages instead of API
	DESIGNER: "/designer",
	// US Parks paths
	US_PARKS: "/us-parks",
	US_PARKS_FULL: "/us-parks-assistant",
	// Amalia paths
	AMALIA: "/amalia",
	AMALIA_FULL: "/amalia-assistant",
	// Assistant path
	ASSISTANT: "/assistant"
};

/**
 * Default path when no path is specified
 */
export const DEFAULT_PATH = "/amalia";

/**
 * Special greeting message used to request chat history
 * Backend recognizes this message and returns history instead of processing it
 */
export const GREETING_MESSAGE = "mytripgreeting";
