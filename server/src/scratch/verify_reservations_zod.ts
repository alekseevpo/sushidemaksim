import {
    createReservationSchema,
    updateReservationSchema,
    getReservationsQuerySchema,
} from '../schemas/reservation.schema.js';

async function testSchema() {
    console.log('🧪 Testing createReservationSchema...');
    const validBody = {
        name: 'Ivan Petrov',
        email: 'ivan@example.com',
        phone: '600123456',
        date: '2026-05-20',
        time: '19:30',
        guests: 4,
        notes: 'Ventana por favor',
    };
    const result1 = createReservationSchema.safeParse({ body: validBody });
    if (result1.success) console.log('✅ Valid reservation body passed');
    else console.error('❌ Valid reservation body failed:', result1.error.format());

    const invalidBody = {
        name: 'A', // too short
        email: 'not-an-email',
        phone: '123', // too short
        date: '20-05-2026', // wrong format
        time: '9:30', // should be 09:30
        guests: 0, // too few
    };
    const result2 = createReservationSchema.safeParse({ body: invalidBody });
    if (!result2.success) console.log('✅ Invalid reservation body correctly caught');

    console.log('\n🧪 Testing guest count transformation...');
    const stringGuestsResult = createReservationSchema.safeParse({
        body: { ...validBody, guests: '8' },
    });
    if (stringGuestsResult.success && stringGuestsResult.data.body.guests === 8) {
        console.log('✅ String guest count correctly transformed to number');
    }

    console.log('\n🧪 Testing updateReservationSchema (Admin)...');
    const validUpdate = {
        status: 'confirmed',
        notes: 'Mesa 5 asignada',
    };
    const result3 = updateReservationSchema.safeParse({ params: { id: '123' }, body: validUpdate });
    if (result3.success) console.log('✅ Valid update body passed');

    console.log('\n🧪 Testing getReservationsQuerySchema filters...');
    const result4 = getReservationsQuerySchema.safeParse({
        query: { status: 'pending', date: '2026-05-20' },
    });
    if (result4.success) console.log('✅ Valid query filters passed');
}

testSchema();
