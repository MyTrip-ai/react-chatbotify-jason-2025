/**
 * Handoff Types & Contract Enforcement
 * =====================================
 * Local implementations matching @mytrip/handoff-contracts for Vite compatibility.
 * This ensures consistent room naming across all clients.
 */

// ============================================================================
// TENANT CONFIGURATION
// ============================================================================

export const DEFAULT_TENANT_ID = "692dcd694130f3f77a280bb3";

// ============================================================================
// ROOM NAME BUILDERS
// ============================================================================

export function getTenantRoom(tenantSlug: string): string {
	if (!tenantSlug) throw new Error("Tenant slug cannot be empty");
	// Reject MongoDB ObjectId format (24 hex chars)
	if (tenantSlug.length === 24 && /^[0-9a-f]{24}$/i.test(tenantSlug)) {
		throw new Error(`Invalid tenant slug: "${tenantSlug}" looks like MongoDB ObjectId`);
	}
	return `tenant:${tenantSlug}`;
}

export function getThreadRoom(threadId: string): string {
	if (!threadId || !threadId.startsWith("thread_")) {
		throw new Error(`Invalid thread ID format: ${threadId}. Must start with "thread_"`);
	}
	return `thread:${threadId}`;
}

export function getConversationRoom(threadId: string): string {
	if (!threadId || !threadId.startsWith("thread_")) {
		throw new Error(`Invalid thread ID format: ${threadId}. Must start with "thread_"`);
	}
	return `conversation:${threadId}`;
}

// ============================================================================
// EVENT NAMES
// ============================================================================

export const EVENT_NAMES = {
	CUSTOMER_MESSAGE: "customer_message",
	HANDOFF_REQUEST: "handoff_request",
	OPERATOR_MESSAGE: "operator_message",
	CONVERSATION_MODE_CHANGED: "conversation_mode_changed",
	JOIN_ROOM: "join_room",
} as const;

export const FIELD_NAMES = {
	TEXT: "text",
	CUSTOMER_ID: "customer_id",
	SEQ: "seq",
	TRACE_ID: "trace_id",
	TIMESTAMP: "timestamp",
} as const;

// ============================================================================
// TYPES
// ============================================================================

export type ConversationMode = "ai" | "human" | "hybrid" | "cooldown";

export type CustomerMessage = {
	message_id: string;
	thread_id: string;
	customer_id: string;
	text: string;
	seq: number;
	trace_id: string;
	timestamp: string;
}

export type OperatorMessage = {
	message_id: string;
	thread_id: string;
	operator_id: string;
	text: string;
	seq: number;
	timestamp: string;
}

export type ConversationModeChanged = {
	thread_id: string;
	mode: ConversationMode;
	mode_version: number;
	reason?: string;
	timestamp: string;
}

export type JoinRoomPayload = {
	room: string;
	client_type: "widget" | "crm";
}

export type HandoffRequest = {
	request_id: string;
	thread_id: string;
	tenant_id: string;
	reason: string;
	customer_name?: string;
	timestamp: string;
}
