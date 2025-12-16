/**
 * API Configuration Constants
 * Centralized configuration for API endpoints and special paths
 */

/**
 * Environment Detection
 * Set VITE_DEV_MODE=true in .env for local development
 */
const IS_DEV_MODE = import.meta.env.VITE_DEV_MODE === "true" || 
	import.meta.env.DEV || 
	window.location.hostname === "localhost";

console.log(`🔧 [Config] Running in ${IS_DEV_MODE ? "DEVELOPMENT" : "PRODUCTION"} mode`);

/**
 * Tenant Configuration
 */
export const TENANT_ID = IS_DEV_MODE 
	? "tenant-undiscovered-2"  // Dev tenant
	: "mytrip-ai";             // Production tenant

/**
 * API Endpoints - Dev vs Production
 */
export const API_ENDPOINTS = {
	// All APIs point to localhost in dev
	CHAT_BASE: IS_DEV_MODE 
		? "http://localhost:8001" 
		: "https://chats.mytrip.ai",
	
	HANDOFF_SERVER: IS_DEV_MODE 
		? "http://localhost:8001" 
		: "https://chats.mytrip.ai",
	
	EXPRESS_MIDDLEWARE: import.meta.env.VITE_API_URL || "http://localhost:3001",
	
	TOKEN_SERVICE: IS_DEV_MODE
		? "http://localhost:3000"
		: "https://stagingplatform.mytrip.ai"
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
