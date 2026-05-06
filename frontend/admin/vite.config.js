import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
                maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
            },
            manifest: {
                name: 'Ulamayi - Administration',
                short_name: 'Ulamayi Admin',
                description: 'Tableau de bord administrateur Ulamayi',
                theme_color: '#1d4ed8',
                background_color: '#f3f6fb',
                display: 'standalone',
                start_url: '/',
                icons: [
                    { src: '/pwa-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
                ],
            },
        }),
    ],
});
