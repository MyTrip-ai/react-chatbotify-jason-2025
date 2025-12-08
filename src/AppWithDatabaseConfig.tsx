// ============================================================================
// IMPORTS
// ============================================================================

// React hooks for state management and side effects
import { useState, useEffect, useRef } from "react";

// Main chatbot component that renders the chat interface
import ChatBot from "./components/ChatBot";

// Type definitions for type safety
import { Flow } from "./types/Flow";              // Defines conversation flow structure
import { Params } from "./types/Params";          // Parameters passed between flow steps
import { BrandTokens, defaultBrandTokens } from "./types/BrandTokens"; // Branding configuration

// Utility functions
import { mapApiToConfig, applyURLParamOverrides } from "./utils/apiMapper"; // Maps API response to chatbot config
import { mapStaticConfigToAppConfig } from "./utils/staticConfigMapper"; // Maps static config to app format

// Custom hooks
import { useURLParams } from "./hooks/useURLParams"; // Extract URL parameters
import { useSessionManager } from "./hooks/useSessionManager"; // Session ID management
import { useStaticConfig, useCurrentPath } from "./hooks/useStaticConfig"; // Static configuration
import { useParentMessaging } from "./hooks/useParentMessaging"; // Parent window messaging

// Chat service functions
import { getChatHistory, callAmaliaAPI } from "./services/chatService";

// Theme configuration (settings = behavior, styles = appearance)
import { myTripFloatingSettings, myTripFloatingStyles, myTripEmbeddedStyles } from "./themes/myTripTheme";

// ============================================================================
// API CONFIGURATION
// ============================================================================

/**
 * API endpoint configuration
 * Uses environment variable VITE_API_URL if available, otherwise defaults to localhost
 * Set VITE_API_URL in your .env file for production
 */
const API_ENDPOINTS = {
	EXPRESS_MIDDLEWARE: import.meta.env.VITE_API_URL || "http://localhost:3001",
	TOKEN_SERVICE: import.meta.env.VITE_TOKEN_SERVICE_URL || "http://localhost:3000"
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Fetches authentication token from the token service using assistant ID.
 * This function retrieves a JWT token needed to authenticate with the widget config API.
 * 
 * @param assistantId - The assistant ID from the URL path
 * @returns JWT token string, or null if fetch fails
 * 
 * API Request:
 * POST http://localhost:3000/api/assistants/token-by-id/
 * Body: { "id": "686f2d8101f78ff2b397c172" }
 * 
 * API Response:
 * { "token": "eyJhbGciOiJIUzI1NiJ9..." }
 */
const fetchTokenByAssistantId = async (assistantId: string): Promise<string | null> => {
	console.log("🔐 fetchTokenByAssistantId called with ID:", assistantId);
	
	try {
		const url = `${API_ENDPOINTS.TOKEN_SERVICE}/api/assistants/token-by-id`;
		console.log("📤 Fetching token from:", url);
		
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ id: assistantId }),
		});
		
		console.log("📥 Token API response status:", response.status, response.statusText);
		
		if (!response.ok) {
			console.error("❌ Failed to fetch token, status:", response.status);
			return null;
		}
		
		const data = await response.json();
		console.log("✅ Token received successfully");
		
		if (data.token) {
			console.log("🔑 Token (first 50 chars):", data.token.substring(0, 50) + "...");
			return data.token;
		}
		
		console.error("❌ No token in response data");
		return null;
	} catch (error) {
		console.error("❌ Error fetching token:", error);
		return null;
	}
};

/**
 * Fetches widget configuration from the database using the provided token.
 * This function retrieves chatbot branding, settings, and configuration from the backend.
 * 
 * @param token - JWT authorization token for authentication
 * @returns Widget configuration object with branding tokens, or null if fetch fails
 * 
 * API Response Structure:
 * {
 *   docs: [{
 *     branding: { colors, fonts, etc. },
 *     settings: { behavior configurations },
 *     ...
 *   }]
 * }
 */
