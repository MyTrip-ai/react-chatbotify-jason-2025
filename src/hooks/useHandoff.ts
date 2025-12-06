/**
 * useHandoff Hook
 * ================
 * Phase D: React hook for receiving operator messages in the widget
 *
 * This hook connects to the HandoffService and provides a way to
 * inject operator messages into the chat when in human mode.
 *
 * Usage:
 *   const { isInHumanMode, operatorName } = useHandoff(params);
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { handoffService, OperatorMessage, ModeChangeEvent } from "../services/HandoffService";
import { Params } from "../types/Params";

type UseHandoffOptions = {
	params: Params | null;
};

type UseHandoffReturn = {
	isConnected: boolean;
	isInHumanMode: boolean;
	operatorName: string | null;
	threadId: string | null;
};

/**
 * Hook for handling operator handoff in the widget
 */
export const useHandoff = (options: UseHandoffOptions): UseHandoffReturn => {
	const { params } = options;

	const [isConnected, setIsConnected] = useState(false);
	const [isInHumanMode, setIsInHumanMode] = useState(false);
	const [operatorName, setOperatorName] = useState<string | null>(null);
	const [threadId, setThreadId] = useState<string | null>(null);

	// Keep refs to avoid stale closures
	const paramsRef = useRef(params);
	paramsRef.current = params;

	// Handle operator messages
	const handleOperatorMessage = useCallback(async (message: OperatorMessage) => {
		console.log("[useHandoff] 📩 Operator message:", message.text);

		if (!paramsRef.current?.injectMessage) {
			console.warn("[useHandoff] No params.injectMessage available");
			return;
		}

		// Inject the operator's message into the chat
		// The message appears as coming from the bot (assistant)
		try {
			// Optionally prefix with operator name
			const displayText = message.sender_name
				? `**${message.sender_name}:** ${message.text}`
				: message.text;

			await paramsRef.current.injectMessage(displayText);
			console.log("[useHandoff] ✅ Operator message injected");
		} catch (error) {
			console.error("[useHandoff] ❌ Failed to inject message:", error);
		}
	}, []);

	// Handle mode changes
	const handleModeChange = useCallback((event: ModeChangeEvent) => {
		console.log("[useHandoff] 🔄 Mode changed to:", event.mode);

		const humanMode = event.mode === "human" || event.mode === "hybrid";
		setIsInHumanMode(humanMode);

		if (humanMode && event.operator_name) {
			setOperatorName(event.operator_name);
		} else if (!humanMode) {
			setOperatorName(null);
		}
	}, []);

	// Handle connection state
	const handleConnection = useCallback((connected: boolean) => {
		console.log("[useHandoff] Connection state:", connected);
		setIsConnected(connected);
	}, []);

	// Subscribe to handoff events
	useEffect(() => {
		console.log("[useHandoff] Setting up event listeners");

		const unsubMessage = handoffService.onOperatorMessage(handleOperatorMessage);
		const unsubMode = handoffService.onModeChange(handleModeChange);
		const unsubConnection = handoffService.onConnection(handleConnection);

		// Check initial state
		setIsConnected(handoffService.isConnected());
		setThreadId(handoffService.getThreadId());

		return () => {
			console.log("[useHandoff] Cleaning up event listeners");
			unsubMessage();
			unsubMode();
			unsubConnection();
		};
	}, [handleOperatorMessage, handleModeChange, handleConnection]);

	// Update thread ID when it changes
	useEffect(() => {
		const currentThreadId = handoffService.getThreadId();
		if (currentThreadId !== threadId) {
			setThreadId(currentThreadId);
		}
	}, [isConnected, threadId]);

	return {
		isConnected,
		isInHumanMode,
		operatorName,
		threadId,
	};
};

export default useHandoff;
