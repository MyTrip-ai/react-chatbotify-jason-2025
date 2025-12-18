/**
 * HandoffService
 * ================
 * Phase D: Widget listens for operator_message events
 *
 * This service connects the customer widget to the Flask chat server via Socket.IO
 * to receive real-time messages from human operators during handoff mode.
 */

import { io, Socket } from "socket.io-client";
import { API_ENDPOINTS, ASSISTANT_ID } from "../config/constants";

// ============================================================================
// CONTRACT ENFORCEMENT - Local implementations matching @mytrip/handoff-contracts
// ============================================================================

const EVENT_NAMES = {
	JOIN_ROOM: "join_room",
} as const;

function getTenantRoom(tenantSlug: string): string {
	if (!tenantSlug) throw new Error("Tenant slug cannot be empty");
	return `tenant:${tenantSlug}`;
}

function getThreadRoom(threadId: string): string {
	if (!threadId || !threadId.startsWith("thread_")) {
		throw new Error(`Invalid thread ID format: ${threadId}. Must start with "thread_"`);
	}
	return `thread:${threadId}`;
}

// ============================================================================
// TYPES
// ============================================================================

export type OperatorMessage = {
	message_id: string;
	thread_id: string;
	text: string;
	sender: "operator";
	sender_id: string;
	sender_name: string;
	seq: number;
	timestamp: string;
};

export type ModeChangeEvent = {
	thread_id: string;
	mode: "ai" | "human" | "hybrid" | "cooldown";
	operator_id?: string;
	operator_name?: string;
	mode_version: number;
	changed_at: string;
};

export type TypingIndicator = {
	thread_id: string;
	sender: "operator" | "customer";
	sender_name?: string;
	is_typing: boolean;
};

export type HandoffRequest = {
	request_id: string;
	thread_id: string;
	tenant_id: string;
	reason: string;
	customer_name?: string;
	priority?: number;
	timestamp: string;
};

type OperatorMessageCallback = (message: OperatorMessage) => void;
type ModeChangeCallback = (mode: ModeChangeEvent) => void;
type TypingCallback = (typing: TypingIndicator) => void;
type ConnectionCallback = (connected: boolean) => void;
type HandoffRequestCallback = (request: HandoffRequest) => void;

// ============================================================================
// HANDOFF SERVICE CLASS
// ============================================================================

class HandoffService {
	private socket: Socket | null = null;
	private threadId: string | null = null;
	private tenantId: string | null = null;
	private assistantId: string = ASSISTANT_ID;
	private serverUrl: string;
	private joinedThreadRoom: string | null = null;
	private tenantRoomJoined: boolean = false;

	// Callbacks
	private onOperatorMessageCallbacks: OperatorMessageCallback[] = [];
	private onModeChangeCallbacks: ModeChangeCallback[] = [];
	private onTypingCallbacks: TypingCallback[] = [];
	private onConnectionCallbacks: ConnectionCallback[] = [];
	private onHandoffRequestCallbacks: HandoffRequestCallback[] = [];

	// Message deduplication
	private processedMessageIds: Set<string> = new Set();

	constructor() {
		// Use the handoff server URL (Flask @ 8001 for local testing)
		this.serverUrl = API_ENDPOINTS.HANDOFF_SERVER || "http://localhost:8001";
		console.log("[HandoffService] Initialized with server URL:", this.serverUrl);
	}

	/**
	 * Set the assistant ID for room subscriptions
	 */
	setAssistantId(assistantId: string): void {
		this.assistantId = assistantId;
	}

	/**
	 * Set the tenant ID from API response for room subscriptions
	 */
	setTenantId(tenantId: string): void {
		if (this.tenantId === tenantId) return;
		
		console.log("[HandoffService] Setting tenant ID:", tenantId);
		this.tenantId = tenantId;
		this.tenantRoomJoined = false;
		
		// Re-join tenant room if socket is connected
		if (this.socket?.connected) {
			this.joinTenantRoom();
		}
	}

	// ==========================================================================
	// PUBLIC METHODS
	// ==========================================================================

