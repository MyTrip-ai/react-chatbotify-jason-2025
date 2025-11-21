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
import { mapApiToConfig } from "./utils/apiMapper"; // Maps API response to chatbot config

// Theme configuration (settings = behavior, styles = appearance)
import { myTripFloatingSettings, myTripFloatingStyles } from "./themes/myTripTheme";

// ============================================================================
// API CONFIGURATION
// ============================================================================

/**
 * API endpoint configuration
 * Uses environment variable VITE_API_URL if available, otherwise defaults to localhost
 * Set VITE_API_URL in your .env file for production
 */
const API_ENDPOINTS = {
	EXPRESS_MIDDLEWARE: import.meta.env.VITE_API_URL || "http://localhost:3001"
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

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

	console.log("🚀 AppWithDatabaseConfig component mounted");
	console.log("📊 Initial state - configLoaded:", configLoaded);

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
			// TOKEN CONFIGURATION - Choose one option below
			// ================================================================
			
			// OPTION 1: Hardcoded token (CURRENT - for testing only)
			// ⚠️ WARNING: Never commit real tokens to version control!
			// This is a JWT token that authenticates with the backend API
			const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZjUxMzg2MmVjNDU0NjAwMWNiYWQ0" + 
			"YiIsImNvbGxlY3Rpb24iOiJ1c2VycyIsImVtYWlsIjoiamRAdGVzdC5jb20iLCJzaWQiOiJhNDM0Y2IyMS1iOGM0LTQ5Yj" + 
			"EtYTYyZS00M2E4MmY5MmQ5MGMiLCJ0ZW5hbnRzIjpbeyJ0ZW5hbnQiOiI2ODdlYTc0MTlmYTg4OGU1YzZkZDUzYzYiLCJyb2x" +
			"lcyI6WyJ0ZW5hbnQtdmlld2VyIiwidGVuYW50LWFkbWluIl0sImlkIjoiNjhmNTEzODA5NWVmODY3NDUyMzU5OWEyIn1dLCJpY" +
			"XQiOjE3NjM3Mzc5NjIsImV4cCI6MTc2MzgyNDM2Mn0.eDdcASFKcdJnHsWUnHrgTaHjqs8ByO59gICY1hwW24o";
			
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
			const config = await fetchWidgetConfigByToken(token);
			console.log("📦 Config received:", config);
			
			// Update state with fetched configuration
			if (config && config.branding) {
				console.log("✅ Branding loaded from database:", config.branding);
				console.log("🖼️ Full config:", config);
				
				// Apply custom branding from database
				setBranding(config.branding);
				// Store full config for later use
				setDbConfig(config);
			} else {
				// Fallback to default branding if fetch fails
				console.log("⚠️ Using default branding");
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
	}, []); // Empty dependency array = run only once on mount

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
	const flow: Flow = {
		// First block - always named "start"
		// Bot asks for user's name
		start: {
			message: "Hello! What is your name?",
			path: "show_name", // Go to show_name block after user responds
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
	 * 2. Database config (dbConfig)
	 * 3. Default theme settings (myTripFloatingSettings)
	 */
	const mergedSettings = {
		...myTripFloatingSettings(branding),  // Start with theme defaults
		...(dbConfig || {}),                  // Override with database config
		// Hardcoded overrides for specific features
		audio: { disabled: false },           // Enable audio
		chatInput: { botDelay: 1000 },        // Bot typing delay (1 second)
		userBubble: dbConfig?.userBubble || { showAvatar: true },
		botBubble: dbConfig?.botBubble || { showAvatar: true },
		header: dbConfig?.header || myTripFloatingSettings(branding).header,
		voice: { disabled: false },           // Enable voice
		sensitiveInput: { asterisksCount: 6 }, // Show 6 asterisks for sensitive input
	};
	
	// ========================================================================
	// MAIN RENDER
	// ========================================================================
	
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
					 * - styles: Visual appearance (from myTripFloatingStyles theme)
					 * 
					 * STYLING: Styles are applied via the 'styles' prop
					 * The myTripFloatingStyles() function returns a styles object
					 * that controls colors, fonts, sizes, animations, etc.
					 */}
					<ChatBot
						id="chatbot-id"
						flow={flow}
						settings={mergedSettings}
						styles={myTripFloatingStyles(branding)}
					/>
				</div>
			</header>
		</div>
	);
}

export default AppWithDatabaseConfig;
