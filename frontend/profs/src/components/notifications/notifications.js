import { createIcon } from '../icon/icon.js';

const ICONS = {
  info: 'info',
  success: 'check',
  warning: 'alert',
  danger: 'alert'
};

const listeners = [];

export const notify = ({ tone = 'info', message = '', duration = 4000 }) => {
  listeners.forEach((listener) => listener({
    tone,
    message,
    duration,
    id: `${Date.now()}-${Math.random()}`
  }));
};

export const createNotificationCenter = () => {
  const element = document.createElement('div');
  element.className = 'notification-center';

  const pushNotification = ({ tone, message, duration, id }) => {
    const item = document.createElement('div');
    item.className = `notification notification--${tone}`;
    item.dataset.id = id;

    item.append(createIcon(ICONS[tone] || 'info', { size: 18 }));

    const text = document.createElement('span');
    text.textContent = message;
    item.append(text);

    element.append(item);

    window.setTimeout(() => {
      item.remove();
    }, duration);
  };

  listeners.push(pushNotification);

  return { element };
};