	/**
	 * Initialize connection without a thread ID (for tenant-level events)
	 */
	init(): void {
		if (this.socket?.connected) {
			console.log("[HandoffService] Already connected");
			return;
		}

		console.log("[HandoffService] Initializing connection to:", this.serverUrl);

		this.socket = io(this.serverUrl, {
			transports: ["websocket", "polling"],
			reconnection: true,
			reconnectionAttempts: 5,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
		});

		this.setupEventListeners();
	}

	/**
	 * Connect to the handoff WebSocket server
	 */
	connect(threadId: string): void {
		if (this.socket?.connected && this.threadId === threadId) {
			console.log("[HandoffService] Already connected to thread:", threadId);
			return;
		}

		// Disconnect existing connection if thread changed
		if (this.socket?.connected && this.threadId !== threadId) {
			console.log("[HandoffService] Thread changed, reconnecting...");
			this.disconnect();
		}

		this.threadId = threadId;
		this.joinedThreadRoom = null;
		this.tenantRoomJoined = false;
		console.log("[HandoffService] Connecting to:", this.serverUrl, "for thread:", threadId);

		// Create Socket.IO connection (unauthenticated for customer widget)
		this.socket = io(this.serverUrl, {
			transports: ["websocket"],
			reconnection: true,
			reconnectionAttempts: 5,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
		});

		this.setupEventListeners();
	}

	/**
	 * Apply mode info coming directly from the chat API response (pre-socket event)
	 * Input mode can include 'handoff_pending' which maps to 'human'
	 */
	applyModeFromApi(modeData: Partial<ModeChangeEvent> & { mode?: string }): void {
		const rawMode: string | undefined = modeData.mode;
		if (!rawMode) return;

		// Map temporary/handoff_pending states to allowed modes
		// API can return "handoff_pending" which we map to "human"
		const effectiveMode: ModeChangeEvent["mode"] = 
			rawMode === "handoff_pending" ? "human" : (rawMode as ModeChangeEvent["mode"]);

		const event: ModeChangeEvent = {
			thread_id: modeData.thread_id || this.threadId || "",
			mode: effectiveMode as ModeChangeEvent["mode"],
			operator_id: modeData.operator_id,
			operator_name: modeData.operator_name,
			mode_version: modeData.mode_version ?? 0,
			changed_at: modeData.changed_at ?? new Date().toISOString(),
		};

		this.onModeChangeCallbacks.forEach(cb => cb(event));
	}

	/**
	 * Disconnect from the WebSocket server
	 */
	disconnect(): void {
		if (this.socket) {
			console.log("[HandoffService] Disconnecting...");
			this.socket.disconnect();
			this.socket = null;
		}
		this.threadId = null;
		this.joinedThreadRoom = null;
		this.tenantRoomJoined = false;
		this.processedMessageIds.clear();
	}

	/**
	 * Update the thread ID (e.g., when a new conversation starts)
	 */
	setThreadId(threadId: string): void {
		if (this.threadId === threadId) return;

		console.log("[HandoffService] Updating thread ID:", threadId);

		// Leave old room
		if (this.socket?.connected && this.threadId) {
			this.socket.emit("leave_room", { thread_id: this.threadId });
		}

		this.threadId = threadId;
		this.joinedThreadRoom = null;
		this.processedMessageIds.clear();

		// Join new room
		if (this.socket?.connected) {
			this.joinThreadRoom();
		}
	}

	/**
	 * Check if connected to the handoff server
	 */
	isConnected(): boolean {
		return this.socket?.connected ?? false;
	}

	/**
	 * Get the current thread ID
	 */
	getThreadId(): string | null {
		return this.threadId;
	}

	// ==========================================================================
	// CALLBACK REGISTRATION
	// ==========================================================================

	onOperatorMessage(callback: OperatorMessageCallback): () => void {
		this.onOperatorMessageCallbacks.push(callback);
		return () => {
			this.onOperatorMessageCallbacks = this.onOperatorMessageCallbacks.filter(cb => cb !== callback);
		};
	}

	onModeChange(callback: ModeChangeCallback): () => void {
		this.onModeChangeCallbacks.push(callback);
		return () => {
			this.onModeChangeCallbacks = this.onModeChangeCallbacks.filter(cb => cb !== callback);
		};
	}

