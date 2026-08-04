import { getEpreuveById, deleteEpreuve } from '../../services/epreuve.service.js';
import { createIcon } from '../../components/icon/icon.js';
import { notify } from '../../components/notifications/notifications.js';
import { createLoadingCard } from '../../utils/loading.js';
import { getSession } from '../../utils/session.js';
import { urlAffichageImage } from '../../utils/media.js';

export const createEpreuveDetailView = (params) => {
  const page = document.createElement('section');
  page.className = 'page';

  const loadingCard = createLoadingCard('Chargement de l\'épreuve...');
  page.append(loadingCard);

  const epreuveId = params?.id;

  getEpreuveById(epreuveId)
    .then((epreuve) => {
      page.replaceChildren();

      const backLink = document.createElement('a');
      backLink.className = 'btn btn-ghost';
      backLink.href = '#/epreuves';
      backLink.append(createIcon('chevronLeft', { size: 18 }));
      backLink.append(' Retour aux épreuves');
      page.append(backLink);

      const header = document.createElement('div');
      header.className = 'page-header';

      const titleWrap = document.createElement('div');
      titleWrap.className = 'stack';
      const title = document.createElement('h1');
      title.className = 'page-title';
      title.textContent = epreuve.titre || 'Sans titre';
      titleWrap.append(title);

      if (epreuve.niveau_scolaire) {
        const niveau = document.createElement('span');
        niveau.className = 'badge badge-primary';
        niveau.textContent = epreuve.niveau_scolaire;
        titleWrap.append(niveau);
      }

      header.append(titleWrap);

      const session = getSession();
      const isOwner = session?.utilisateur?.id === epreuve.eleve_id;

      if (isOwner) {
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn btn-danger';
        deleteBtn.append(createIcon('trash', { size: 18 }));
        deleteBtn.append(' Supprimer');
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
        const media = document.createElement('div');
        media.className = 'pub-media';

        if (epreuve.media_type === 'pdf') {
          const iframe = document.createElement('iframe');
          iframe.src = epreuve.media_url;
          iframe.title = epreuve.titre;
          media.append(iframe);

          const openLink = document.createElement('a');
          openLink.className = 'btn btn-secondary btn-sm';
          openLink.href = epreuve.media_url;
          openLink.target = '_blank';
          openLink.append(createIcon('eye', { size: 16 }));
          openLink.append(' Ouvrir le PDF');
          media.append(openLink);
        } else {
          const img = document.createElement('img');
          img.src = urlAffichageImage(epreuve.media_url);
          img.alt = epreuve.titre;
          img.loading = 'lazy';
          media.append(img);
        }

        page.append(media);
      }

      if (epreuve.description) {
        const descCard = document.createElement('div');
        descCard.className = 'card';
        descCard.textContent = epreuve.description;
        page.append(descCard);
      }

      const contentCard = document.createElement('div');
      contentCard.className = 'card';
      contentCard.innerHTML = `<p>${epreuve.contenu || 'Aucun contenu.'}</p>`;
      page.append(contentCard);

      const meta = document.createElement('div');
      meta.className = 'card row';
      meta.style.cssText = 'display:flex;align-items:center;gap:var(--space-3);flex-wrap:wrap';

      if (epreuve.cree_le) {
        const date = document.createElement('span');
        date.className = 'subtle';
        date.append(createIcon('calendar', { size: 16 }));
        date.append(` ${new Date(epreuve.cree_le).toLocaleDateString('fr-FR')}`);
        meta.append(date);
      }

      if (epreuve.nombre_telechargements !== undefined) {
        const downloads = document.createElement('span');
        downloads.className = 'subtle';
        downloads.append(createIcon('download', { size: 16 }));
        downloads.append(` ${epreuve.nombre_telechargements} téléchargements`);
        meta.append(downloads);
      }

      page.append(meta);
    })
    .catch((err) => {
      page.replaceChildren();
      const errorCard = document.createElement('div');
      errorCard.className = 'card';
      errorCard.textContent = err.message;
      page.append(errorCard);
    });

  return page;
};
