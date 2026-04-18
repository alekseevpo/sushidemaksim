/**
 * Centralized utility for page reloads with infinite loop protection.
 * Especially useful during DNS propagation or PWA updates.
 */
export const safeReload = (reason: string) => {
    const NOW = Date.now();
    const STORAGE_KEY = 'sushi_reload_tracker';
    const MAX_RETRIES = 3;
    const TIME_WINDOW = 60000; // 1 minute

    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        const tracker = raw ? JSON.parse(raw) : { count: 0, lastReload: 0 };

        // If the last reload was a long time ago, reset the counter
        if (NOW - tracker.lastReload > TIME_WINDOW) {
            tracker.count = 0;
        }

        if (tracker.count >= MAX_RETRIES) {
            console.error(
                `[SafeReload] Multiple reload attempts detected (${tracker.count}). Aborting reload to prevent infinite loop.`,
                { reason, lastReload: new Date(tracker.lastReload).toISOString() }
            );
            return false;
        }

        // Update tracker and save
        tracker.count += 1;
        tracker.lastReload = NOW;
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tracker));

        console.warn(
            `[SafeReload] Reloading page. Reason: ${reason} (Attempt ${tracker.count}/${MAX_RETRIES})`
        );
        // Execute reload
        window.location.reload();
        return true;
    } catch (e) {
        // Fallback if sessionStorage fails
        console.error('[SafeReload] Failed to access sessionStorage, performing default reload', e);
        window.location.reload();
        return true;
    }
};
