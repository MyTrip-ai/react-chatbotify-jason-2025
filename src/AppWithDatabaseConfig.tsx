import { useState, useEffect } from "react";
import ChatBot from "./components/ChatBot";
import { Flow } from "./types/Flow";
import { Params } from "./types/Params";
import { BrandTokens, defaultBrandTokens } from "./types/BrandTokens";
import { mapApiToConfig } from "./utils/apiMapper";
import { myTripFloatingSettings, myTripFloatingStyles } from "./themes/myTripTheme";

// Replace with your actual API endpoint
const API_ENDPOINTS = {
	EXPRESS_MIDDLEWARE: import.meta.env.VITE_API_URL || "http://localhost:3001"
};

/**
 * Fetches widget configuration from the database using the provided token.
 * @param token - Authorization token
 * @returns Widget configuration with branding tokens
 */
const fetchWidgetConfigByToken = async (token: string) => {
	console.log("🌐 fetchWidgetConfigByToken called");
	console.log("🔗 API URL:", `${API_ENDPOINTS.EXPRESS_MIDDLEWARE}/api/chatwidgets`);
	console.log("🔑 Token (first 50 chars):", token.substring(0, 50) + "...");
	
	try {
		console.log("📤 Sending fetch request...");
		const response = await fetch(`${API_ENDPOINTS.EXPRESS_MIDDLEWARE}/api/chatwidgets`, {
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`,
			},
		});

		console.log("📥 Response status:", response.status, response.statusText);

		if (!response.ok) {
			throw new Error(`Error fetching chat widgets: ${response.statusText}`);
		}

		const data = await response.json();
		console.log("📊 Raw data received:", data);
		
		if (data.docs && data.docs.length > 0) {
			console.log(`👀 Data received: ${JSON.stringify(data.docs[0])}`);
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

function AppWithDatabaseConfig() {
	const [name, setName] = useState("");
	const [branding, setBranding] = useState<BrandTokens>(defaultBrandTokens);
	const [dbConfig, setDbConfig] = useState<any>(null);
	const [configLoaded, setConfigLoaded] = useState(false);

	console.log("🚀 AppWithDatabaseConfig component mounted");
	console.log("📊 Initial state - configLoaded:", configLoaded);

	// Fetch configuration from database on mount
	useEffect(() => {
		const loadConfig = async () => {
			console.log("🔄 Starting loadConfig...");
			// OPTION 1: Hardcode your token for testing (replace with your actual token)
			const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZjUxMzg2MmVjNDU0NjAwMWNiYWQ0YiIsI" +
				"mNvbGxlY3Rpb24iOiJ1c2VycyIsImVtYWlsIjoiamRAdGVzdC5jb20iLCJzaWQiOiIyMWVlYTdmNy02Y2NjLTRiOWI" +
				"tYmJmNC1kYzQ2OWM1YjM2YWIiLCJ0ZW5hbnRzIjpbeyJ0ZW5hbnQiOiI2ODdlYTc0MTlmYTg4OGU1YzZkZDUzYzYiLCJ" +
				"yb2xlcyI6WyJ0ZW5hbnQtdmlld2VyIiwidGVuYW50LWFkbWluIl0sImlkIjoiNjhmNTEzODA5NWVmODY3NDUyMzU5OWE" +
				"yIn1dLCJpYXQiOjE3NjM2NzY5NzAsImV4cCI6MTc2Mzc2MzM3MH0.DYTnFAVNhgGztAjtL74mBArcUQs97hE2jfVUs" +
				"TxEqiI";
			
			// OPTION 2: Get from localStorage (if you set it manually in browser console)
			// const token = localStorage.getItem("authToken") || "your-token-here";
			
			// OPTION 3: Get from URL parameter (?token=xxx)
			// const urlParams = new URLSearchParams(window.location.search);
			// const token = urlParams.get("token") || "your-token-here";
			
			console.log("📡 Calling fetchWidgetConfigByToken...");
			const config = await fetchWidgetConfigByToken(token);
			console.log("📦 Config received:", config);
			
			if (config && config.branding) {
				console.log("✅ Branding loaded from database:", config.branding);
				console.log("🖼️ Full config:", config);
				setBranding(config.branding);
				setDbConfig(config);
			} else {
				console.log("⚠️ Using default branding");
			}
			
			console.log("✔️ Setting configLoaded to true");
			setConfigLoaded(true);
		};

		loadConfig().catch(error => {
			console.error("❌ Error in loadConfig:", error);
			setConfigLoaded(true); // Still set to true to show the widget with defaults
		});
	}, []);

	// Example flow - same as original App.tsx
	const flow: Flow = {
		start: {
			message: "Hello! What is your name?",
			path: "show_name",
		},
		show_name: {
			message: (params: Params) => `Hey ${params.userInput}! Nice to meet you.`,
			function: (params: Params) => setName(params.userInput),
			chatDisabled: true,
			transition: { duration: 1000 },
			path: "ask_token",
		},
		ask_token: {
			message: () => "Before we proceed, we need to verify your profile id, " +
				"Enter your 6 digit profile id",
			isSensitive: true,
			path: (params: Params) => {
				if (params.userInput.length !== 6) {
					return "incorrect_answer";
				} else {
					return "ask_age_group";
				}
			},
		},
		ask_age_group: {
			message: () => `Hey ${name}!, Your account got verified, May i know your age group?`,
			options: ["child", "teen", "adult"],
			chatDisabled: true,
			path: () => "ask_math_question",
		},
		ask_math_question: {
			message: (params: Params) => {
				if (params.prevPath == "incorrect_answer") {
					return;
				}
				return `I see you're a ${params.userInput}. Let's do a quick test! What is 1 + 1?`;
			},
			path: (params: Params) => {
				if (params.userInput != "2") {
					return "incorrect_answer";
				} else {
					return "end";
				}
			},
		},
		end: {
			message: "Great job! Thank you for chatting with me!",
			path: "loop"
		},
		loop: {
			message: (params: Params) => {
				setTimeout(async () => {
					await params.injectMessage("You have reached the end of the conversation!");
				}, 500);
			},
			path: "loop"
		},
		incorrect_answer: {
			message: "Your answer is incorrect, try again!",
			transition: { duration: 0 },
			path: (params: Params) => params.prevPath
		},
	};

	console.log("🎨 Render - configLoaded:", configLoaded);
	console.log("🎨 Render - branding:", branding);
	
	// Don't render until config is loaded
	if (!configLoaded) {
		console.log("⏸️ Showing loading screen");
		return (
			<div style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "100vh",
				fontFamily: defaultBrandTokens.fontFamily
			}}>
				Loading chatbot configuration...
			</div>
		);
	}

	console.log("🎉 Rendering ChatBot with branding:", branding);
	console.log("🎉 Rendering ChatBot with dbConfig:", dbConfig);
	
	// Merge database config with default settings
	const mergedSettings = {
		...myTripFloatingSettings(branding),
		...(dbConfig || {}),
		audio: { disabled: false },
		chatInput: { botDelay: 1000 },
		userBubble: dbConfig?.userBubble || { showAvatar: true },
		botBubble: dbConfig?.botBubble || { showAvatar: true },
		header: dbConfig?.header || myTripFloatingSettings(branding).header,
		voice: { disabled: false },
		sensitiveInput: { asterisksCount: 6 },
	};
	
	return (
		<div className="App">
			<header className="App-header">
				<div style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					marginTop: `calc(20vh)`
				}}>
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
