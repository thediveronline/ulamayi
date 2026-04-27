import { createIcon } from '../icon/icon.js';

const ICONS = {
  info: 'info',
  success: 'check',
  warning: 'alert',
  danger: 'alert'
};

export const createAlert = ({ tone = 'info', message = '' }) => {
  const element = document.createElement('div');
  element.className = `alert alert-${tone}`;

  element.append(createIcon(ICONS[tone] || 'info', { size: 18 }));

  const text = document.createElement('span');
  text.textContent = message;
  element.append(text);

  return element;
};
