/**
 * HTML Button Actions Registry
 * 
 * This module provides a registry of functions that can be called from HTML onclick attributes.
 * Since <script> tags don't execute in React-rendered HTML, we need to pre-define functions
 * that can be called from inline event handlers.
 */

/**
 * Registry of available actions that can be called from HTML buttons
 */
export const htmlButtonActions: Record<string, (...args: any[]) => void> = {
	/**
	 * Opens the documents popup in the parent window
	 * Sends postMessage to trigger the existing OPEN_DOCUMENTS_POPUP listener
	 */
	openDocumentsPopup: () => {
		console.log("openDocumentsPopup called from HTML button");

		// Check if we're in an iframe
		if (window.self === window.parent) {
			console.warn('Not in an iframe - cannot send message to parent');
			return;
		}

		// Send postMessage to parent window
		try {
			window.parent.postMessage({
				type: 'OPEN_DOCUMENTS_POPUP'
			}, '*'); // In production, specify target origin
			
			console.log('✅ Sent OPEN_DOCUMENTS_POPUP message to parent');
		} catch (error) {
			console.error('❌ Error sending message to parent:', error);
		}
	},

	/**
	 * Show alert (for testing)
	 */
	showAlert: (message: string) => {
		alert(message || 'Button clicked!');
	},
};

/**
 * Makes the action registry available globally so inline onclick handlers can access it
 */
export const registerGlobalActions = () => {
	// Attach to window object so inline onclick can access it
	(window as any).chatbotActions = htmlButtonActions;
	console.log('[htmlButtonActions] Global actions registered');
};

/**
 * Helper to check if an action exists
 */
export const hasAction = (actionName: string): boolean => {
	return actionName in htmlButtonActions;
};

/**
 * Helper to call an action safely
 */
export const callAction = (actionName: string, ...args: any[]): void => {
	if (hasAction(actionName)) {
		try {
			htmlButtonActions[actionName](...args);
		} catch (error) {
			console.error(`[htmlButtonActions] Error calling action "${actionName}":`, error);
		}
	} else {
		console.error(`[htmlButtonActions] Action "${actionName}" not found`);
	}
};
