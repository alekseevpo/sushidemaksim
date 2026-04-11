import { subscribeSchema } from '../schemas/newsletter.schema.js';
import { trackEventSchema, waiterOrderSchema } from '../schemas/analytics.schema.js';
import { addToCartSchema, updateCartItemSchema, bulkCartSchema } from '../schemas/cart.schema.js';

async function testPhase8() {
    console.log('🧪 Testing Newsletter Schema...');
    const newsResult = subscribeSchema.safeParse({ body: { email: ' TEST@EXAMPLE.COM  ' } });
    if (newsResult.success) {
        console.log('✅ Newsletter normalization passed:', newsResult.data.body.email);
    } else {
        console.error('❌ Newsletter schema failed:', newsResult.error.format());
    }

    console.log('\n🧪 Testing Analytics (Track Event) Schema...');
    const trackResult = trackEventSchema.safeParse({
        body: {
            eventName: 'page_view',
            sessionId: 'sess-123',
            userId: '00000000-0000-0000-0000-000000000000',
        },
    });
    if (trackResult.success) console.log('✅ Analytics track passed');

    console.log('\n🧪 Testing Analytics (Waiter Order) Schema...');
    const waiterResult = waiterOrderSchema.safeParse({
        body: {
            items: [{ id: 1, name: 'Sushi', quantity: 2, price: 10 }],
            totalValue: 20,
            itemsCount: 2,
            metadata: { table: '5' },
        },
    });
    if (waiterResult.success) console.log('✅ Waiter order schema passed');

    console.log('\n🧪 Testing Cart (Add) Schema...');
    const cartAddResult = addToCartSchema.safeParse({ body: { menuItemId: 45, quantity: 2 } });
    if (cartAddResult.success) console.log('✅ Cart add schema passed');

    console.log('\n🧪 Testing Cart (Update) Schema...');
    const cartUpdateResult = updateCartItemSchema.safeParse({
        params: { itemId: '123' },
        body: { quantity: 5 },
    });
    if (cartUpdateResult.success) console.log('✅ Cart update schema passed');

    console.log('\n🧪 Testing Cart (Bulk Sync) Schema...');
    const bulkResult = bulkCartSchema.safeParse({
        body: {
            items: [
                { id: '10', quantity: '2' },
                { menuItemId: 20, quantity: 1 },
            ],
        },
    });
    if (bulkResult.success) console.log('✅ Bulk cart schema passed');
}

testPhase8();
