import {
    validatePromoSchema,
    createPromoSchema,
    updatePromoSchema,
} from '../schemas/promo.schema.js';

async function testSchema() {
    console.log('🧪 Testing validatePromoSchema normalization...');
    const result1 = validatePromoSchema.safeParse({
        body: { code: ' test-code ', subtotal: 50.5 },
    });
    if (result1.success) {
        console.log('✅ Validation passed. Transformed code:', result1.data.body.code);
        // Expect: 'TEST-CODE'
    } else {
        console.error('❌ Validation failed:', result1.error.format());
    }

    console.log('\n🧪 Testing createPromoSchema (Admin Campaign)...');
    const validPromo = {
        title: 'Sushi Day',
        description: '20% extra discount',
        discount: 20,
        valid_until: '2026-12-31',
        is_active: true,
        bg: '#000000',
    };
    const result2 = createPromoSchema.safeParse({ body: validPromo });
    if (result2.success) console.log('✅ Valid promo campaign passed');

    const invalidPromo = {
        title: '', // empty
        discount: 150, // too much
    };
    const result3 = createPromoSchema.safeParse({ body: invalidPromo });
    if (!result3.success) console.log('✅ Invalid promo campaign correctly caught');

    console.log('\n🧪 Testing updatePromoSchema partiality...');
    const result4 = updatePromoSchema.safeParse({ params: { id: '456' }, body: { discount: 25 } });
    if (result4.success) console.log('✅ Partial update passed');
}

testSchema();
