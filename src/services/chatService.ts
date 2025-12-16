/**
 * Chat Service
 * Handles chat history retrieval and API communication
 * 
 * Phase D: Also handles [HUMAN_MODE] responses for operator handoff
 */

import { API_ENDPOINTS, SPECIAL_PATHS, DEFAULT_PATH, GREETING_MESSAGE, ASSISTANT_ID } from "../config/constants";
import { Params } from "../types/Params";
import { parseHTMLToReact, containsHTML } from "../utils/htmlParser";
import { handoffService } from "./HandoffService";

// Persist the latest thread ID returned by the server so subsequent
// /chat requests continue the same thread (required for room alignment).
let persistedThreadId: string | null = null;

// Detect dev mode for debug info in error messages
const IS_DEV_MODE = import.meta.env.VITE_DEV_MODE === "true" ||
	import.meta.env.DEV ||
	window.location.hostname === "localhost";

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
 * Constructs the chat API URL using assistant_id as the route
 * Endpoint format: POST /{assistant_id}/chat
 * @returns Complete API URL
 */
const getChatApiUrl = (): string => {
	return `${API_ENDPOINTS.CHAT_BASE}/${ASSISTANT_ID}/chat`;
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
	const startTime = performance.now();

	console.log('🚀 [callAmaliaAPI] Starting API call...');
	console.log('🚀 [callAmaliaAPI] User input:', params.userInput);
	console.log('🔗 [callAmaliaAPI] onboardingThreadID:', params.onboardingThreadID);

	const effectivePath = getEffectivePath(currentPath);
	const url = getChatApiUrl();
	const clientIdWithPath = `${sessionId || 'unknown_user_chatbotify'}-${effectivePath}`;

	console.log('🔑 [callAmaliaAPI] Using client_id:', clientIdWithPath);
	console.log('📡 [callAmaliaAPI] API URL:', url);
	// Only include thread_id after the server issues it; omit on the very first message
	const outboundThreadId = params.onboardingThreadID || persistedThreadId || undefined;
	const requestBody: Record<string, unknown> = {
		message: params.userInput,
		client_id: clientIdWithPath,
		tenant_id: ASSISTANT_ID,
	};

	if (params.onboardingThreadID) {
		requestBody.onboarding_thread_id = params.onboardingThreadID;
	}
	if (outboundThreadId) {
		requestBody.thread_id = outboundThreadId;
	}

	console.log('📡 [callAmaliaAPI] Outbound thread_id:', outboundThreadId);
	console.log('📡 [callAmaliaAPI] Request body:', JSON.stringify(requestBody, null, 2));

	try {
		// Make API request with timeout
		const controller = new AbortController();
		// 30s timeout (increased due to slow OpenAI responses)
		const timeoutId = setTimeout(() => controller.abort(), 30000);

		console.log('⏱️ [callAmaliaAPI] Sending request at:', new Date().toISOString());
		const fetchStartTime = performance.now();

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(requestBody),
			signal: controller.signal,
		});

		clearTimeout(timeoutId);
		const fetchEndTime = performance.now();
		const fetchDuration = ((fetchEndTime - fetchStartTime) / 1000).toFixed(2);

		console.log(`⏱️ [callAmaliaAPI] Response received in ${fetchDuration}s`);
		console.log('📥 [callAmaliaAPI] Response status:', response.status, response.statusText);
		console.log('📥 [callAmaliaAPI] Response headers:', {
			contentType: response.headers.get('content-type'),
			contentLength: response.headers.get('content-length'),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('❌ [callAmaliaAPI] Server returned error:', errorText);
			throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
		}

		const data = await response.json();
		console.log('📦 [callAmaliaAPI] Response data:', data);

		const totalTime = ((performance.now() - startTime) / 1000).toFixed(2);
		console.log(`✅ [callAmaliaAPI] Total processing time: ${totalTime}s`);

		// Phase D: Connect handoff service if we have a thread_id
		if (data.thread_id) {
			console.log("🔗 [callAmaliaAPI] Thread ID received:", data.thread_id);
			// Store thread ID and connect to handoff service for operator messages
			persistedThreadId = data.thread_id;

			if (!handoffService.isConnected() || handoffService.getThreadId() !== data.thread_id) {
				handoffService.connect(data.thread_id);
			}

			// ✅ API FALLBACK: Apply mode from REST response (before socket events arrive)
			// This handles: page reload mid-conversation, missed socket events, initial state
			if (data.mode && (data.mode === 'human' || data.mode === 'handoff_pending')) {
				console.log(`🔄 [callAmaliaAPI] API says mode is '${data.mode}' - applying fallback`);
				handoffService.applyModeFromApi({
					mode: data.mode,
					mode_version: data.mode_version || 0,
					operator_id: data.operator_id,
					operator_name: data.operator_name,
				});
			}
		}

		// ✅ FIX: Handle human mode - empty response is valid when mode is 'human'
		if (data.mode === 'human' && (data.response === '' || data.response === null || data.response === undefined)) {
			console.log("🤝 [callAmaliaAPI] Human mode - no AI response, waiting for operator");
			return true;  // Success - operator will respond via WebSocket
		}

		if (data.response) {
			// *** CRITICAL: Handle both array and string responses ***
			if (Array.isArray(data.response)) {
				// Handle chat history array
				console.log("📚 [callAmaliaAPI] Processing chat history array...");
				console.log("📚 [callAmaliaAPI] Array length:", data.response.length);
				
				for (const messageObj of data.response) {
					const { message, role } = messageObj;
					console.log(`💬 Injecting message - Role: ${role}, Message: ${message.substring(0, 50)}...`);
					
					// Parse HTML if enabled and message contains HTML tags
					const messageContent = (enableHTMLParsing && typeof message === "string" && containsHTML(message))
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
			} else if (data.response === "[HUMAN_MODE]") {
				// Phase D: Human mode - operator will respond via WebSocket
				console.log("🤝 [callAmaliaAPI] HUMAN_MODE detected - waiting for operator response");
				await params.injectMessage("Connecting you with a travel specialist...");
			} else {
				// Handle single message (string)
				console.log("💬 [callAmaliaAPI] Processing single message...");
				
				// Parse HTML if enabled and message contains HTML tags
				const messageContent = (enableHTMLParsing && typeof data.response === "string" 
					&& containsHTML(data.response))
					? parseHTMLToReact(data.response)
					: data.response;
				
				await params.injectMessage(messageContent);
			}
			console.log("✅ [callAmaliaAPI] API call completed successfully");
			return true;
		} else {
			throw new Error("Response did not include a reply field");
		}
	} catch (error) {
		const totalTime = ((performance.now() - startTime) / 1000).toFixed(2);
		console.error('❌ [callAmaliaAPI] Error after', totalTime + 's:', error);

		let userMessage = "Looks like we're unavailable right now, please try again in a moment.";
		let debugInfo = '';

		// Determine specific error type for better debugging
		if (error instanceof Error) {
			console.error('❌ [callAmaliaAPI] Error name:', error.name);
			console.error('❌ [callAmaliaAPI] Error message:', error.message);
			console.error('❌ [callAmaliaAPI] Error stack:', error.stack);

			if (error.name === 'AbortError') {
				// Request timeout
				console.error('❌ [callAmaliaAPI] REQUEST TIMEOUT - Server took longer than 30 seconds to respond');
				debugInfo = `[Timeout after ${totalTime}s]`;
				userMessage = "The request is taking longer than expected. Please try again.";
			} else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
				// Network error (CORS, connection refused, etc.)
				console.error('❌ [callAmaliaAPI] NETWORK ERROR - Could not connect to server');
				console.error('❌ [callAmaliaAPI] Check if:');
				console.error('   1. Flask server is running on', url);
				console.error('   2. CORS is properly configured');
				console.error('   3. Network connection is stable');
				debugInfo = '[Network Error]';
				userMessage = "Unable to connect to the chat service. Please check your connection.";
			} else if (error.message.includes('HTTP')) {
				// HTTP error (4xx, 5xx)
				console.error('❌ [callAmaliaAPI] HTTP ERROR - Server returned an error response');
				debugInfo = `[${error.message}]`;
				userMessage = "The server encountered an error. Please try again.";
			} else {
				// Unknown error
				console.error('❌ [callAmaliaAPI] UNKNOWN ERROR');
				debugInfo = `[${error.message}]`;
			}
		} else {
			console.error('❌ [callAmaliaAPI] NON-ERROR OBJECT THROWN:', error);
		}

		console.error('❌ [callAmaliaAPI] API Configuration:');
		console.error('   - URL:', url);
		console.error('   - Assistant ID:', ASSISTANT_ID);
		console.error('   - Client ID:', clientIdWithPath);
		console.error('   - Is Dev Mode:', IS_DEV_MODE);

		// Inject user-friendly error message
		await params.injectMessage(userMessage + (IS_DEV_MODE ? ` ${debugInfo}` : ''));
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