const fetchWidgetConfigByToken = async (token: string) => {
	console.log("🌐 fetchWidgetConfigByToken called");
	console.log("🔗 API URL:", `${API_ENDPOINTS.EXPRESS_MIDDLEWARE}/api/chatwidgets`);
	console.log("🔑 Token (first 50 chars):", token.substring(0, 50) + "...");
	
	try {
		console.log("📤 Sending fetch request...");
		
		// Make authenticated request to backend API
		// Authorization header contains JWT token for user authentication
		const response = await fetch(`${API_ENDPOINTS.EXPRESS_MIDDLEWARE}/api/chatwidgets`, {
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`,
			},
		});

		console.log("📥 Response status:", response.status, response.statusText);

		// Check if request was successful (status 200-299)
		if (!response.ok) {
			throw new Error(`Error fetching chat widgets: ${response.statusText}`);
		}

		// Parse JSON response from API
		const data = await response.json();
		console.log("📊 Raw data received:", data);
		
		// Extract first widget configuration from response
		// API returns array of docs, we use the first one
		if (data.docs && data.docs.length > 0) {
			console.log(`👀 Data received: ${JSON.stringify(data.docs[0])}`);
			
			// Transform API response format to internal config format
			const config = mapApiToConfig(data.docs[0]);
			console.log("🔄 Mapped config:", config);
			return config;
		}
		
		console.log("⚠️ No docs found in response");
		return null;
	} catch (error) {
		console.error("❌ Failed to fetch widget config:", error);
		return null;
	}
};

// ============================================================================
// MAIN APPLICATION COMPONENT
// ============================================================================

/**
 * AppWithDatabaseConfig - Main application component
 * 
 * This component:
 * 1. Fetches chatbot configuration from database on mount
 * 2. Displays loading screen while fetching
 * 3. Renders ChatBot with database-driven branding and settings
 * 4. Manages conversation flow and user interactions
 * 
 * State Management:
 * - name: User's name collected during conversation
 * - branding: Visual branding (colors, fonts) from database or defaults
 * - dbConfig: Full configuration object from database
 * - configLoaded: Flag to show loading screen until config is ready
 */
function AppWithDatabaseConfig() {
	// User's name collected during the chat flow
	const [name, setName] = useState("");
	
	// Branding configuration (colors, fonts, etc.) - starts with defaults
	const [branding, setBranding] = useState<BrandTokens>(defaultBrandTokens);
	
	// Full database configuration (includes settings, branding, etc.)
	const [dbConfig, setDbConfig] = useState<any>(null);
	
	// Loading flag - prevents rendering until config is fetched
	const [configLoaded, setConfigLoaded] = useState(false);
	
	// Error state for flow management
	const [hasError, setHasError] = useState(false);
	
	// Ref to track if initial messages have been injected
	const hasInjectedInitialMessages = useRef(false);

	// Extract URL parameters for configuration overrides
	const urlParams = useURLParams();
	
	// Get or create session ID for tracking user sessions
	const sessionId = useSessionManager();
	
	// Get static configuration based on URL path
	const staticConfig = useStaticConfig();
	
	// Get current URL path
	const currentPath = useCurrentPath();
	
	// Get onboarding thread ID from parent window
	const { onboardingThreadID } = useParentMessaging();

	console.log("🚀 AppWithDatabaseConfig component mounted");
	console.log("📊 Initial state - configLoaded:", configLoaded);
	console.log("🔗 URL Parameters:", urlParams);

	// ========================================================================
	// CONFIGURATION LOADING
	// ========================================================================
	
	/**
	 * useEffect hook runs once on component mount (empty dependency array [])
	 * Fetches chatbot configuration from database and updates state
	 */
	useEffect(() => {
		const loadConfig = async () => {
			console.log("🔄 Starting loadConfig...");
			console.log("🗺️ Static config available:", !!staticConfig);
			console.log("📍 Current path:", currentPath);
			
			// ================================================================
			// CONFIGURATION PRIORITY ORDER (as per documentation):
			// 1. Default Config (fallback)
			// 2. Static Path Config (if path matches chatbotConfig)
			// 3. Database Config (if token available)
			// 4. URL Parameters (override specific properties)
			// ================================================================
			
			let config: any = null;
			let configSource = "";
			
			// ================================================================
			// STEP 1: Check for Static Configuration
			// If we have a static config for this path, use it as base
			// ================================================================
			if (staticConfig) {
				console.log("✅ Using static configuration for path:", currentPath);
				config = mapStaticConfigToAppConfig(staticConfig);
				configSource = `Static config (${currentPath})`;
			}
			
			// ================================================================
			// STEP 2: Try to fetch Database Configuration
			// Only attempt if we have a token OR can fetch one
			// Database config overrides static config if available
			// ================================================================
			let token = urlParams.token;
			let tokenSource = "";
			
			// If no URL token parameter, try to fetch from API using URL path
			// Only try if path looks like an ID (not a static config path)
			if (!token && !staticConfig && currentPath) {
				console.log("🌐 Attempting to fetch token from API for ID:", currentPath);
				const fetchedToken = await fetchTokenByAssistantId(currentPath);
				
				if (fetchedToken) {
					token = fetchedToken;
					tokenSource = "API (from URL path)";
					console.log("✅ Token fetched successfully from API");
				} else {
					console.log("⚠️ Failed to fetch token from API");
				}
			} else if (token) {
				tokenSource = "URL parameter";
			}
			
			// If we have a token, fetch database config (overrides static config)
			if (token) {
				console.log("🔑 Token source:", tokenSource);
				console.log("📡 Calling fetchWidgetConfigByToken...");
				const dbConfig = await fetchWidgetConfigByToken(token);
				console.log("📦 Config received from database:", dbConfig);
				
				if (dbConfig) {
					// Database config overrides static config
					config = dbConfig;
					configSource = `Database config (${tokenSource})`;
					console.log("✅ Using database config (overrides static config)");
				}
			}
			
			// ================================================================
			// STEP 3: Apply URL Parameter Overrides
			// URL params override specific properties regardless of source
			// ================================================================
			if (!config) {
				console.log("🔗 No config available, creating empty config for URL overrides");
				config = {};
			}
			
			console.log("🔗 Applying URL parameter overrides...");
			console.log("🔗 Config BEFORE URL overrides:", config);
			console.log("🔗 URL params to apply:", urlParams);
			config = applyURLParamOverrides(config, urlParams);
			console.log("✨ Config AFTER URL overrides:", config);
			console.log("✨ Config AFTER - header:", config?.header);
			console.log("✨ Config AFTER - header.fontFamily:", config?.header?.fontFamily);
			console.log("✨ Final config source:", configSource || "URL params only");
			
			// ================================================================
			// STEP 4: Update State
			// ================================================================
			if (config && config.branding) {
				console.log("✅ Branding loaded:", config.branding);
				setBranding(config.branding);
				setDbConfig(config);
			} else {
				console.log("⚠️ Using default branding (no branding in config)");
				setDbConfig(config);
			}
			
			// Mark configuration as loaded to stop showing loading screen
			console.log("✔️ Setting configLoaded to true");
			setConfigLoaded(true);
		};

		// Execute loadConfig and handle any errors
		loadConfig().catch(error => {
			console.error("❌ Error in loadConfig:", error);
			// Still mark as loaded to show widget with default settings
			// Better to show default chatbot than nothing at all
			setConfigLoaded(true);
		});
	}, [urlParams, staticConfig, currentPath]); // Re-run when URL params, static config, or path changes

	// ========================================================================
	// CONVERSATION FLOW DEFINITION
	// ========================================================================
	
	/**
	 * Flow object defines the conversation structure
	 * Each key is a "block" (step) in the conversation
	 * Each block can have:
	 * - message: What the bot says (string or function)
	 * - path: Next block to go to (string or function)
	 * - function: Code to run when this block executes
	 * - options: Buttons for user to click
	 * - chatDisabled: Whether to disable text input
	 * - isSensitive: Whether to hide user input (for passwords, etc.)
	 * - transition: Animation settings
	 */
	
	// ========================================================================
	// HELPER FUNCTIONS
	// ========================================================================
	
	/**
	 * Gets the current URL path
	 * @returns Current path string
	 */
	const getCurrentPath = (): string => {
		return window.location.pathname || '/';
	};
	
	const flow: Flow = {
		// ====================================================================
		// START BLOCK - Fetches chat history on initial load
		// ====================================================================
		start: {
			message: async (params: Params) => {
				console.log('🎬 [Flow] Entering start block - fetching chat history...');
				
				// Check if HTML parsing is enabled
				const enableHTMLParsing = dbConfig?.botBubble?.dangerouslySetInnerHtml ?? false;
				
				// Fetch and inject chat history
				await getChatHistory(
					params,
					getCurrentPath(),
					onboardingThreadID || null,
					sessionId,
					hasInjectedInitialMessages,
					enableHTMLParsing
				);
				
				console.log('✅ [Flow] Chat history loaded, transitioning to loop...');
			},
			path: () => {
				// Reset error state and move to conversation loop
				setHasError(false);
				return "loop";
			},
		},
		
		// ====================================================================
		// LOOP BLOCK - Handles ongoing conversation
		// ====================================================================
		loop: {
			message: async (params: Params) => {
				console.log('🔄 [Flow] In loop block - processing user message...');
				
				// Check if HTML parsing is enabled
				const enableHTMLParsing = dbConfig?.botBubble?.dangerouslySetInnerHtml ?? false;
				
				// Call API with user's message
				const success = await callAmaliaAPI(
					params,
					sessionId,
					getCurrentPath(),
					enableHTMLParsing
				);
				
				// Update error state based on API response
				setHasError(!success);
			},
			path: () => {
				// If error occurred, retry from start
				if (hasError) {
					console.log('⚠️ [Flow] Error detected, returning to start...');
					return "start";
				}
				// Otherwise, stay in loop for continued conversation
				console.log('✅ [Flow] Staying in loop...');
				return "loop";
			}
		},

		// Second block - greets user by name
		show_name: {
			// Dynamic message using user's input from previous block
			message: (params: Params) => `Hey ${params.userInput}! Nice to meet you.`,
			// Save user's name to state for later use
			function: (params: Params) => setName(params.userInput),
			// Disable chat input (bot is "thinking")
			chatDisabled: true,
			// Wait 1 second before moving to next block
			transition: { duration: 1000 },
			path: "ask_token",
		},
		// Third block - asks for 6-digit profile ID
		ask_token: {
			message: () => "Before we proceed, we need to verify your profile id, " +
				"Enter your 6 digit profile id",
			// isSensitive = true hides user input with asterisks (like password field)
			isSensitive: true,
			// Dynamic path based on validation
			path: (params: Params) => {
				// Validate input length
				if (params.userInput.length !== 6) {
					return "incorrect_answer"; // Show error
				} else {
					return "ask_age_group"; // Continue to next step
				}
			},
		},
		// Fourth block - asks for age group with button options
		ask_age_group: {
			// Uses the 'name' variable from state (saved earlier)
			message: () => `Hey ${name}!, Your account got verified, May i know your age group?`,
			// Show buttons instead of text input
			options: ["child", "teen", "adult"],
			// Disable text input (user must click a button)
			chatDisabled: true,
			path: () => "ask_math_question",
		},
		// Fifth block - asks math question
		ask_math_question: {
			message: (params: Params) => {
				// Don't show message if coming from error block
				// (error block already shows the question)
				if (params.prevPath == "incorrect_answer") {
					return;
				}
				// Show question with user's age group
				return `I see you're a ${params.userInput}. Let's do a quick test! What is 1 + 1?`;
			},
			// Validate answer
			path: (params: Params) => {
				if (params.userInput != "2") {
					return "incorrect_answer"; // Wrong answer
				} else {
					return "end"; // Correct! Go to end
				}
			},
		},
		// Success block - conversation completed
		end: {
			message: "Great job! Thank you for chatting with me!",
			path: "loop" // Go to loop block
		},
		// Loop block - keeps conversation alive
		// Useful for showing final message or keeping chat open
		old_loop: {
			message: (params: Params) => {
				// Inject a message after 500ms delay
				// injectMessage() adds a bot message programmatically
				setTimeout(async () => {
					await params.injectMessage("You have reached the end of the conversation!");
				}, 500);
			},
			// Loop back to itself (conversation stays here)
			path: "loop"
		},
		// Error block - handles incorrect answers
		// This is a reusable error handler used by multiple blocks
		incorrect_answer: {
			message: "Your answer is incorrect, try again!",
			// No transition delay (show error immediately)
			transition: { duration: 0 },
			// Go back to the previous block to retry
			// params.prevPath contains the name of the block we came from
			path: (params: Params) => params.prevPath
		},
	};

	// ========================================================================
	// RENDER LOGIC
	// ========================================================================
	
	console.log("🎨 Render - configLoaded:", configLoaded);
	console.log("🎨 Render - branding:", branding);
	
	// Show loading screen while fetching configuration from database
	// This prevents rendering the chatbot with incomplete/missing data
	if (!configLoaded) {
		console.log("⏸️ Showing loading screen");
		return (
			<div style={{
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				height: "100vh",
				fontFamily: defaultBrandTokens.fontFamily,
				background: "#ffffff",
				color: "#333333"
			}}>
				<div style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: "20px"
				}}>
					{/* Animated spinner */}
					<div style={{
						width: "50px",
						height: "50px",
						border: "4px solid rgba(0, 0, 0, 0.1)",
						borderTop: "4px solid #667eea",
						borderRadius: "50%",
						animation: "spin 1s linear infinite"
					}} />
					<style>{`
						@keyframes spin {
							0% { transform: rotate(0deg); }
							100% { transform: rotate(360deg); }
						}
					`}</style>
					<div style={{
						fontSize: "18px",
						fontWeight: 300,
						letterSpacing: "0.5px"
					}}>
						Preparing your assistant...
					</div>
				</div>
			</div>
		);
	}

	console.log("🎉 Rendering ChatBot with branding:", branding);
	console.log("🎉 Rendering ChatBot with dbConfig:", dbConfig);
	
	// ========================================================================
	// SETTINGS CONFIGURATION
	// ========================================================================
	
	/**
	 * Merge database configuration with default theme settings
	 * Priority order (highest to lowest):
	 * 1. Hardcoded overrides (audio, voice, etc.)
	 * 2. Database config with URL parameter overrides (dbConfig)
	 * 3. Default theme settings (myTripFloatingSettings)
	 */
	console.log("⚙️ [Settings Merge] Starting settings merge...");
	console.log("⚙️ [Settings Merge] dbConfig:", dbConfig);
	console.log("⚙️ [Settings Merge] dbConfig.general:", dbConfig?.general);
	console.log("⚙️ [Settings Merge] dbConfig.general.embedded:", dbConfig?.general?.embedded);
	
	const mergedSettings = {
		...myTripFloatingSettings(branding),  // Start with theme defaults
		...(dbConfig || {}),                  // Override with database config (includes URL params)
		// Merge general settings to preserve embedded mode from URL/database
		general: {
			...myTripFloatingSettings(branding).general,
			...(dbConfig?.general || {}),     // Includes embedded from URL params
			flowStartTrigger: 'ON_LOAD',      // Start flow immediately when component mounts
		},
		// Hardcoded overrides for specific features
		audio: { disabled: false },           // Enable audio
		chatInput: {
			...(dbConfig?.chatInput || {}),
			botDelay: 1000,                   // Bot typing delay (1 second)
		},
		chatHistory: {
			...(dbConfig?.chatHistory || {}),
			disabled: true,                   // Disable local chat history (using backend history)
		},
		chatWindow: {
			...(dbConfig?.chatWindow || {}),
			defaultOpen: dbConfig?.chatWindow?.defaultOpen ?? true, // Default to open if not specified
		},
		userBubble: dbConfig?.userBubble || { showAvatar: true },
		botBubble: dbConfig?.botBubble || { showAvatar: true },
		// Preserve JSX elements in header (title can be JSX)
		header: dbConfig?.header ? {
			...myTripFloatingSettings(branding).header,
			...dbConfig.header,
		} : myTripFloatingSettings(branding).header,
		// Preserve JSX elements in footer (text can be JSX)
		footer: dbConfig?.footer ? {
			...myTripFloatingSettings(branding).footer,
			...dbConfig.footer,
		} : myTripFloatingSettings(branding).footer,
		voice: { disabled: false },           // Enable voice
		sensitiveInput: { asterisksCount: 6 }, // Show 6 asterisks for sensitive input
	};
	
	console.log("⚙️ [Settings Merge] mergedSettings:", mergedSettings);
	console.log("⚙️ [Settings Merge] mergedSettings.general:", mergedSettings.general);
	console.log("⚙️ [Settings Merge] mergedSettings.general.embedded:", mergedSettings.general?.embedded);
	console.log("⚙️ [Settings Merge] mergedSettings.chatWindow:", mergedSettings.chatWindow);
	console.log("⚙️ [Settings Merge] mergedSettings.chatWindow.defaultOpen:", mergedSettings.chatWindow?.defaultOpen);
	console.log("⚙️ [Settings Merge] mergedSettings.header:", mergedSettings.header);
	console.log("⚙️ [Settings Merge] mergedSettings.header.fontFamily:", mergedSettings.header?.fontFamily);
	
	// ========================================================================
	// STYLES CONFIGURATION
	// ========================================================================
	
	/**
	 * Select appropriate styles based on embedded mode
	 * - Embedded mode: Use embedded styles (no floating button, relative positioning)
	 * - Floating mode: Use floating styles (button in corner, fixed positioning)
	 */
	console.log("🎨 [Style Selection] Selecting styles...");
	console.log("🎨 [Style Selection] mergedSettings.general?.embedded:", mergedSettings.general?.embedded);
	
	let chatbotStyles = mergedSettings.general?.embedded
		? myTripEmbeddedStyles(branding)
		: myTripFloatingStyles(branding);
	
	console.log("🎨 [Style Selection] Using:", mergedSettings.general?.embedded ? "EMBEDDED styles" : "FLOATING styles");
	
	// Apply size overrides from URL parameters if present
	if (dbConfig?.chatWindowSize) {
		console.log("📏 [Size Override] Applying size overrides from URL params");
		console.log("📏 [Size Override] chatWindowSize:", dbConfig.chatWindowSize);
		
		chatbotStyles = {
			...chatbotStyles,
			chatWindowStyle: {
				...chatbotStyles.chatWindowStyle,
				...dbConfig.chatWindowSize, // Apply width, height, maxWidth, maxHeight
			},
		};
		
		console.log("📏 [Size Override] Updated chatWindowStyle:", chatbotStyles.chatWindowStyle);
	}
	
	// Apply header font family if specified
	if (dbConfig?.header?.fontFamily) {
		console.log("🔤 [Font Override] Applying header font family:", dbConfig.header.fontFamily);
		console.log("🔤 [Font Override] Current headerStyle BEFORE:", chatbotStyles.headerStyle);
		
		chatbotStyles = {
			...chatbotStyles,
			headerStyle: {
				...chatbotStyles.headerStyle,
				fontFamily: dbConfig.header.fontFamily,
			},
		};
		
		console.log("🔤 [Font Override] Updated headerStyle AFTER:", chatbotStyles.headerStyle);
	} else {
		console.log("⚠️ [Font Override] No fontFamily found in dbConfig.header");
		console.log("⚠️ [Font Override] dbConfig.header:", dbConfig?.header);
	}
	
	// ========================================================================
	// MAIN RENDER
	// ========================================================================
	
	// In embedded mode, render without wrapper divs to allow full-screen fill
	if (mergedSettings.general?.embedded) {
		return (
			<ChatBot
				id="chatbot-id"
				flow={flow}
				settings={mergedSettings}
				styles={chatbotStyles}
			/>
		);
	}
	
	// In floating mode, use centered layout with wrapper
	return (
		<div className="App">
			<header className="App-header">
				{/* Container for centering the chatbot */}
				{/* STYLING: Inline styles for layout positioning */}
				<div style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					marginTop: `calc(20vh)` // Position 20% from top of viewport
				}}>
					{/* 
					 * ChatBot Component
					 * - id: Unique identifier for this chatbot instance
					 * - flow: Conversation flow object (defined above)
					 * - settings: Behavior configuration (merged from multiple sources)
					 * - styles: Visual appearance (dynamically selected based on embedded mode)
					 * 
					 * STYLING: Styles are applied via the 'styles' prop
					 * The styles function returns an object that controls colors, fonts, sizes, animations, etc.
					 * Embedded mode uses myTripEmbeddedStyles, floating mode uses myTripFloatingStyles
					 */}
					<ChatBot
						id="chatbot-id"
						flow={flow}
						settings={mergedSettings}
						styles={chatbotStyles}
					/>
				</div>
			</header>
		</div>
	);
}

export default AppWithDatabaseConfig;
