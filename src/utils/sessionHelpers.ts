import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique session ID
 * @returns {string} Session ID with timestamp and UUID
 */
export const generateSessionId = (): string => {
	const randomUUID = uuidv4();
	const timestamp = Date.now();
	return `session_${timestamp}_${randomUUID}`;
};

/**
 * Gets or creates a session ID from localStorage
 * @returns {string} Session ID
 */
export const getOrCreateSessionId = (): string => {
	const existingSessionId = localStorage.getItem('sessionId');
	if (existingSessionId) {
		console.log('📋 Using existing session:', existingSessionId);
		return existingSessionId;
	}
	
	const newSessionId = generateSessionId();
	localStorage.setItem('sessionId', newSessionId);
	console.log('🆕 Created new session:', newSessionId);
	return newSessionId;
};

/**
 * Clears the current session and generates a new one
 * @returns {string} New session ID
 */
export const resetSession = (): string => {
	localStorage.removeItem('sessionId');
	const newSessionId = generateSessionId();
	localStorage.setItem('sessionId', newSessionId);
	console.log('🔄 Reset session:', newSessionId);
	return newSessionId;
};
