import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { tracker } from '../analytics/tracker';
import { useAuth } from './useAuth';

/**
 * Automatically tracks page views on every route change.
 */
export function usePageTracking() {
    const location = useLocation();
    const { user } = useAuth();

    useEffect(() => {
        tracker.track('page_view', {
            userId: user?.id,
            metadata: {
                title: document.title,
                referrer: document.referrer,
            },
        });
    }, [location.pathname, user?.id]);
}
