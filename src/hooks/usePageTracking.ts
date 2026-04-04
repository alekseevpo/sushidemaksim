import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { tracker } from '../analytics/tracker';
import { useAuth } from './useAuth';

/**
 * Automatically tracks page views on every route change.
 */
export function usePageTracking() {
    const location = useLocation();
    const lastTrackedRef = useRef<{ path: string; userId?: string } | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const currentPath = location.pathname + location.search;

        // Prevent double tracking if same path and same user (or both undefined)
        if (
            lastTrackedRef.current?.path === currentPath &&
            lastTrackedRef.current?.userId === user?.id
        ) {
            return;
        }

        tracker.track('page_view', {
            userId: user?.id,
            metadata: {
                title: document.title,
                referrer: document.referrer,
                path: location.pathname,
                search: location.search,
            },
        });

        lastTrackedRef.current = {
            path: currentPath,
            userId: user?.id,
        };
    }, [location.pathname, location.search, user?.id]);
}
