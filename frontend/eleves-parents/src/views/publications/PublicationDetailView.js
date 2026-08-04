import { getPublicationById } from '../../services/publication.service.js';
import { basculerFavori, posterCommentaire, getCommentaires, noterPublication, telechargerPublication } from '../../services/engagement.service.js';
import { createElement, createButton } from '../../utils/dom.js';
import { createLoadingCard } from '../../utils/loading.js';
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

const isGratuit = (prix) => {
  const value = Number(prix);
  return !value || Number.isNaN(value);
};

const buildMediaSection = (publication) => {
  if (!publication.media_url) return null;

  const gratuit = isGratuit(publication.prix);

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

    if (gratuit) {
      const open = createElement({ tag: 'a', text: 'Ouvrir le PDF dans un nouvel onglet', attrs: { href: publication.media_url, target: '_blank', rel: 'noopener noreferrer' } });
      wrapper.append(open);

      const download = createElement({ tag: 'a', text: 'Télécharger le PDF', attrs: { href: publication.media_url, download: `${publication.titre || 'document'}.pdf`, rel: 'noopener noreferrer' } });
      download.style.display = 'inline-block';
      download.style.marginTop = '0.5rem';
      wrapper.append(download);
    }
  } else {
    const img = document.createElement('img');
    img.src = urlAffichageImage(publication.media_url, { largeur: 1200 }) || publication.media_url;
    img.alt = publication.titre || 'Média';
    img.loading = 'lazy';
    box.append(img);
    wrapper.append(box);

    if (gratuit) {
      const open = createElement({ tag: 'a', text: 'Voir l\'image en pleine résolution', attrs: { href: publication.media_url, target: '_blank', rel: 'noopener noreferrer' } });
      wrapper.append(open);

      const download = createElement({ tag: 'a', text: 'Télécharger l\'image', attrs: { href: publication.media_url, download: `${publication.titre || 'image'}`, rel: 'noopener noreferrer' } });
      download.style.display = 'inline-block';
      download.style.marginTop = '0.5rem';
      wrapper.append(download);
    }
  }

  return wrapper;
};

const buildEngagementSection = (publicationId) => {
  const wrapper = createElement({ tag: 'section', className: 'stack-lg' });
  wrapper.append(createElement({ tag: 'hr', className: 'divider' }));
  wrapper.append(createElement({ tag: 'h2', text: 'Engagement' }));

  const actions = createElement({ tag: 'div', className: 'row' });

  const favoriBtn = createButton({ label: 'Favori', icon: 'heart', variant: 'secondary', size: 'sm' });
  favoriBtn.addEventListener('click', async () => {
    try {
      const result = await basculerFavori(publicationId);
      notify({ tone: 'success', message: result.message || 'Favori mis à jour.' });
    } catch (err) {
      notify({ tone: 'danger', message: err.message });
    }
  });
  actions.append(favoriBtn);

  const telechargerBtn = createButton({ label: 'Télécharger', icon: 'download', variant: 'secondary', size: 'sm' });
  telechargerBtn.addEventListener('click', async () => {
    try {
      const result = await telechargerPublication(publicationId);
      notify({ tone: 'success', message: result.message || 'Téléchargement enregistré.' });
    } catch (err) {
      notify({ tone: 'danger', message: err.message });
    }
  });
  actions.append(telechargerBtn);

  const noteContainer = createElement({ tag: 'div', className: 'row' });
  noteContainer.append(createElement({ tag: 'span', text: 'Noter : ' }));
  for (let i = 1; i <= 5; i++) {
    const star = createButton({ label: String(i), variant: 'ghost', size: 'sm' });
    star.style.minWidth = '32px';
    star.addEventListener('click', async () => {
      try {
        const result = await noterPublication(publicationId, i);
        notify({ tone: 'success', message: result.message || `Note de ${i}/5 enregistrée.` });
      } catch (err) {
        notify({ tone: 'danger', message: err.message });
      }
    });
    noteContainer.append(star);
  }
  actions.append(noteContainer);

  wrapper.append(actions);

  const commentairesCard = createElement({ tag: 'div', className: 'card stack' });
  commentairesCard.append(createElement({ tag: 'h3', text: 'Commentaires' }));

  const commentairesList = createElement({ tag: 'div', className: 'stack' });
  commentairesList.append(createLoadingCard('Chargement des commentaires...'));
  commentairesCard.append(commentairesList);

  getCommentaires(publicationId)
    .then((commentaires) => {
      commentairesList.replaceChildren();
      if (!commentaires || !commentaires.length) {
        commentairesList.append(createElement({ tag: 'p', className: 'muted', text: 'Aucun commentaire pour le moment.' }));
        return;
      }
      commentaires.forEach((c) => {
        const item = createElement({ tag: 'div', className: 'card-compact stack' });
        item.style.cssText = 'padding:var(--space-3);border:1px solid var(--color-border);border-radius:var(--radius-md)';

        const header = createElement({ tag: 'div', className: 'row-between' });
        const authorName = c.prenom_utilisateur || c.nom_utilisateur
          ? `${c.prenom_utilisateur || ''} ${c.nom_utilisateur || ''}`.trim()
          : 'Anonyme';
        const author = createElement({ tag: 'strong', text: authorName });
        header.append(author);

        item.append(header);
        item.append(createElement({ tag: 'p', text: c.contenu }));

        if (c.cree_le) {
          item.append(createElement({ tag: 'span', className: 'subtle', text: new Date(c.cree_le).toLocaleDateString('fr-FR') }));
        }

        commentairesList.append(item);
      });
    })
    .catch(() => {
      commentairesList.replaceChildren(createElement({ tag: 'p', className: 'muted', text: 'Impossible de charger les commentaires.' }));
    });

  const commentForm = document.createElement('form');
  commentForm.className = 'row';
  commentForm.style.cssText = 'display:flex;gap:var(--space-3)';

  const commentInput = document.createElement('input');
  commentInput.className = 'input';
  commentInput.type = 'text';
  commentInput.placeholder = 'Ajouter un commentaire...';
  commentInput.required = true;
  commentInput.style.flex = '1';
  commentForm.append(commentInput);

  const submitComment = createButton({ label: 'Commenter', variant: 'primary', size: 'sm' });
  submitComment.type = 'submit';
  commentForm.append(submitComment);

  commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const contenu = commentInput.value.trim();
    if (!contenu) return;

    submitComment.disabled = true;
    try {
      await posterCommentaire(publicationId, contenu);
      notify({ tone: 'success', message: 'Commentaire ajouté.' });
      commentInput.value = '';
    } catch (err) {
      notify({ tone: 'danger', message: err.message });
    } finally {
      submitComment.disabled = false;
    }
  });

  commentairesCard.append(commentForm);
  wrapper.append(commentairesCard);

  return wrapper;
};

export const createPublicationDetailView = (context = {}) => {
  const id = context?.params?.id;
  const page = createElement({ tag: 'section', className: 'page' });

  const backBtn = createButton({ label: 'Retour aux publications', icon: 'chevronLeft', variant: 'ghost', size: 'sm' });
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

      const engagementSection = buildEngagementSection(id);
      card.append(engagementSection);
    })
    .catch((error) => {
      card.replaceChildren(createAlert({ tone: 'danger', message: error.message }));
      notify({ tone: 'danger', message: error.message });
    });

  return page;
};
