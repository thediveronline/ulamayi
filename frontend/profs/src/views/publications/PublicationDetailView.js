import { getPublicationById, deletePublication } from '../../services/publication.service.js';
import { createElement, createButton } from '../../utils/dom.js';
import { createLoadingCard, setLoadingState } from '../../utils/loading.js';
import { createAlert } from '../../components/alert/alert.js';
import { createIcon } from '../../components/icon/icon.js';
import { notify } from '../../components/notifications/notifications.js';
import { urlAffichageImage } from '../../utils/media.js';

const formatPrice = (prix) => {
  const value = Number(prix);
  if (!value || Number.isNaN(value)) return 'Gratuit';
  return `${value.toLocaleString('fr-FR')} F`;
};

const formatDate = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return '';
  }
};

const buildMediaSection = (publication) => {
  if (!publication.media_url) return null;

  const wrapper = createElement({ tag: 'section', className: 'stack' });
  wrapper.append(createElement({ tag: 'h2', text: 'Média' }));

  const box = createElement({ tag: 'div', className: 'pub-media' });

  if (publication.media_type === 'pdf') {
    const iframe = document.createElement('iframe');
    iframe.src = publication.media_url;
    iframe.title = publication.titre || 'PDF';
    iframe.setAttribute('loading', 'lazy');
    box.append(iframe);

    wrapper.append(box);
    const open = createElement({ tag: 'a', text: 'Ouvrir le PDF dans un nouvel onglet', attrs: { href: publication.media_url, target: '_blank', rel: 'noopener noreferrer' } });
    wrapper.append(open);
  } else {
    const img = document.createElement('img');
    img.src = urlAffichageImage(publication.media_url, { largeur: 1200 }) || publication.media_url;
    img.alt = publication.titre || 'Média';
    img.loading = 'lazy';
    box.append(img);
    wrapper.append(box);

    const open = createElement({ tag: 'a', text: 'Voir l\'image en pleine résolution', attrs: { href: publication.media_url, target: '_blank', rel: 'noopener noreferrer' } });
    wrapper.append(open);
  }

  return wrapper;
};

export const createPublicationDetailView = (context = {}) => {
  const id = context?.params?.id;
  const page = createElement({ tag: 'section', className: 'page' });

  const backBtn = createButton({ label: 'Retour', icon: 'chevronLeft', variant: 'ghost', size: 'sm' });
  backBtn.addEventListener('click', () => { window.location.hash = '/publications'; });
  page.append(backBtn);

  if (!id) {
    page.append(createAlert({ tone: 'danger', message: 'Identifiant de publication manquant.' }));
    return page;
  }

  const card = createElement({ tag: 'article', className: 'card stack-lg' });
  card.append(createLoadingCard('Chargement de la publication...'));
  page.append(card);

  getPublicationById(id)
    .then((publication) => {
      card.replaceChildren();

      const header = createElement({ tag: 'div', className: 'stack' });

      const badges = createElement({ tag: 'div', className: 'row' });
      badges.append(createElement({ tag: 'span', className: 'badge badge-primary', text: publication.niveau_scolaire || 'Tous niveaux' }));
      if (Number(publication.prix) > 0) {
        badges.append(createElement({ tag: 'span', className: 'badge badge-accent', text: formatPrice(publication.prix) }));
      } else {
        badges.append(createElement({ tag: 'span', className: 'badge badge-success', text: 'Gratuit' }));
      }
      if (publication.media_type === 'pdf') {
        badges.append(createElement({ tag: 'span', className: 'badge badge-info', text: 'PDF' }));
      }
      const dateText = formatDate(publication.cree_le);
      if (dateText) {
        const dateBadge = createElement({ tag: 'span', className: 'badge' });
        dateBadge.append(createIcon('calendar', { size: 12 }));
        dateBadge.append(document.createTextNode(dateText));
        badges.append(dateBadge);
      }

      header.append(
        badges,
        createElement({ tag: 'h1', className: 'page-title', text: publication.titre || 'Sans titre' }),
        createElement({ tag: 'p', className: 'page-subtitle', text: publication.description || 'Sans description.' })
      );

      const actions = createElement({ tag: 'div', className: 'row' });
      const editBtn = createButton({ label: 'Modifier', icon: 'edit', variant: 'secondary' });
      editBtn.addEventListener('click', () => { window.location.hash = `/publications/${id}/modifier`; });

      const deleteBtn = createButton({ label: 'Supprimer', icon: 'trash', variant: 'danger' });
      deleteBtn.addEventListener('click', async () => {
        const confirmed = window.confirm('Supprimer définitivement cette publication ?');
        if (!confirmed) return;

        setLoadingState({ button: deleteBtn, isLoading: true, idleLabel: 'Supprimer' });
        try {
          await deletePublication(id);
          notify({ tone: 'success', message: 'Publication supprimée.' });
          window.location.hash = '/publications';
        } catch (error) {
          notify({ tone: 'danger', message: error.message });
          setLoadingState({ button: deleteBtn, isLoading: false, idleLabel: 'Supprimer' });
        }
      });

      actions.append(editBtn, deleteBtn);
      header.append(actions);

      card.append(header);
      card.append(createElement({ tag: 'hr', className: 'divider' }));

      const mediaSection = buildMediaSection(publication);
      if (mediaSection) {
        card.append(mediaSection);
        card.append(createElement({ tag: 'hr', className: 'divider' }));
      }

      const contentSection = createElement({ tag: 'section', className: 'stack' });
      contentSection.append(createElement({ tag: 'h2', text: 'Contenu' }));

      const contentBody = createElement({ tag: 'div', attrs: { style: 'white-space: pre-wrap; line-height: 1.6;' } });
      contentBody.textContent = publication.contenu || 'Aucun contenu détaillé fourni.';
      contentSection.append(contentBody);

      card.append(contentSection);
    })
    .catch((error) => {
      card.replaceChildren(createAlert({ tone: 'danger', message: error.message }));
      notify({ tone: 'danger', message: error.message });
    });

  return page;
};
