import { createElement, createButton } from '../../utils/dom.js';
import { createIcon } from '../../components/icon/icon.js';

export const createNotFoundView = () => {
  const page = createElement({ tag: 'section', className: 'page' });
  const card = createElement({ tag: 'div', className: 'empty-state', attrs: { style: 'padding: 3rem 1.5rem;' } });

  const iconWrap = createElement({ tag: 'div', className: 'empty-state-icon' });
  iconWrap.append(createIcon('alert', { size: 24 }));

  const homeBtn = createButton({ label: 'Retour à l\'accueil', icon: 'home', variant: 'primary' });
  homeBtn.addEventListener('click', () => { window.location.hash = '/'; });

  card.append(
    iconWrap,
    createElement({ tag: 'h1', className: 'page-title', text: 'Page introuvable' }),
    createElement({ tag: 'p', className: 'muted', text: 'La page demandée n\'existe pas ou a été déplacée.' }),
    homeBtn
  );

  page.append(card);
  return page;
};
