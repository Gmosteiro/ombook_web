import { useEffect } from 'react';
import { useRevalidator } from 'react-router';

/**
 * Hook to poll for new notifications from server
 * The actual SSE connection is handled server-side in the loader
 */
export function useNotificationPolling(isLoggedIn: boolean) {
    const revalidator = useRevalidator();

    useEffect(() => {
        if (!isLoggedIn) return;

        // Poll for new notifications every 30 seconds
        const interval = setInterval(() => {
            revalidator.revalidate();
        }, 30000);

        return () => clearInterval(interval);
    }, [isLoggedIn, revalidator]);
}
