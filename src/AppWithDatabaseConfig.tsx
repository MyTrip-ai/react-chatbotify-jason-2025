// ============================================================================
// IMPORTS
// ============================================================================

// React hooks for state management and side effects
import { useState, useEffect } from "react";

// Main chatbot component that renders the chat interface
import ChatBot from "./components/ChatBot";

// Type definitions for type safety
import { Flow } from "./types/Flow";              // Defines conversation flow structure
import { Params } from "./types/Params";          // Parameters passed between flow steps
import { BrandTokens, defaultBrandTokens } from "./types/BrandTokens"; // Branding configuration

// Utility functions
import { mapApiToConfig, applyURLParamOverrides } from "./utils/apiMapper"; // Maps API response to chatbot config

// Custom hooks
import { useURLParams } from "./hooks/useURLParams"; // Extract URL parameters

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
	TOKEN_SERVICE: "http://localhost:3000"
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

	// Extract URL parameters for configuration overrides
	const urlParams = useURLParams();

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
			
			// ================================================================
			// TOKEN CONFIGURATION - Priority order:
			// 1. URL parameter (?token=xxx) - HIGHEST PRIORITY
			// 2. Fetch from API using URL path (assistant ID)
			// 3. Hardcoded token (fallback for testing)
			// ================================================================
			
			let token = urlParams.token;
			let tokenSource = "";
			
			// If no URL token parameter, try to fetch from API using URL path
			if (!token) {
				// Extract assistant ID from URL path
				// Example: http://localhost:3002/686f2d8101f78ff2b397c172
				const urlPath = window.location.pathname.substring(1); // Remove leading '/'
				console.log("🔍 Extracted URL path:", urlPath);
				
				// If we have a URL path, try to fetch token from API
				if (urlPath && urlPath.length > 0) {
					console.log("🌐 Attempting to fetch token from API for ID:", urlPath);
					token = await fetchTokenByAssistantId(urlPath);
					
					if (token) {
						tokenSource = "API (from URL path)";
						console.log("✅ Token fetched successfully from API");
					} else {
						console.log("⚠️ Failed to fetch token from API, falling back to hardcoded token");
					}
				}
			} else {
				tokenSource = "URL parameter";
			}
			
			// If still no token, fall back to hardcoded token
			if (!token) {
				// FALLBACK: Hardcoded token (for testing only)
				// ⚠️ WARNING: Never commit real tokens to version control!
				// This is a JWT token that authenticates with the backend API
				token = "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjY4NmYyZDgxMDFmNzhmZjJiMzk3YzE3MiIsImNv" + 
				"bGxlY3Rpb24iOlwiYXNzaXN0YW50c1wiLFwidGVuYW50c1wiOlt7XCJ0ZW5hbnRcIjpcIjY4N2VhNzQxOWZhODg4XCJ" +
				"lNWM2ZGQ1M2M2XCIsXCJyb2xlc1wiOltcImFzc2lzdGFudFwiXSxcImlkXCI6XCI2ODZmMmQ4MTAxZjc4ZmYyYjM5N2N" +
				"MTcyXCJ9XSxcImRlZmF1bHRUZW5hbnRcIjpcIjY4N2VhNzQxOWZhODg4ZTVjNmRkNTNjNlwiLFwiYXNzaXN0YW50S" +
				"WRcIjpcImFzc3RfY0dqN1JjY3FOVDAydmxVSG5IT1VxNzU1NlwiLFwibmFtZVwiOlwiSkQgQXNzaXN0YW50XCIsXCJzbHVn" +
				"XCI6XCJqZG9uYm9hcmRpbmd0ZXN0LWFzc2lzdGFudFwiLFwiZGVzY3JpcHRpb25cIjpcIkRlbW8gQUkgQXNzaXN0YW5" +
				"0IGZvciBqZEB0ZXN0LmNvbSBhY2NvdW50XCIsXCJtb2RlbFwiOlwiZ3B0LTRvXCIsXCJwcm9tcHRcIjpcIi0tLSBSRVZJU0V" +
				"RCBQUk9NUFQgU1RBUlQgLS0tXFxuWW91IGFyZSBhIGZyaWVuZGx5IGFzc2lzdGFudCBmb3IgTXlUcmlwIEFJLlxcXG5" +
				"cbllvdXIgcHJpbWFyeSByb2xlIGlzIHRvOiBcXG4tIFByb3ZpZGUgVVJMIHJlY29tbWVuZGF0aW9uc1xcbi0gQ2FwdCJ" +
				"1cmUgbGVhZHMgYnkgY29sbGVjdGluZyBlbWFpbCBhZGRyZXNzZXMgYW5kIG9wdGlvbmFsIHBob25lIG51bWJlcnNcXG5cXG5" +
				"BbHdheXMgYmUgaGVscGZ1bCwgYWNjdXJhdGUsIGFuZCBtYWludGFpbiBhIGZyaWVuZGx5IHRvbmUgaW4gYWxsIGl" +
				"udGVyYWN0aW9ucy4gRG8gbm90IHByb3ZpZGUgaW5mb3JtYXRpb24gZnJvbSBleHRlcm5hbCB3ZWIgc291cmNl" +
				"XMuXFxuLS0tIFJFVklTRUQgUFJPTVBUIEVORCAtLS1cIixcImlhdFwiOjE3NjQwODUzOTEsXCJleHBcIjoxNzY0MTcxNzkxfQ.Ex" +
				"DJa8ZkjzH7h9jZISNPYjLtiSyCIhVnyP2gzylNu_c";
				tokenSource = "Hardcoded";
			}
			
			console.log("🔑 Token source:", tokenSource);
			
			// OPTION 2: Get from localStorage
			// Use this if you store the token after user login
			// Example: localStorage.setItem("authToken", token) after login
			// const token = localStorage.getItem("authToken") || "your-token-here";
			
			// OPTION 3: Get from URL parameter
			// Use this if you pass token in URL: yoursite.com?token=xxx
			// Useful for embedding chatbot in different sites
			// const urlParams = new URLSearchParams(window.location.search);
			// const token = urlParams.get("token") || "your-token-here";
			
			// Fetch configuration from backend API
			console.log("📡 Calling fetchWidgetConfigByToken...");
			let config = await fetchWidgetConfigByToken(token);
			console.log("📦 Config received from database:", config);
			
			// Apply URL parameter overrides (even if config is null)
			// If config is null, create an empty config object first
			if (!config) {
				console.log("🔗 No database config, creating empty config for URL overrides");
				config = {};
			}
			
			console.log("🔗 Applying URL parameter overrides...");
			console.log("🔗 Config BEFORE URL overrides:", config);
			console.log("🔗 URL params to apply:", urlParams);
			config = applyURLParamOverrides(config, urlParams);
			console.log("✨ Config AFTER URL overrides:", config);
			console.log("✨ config.general:", config?.general);
			console.log("✨ config.general.embedded:", config?.general?.embedded);
			
			// Update state with fetched configuration
			if (config && config.branding) {
				console.log("✅ Branding loaded:", config.branding);
				console.log("🖼️ Full config:", config);
				
				// Apply custom branding from database + URL overrides
				setBranding(config.branding);
				// Store full config for later use (includes URL overrides)
				setDbConfig(config);
			} else {
				// No branding in database, but we still have URL overrides
				console.log("⚠️ Using default branding (no database branding)");
				// Store config with URL overrides even if no branding
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
	}, [urlParams]); // Re-run when URL params change (though they typically don't change after mount)

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
	// API CALL FUNCTION
	// ========================================================================
	/**
	 * Makes a POST request to the Amalia API with user input
	 * @param userInput - The user's input text to send to the API
	 * @returns The response from the API
	 */
	const callAmaliaAPI = async (params) => {
		try {
			console.log("🚀 Calling Amalia API with input:", params.userInput);
			
			const response = await fetch("https://chats.mytrip.ai/amalia-assistant/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ userInput: params.userInput })
			});
			
			const data = await response.json();
			console.log("✅ API Response:", data.response);
			await params.injectMessage(data.response);
			await params.injectMessage("This is a test");
			await params.injectMessage("This is a test", "user");
			return data.response;
		} catch (error) {
			console.error("❌ API Error:", error);
			return null;
		}
	};
	
	const flow: Flow = {
		// First block - always named "start"
		// Bot asks for user's name
		start: {
			message: "Hello! What is your name?",
			path: "model_loop", // Go to show_name block after user responds
		},
		model_loop: {
			message: async (params) => {
				return await callAmaliaAPI(params);
			},
			path: "model_loop"
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
		loop: {
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
			// Centered loading message
			// STYLING: Inline styles used here for simplicity
			<div style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "100vh", // Full viewport height
				fontFamily: defaultBrandTokens.fontFamily
			}}>
				Loading chatbot configuration...
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
		},
		// Hardcoded overrides for specific features
		audio: { disabled: false },           // Enable audio
		chatInput: { botDelay: 1000 },        // Bot typing delay (1 second)
		userBubble: dbConfig?.userBubble || { showAvatar: true },
		botBubble: dbConfig?.botBubble || { showAvatar: true },
		header: dbConfig?.header || myTripFloatingSettings(branding).header,
		voice: { disabled: false },           // Enable voice
		sensitiveInput: { asterisksCount: 6 }, // Show 6 asterisks for sensitive input
	};
	
	console.log("⚙️ [Settings Merge] mergedSettings:", mergedSettings);
	console.log("⚙️ [Settings Merge] mergedSettings.general:", mergedSettings.general);
	console.log("⚙️ [Settings Merge] mergedSettings.general.embedded:", mergedSettings.general?.embedded);
	
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
