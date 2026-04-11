import { updateSettingsSchema } from '../schemas/settings.schema.js';
import {
    createDeliveryZoneSchema,
    addressSearchQuerySchema,
    reverseGeocodeQuerySchema,
} from '../schemas/deliveryZone.schema.js';

async function testSchema() {
    console.log('🧪 Testing updateSettingsSchema...');
    const result1 = updateSettingsSchema.safeParse({
        body: { siteName: 'Sushi de Maksim', minOrder: 20 },
    });
    if (result1.success) console.log('✅ Settings valid body passed');

    const result2 = updateSettingsSchema.safeParse({ body: {} });
    if (!result2.success) console.log('✅ Empty settings correctly caught');

    console.log('\n🧪 Testing createDeliveryZoneSchema...');
    const validZone = {
        name: 'Zona 1',
        cost: 5,
        minOrder: 15,
        coordinates: [
            [40.4168, -3.7038],
            [40.417, -3.704],
        ],
        type: 'polygon',
    };
    const result3 = createDeliveryZoneSchema.safeParse({ body: validZone });
    if (result3.success) console.log('✅ Valid zone passed');
    else console.error('❌ Valid zone failed:', result3.error.format());

    console.log('\n🧪 Testing addressSearchQuerySchema...');
    const result4 = addressSearchQuerySchema.safeParse({ query: { q: 'Calle Mayor' } });
    if (result4.success) console.log('✅ Valid search passed');

    console.log('\n🧪 Testing reverseGeocodeQuerySchema transformations...');
    const result5 = reverseGeocodeQuerySchema.safeParse({
        query: { lat: '40.4168', lon: '-3.7038' },
    });
    if (result5.success) {
        console.log('✅ Reverse geocode passed. Transformed values:', result5.data.query);
        // Expect: { lat: 40.4168, lon: -3.7038 }
    } else {
        console.error('❌ Reverse geocode failed:', result5.error.format());
    }
}

testSchema();
