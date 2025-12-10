import { useCallback, useEffect } from "react";

import { useDispatchRcbEventInternal } from "./useDispatchRcbEventInternal";
import { useBotStatesContext } from "../../context/BotStatesContext";
import { useBotRefsContext } from "../../context/BotRefsContext";
import { useSettingsContext } from "../../context/SettingsContext";
import { RcbEvent } from "../../constants/RcbEvent";

/**
 * Internal custom hook for managing chat window logic.
 */
export const useChatWindowInternal = () => {
	// handles settings
	const { settings } = useSettingsContext();

	// handles bot states
	const {
		isChatWindowOpen,
		setSyncedIsChatWindowOpen,
		viewportHeight,
		setViewportHeight,
		viewportWidth,
		setViewportWidth,
		setUnreadCount,
		setSyncedIsBotTyping,
		setSyncedIsScrolling,
		syncedIsBotTypingRef,
		syncedIsChatWindowOpenRef,
	} = useBotStatesContext();

	const { chatBodyRef } = useBotRefsContext();

	// handles rcb events
	const { dispatchRcbEvent } = useDispatchRcbEventInternal();

	// Notify parent window of initial chat window state
	useEffect(() => {
		const sendInitialState = () => {
			try {
				if (window.parent && window.parent !== window) {
					const initialState = isChatWindowOpen ? "open" : "closed";
					window.parent.postMessage(isChatWindowOpen ? "chatOpened" : "chatClosed", "*");
					window.parent.postMessage(
						{ type: "rchat_widget_state", value: initialState },
						"*"
					);
					console.log("[Chat Window] Sent initial state to parent:", initialState);
				}
			} catch (e) {
				console.warn("[Chat Window] Could not notify parent of initial state:", e);
			}
		};

		// Send immediately
		sendInitialState();

		// Also send after a short delay to ensure parent is ready
		const timer = setTimeout(sendInitialState, 100);

		// Listen for parent requesting initial state
		const handleParentRequest = (event: MessageEvent) => {
			if (event.data?.type === "requestInitialWidgetState") {
				sendInitialState();
			}
		};

		window.addEventListener("message", handleParentRequest);

		return () => {
			clearTimeout(timer);
			window.removeEventListener("message", handleParentRequest);
		};
	}, [isChatWindowOpen]); // Re-run if initial state changes

	/**
	 * Checks if chatbot is visible (uses chatbot body as reference).
	 */
	const getIsChatBotVisible = useCallback(() => {
		if (!chatBodyRef.current) {
			return false;
		}

		const rect = chatBodyRef.current.getBoundingClientRect();
		const windowHeight = (window.innerHeight ?? document.documentElement.clientHeight);
		const windowWidth = (window.innerWidth ?? document.documentElement.clientWidth);

		return (
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <= windowHeight &&
			rect.right <= windowWidth
		);
	}, [chatBodyRef]);

	/**
	 * Toggles chat window.
	 * 
	 * @param active boolean indicating desired state (if not specified, just flips existing state)
	 */
	const toggleChatWindow = useCallback(async (active?: boolean) => {
		// nothing to do if state is as desired
		if (active === syncedIsChatWindowOpenRef.current) {
			return;
		}

		// handles toggle chat window event
		if (settings.event?.rcbToggleChatWindow) {
			const event = await dispatchRcbEvent(
				RcbEvent.TOGGLE_CHAT_WINDOW,
				{
					currState: syncedIsChatWindowOpenRef.current,
					newState: !syncedIsChatWindowOpenRef.current
				}
			);
			if (event.defaultPrevented) {
				return;
			}
		}
		setSyncedIsChatWindowOpen(prev => {
			const newState = !prev;
			
			// if currently false means opening so set unread count to 0
			if (!prev) {
				setUnreadCount(0);
			}
			
			// Notify parent window about state change
			try {
				if (window.parent && window.parent !== window) {
					window.parent.postMessage(newState ? "chatOpened" : "chatClosed", "*");
					window.parent.postMessage(
						{ type: "rchat_widget_state", value: newState ? "open" : "closed" },
						"*"
					);
				}
			} catch (e) {
				console.warn("[Chat Window] Could not notify parent window:", e);
			}
			
			return newState;
		});
	}, [syncedIsChatWindowOpenRef]);

	/**
	 * Forces state for showing typing indicator.
	 * 
	 * @param active boolean indicating desired state (if not specified, just flips existing state)
	 */
	const toggleIsBotTyping = useCallback(async (active?: boolean) => {
		if (active === syncedIsBotTypingRef.current) {
			return
		}
		setSyncedIsBotTyping(prev => !prev);
	}, [syncedIsBotTypingRef])

	/**
	 * Helper function for custom scrolling.
	 */
	const easeInOutQuad = useCallback((t: number, b: number, c: number, d: number) => {
		t /= d / 2;
		if (t < 1) return c / 2 * t * t + b;
		t--;
		return -c / 2 * (t * (t - 2) - 1) + b;
	}, []);

	/**
     * Handles scrolling to the bottom of the chat window with specified duration.
	 * 
	 * @param duration time in milliseconds to get to bottom
     */
	const scrollToBottom = useCallback((duration: number = 0) => {
		if (!chatBodyRef.current) {
			return;
		}

		const end = chatBodyRef.current.scrollHeight - chatBodyRef.current.clientHeight;
		if (duration <= 0) {
			chatBodyRef.current.scrollTop = end;
			setSyncedIsScrolling(false);
			return;
		}

		const start = chatBodyRef.current.scrollTop;
		const change = end - start;
		const increment = 20;
		let currentTime = 0;
	
		const animateScroll = () => {
			if (!chatBodyRef.current) {
				return;
			}
			currentTime += increment;
			const val = easeInOutQuad(currentTime, start, change, duration);
			chatBodyRef.current.scrollTop = val;
			if (currentTime < duration) {
				requestAnimationFrame(animateScroll);
			} else {
				setSyncedIsScrolling(false);
			}
		}
		
		animateScroll();
	}, [chatBodyRef])

	return {
		isChatWindowOpen,
		setSyncedIsChatWindowOpen,
		toggleChatWindow,
		viewportHeight,
		setViewportHeight,
		viewportWidth,
		setViewportWidth,
		toggleIsBotTyping,
		scrollToBottom,
		getIsChatBotVisible,
	};
};
