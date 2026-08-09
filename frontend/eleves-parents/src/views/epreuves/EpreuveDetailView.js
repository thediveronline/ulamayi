import { getEpreuveById, deleteEpreuve } from '../../services/epreuve.service.js';
import { createIcon } from '../../components/icon/icon.js';
import { notify } from '../../components/notifications/notifications.js';
import { createLoadingCard } from '../../utils/loading.js';
import { createElement } from '../../utils/dom.js';
import { getSession } from '../../utils/session.js';
import { urlAffichageImage } from '../../utils/media.js';

export const createEpreuveDetailView = (params) => {
  const page = createElement({ tag: 'section', className: 'page' });

  const loadingCard = createLoadingCard('Chargement de l\'épreuve...');
  page.append(loadingCard);

  const epreuveId = params?.id;

  getEpreuveById(epreuveId)
    .then((epreuve) => {
      page.replaceChildren();

      const backLink = createElement({ tag: 'a', className: 'btn btn-ghost', attrs: { href: '#/epreuves' } });
      backLink.append(createIcon('chevronLeft', { size: 18 }));
      backLink.append(createElement({ tag: 'span', text: ' Retour aux épreuves' }));
      page.append(backLink);

      const header = createElement({ tag: 'div', className: 'page-header' });

      const titleWrap = createElement({ tag: 'div', className: 'stack' });
      titleWrap.append(createElement({ tag: 'h1', className: 'page-title', text: epreuve.titre || 'Sans titre' }));

      if (epreuve.niveau_scolaire) {
        titleWrap.append(createElement({ tag: 'span', className: 'badge badge-primary', text: epreuve.niveau_scolaire }));
      }

      header.append(titleWrap);

      const session = getSession();
      const isOwner = session?.utilisateur?.id === epreuve.eleve_id;

      if (isOwner) {
        const deleteBtn = createElement({ tag: 'button', className: 'btn btn-danger', attrs: { type: 'button' } });
        deleteBtn.append(createIcon('trash', { size: 18 }));
        deleteBtn.append(createElement({ tag: 'span', text: ' Supprimer' }));
        deleteBtn.addEventListener('click', async () => {
          if (!window.confirm('Supprimer cette épreuve ?')) return;
          try {
            await deleteEpreuve(epreuve.id);
            notify({ tone: 'success', message: 'Épreuve supprimée.' });
            window.location.hash = '#/epreuves';
          } catch (err) {
            notify({ tone: 'danger', message: err.message });
          }
        });
        header.append(deleteBtn);
      }

      page.append(header);

      if (epreuve.media_url) {
        const media = createElement({ tag: 'div', className: 'pub-media' });

        if (epreuve.media_type === 'pdf') {
          const iframe = createElement({ tag: 'iframe', attrs: { src: epreuve.media_url, title: epreuve.titre } });
          media.append(iframe);

          const openLink = createElement({ tag: 'a', className: 'btn btn-secondary btn-sm', attrs: { href: epreuve.media_url, target: '_blank', rel: 'noopener noreferrer' } });
          openLink.append(createIcon('eye', { size: 16 }));
          openLink.append(createElement({ tag: 'span', text: ' Ouvrir le PDF' }));
          media.append(openLink);
        } else {
          const img = createElement({ tag: 'img', attrs: { src: urlAffichageImage(epreuve.media_url), alt: epreuve.titre, loading: 'lazy' } });
          media.append(img);
        }

        page.append(media);
      }

      if (epreuve.description) {
        const descCard = createElement({ tag: 'div', className: 'card', text: epreuve.description });
        page.append(descCard);
      }

      const contentCard = createElement({ tag: 'div', className: 'card' });
      contentCard.innerHTML = `<p>${epreuve.contenu || 'Aucun contenu.'}</p>`;
      page.append(contentCard);

      const meta = createElement({ tag: 'div', className: 'row', attrs: { style: 'align-items: center; gap: var(--space-3); flex-wrap: wrap;' } });

      if (epreuve.cree_le) {
        const date = createElement({ tag: 'span', className: 'subtle' });
        date.append(createIcon('calendar', { size: 16 }));
        date.append(document.createTextNode(` ${new Date(epreuve.cree_le).toLocaleDateString('fr-FR')}`));
        meta.append(date);
      }

      if (epreuve.nombre_telechargements !== undefined) {
        const downloads = createElement({ tag: 'span', className: 'subtle' });
        downloads.append(createIcon('download', { size: 16 }));
        downloads.append(document.createTextNode(` ${epreuve.nombre_telechargements} téléchargements`));
        meta.append(downloads);
      }

      page.append(meta);
    })
    .catch((err) => {
      page.replaceChildren();
      page.append(createElement({ tag: 'div', className: 'alert alert-danger', text: err.message }));
    });

  return page;
};
