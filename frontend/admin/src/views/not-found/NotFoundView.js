import { createIcon } from '../../components/icon/icon.js';

export const createNotFoundView = () => {
  const page = document.createElement('section');
  page.className = 'page';

  const card = document.createElement('div');
  card.className = 'card';
  card.style.cssText = 'text-align:center;padding:var(--space-7) var(--space-5);max-width:480px;margin:10vh auto';

  const iconWrap = document.createElement('div');
  iconWrap.style.cssText = 'display:grid;place-items:center;width:48px;height:48px;border-radius:var(--radius-md);background:var(--color-primary-soft);color:var(--color-text);margin:0 auto';
  iconWrap.append(createIcon('alert', { size: 28 }));
  card.append(iconWrap);

  const title = document.createElement('h2');
  title.textContent = 'Page introuvable';
  card.append(title);

  const desc = document.createElement('p');
  desc.className = 'page-subtitle';
  desc.textContent = 'La route demandée n\'existe pas.';
  card.append(desc);

  const btn = document.createElement('a');
  btn.className = 'btn btn-primary';
  btn.href = '#/';
  btn.textContent = 'Retour à l\'accueil';
  card.append(btn);

  page.append(card);

  return page;
};
