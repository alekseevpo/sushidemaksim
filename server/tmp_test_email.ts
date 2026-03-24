import { sendReservationEmail } from './src/utils/email';

const testData = {
    name: 'Pavel Test',
    email: 'alekseevpo@gmail.com',
    phone: '624682795',
    guests: 2,
    reservation_date: '2026-03-25',
    reservation_time: '21:30',
    notes: 'Test from script',
};

console.log('Testing email send to:', testData.email);
sendReservationEmail(testData)
    .then(() => console.log('Successfully sent customer email'))
    .catch(err => console.error('Failed to send customer email:', err));

sendReservationEmail(testData, true)
    .then(() => console.log('Successfully sent admin email'))
    .catch(err => console.error('Failed to send admin email:', err));
