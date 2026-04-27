import { getChildFollowup } from '../../services/parent.service.js';
import { notify } from '../../components/notifications/notifications.js';
import { createElement, createButton } from '../../utils/dom.js';
import { createLoadingCard } from '../../utils/loading.js';
import { createIcon } from '../../components/icon/icon.js';
import { createAlert } from '../../components/alert/alert.js';
import { urlVignette } from '../../utils/media.js';

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

  const summary = createElement({ tag: 'div', className: 'card stack' });
  summary.append(createLoadingCard('Chargement du suivi...'));
  page.append(summary);

  const pubsHeader = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap: 0.25rem;' } });
  pubsHeader.append(
    createElement({ tag: 'h2', text: 'Publications adaptées' }),
    createElement({ tag: 'p', className: 'muted', text: 'Les épreuves disponibles pour le niveau de cet enfant.' })
  );
  page.append(pubsHeader);

  const list = createElement({ tag: 'div', className: 'grid-cards' });
  page.append(list);

  const buildPubCard = (item) => {
    const card = createElement({ tag: 'article', className: 'card card-hover pub-card', attrs: { style: 'cursor: pointer;' } });

    const thumb = createElement({ tag: 'div', className: 'pub-card__thumb' });
    const url = urlVignette(item, { largeur: 480, hauteur: 360 });
    if (url) {
      const img = document.createElement('img');
      img.src = url;
      img.alt = item.titre || 'Publication';
      img.loading = 'lazy';
      thumb.append(img);
    } else {
      thumb.classList.add('pub-card__thumb--placeholder');
      thumb.append(createIcon('book', { size: 36 }));
    }
    const badges = createElement({ tag: 'div', className: 'pub-card__badges' });
    badges.append(createElement({ tag: 'span', className: 'badge badge-primary', text: item.niveau_scolaire || '-' }));
    if (item.media_type === 'pdf') {
      badges.append(createElement({ tag: 'span', className: 'badge badge-info', text: 'PDF' }));
    }
    thumb.append(badges);
    const priceText = Number(item.prix) > 0 ? `${Number(item.prix).toLocaleString('fr-FR')} F` : 'Gratuit';
    thumb.append(createElement({ tag: 'span', className: `pub-card__price badge ${Number(item.prix) > 0 ? 'badge-accent' : 'badge-success'}`, text: priceText }));

    const body = createElement({ tag: 'div', className: 'pub-card__body' });
    body.append(
      createElement({ tag: 'h3', className: 'pub-card__title', text: item.titre || 'Sans titre' }),
      createElement({ tag: 'p', className: 'pub-card__desc', text: item.description || 'Sans description.' })
    );

    card.append(thumb, body);
    card.addEventListener('click', () => {
      window.location.hash = `/publications/${item.id}`;
    });
    return card;
  };

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

      items.forEach((item) => list.append(buildPubCard(item)));
    })
    .catch((error) => {
      summary.replaceChildren(createAlert({ tone: 'danger', message: error.message }));
      list.replaceChildren();
      notify({ tone: 'danger', message: error.message });
    });

  return page;
};
