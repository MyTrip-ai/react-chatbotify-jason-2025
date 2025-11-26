import { useState, useEffect } from 'react';
import { getOrCreateSessionId } from '../utils/sessionHelpers';

/**
 * Custom hook to manage session ID
 * @returns {string} Session ID
 */
export const useSessionManager = (): string => {
	const [sessionId, setSessionId] = useState('');

	useEffect(() => {
		const id = getOrCreateSessionId();
		setSessionId(id);
	}, []);

	return sessionId;
};
