import { config } from '../config.js';

async function verifyConfig() {
    console.log('🧪 Verifying Server Configuration...');
    try {
        console.log('✅ Config parsed successfully');
        console.log('📦 Port:', config.port);
        console.log('🔗 Supabase URL:', config.supabase.url);
        console.log('📧 Admin Email:', config.adminEmail);
    } catch (err: any) {
        console.error('❌ Config verification failed:', err.message);
        process.exit(1);
    }
}

verifyConfig();
