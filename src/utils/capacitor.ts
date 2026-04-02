import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * Utility for Capacitor native features with safety checks for web browser support.
 */
export const capacitorUtil = {
    /**
     * Trigger haptic feedback impact
     */
    async hapticsImpact(style: ImpactStyle = ImpactStyle.Light) {
        if (Capacitor.isNativePlatform()) {
            try {
                await Haptics.impact({ style });
            } catch (e) {
                console.warn('Haptics failed', e);
            }
        }
    },

    /**
     * Trigger selection change haptic feedback
     */
    async hapticsSelection() {
        if (Capacitor.isNativePlatform()) {
            try {
                await Haptics.selectionStart();
                await Haptics.selectionChanged();
            } catch (e) {
                console.warn('Haptics failed', e);
            }
        }
    },

    /**
     * Open native share sheet
     */
    async share(options: { title: string; text?: string; url: string; dialogueTitle?: string }) {
        if (Capacitor.isNativePlatform()) {
            try {
                const canShare = await Share.canShare();
                if (canShare.value) {
                    await Share.share(options);
                    return true;
                }
            } catch (e) {
                console.warn('Native share failed', e);
            }
        }
        return false; // Fallback to web share or custom logic
    },

    /**
     * Configure Status Bar
     */
    async setStatusBar(options: { style?: Style; backgroundColor?: string; overlay?: boolean }) {
        if (Capacitor.isNativePlatform()) {
            try {
                if (options.style !== undefined) {
                    await StatusBar.setStyle({ style: options.style });
                }
                if (options.backgroundColor) {
                    await StatusBar.setBackgroundColor({ color: options.backgroundColor });
                }
                if (options.overlay !== undefined) {
                    await StatusBar.setOverlaysWebView({ overlay: options.overlay });
                }
            } catch (e) {
                console.warn('StatusBar config failed', e);
            }
        }
    },
};
