/**
 * Utility to trigger haptic feedback on mobile devices.
 * Uses the Web Vibration API.
 */

export const HAPTIC_PATTERNS = {
    LIGHT: 10,
    MEDIUM: 20,
    HEAVY: 40,
    SUCCESS: [10, 50, 10],
    ERROR: [50, 30, 50, 30, 50],
    NOTIFICATION: [20, 100, 20],
};

export function triggerHaptic(pattern: number | number[] = HAPTIC_PATTERNS.LIGHT) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
            navigator.vibrate(pattern);
        } catch (err) {
            // Silently ignore if browser restricts vibration
            console.debug('Haptic feedback blocked or not supported');
        }
    }
}
