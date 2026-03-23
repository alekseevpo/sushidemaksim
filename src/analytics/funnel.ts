import { api } from '../utils/api';

/**
 * Steps for the checkout funnel.
 */
export type FunnelStep =
    | 'cart_view' // Viewing the cart page
    | 'checkout_start' // Clicking "Realizar Pedido"
    | 'delivery_info_filled' // Address/House/Apartment filled
    | 'payment_method_selected' // Payment method selected
    | 'order_placed'; // Order successfully created

/**
 * Service for tracking user progress through the checkout funnel.
 * Uses a persistent sessionId in sessionStorage to link events.
 */
class FunnelService {
    private sessionId: string;
    private sentSteps: Set<string> = new Set();

    constructor() {
        // Look for existing session or generate a new one
        let sid = sessionStorage.getItem('funnel_session_id');
        if (!sid) {
            sid = crypto.randomUUID();
            sessionStorage.setItem('funnel_session_id', sid);
        }
        this.sessionId = sid;
    }

    /**
     * Send a funnel step event to the backend.
     */
    async trackStep(
        step: FunnelStep,
        data: {
            totalValue?: number;
            itemsCount?: number;
            userId?: string | number | null;
            metadata?: Record<string, any>;
        } = {}
    ) {
        // Prevent duplicate tracking of the same step if nothing significant changed
        const cacheKey = `${step}_${data.totalValue}_${data.itemsCount}`;
        if (this.sentSteps.has(cacheKey)) return;

        try {
            // Avoid blocking the UI for analytics
            api.post('/analytics/funnel', {
                sessionId: this.sessionId,
                step,
                totalValue: data.totalValue,
                itemsCount: data.itemsCount,
                userId: data.userId,
                metadata: {
                    ...data.metadata,
                    timestamp: new Date().toISOString(),
                    path: window.location.pathname,
                },
            })
                .then(() => {
                    this.sentSteps.add(cacheKey);
                })
                .catch(err => {
                    // Silently ignore errors from analytics to not break user experience
                    console.warn('Analytics tracking failed:', err);
                });
        } catch (err) {
            // Should not happen as catch is above, but just in case
            console.warn('Analytics tracker exception:', err);
        }
    }

    /**
     * Resets the session (call after successful order to start fresh)
     */
    resetSession() {
        this.sessionId = crypto.randomUUID();
        sessionStorage.setItem('funnel_session_id', this.sessionId);
        this.sentSteps.clear();
    }
}

export const funnelTracker = new FunnelService();
