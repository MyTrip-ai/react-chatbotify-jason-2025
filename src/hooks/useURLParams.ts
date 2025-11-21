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
 * 
 * @returns Object containing all URL parameters
 * 
 * @example
 * // URL: ?token=abc123&primaryColor=FF5733&title=My%20Bot
 * const params = useURLParams();
 * // params = { token: "abc123", primaryColor: "FF5733", title: "My Bot" }
 */
export const useURLParams = (): URLParams => {
	return useMemo(() => {
		const searchParams = new URLSearchParams(window.location.search);
		
		return {
			token: searchParams.get("token") || undefined,
			avatar: searchParams.get("avatar") || undefined,
			logoUrl: searchParams.get("logoUrl") || undefined,
			avatarUrl: searchParams.get("avatarUrl") || undefined,
			chatButtonImageUrl: searchParams.get("chatButtonImageUrl") || undefined,
			primaryColor: searchParams.get("primaryColor") || undefined,
			secondaryColor: searchParams.get("secondaryColor") || undefined,
			title: searchParams.get("title") || undefined,
			transparency: searchParams.get("transparency") || undefined,
		};
	}, []);
};
