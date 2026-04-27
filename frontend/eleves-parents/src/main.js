import './styles/variables.css';
import './styles/base.css';
import { createApp } from './app/createApp.js';
import { createNotificationCenter } from './components/notifications/notifications.js';
import { initializeTheme } from './utils/theme.js';

const notificationCenter = createNotificationCenter();
document.body.append(notificationCenter.element);

initializeTheme();

createApp(document.querySelector('#app'));
