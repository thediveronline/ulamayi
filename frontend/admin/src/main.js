import './styles/variables.css';
import './styles/base.css';
import { createApp } from './app/createApp.js';

createApp(document.querySelector('#app'));

// Reload automatique lors d'une mise a jour du service worker PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
    });
}
