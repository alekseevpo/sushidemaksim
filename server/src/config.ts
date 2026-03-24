import 'dotenv/config';

const DEFAULT_JWT_SECRET = 'sushi-de-maksim-secret-key-2024-CHANGE-IN-PRODUCTION';

const jwtSecret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
const nodeEnv = process.env.NODE_ENV || 'development';

if (nodeEnv === 'production' && jwtSecret === DEFAULT_JWT_SECRET) {
    console.warn(
        '⚠️ WARNING: JWT_SECRET should be set in production environment for better security.'
    );
}

export const config = {
    port: parseInt(process.env.PORT || '3001'),
    jwtSecret,
    jwtExpiresIn: '7d' as const,
    bcryptRounds: 10,
    corsOrigin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',')
        : [
              'http://localhost:5173',
              'https://sushidemaksim.vercel.app',
              'https://sushidemaksim.com',
          ],
    nodeEnv,
    isDev: nodeEnv === 'development',
    isProd: nodeEnv === 'production',
    smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        fromName: process.env.SMTP_FROM_NAME || 'Sushi de Maksim',
    },
    resendApiKey: process.env.RESEND_API_KEY || '',
    adminEmail: process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'alekseevpo@gmail.com',
    supabase: {
        url: process.env.SUPABASE_URL || '',
        key: process.env.SUPABASE_KEY || '',
    },
    frontendUrl: process.env.FRONTEND_URL || 'https://sushidemaksim.vercel.app',
};
