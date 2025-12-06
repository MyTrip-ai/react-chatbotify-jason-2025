import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import ChatBot from "./components/ChatBot";
import { Flow } from "./types/Flow";
import { Params } from "./types/Params";
import { defaultBrandTokens } from "./types/BrandTokens";
import { myTripFloatingSettings, myTripFloatingStyles } from "./themes/myTripTheme";
import { Settings } from "./types/Settings";

const TENANT_ID = "mytrip-ai";
const SERVER_URL = "http://localhost:8001";

function App() {
	const [name, setName] = useState("");
	const [remoteSettings, setRemoteSettings] = useState<Settings | null>(null);

	const baseSettings = useMemo(() => myTripFloatingSettings(defaultBrandTokens), []);

	useEffect(() => {
		const loadConfig = async () => {
			try {
				const res = await fetch(
					`${SERVER_URL}/api/config/widget-display/public?tenant=${TENANT_ID}`
				);
				if (!res.ok) {
					throw new Error(`Config fetch failed: ${res.status}`);
				}
				const json = await res.json();
				const cfg = json.display_mode;
				const mergedSettings: Settings = {
					...baseSettings,
					general: {
						...baseSettings.general,
						embedded: cfg?.embedded ?? baseSettings.general?.embedded,
						flowStartTrigger: cfg?.flow_start_trigger ?? baseSettings.general?.flowStartTrigger,
						showHeader: cfg?.show_header ?? baseSettings.general?.showHeader,
						showFooter: cfg?.show_footer ?? baseSettings.general?.showFooter,
					},
					tooltip: {
						...baseSettings.tooltip,
						mode: cfg?.tooltip?.mode ?? baseSettings.tooltip?.mode,
						text: cfg?.tooltip?.text ?? baseSettings.tooltip?.text,
					},
					notification: {
						...baseSettings.notification,
						defaultToggledOn:
							cfg?.notification_badge?.enabled ?? baseSettings.notification?.defaultToggledOn,
						showCount:
							cfg?.notification_badge?.show_count ?? baseSettings.notification?.showCount,
						volume: cfg?.notification_badge?.volume ?? baseSettings.notification?.volume,
					},
					chatWindow: {
						...baseSettings.chatWindow,
						defaultOpen: cfg?.initial_state
							? cfg.initial_state === "open"
							: baseSettings.chatWindow?.defaultOpen,
					},
					device: {
						...baseSettings.device,
						applyMobileOptimizations:
							cfg?.mobile_optimizations ?? baseSettings.device?.applyMobileOptimizations,
					},
				};
				setRemoteSettings(mergedSettings);
			} catch (error) {
				console.error("Failed to load remote config:", error);
			}
		};

		loadConfig();
	}, [baseSettings]);

	useEffect(() => {
		console.log("🔌 [Socket.IO] Connecting to", SERVER_URL);
		const socket = io(SERVER_URL, { transports: ["websocket", "polling"] });

		socket.on("connect", () => {
			console.log("✅ [Socket.IO] Connected, socket id:", socket.id);
			console.log("🚪 [Socket.IO] Joining room:", `tenant:${TENANT_ID}`);
			socket.emit("join_room", { room: `tenant:${TENANT_ID}` });
		});

		socket.on("connect_error", (error) => {
			console.error("❌ [Socket.IO] Connection error:", error.message);
		});

		socket.on("disconnect", (reason) => {
			console.log("🔌 [Socket.IO] Disconnected:", reason);
		});

		socket.on("handoff_request", (data) => {
			console.log("📣 [Socket.IO] handoff_request received:", data);
			alert(`Handoff request from ${data.customer_name || "customer"}`);
		});

		return () => {
			console.log("🧹 [Socket.IO] Cleaning up connection");
			socket.disconnect();
		};
	}, []);

	// Serves as an example flow used during the development phase - covers all possible attributes in a block.
	// restore to default state before running selenium tests (or update the test cases if necessary)!
	const flow: Flow = {
		start: {
			message: "Hello! What is your name?",
			path: "show_name",
		},
		show_name : {
			message: (params: Params) => `Hey ${params.userInput}! Nice to meet you.`,
			function: (params: Params) => setName(params.userInput),
			chatDisabled: true,
			transition: {duration: 1000},
			path: "ask_token",
		},
		ask_token: {
			message: () => "Before we proceed, we need to verify your profile id, "
			+ "Enter your 6 digit profile id",
			isSensitive: true,
			path: (params: Params) => {
				if (params.userInput.length !== 6) {
					return "incorrect_answer"
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
				return `I see you're a ${params.userInput}. Let's do a quick test! What is 1 + 1?`
			},
			path: (params: Params) => {
				if (params.userInput != "2") {
					return "incorrect_answer"
				} else {
					return "ask_favourite_color";
				}
			},
		},
		ask_favourite_color: {
			message: "Great Job! What is your favourite color?",
			path: "ask_favourite_pet"
		},
		ask_favourite_pet: {
			message: "Interesting! Pick any 2 pets below.",
			checkboxes: {items: ["Dog", "Cat", "Rabbit", "Hamster"], min:2, max: 2},
			function: (params: Params) => alert(`You picked: ${JSON.stringify(params.userInput)}!`),
			chatDisabled: true,
			path: "ask_height",
		},
		ask_height: {
			message: "What is your height (cm)?",
			path: async (params: Params) => {
				if (isNaN(Number(params.userInput))) {
					await params.injectMessage("Height needs to be a number!");
					return;
				}
				return "ask_weather";
			}
		},
		ask_weather: {
			message: (params: Params) => {
				if (params.prevPath == "incorrect_answer") {
					return;
				}
				return "What's my favourite color? Click the button below to find out my answer!"
			},
			component: (
				<div style={{
					width: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					marginTop: 10
				}}>
					<button 
						className="secret-fav-color"
						onClick={() => alert("black")}>
						Click me!
					</button>
				</div>
			),
			path: async (params: Params) => {
				if (params.userInput.toLowerCase() != "black") {
					return "incorrect_answer"
				} else {
					await params.toggleChatWindow(false);
					return "close_chat";
				}
			},
		},
		close_chat: {
			message: "I went into hiding but you found me! Ok tell me, what's your favourite food?",
			path: "ask_image"
		},
		ask_image: {
			message: (params: Params) =>
				`${params.userInput}? Interesting. Could you share an image of that?`,
			file: (params: Params) => console.log(params.files),
			function: (params: Params) =>
				params.showToast("Image is uploaded successfully!"),
			path: "end",
		},
		end: {
			message: "Thank you for sharing! See you again!",
			path: "loop"
		},
		loop: {
			message: (params: Params) => {
				// sends the message half a second later to facilitate testing of new message prompt
				setTimeout(async () => {
					await params.injectMessage("You have reached the end of the conversation!");
				}, 500)
			},
			path: "loop"
		},
		incorrect_answer: {
			message: "Your answer is incorrect, try again!",
			transition: {duration: 0},
			path: (params: Params) => params.prevPath
		},
	}

	return (
		<div className="App">
			<header className="App-header">
				<div style={{display: "flex", justifyContent: "center", alignItems: "center", marginTop: `calc(20vh)`}}>
					{remoteSettings ? (
						<ChatBot
							id="chatbot-id"
							flow={flow}
							settings={remoteSettings}
							styles={myTripFloatingStyles(defaultBrandTokens)}
						/>
					) : (
						<div>Loading...</div>
					)}
				</div>
			</header>
		</div>
	);
}

export default App;