	onTyping(callback: TypingCallback): () => void {
		this.onTypingCallbacks.push(callback);
		return () => {
			this.onTypingCallbacks = this.onTypingCallbacks.filter(cb => cb !== callback);
		};
	}

	onConnection(callback: ConnectionCallback): () => void {
		this.onConnectionCallbacks.push(callback);
		return () => {
			this.onConnectionCallbacks = this.onConnectionCallbacks.filter(cb => cb !== callback);
		};
	}

	onHandoffRequest(callback: HandoffRequestCallback): () => void {
		const count = this.onHandoffRequestCallbacks.length + 1;
		console.log("[HandoffService] 📝 Registering handoff request callback, total:", count);
		this.onHandoffRequestCallbacks.push(callback);
		return () => {
			console.log("[HandoffService] 🗑️ Unregistering handoff request callback");
			this.onHandoffRequestCallbacks = this.onHandoffRequestCallbacks.filter(cb => cb !== callback);
		};
	}

	// ==========================================================================
	// PRIVATE METHODS
	// ==========================================================================

	private setupEventListeners(): void {
		if (!this.socket) return;

		// Connection events
		this.socket.on("connect", () => {
			console.log("[HandoffService] ✅ Connected to handoff server, socket.id:", this.socket?.id);
			console.log("[HandoffService] 🏠 Assistant ID for room join:", this.assistantId);
			this.joinThreadRoom();
			this.notifyConnectionCallbacks(true);
		});

		this.socket.on("disconnect", (reason) => {
			console.log("[HandoffService] ❌ Disconnected:", reason);
			this.joinedThreadRoom = null;
			this.tenantRoomJoined = false;
			this.notifyConnectionCallbacks(false);
		});

		this.socket.on("connect_error", (error) => {
			console.error("[HandoffService] Connection error:", error.message);
		});

		// Operator message event (Phase D)
		this.socket.on("operator_message", (data: unknown) => {
			console.log("[HandoffService] 📩 Operator message received:", data);

			// Handle both wrapped and flat formats
			const rawData = data as Record<string, unknown>;
			const messageData = (rawData.data || rawData) as Record<string, unknown>;

			// Check thread ID matches
			if (messageData.thread_id !== this.threadId) {
				console.log("[HandoffService] Ignoring message for different thread");
				return;
			}

			// Deduplicate by message_id
			const msgId = messageData.message_id as string;
			if (this.processedMessageIds.has(msgId)) {
				console.log("[HandoffService] Ignoring duplicate message:", msgId);
				return;
			}
			this.processedMessageIds.add(msgId);

			// Notify callbacks
			const message: OperatorMessage = {
				message_id: msgId,
				thread_id: messageData.thread_id as string,
				text: (messageData.text || messageData.content) as string,
				sender: "operator",
				sender_id: messageData.sender_id as string,
				sender_name: (messageData.sender_name as string) || "Operator",
				seq: messageData.seq as number,
				timestamp: messageData.timestamp as string,
			};

			this.onOperatorMessageCallbacks.forEach(cb => cb(message));
		});

		// Mode change event
		this.socket.on("conversation_mode_changed", (data: unknown) => {
			console.log("[HandoffService] 🔄 Mode changed:", data);

			const rawData = data as Record<string, unknown>;
			const modeData = (rawData.data || rawData) as Record<string, unknown>;

			if (modeData.thread_id !== this.threadId) return;

			const modeEvent: ModeChangeEvent = {
				thread_id: modeData.thread_id as string,
				mode: (modeData.mode || modeData.new_mode) as ModeChangeEvent["mode"],
				operator_id: modeData.operator_id as string | undefined,
				operator_name: modeData.operator_name as string | undefined,
				mode_version: modeData.mode_version as number,
				changed_at: modeData.changed_at as string,
			};

			this.onModeChangeCallbacks.forEach(cb => cb(modeEvent));
		});

		// Typing indicator event
		this.socket.on("typing_indicator", (data: unknown) => {
			const rawData = data as Record<string, unknown>;
			const typingData = (rawData.data || rawData) as Record<string, unknown>;

			if (typingData.thread_id !== this.threadId) return;
			if (typingData.sender !== "operator") return;

			const typing: TypingIndicator = {
				thread_id: typingData.thread_id as string,
				sender: typingData.sender as TypingIndicator["sender"],
				sender_name: typingData.sender_name as string | undefined,
				is_typing: typingData.is_typing as boolean,
			};

			this.onTypingCallbacks.forEach(cb => cb(typing));
		});

		// Handoff request event (for testing/debugging)
		this.socket.on("handoff_request", (data: unknown) => {
			console.log("[HandoffService] 📣 HANDOFF_REQUEST EVENT RECEIVED!");
			console.log("[HandoffService] 📣 Raw data:", JSON.stringify(data, null, 2));
			console.log("[HandoffService] 📣 Registered callbacks count:", this.onHandoffRequestCallbacks.length);

			const rawData = data as Record<string, unknown>;
			const requestData = (rawData.data || rawData) as Record<string, unknown>;

			const request: HandoffRequest = {
				request_id: requestData.request_id as string,
				thread_id: requestData.thread_id as string,
				tenant_id: requestData.tenant_id as string,
				reason: requestData.reason as string,
				customer_name: requestData.customer_name as string | undefined,
				priority: requestData.priority as number | undefined,
				timestamp: requestData.timestamp as string,
			};

			console.log("[HandoffService] 📣 Parsed request:", request);
			this.onHandoffRequestCallbacks.forEach((cb, i) => {
				console.log(`[HandoffService] 📣 Calling callback ${i}`);
				cb(request);
			});
		});

		// DEBUG: Catch-all to see ANY events from server
		this.socket.onAny((eventName, ...args) => {
			console.log(`[HandoffService] 🔔 EVENT: ${eventName}`, args);
		});
	}

