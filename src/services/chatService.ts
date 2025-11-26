/**
 * Chat Service
 * Handles chat history retrieval and API communication
 */

import { API_ENDPOINTS, SPECIAL_PATHS, DEFAULT_PATH, GREETING_MESSAGE } from '../config/constants';
import { Params } from '../types/Params';
import { parseHTMLToReact, containsHTML } from '../utils/htmlParser';

/**
 * Determines the effective path for API calls
 * @param currentPath - Current URL path
 * @returns Effective path for API
 */
const getEffectivePath = (currentPath: string): string => {
	if (!currentPath || currentPath === '/') {
		return DEFAULT_PATH;
	}
	if (currentPath === SPECIAL_PATHS.US_PARKS_FULL) {
		return SPECIAL_PATHS.US_PARKS;
	}
	if (currentPath === SPECIAL_PATHS.AMALIA_FULL) {
		return SPECIAL_PATHS.AMALIA;
	}
	return currentPath;
};

/**
 * Constructs the chat API URL based on the path
 * @param effectivePath - Effective path for the API
 * @returns Complete API URL
 */
const getChatApiUrl = (effectivePath: string): string => {
	return effectivePath === SPECIAL_PATHS.ASSISTANT
		? `${API_ENDPOINTS.CHAT_BASE}/assistant/chat`
		: `${API_ENDPOINTS.CHAT_BASE}${effectivePath}-assistant/chat`;
};

/**
 * Calls the Amalia chat API
 * @param params - Parameters object from react-chatbotify
 * @param sessionId - Session ID for tracking user sessions
 * @param currentPath - Current URL path
 * @param enableHTMLParsing - Whether to parse HTML in messages (default: false)
 * @returns Success status
 */
export const callAmaliaAPI = async (
	params: Params,
	sessionId: string,
	currentPath: string,
	enableHTMLParsing: boolean = false
): Promise<boolean> => {
	console.log('🚀 [callAmaliaAPI] Starting API call...');
	console.log('🚀 [callAmaliaAPI] User input:', params.userInput);
	console.log('🔗 [callAmaliaAPI] onboardingThreadID:', params.onboardingThreadID);

	const effectivePath = getEffectivePath(currentPath);
	const url = getChatApiUrl(effectivePath);
	const clientIdWithPath = `${sessionId || 'unknown_user_chatbotify'}-${effectivePath}`;

	console.log('🔑 [callAmaliaAPI] Using client_id:', clientIdWithPath);
	console.log('📡 [callAmaliaAPI] API URL:', url);

	try {
		// Make API request
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				message: params.userInput,
				client_id: clientIdWithPath,
				onboarding_thread_id: params.onboardingThreadID || null,
			}),
		});

		console.log('📥 [callAmaliaAPI] Response status:', response.status, response.statusText);

		if (!response.ok) {
			throw new Error(`Error: ${response.statusText}`);
		}

		const data = await response.json();
		console.log('📦 [callAmaliaAPI] Response data:', data);

		if (data.response) {
			// *** CRITICAL: Handle both array and string responses ***
			if (Array.isArray(data.response)) {
				// Handle chat history array
				console.log('📚 [callAmaliaAPI] Processing chat history array...');
				console.log('📚 [callAmaliaAPI] Array length:', data.response.length);
				
				for (const messageObj of data.response) {
					const { message, role } = messageObj;
					console.log(`💬 Injecting message - Role: ${role}, Message: ${message.substring(0, 50)}...`);
					
					// Parse HTML if enabled and message contains HTML tags
					const messageContent = (enableHTMLParsing && typeof message === 'string' && containsHTML(message))
						? parseHTMLToReact(message)
						: message;
					
					switch (role) {
					case "user":
						await params.injectMessage(messageContent, "user");
						break;
					case "assistant":
						await params.injectMessage(messageContent);
						break;
					default:
						console.warn(`⚠️ [callAmaliaAPI] Unexpected role ${role}`, messageObj);
					}
				}
			} else {
				// Handle single message (string)
				console.log('💬 [callAmaliaAPI] Processing single message...');
				
				// Parse HTML if enabled and message contains HTML tags
				const messageContent = (enableHTMLParsing && typeof data.response === 'string' 
					&& containsHTML(data.response))
					? parseHTMLToReact(data.response)
					: data.response;
				
				await params.injectMessage(messageContent);
			}
			console.log('✅ [callAmaliaAPI] API call completed successfully');
			return true;
		} else {
			throw new Error("Response did not include a reply field");
		}
	} catch (error) {
		console.error('❌ [callAmaliaAPI] Error:', error);
		await params.injectMessage("Unable to connect to the chat service. Please try again.");
		console.log('❌ [callAmaliaAPI] API call failed');
		return false;
	}
};

/**
 * Fetches chat history or sends initial greeting
 * @param params - Parameters object from react-chatbotify
 * @param currentPath - Current URL path
 * @param onboardingThreadID - Thread ID for onboarding
 * @param sessionId - Session ID for tracking user sessions
 * @param hasInjectedRef - Ref to track if initial messages were injected
 * @param enableHTMLParsing - Whether to parse HTML in messages (default: false)
 * @returns Promise<void>
 */
export const getChatHistory = async (
	params: Params,
	currentPath: string,
	onboardingThreadID: string | null,
	sessionId: string,
	hasInjectedRef: React.MutableRefObject<boolean>,
	enableHTMLParsing: boolean = false
): Promise<void> => {
	console.log('📜 [getChatHistory] Starting to fetch chat history...');
	console.log('📜 [getChatHistory] Current path:', currentPath);
	console.log('📜 [getChatHistory] Session ID:', sessionId);
	console.log('🔗 [getChatHistory] onboardingThreadID:', onboardingThreadID);
	console.log('📜 [getChatHistory] Has injected:', hasInjectedRef.current);

	// Prevent duplicate injection
	if (hasInjectedRef.current) {
		console.log('⏭️ [getChatHistory] Messages already injected, skipping...');
		return;
	}

	// Special handling for designer path
	if (currentPath === SPECIAL_PATHS.DESIGNER) {
		console.log('🎨 [getChatHistory] Designer path detected - using hardcoded messages');
		await params.injectMessage("Welcome!");
		await params.injectMessage("Hello AI!", "user");
		hasInjectedRef.current = true;
	} else {
		// For all other paths, fetch history from backend
		console.log('🌐 [getChatHistory] Fetching history from backend...');
		
		// Set special greeting message to trigger history retrieval
		params.userInput = GREETING_MESSAGE;
		params.onboardingThreadID = onboardingThreadID;
		
		// Call API to get history
		await callAmaliaAPI(params, sessionId, currentPath, enableHTMLParsing);
		
		// Mark as injected
		hasInjectedRef.current = true;
	}
	
	console.log('✅ [getChatHistory] Chat history fetch completed');
};
