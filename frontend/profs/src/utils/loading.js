import { createIcon } from '../components/icon/icon.js';

export const setLoadingState = ({ button, isLoading, idleLabel, loadingLabel = 'Chargement...' }) => {
  if (!button) {
    return;
  }

  button.disabled = isLoading;

  const labelNode = button.querySelector('[data-btn-label]');
  if (labelNode) {
    labelNode.textContent = isLoading ? loadingLabel : idleLabel;
  } else {
    button.textContent = isLoading ? loadingLabel : idleLabel;
  }
};

export const createEmptyState = ({ icon = 'book', title = 'Aucune donnée', description = '', action } = {}) => {
  const container = document.createElement('div');
  container.className = 'empty-state';

  const iconContainer = document.createElement('div');
  iconContainer.className = 'empty-state-icon';
  iconContainer.append(createIcon(icon, { size: 24 }));
  container.append(iconContainer);

  const heading = document.createElement('h3');
  heading.textContent = title;
  container.append(heading);

  if (description) {
    const desc = document.createElement('p');
    desc.textContent = description;
    container.append(desc);
  }

  if (action) {
    container.append(action);
  }

  return container;
};

export const createLoadingCard = (message = 'Chargement...') => {
  const element = document.createElement('div');
  element.className = 'loading-card';

  const spinner = document.createElement('span');
  spinner.className = 'spinner';

  const text = document.createElement('span');
  text.textContent = message;

  element.append(spinner, text);
  return element;
};
