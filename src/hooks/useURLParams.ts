import { useMemo } from "react";

/**
 * URL Parameters type
 * Defines all supported URL parameters for chatbot configuration
 */
export type URLParams = {
	token?: string;
	avatar?: string;
	logoUrl?: string;
	avatarUrl?: string;
	chatButtonImageUrl?: string;
	primaryColor?: string;
	secondaryColor?: string;
	title?: string;
	transparency?: string;
	embedded?: string; // Legacy: "true" or "false" to enable embedded mode
	chatType?: string; // New: "embedded" or "popup" (aligns with database schema)
	width?: string;
	height?: string;
	maxWidth?: string;
	maxHeight?: string;
};

/**
 * Custom hook to extract and parse URL parameters
 * Supports the following parameters:
 * - token: Authorization token for API config
 * - avatar: Bot avatar URL
 * - logoUrl: Header logo URL
 * - avatarUrl: Bot bubble avatar URL
 * - chatButtonImageUrl: Chat button icon URL
 * - primaryColor: Primary theme color (hex)
 * - secondaryColor: Secondary theme color (hex)
 * - title: Header title text
 * - transparency: Color transparency (0-1)
 * - embedded: Enable embedded mode ("true" or "false") - legacy parameter
 * - chatType: Widget display mode ("embedded" or "popup") - new parameter
 * - width: Chat window width in pixels (e.g., "600")
 * - height: Chat window height in pixels (e.g., "700")
 * - maxWidth: Maximum chat window width in pixels
 * - maxHeight: Maximum chat window height in pixels
 * 
 * @returns Object containing all URL parameters
 * 
 * @example
 * // URL: ?token=abc123&primaryColor=FF5733&title=My%20Bot&chatType=embedded
 * const params = useURLParams();
 * // params = { token: "abc123", primaryColor: "FF5733", title: "My Bot", chatType: "embedded" }
 */
export const useURLParams = (): URLParams => {
	return useMemo(() => {
		const searchParams = new URLSearchParams(window.location.search);
		
		const params = {
			token: searchParams.get("token") || undefined,
			avatar: searchParams.get("avatar") || undefined,
			logoUrl: searchParams.get("logoUrl") || undefined,
			avatarUrl: searchParams.get("avatarUrl") || undefined,
			chatButtonImageUrl: searchParams.get("chatButtonImageUrl") || undefined,
			primaryColor: searchParams.get("primaryColor") || undefined,
			secondaryColor: searchParams.get("secondaryColor") || undefined,
			title: searchParams.get("title") || undefined,
			transparency: searchParams.get("transparency") || undefined,
			embedded: searchParams.get("embedded") || undefined,
			chatType: searchParams.get("chatType") || undefined,
			width: searchParams.get("width") || undefined,
			height: searchParams.get("height") || undefined,
			maxWidth: searchParams.get("maxWidth") || undefined,
			maxHeight: searchParams.get("maxHeight") || undefined,
		};
		
		console.log(" [useURLParams] URL:", window.location.href);
		console.log(" [useURLParams] Search string:", window.location.search);
		console.log(" [useURLParams] Extracted params:", params);
		console.log(" [useURLParams] Embedded value:", params.embedded);
		
		return params;
	}, []);
};
