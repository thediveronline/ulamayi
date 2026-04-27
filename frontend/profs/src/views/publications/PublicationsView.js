import { getMyPublications } from '../../services/teacher.service.js';
import { notify } from '../../components/notifications/notifications.js';
import { createElement, createButton } from '../../utils/dom.js';
import { createLoadingCard } from '../../utils/loading.js';
import { createIcon } from '../../components/icon/icon.js';
import { createAlert } from '../../components/alert/alert.js';
import { urlVignette } from '../../utils/media.js';

const formatPrice = (prix) => {
  const value = Number(prix);
  if (!value || Number.isNaN(value)) return 'Gratuit';
  return `${value.toLocaleString('fr-FR')} F`;
};

const formatDate = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
};

const buildThumb = (item) => {
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
  badges.append(createElement({ tag: 'span', className: 'badge badge-primary', text: item.niveau_scolaire || 'Tous niveaux' }));
  if (item.media_type === 'pdf') {
    badges.append(createElement({ tag: 'span', className: 'badge badge-info', text: 'PDF' }));
  }
  thumb.append(badges);

  const price = createElement({ tag: 'span', className: `pub-card__price badge ${Number(item.prix) > 0 ? 'badge-accent' : 'badge-success'}`, text: formatPrice(item.prix) });
  thumb.append(price);

  return thumb;
};

const buildCard = (item) => {
  const card = createElement({ tag: 'article', className: 'card card-hover pub-card', attrs: { style: 'cursor: pointer;' } });
  card.dataset.id = item.id;

  card.append(buildThumb(item));

  const body = createElement({ tag: 'div', className: 'pub-card__body' });
  body.append(
    createElement({ tag: 'h3', className: 'pub-card__title', text: item.titre || 'Sans titre' }),
    createElement({ tag: 'p', className: 'pub-card__desc', text: item.description || 'Sans description.' })
  );

  const meta = createElement({ tag: 'div', className: 'pub-card__meta' });
  const date = createElement({ tag: 'span', className: 'row', attrs: { style: 'gap: 0.3rem;' } });
  date.append(createIcon('calendar', { size: 12 }));
  date.append(document.createTextNode(formatDate(item.cree_le) || '—'));
  const cta = createElement({ tag: 'span', attrs: { style: 'color: var(--color-primary); font-weight: 600;' } });
  cta.append(document.createTextNode('Voir '));
  cta.append(createIcon('chevronRight', { size: 14 }));
  meta.append(date, cta);

  body.append(meta);
  card.append(body);

  card.addEventListener('click', () => {
    window.location.hash = `/publications/${item.id}`;
  });
  return card;
};

const buildEmptyState = () => {
  const empty = createElement({ tag: 'div', className: 'empty-state' });
  const iconWrap = createElement({ tag: 'div', className: 'empty-state-icon' });
  iconWrap.append(createIcon('book', { size: 24 }));
  const cta = createButton({ label: 'Créer ma première publication', icon: 'plus', variant: 'primary' });
  cta.addEventListener('click', () => { window.location.hash = '/publications/nouvelle'; });
  empty.append(
    iconWrap,
    createElement({ tag: 'h3', text: 'Aucune publication' }),
    createElement({ tag: 'p', className: 'muted', text: 'Tu n\'as encore rien publié.' }),
    cta
  );
  return empty;
};

const filterItems = (items, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => {
    return [item.titre, item.description, item.niveau_scolaire]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(q));
  });
};

export const createPublicationsView = () => {
  const page = createElement({ tag: 'section', className: 'page' });

  const header = createElement({ tag: 'div', className: 'page-header' });
  const headerLeft = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap: 0.25rem;' } });
  headerLeft.append(
    createElement({ tag: 'h1', className: 'page-title', text: 'Mes publications' }),
    createElement({ tag: 'p', className: 'page-subtitle', text: 'Liste des épreuves et exercices que tu as publiés.' })
  );
  header.append(headerLeft);

  const newBtn = createButton({ label: 'Nouvelle publication', icon: 'plus', variant: 'primary' });
  newBtn.addEventListener('click', () => { window.location.hash = '/publications/nouvelle'; });
  header.append(newBtn);

  page.append(header);

  const searchWrapper = createElement({ tag: 'div', className: 'input-with-icon' });
  const iconNode = createIcon('search', { size: 16, className: 'input-icon' });
  iconNode.classList.add('input-icon');
  const searchInput = createElement({ tag: 'input', className: 'input', attrs: { placeholder: 'Rechercher par titre, description ou niveau...', type: 'search' } });
  searchWrapper.append(iconNode, searchInput);
  page.append(searchWrapper);

  const list = createElement({ tag: 'div', className: 'grid-cards' });
  list.append(createLoadingCard('Chargement de tes publications...'));
  page.append(list);

  let allItems = [];

  const renderList = (items) => {
    list.replaceChildren();
    if (!items.length) {
      list.append(buildEmptyState());
      return;
    }
    items.forEach((item) => list.append(buildCard(item)));
  };

  searchInput.addEventListener('input', (event) => {
    renderList(filterItems(allItems, event.target.value));
  });

  getMyPublications()
    .then((items) => {
      allItems = Array.isArray(items) ? items : [];
      renderList(allItems);
    })
    .catch((error) => {
      list.replaceChildren(createAlert({ tone: 'danger', message: error.message }));
      notify({ tone: 'danger', message: error.message });
    });

  return page;
};
