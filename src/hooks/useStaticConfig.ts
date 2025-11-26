import { useMemo } from "react";
import defaultChatbotConfig from "../defaultChatbotConfig.jsx";
import chatbotConfig from "../chatbotConfig.jsx";

/**
 * Custom hook to get static configuration based on URL path
 * 
 * Priority order:
 * 1. Path-specific config from chatbotConfig.js (e.g., /coastlinetravel)
 * 2. Default config from defaultChatbotConfig.js
 * 
 * @returns Static configuration object or null if no match
 * 
 * @example
 * // URL: http://localhost:3002/amalia
 * const config = useStaticConfig();
 * // Returns chatbotConfig.amalia
 * 
 * @example
 * // URL: http://localhost:3002/unknown-path
 * const config = useStaticConfig();
 * // Returns defaultChatbotConfig
 */
export const useStaticConfig = () => {
	return useMemo(() => {
		// Extract path from URL (remove leading slash)
		const path = window.location.pathname.substring(1);
		
		console.log("🗺️ [useStaticConfig] Current path:", path);
		
		// If no path or root path, return default config
		if (!path || path === "") {
			console.log("🗺️ [useStaticConfig] No path, using default config");
			return defaultChatbotConfig;
		}
		
		// Check if path exists in chatbotConfig
		// @ts-ignore - chatbotConfig is a plain JS object with dynamic keys
		if (chatbotConfig[path]) {
			console.log("🗺️ [useStaticConfig] Found path-specific config for:", path);
			// @ts-ignore
			return chatbotConfig[path];
		}
		
		// If path doesn't match any static config, return null
		// This allows the app to try fetching from database
		console.log("🗺️ [useStaticConfig] No static config found for path:", path);
		return null;
	}, []);
};

/**
 * Custom hook to get current URL path (cleaned)
 * 
 * @returns Current path without leading slash
 * 
 * @example
 * // URL: http://localhost:3002/amalia
 * const path = useCurrentPath();
 * // Returns "amalia"
 */
export const useCurrentPath = (): string => {
	return useMemo(() => {
		const path = window.location.pathname.substring(1);
		console.log("📍 [useCurrentPath] Extracted path:", path);
		return path;
	}, []);
};
