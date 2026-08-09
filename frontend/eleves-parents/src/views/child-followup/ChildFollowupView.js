import { getChildFollowup } from '../../services/parent.service.js';
import { notify } from '../../components/notifications/notifications.js';
import { createElement, createButton } from '../../utils/dom.js';
import { createLoadingCard } from '../../utils/loading.js';
import { createIcon } from '../../components/icon/icon.js';
import { createAlert } from '../../components/alert/alert.js';
import { urlVignette } from '../../utils/media.js';

const buildPubRow = (item) => {
  const row = createElement({ tag: 'article', className: 'row', attrs: { style: 'align-items: flex-start; gap: 1rem; cursor: pointer; padding: var(--space-3) 0;' } });

  const thumb = createElement({ tag: 'div', className: 'pub-card__thumb', attrs: { style: 'width: 120px; height: 80px; aspect-ratio: auto; flex-shrink: 0; border-radius: var(--radius-md);' } });
  const url = urlVignette(item, { largeur: 240, hauteur: 160 });
  if (url) {
    const img = document.createElement('img');
    img.src = url;
    img.alt = item.titre || 'Publication';
    img.loading = 'lazy';
    thumb.append(img);
  } else {
    thumb.classList.add('pub-card__thumb--placeholder');
    thumb.append(createIcon('book', { size: 24 }));
  }
  row.append(thumb);

  const body = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap: 0.25rem; flex: 1; min-width: 0;' } });
  body.append(
    createElement({ tag: 'h3', className: 'pub-card__title', text: item.titre || 'Sans titre' }),
    createElement({ tag: 'p', className: 'pub-card__desc', text: item.description || 'Sans description.' })
  );

  const meta = createElement({ tag: 'div', className: 'row', attrs: { style: 'gap: var(--space-2);' } });
  meta.append(createElement({ tag: 'span', className: 'badge badge-primary', text: item.niveau_scolaire || '-' }));
  if (item.media_type === 'pdf') {
    meta.append(createElement({ tag: 'span', className: 'badge', text: 'PDF' }));
  }
  const priceText = Number(item.prix) > 0 ? `${Number(item.prix).toLocaleString('fr-FR')} F` : 'Gratuit';
  meta.append(createElement({ tag: 'span', className: `badge ${Number(item.prix) > 0 ? 'badge-primary' : 'badge-success'}`, text: priceText }));
  body.append(meta);

  row.append(body);

  const chevron = createElement({ tag: 'div', attrs: { style: 'align-self: center; color: var(--color-text-subtle);' } });
  chevron.append(createIcon('chevronRight', { size: 18 }));
  row.append(chevron);

  row.addEventListener('click', () => {
    window.location.hash = `/publications/${item.id}`;
  });
  return row;
};

export const createChildFollowupView = (context = {}) => {
  const childId = context?.params?.id;
  const page = createElement({ tag: 'section', className: 'page' });

  const back = createButton({ label: 'Retour à mes enfants', icon: 'chevronLeft', variant: 'ghost', size: 'sm' });
  back.addEventListener('click', () => { window.location.hash = '/enfants'; });
  page.append(back);

  if (!childId) {
    page.append(createAlert({ tone: 'danger', message: 'Aucun enfant sélectionné.' }));
    return page;
  }

  const summary = createElement({ tag: 'div', className: 'stack' });
  summary.append(createLoadingCard('Chargement du suivi...'));
  page.append(summary);

  const pubsHeader = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap: 0.25rem;' } });
  pubsHeader.append(
    createElement({ tag: 'h2', text: 'Publications adaptées' }),
    createElement({ tag: 'p', className: 'muted', text: 'Les épreuves disponibles pour le niveau de cet enfant.' })
  );
  page.append(pubsHeader);

  const list = createElement({ tag: 'div', className: 'stack' });
  page.append(list);

  getChildFollowup(childId)
    .then(({ eleve, publications: items }) => {
      summary.replaceChildren();

      const top = createElement({ tag: 'div', className: 'row' });
      const avatar = createElement({ tag: 'div', className: 'empty-state-icon', attrs: { style: 'width: 56px; height: 56px;' } });
      avatar.append(createIcon('user', { size: 26 }));

      const info = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap: 0.125rem;' } });
      info.append(
        createElement({ tag: 'h1', className: 'page-title', text: `${eleve?.prenom || ''} ${eleve?.nom || ''}`.trim() || 'Élève' }),
        createElement({ tag: 'span', className: 'badge badge-primary', text: eleve?.niveau_scolaire || 'Niveau non défini' })
      );

      top.append(avatar, info);
      summary.append(top);

      list.replaceChildren();
      if (!items?.length) {
        const empty = createElement({ tag: 'div', className: 'empty-state' });
        const iconWrap = createElement({ tag: 'div', className: 'empty-state-icon' });
        iconWrap.append(createIcon('book', { size: 24 }));
        empty.append(
          iconWrap,
          createElement({ tag: 'h3', text: 'Aucune publication' }),
          createElement({ tag: 'p', className: 'muted', text: 'Aucune épreuve disponible pour le niveau de cet enfant.' })
        );
        list.append(empty);
        return;
      }

      items.forEach((item, index) => {
        if (index > 0) {
          list.append(createElement({ tag: 'hr', className: 'divider' }));
        }
        list.append(buildPubRow(item));
      });
    })
    .catch((error) => {
      summary.replaceChildren(createAlert({ tone: 'danger', message: error.message }));
      list.replaceChildren();
      notify({ tone: 'danger', message: error.message });
    });

  return page;
};
