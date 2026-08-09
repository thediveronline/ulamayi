import './styles/variables.css';
import './styles/base.css';
import { createApp } from './app/createApp.js';
import { createNotificationCenter } from './components/notifications/notifications.js';

const notifCenter = createNotificationCenter();
document.body.append(notifCenter.element);

createApp(document.querySelector('#app'));

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
    });
}
