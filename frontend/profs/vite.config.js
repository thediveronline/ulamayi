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
                name: 'Ulamayi - Enseignants',
                short_name: 'Ulamayi Profs',
                description: 'Gestion des publications et du profil enseignant',
                theme_color: '#2563eb',
                background_color: '#f5f7fb',
                display: 'standalone',
                start_url: '/',
                icons: [
                    { src: '/pwa-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
                ],
            },
        }),
    ],
});
