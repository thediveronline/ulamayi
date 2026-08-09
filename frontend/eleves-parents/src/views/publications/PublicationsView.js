import { getPublicationsForCurrentUser } from '../../services/publication.service.js';
import { notify } from '../../components/notifications/notifications.js';
import { createElement } from '../../utils/dom.js';
import { getUserRole } from '../../utils/session.js';
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

  return thumb;
};

const buildRow = (item) => {
  const row = createElement({ tag: 'article', className: 'row', attrs: { style: 'align-items: flex-start; gap: 1rem; cursor: pointer; padding: var(--space-3) 0;' } });
  row.dataset.id = item.id;

  row.append(buildThumb(item));

  const body = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap: 0.25rem; flex: 1; min-width: 0;' } });
  body.append(
    createElement({ tag: 'h3', className: 'pub-card__title', text: item.titre || 'Sans titre' }),
    createElement({ tag: 'p', className: 'pub-card__desc', text: item.description || 'Sans description.' })
  );

  const meta = createElement({ tag: 'div', className: 'row', attrs: { style: 'gap: var(--space-2);' } });
  meta.append(createElement({ tag: 'span', className: 'badge badge-primary', text: item.niveau_scolaire || 'Tous niveaux' }));
  if (item.media_type === 'pdf') {
    meta.append(createElement({ tag: 'span', className: 'badge', text: 'PDF' }));
  }
  meta.append(createElement({ tag: 'span', className: `badge ${Number(item.prix) > 0 ? 'badge-primary' : 'badge-success'}`, text: formatPrice(item.prix) }));
  if (formatDate(item.cree_le)) {
    meta.append(createElement({ tag: 'span', className: 'subtle', text: formatDate(item.cree_le) }));
  }
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

const buildEmptyState = () => {
  const empty = createElement({ tag: 'div', className: 'empty-state' });
  const iconWrap = createElement({ tag: 'div', className: 'empty-state-icon' });
  iconWrap.append(createIcon('book', { size: 24 }));
  empty.append(
    iconWrap,
    createElement({ tag: 'h3', text: 'Aucune publication' }),
    createElement({ tag: 'p', className: 'muted', text: 'Aucune épreuve n\'est disponible pour le moment.' })
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
  const role = getUserRole();
  const page = createElement({ tag: 'section', className: 'page' });

  const header = createElement({ tag: 'div', className: 'page-header' });
  const headerLeft = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap: 0.25rem;' } });
  headerLeft.append(
    createElement({ tag: 'h1', className: 'page-title', text: 'Publications' }),
    createElement({ tag: 'p', className: 'page-subtitle', text: role === 'eleve' ? 'Les épreuves de ton niveau scolaire.' : 'Les épreuves disponibles, utiles pour le suivi de tes enfants.' })
  );
  header.append(headerLeft);
  page.append(header);

  const searchWrapper = createElement({ tag: 'div', className: 'input-with-icon' });
  const iconNode = createIcon('search', { size: 16, className: 'input-icon' });
  iconNode.classList.add('input-icon');
  const searchInput = createElement({ tag: 'input', className: 'input', attrs: { placeholder: 'Rechercher par titre, description ou niveau...', type: 'search' } });
  searchWrapper.append(iconNode, searchInput);
  page.append(searchWrapper);

  const list = createElement({ tag: 'div', className: 'stack' });
  list.append(createLoadingCard('Chargement des publications...'));
  page.append(list);

  let allItems = [];

  const renderList = (items) => {
    list.replaceChildren();
    if (!items.length) {
      list.append(buildEmptyState());
      return;
    }
    items.forEach((item, index) => {
      if (index > 0) {
        list.append(createElement({ tag: 'hr', className: 'divider' }));
      }
      list.append(buildRow(item));
    });
  };

  searchInput.addEventListener('input', (event) => {
    renderList(filterItems(allItems, event.target.value));
  });

  getPublicationsForCurrentUser()
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
