import { createIcon } from '../components/icon/icon.js';

export const createLoadingCard = (message = 'Chargement en cours...') => {
  const card = document.createElement('div');
  card.className = 'loading-card';

  const spinner = document.createElement('div');
  spinner.className = 'spinner';
  card.append(spinner);

  const text = document.createElement('span');
  text.textContent = message;
  card.append(text);

  return card;
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
