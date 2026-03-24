import nodemailer from 'nodemailer';
import { config } from './config.js';

async function verifySmtp() {
    console.log('--- Verifying SMTP ---');
    console.log('Host:', config.smtp.host);
    console.log('User:', config.smtp.user);

    const transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: false,
        auth: {
            user: config.smtp.user,
            pass: config.smtp.pass,
        },
    });

    try {
        await transporter.verify();
        console.log('✅ SMTP Connection Success!');
    } catch (err: any) {
        console.error('❌ SMTP Connection Failed:', err.message || err);
    }
}

verifySmtp();
