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