	private joinTenantRoom(): void {
		if (!this.socket?.connected) {
			console.log("[HandoffService] ⚠️ joinTenantRoom called but socket not connected");
			return;
		}

		// Join tenant room for handoff_request events
		// Use tenantId from API if available, otherwise fall back to assistantId
		const tenantIdentifier = this.tenantId || this.assistantId;
		if (!this.tenantRoomJoined && tenantIdentifier) {
			const tenantRoom = getTenantRoom(tenantIdentifier);
			console.log("[HandoffService] 🚪 JOINING TENANT ROOM:", tenantRoom);
			this.socket.emit(EVENT_NAMES.JOIN_ROOM, { 
				room: tenantRoom,
				client_type: 'widget'  // REQUIRED: Identifies client for debugging
			});
			this.tenantRoomJoined = true;
			console.log("[HandoffService] ✅ Tenant room join emitted:", tenantRoom);
		} else if (this.tenantRoomJoined) {
			console.log("[HandoffService] ℹ️ Tenant room already joined:", getTenantRoom(tenantIdentifier));
		}
	}

	private joinThreadRoom(): void {
		if (!this.socket?.connected) {
			console.log("[HandoffService] ⚠️ joinThreadRoom called but socket not connected");
			return;
		}

		// Join tenant room first
		this.joinTenantRoom();

		// Join thread room for operator messages
		// CONTRACT ENFORCEMENT: Use getThreadRoom() and include client_type
		if (this.threadId) {
			const threadRoom = getThreadRoom(this.threadId);
			if (this.joinedThreadRoom === threadRoom) {
				console.log("[HandoffService] ℹ️ Already joined thread room:", threadRoom);
				return;
			}
			console.log("[HandoffService] 🚪 JOINING THREAD ROOM:", threadRoom);
			this.socket.emit(EVENT_NAMES.JOIN_ROOM, { 
				room: threadRoom,
				client_type: 'widget'  // REQUIRED: Identifies client for debugging
			});
			this.joinedThreadRoom = threadRoom;
			console.log("[HandoffService] ✅ Thread room join emitted:", threadRoom);
		}
	}

	private notifyConnectionCallbacks(connected: boolean): void {
		this.onConnectionCallbacks.forEach(cb => cb(connected));
	}
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const handoffService = new HandoffService();
export default handoffService;
