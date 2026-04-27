import { getChildren } from '../../services/parent.service.js';
import { notify } from '../../components/notifications/notifications.js';
import { createElement, createButton } from '../../utils/dom.js';
import { createLoadingCard } from '../../utils/loading.js';
import { createIcon } from '../../components/icon/icon.js';
import { createAlert } from '../../components/alert/alert.js';

const buildChildCard = (child) => {
  const card = createElement({ tag: 'article', className: 'card card-hover stack' });

  const top = createElement({ tag: 'div', className: 'row' });
  const avatar = createElement({ tag: 'div', className: 'empty-state-icon', attrs: { style: 'width: 44px; height: 44px;' } });
  avatar.append(createIcon('user', { size: 20 }));

  const info = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap: 0.125rem;' } });
  info.append(
    createElement({ tag: 'h3', text: `${child.prenom || ''} ${child.nom || ''}`.trim() || 'Élève' }),
    createElement({ tag: 'span', className: 'badge badge-primary', text: child.niveau_scolaire || 'Niveau non défini' })
  );

  top.append(avatar, info);
  card.append(top);

  const btn = createButton({ label: 'Voir le suivi', icon: 'chevronRight', iconPosition: 'right', variant: 'secondary', size: 'sm' });
  btn.addEventListener('click', () => {
    window.location.hash = `/enfants/${child.id}/suivi`;
  });
  card.append(btn);

  return card;
};

const buildEmpty = () => {
  const empty = createElement({ tag: 'div', className: 'empty-state' });
  const iconWrap = createElement({ tag: 'div', className: 'empty-state-icon' });
  iconWrap.append(createIcon('users', { size: 24 }));
  empty.append(
    iconWrap,
    createElement({ tag: 'h3', text: 'Aucun enfant lié' }),
    createElement({ tag: 'p', className: 'muted', text: 'Aucun élève n\'est associé à ton compte parent pour le moment.' })
  );
  return empty;
};

export const createChildrenView = () => {
  const page = createElement({ tag: 'section', className: 'page' });

  const header = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap: 0.25rem;' } });
  header.append(
    createElement({ tag: 'h1', className: 'page-title', text: 'Mes enfants' }),
    createElement({ tag: 'p', className: 'page-subtitle', text: 'Accède au suivi de chaque enfant lié à ton compte.' })
  );
  page.append(header);

  const list = createElement({ tag: 'div', className: 'grid-cards' });
  list.append(createLoadingCard('Chargement des enfants...'));
  page.append(list);

  getChildren()
    .then((children) => {
      list.replaceChildren();
      if (!children?.length) {
        list.append(buildEmpty());
        return;
      }
      children.forEach((child) => list.append(buildChildCard(child)));
    })
    .catch((error) => {
      list.replaceChildren(createAlert({ tone: 'danger', message: error.message }));
      notify({ tone: 'danger', message: error.message });
    });

  return page;
};
