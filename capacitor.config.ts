import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.sushidemaksim.app',
    appName: 'Sushi de Maksim',
    webDir: 'dist',
    server: {
        androidScheme: 'https',
        cleartext: true,
        allowNavigation: ['192.168.1.133', 'sushidemaksim.vercel.app'],
    },
};

export default config;
