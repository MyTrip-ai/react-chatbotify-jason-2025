import { useState, useEffect } from 'react';

/**
 * Custom hook to handle messaging with parent window
 * Listens for postMessage events from parent window to receive onboarding thread ID
 * 
 * @returns Object containing onboardingThreadID
 */
export const useParentMessaging = () => {
	const [onboardingThreadID, setOnboardingThreadID] = useState<string>('');

	// Listen for messages from parent window
	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			const { type, value } = event.data || {};
			
			if (type === "thread_id") {
				console.log('📨 [useParentMessaging] Received thread_id from parent:', value);
				setOnboardingThreadID(value);
			} else if (
				type !== "viewportWidth" && 
				type !== "rchat_widget_state" && 
				type !== "initialWidgetState"
			) {
				// Only log unknown message types (filter out known system messages)
				console.warn("⚠️ [useParentMessaging] Unknown message type:", type);
			}
		};

		window.addEventListener("message", handleMessage);
		
		// Cleanup event listener on unmount
		return () => window.removeEventListener("message", handleMessage);
	}, []);

	return { onboardingThreadID };
};
