/**
 * API Configuration Constants
 * Centralized configuration for API endpoints and special paths
 */

/**
 * Environment Detection
 * Set VITE_DEV_MODE=true in .env for local development
 */
const IS_DEV_MODE = import.meta.env.VITE_DEV_MODE === "true" || 
	import.meta.env.DEV;

console.log(`🔧 [Config] Running in ${IS_DEV_MODE ? "DEVELOPMENT" : "PRODUCTION"} mode`);

/**
 * Assistant ID Configuration
 * In dev mode: uses hardcoded dev assistant ID
 * In production: extracts from URL path (e.g., /my-assistant -> "my-assistant")
 */
const DEV_ASSISTANT_ID = "692dcd694130f3f77a280bb3";

/**
 * Gets the assistant ID from the current URL path
 * Removes leading slash and returns the first path segment
 * @returns Assistant ID from URL or empty string
 */
const getAssistantIdFromUrl = (): string => {
	const path = window.location.pathname;
	// Remove leading slash and get first segment
	const segments = path.split('/').filter(Boolean);
	return segments.length > 0 ? segments[0] : '';
};

/**
 * Active Assistant ID
 * Dev: hardcoded dev assistant ID
 * Prod: extracted from URL path
 */
export const ASSISTANT_ID = IS_DEV_MODE 
	? DEV_ASSISTANT_ID
	: getAssistantIdFromUrl();

/**
 * API Endpoints - Configured via environment variables
 * Dev mode uses localhost defaults, production uses .env.production values
 */
export const API_ENDPOINTS = {
	// Chat and Handoff servers - use VITE_CHAT_BASE_URL from .env
	CHAT_BASE: import.meta.env.VITE_CHAT_BASE_URL || 
		(IS_DEV_MODE ? "http://localhost:8001" : "https://chats.mytrip.ai"),
	
	HANDOFF_SERVER: import.meta.env.VITE_CHAT_BASE_URL || 
		(IS_DEV_MODE ? "http://localhost:8001" : "https://chats.mytrip.ai"),
	
	// Express middleware - use VITE_API_URL from .env
	EXPRESS_MIDDLEWARE: import.meta.env.VITE_API_URL || "http://localhost:3001",
	
	// Token service - use VITE_TOKEN_SERVICE_URL from .env
	TOKEN_SERVICE: import.meta.env.VITE_TOKEN_SERVICE_URL || 
		(IS_DEV_MODE ? "http://localhost:3000" : "https://stagingplatform.mytrip.ai")
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
