import { getMesEpreuves, deleteEpreuve } from '../../services/epreuve.service.js';
import { createIcon } from '../../components/icon/icon.js';
import { notify } from '../../components/notifications/notifications.js';
import { createLoadingCard, createEmptyState } from '../../utils/loading.js';

export const createMesEpreuvesView = () => {
  const page = document.createElement('section');
  page.className = 'page';

  const header = document.createElement('div');
  header.className = 'page-header';

  const titleWrap = document.createElement('div');
  titleWrap.className = 'stack';
  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = 'Mes épreuves';
  titleWrap.append(title);

  const subtitle = document.createElement('p');
  subtitle.className = 'page-subtitle';
  subtitle.textContent = 'Les épreuves que vous avez publiées.';
  titleWrap.append(subtitle);

  header.append(titleWrap);

  const createBtn = document.createElement('a');
  createBtn.className = 'btn btn-primary';
  createBtn.href = '#/epreuves/nouvelle';
  createBtn.append(createIcon('plus', { size: 18 }));
  createBtn.append(' Nouvelle épreuve');
  header.append(createBtn);

  page.append(header);

  const list = document.createElement('div');
  list.className = 'stack-lg';
  page.append(list);

  const loadEpreuves = () => {
    list.replaceChildren(createLoadingCard('Chargement de vos épreuves...'));

    getMesEpreuves()
      .then((epreuves) => {
        if (!epreuves || !epreuves.length) {
          list.replaceChildren(
            createEmptyState({
              icon: 'book',
              title: 'Aucune épreuve',
              description: 'Vous n\'avez pas encore publié d\'épreuve.',
              action: (() => {
                const btn = document.createElement('a');
                btn.className = 'btn btn-primary';
                btn.href = '#/epreuves/nouvelle';
                btn.append(createIcon('plus', { size: 18 }));
                btn.append(' Publier une épreuve');
                return btn;
              })()
            })
          );
          return;
        }

        list.replaceChildren();
        epreuves.forEach((ep) => {
          const card = document.createElement('a');
          card.className = 'card card-hover';
          card.href = `#/epreuves/${ep.id}`;
          card.style.cssText = 'display:grid;gap:var(--space-2)';

          const headerRow = document.createElement('div');
          headerRow.className = 'row-between';

          const titleEl = document.createElement('h3');
          titleEl.textContent = ep.titre || 'Sans titre';
          headerRow.append(titleEl);

          const deleteBtn = document.createElement('button');
          deleteBtn.type = 'button';
          deleteBtn.className = 'btn btn-danger btn-sm';
          deleteBtn.append(createIcon('trash', { size: 16 }));
          deleteBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!window.confirm(`Supprimer l'épreuve "${ep.titre}" ?`)) return;
            try {
              await deleteEpreuve(ep.id);
              notify({ tone: 'success', message: 'Épreuve supprimée.' });
              loadEpreuves();
            } catch (err) {
              notify({ tone: 'danger', message: err.message });
            }
          });
          headerRow.append(deleteBtn);

          card.append(headerRow);

          const meta = document.createElement('div');
          meta.className = 'row';

          if (ep.niveau_scolaire) {
            const niveau = document.createElement('span');
            niveau.className = 'badge badge-primary';
            niveau.textContent = ep.niveau_scolaire;
            meta.append(niveau);
          }

          if (ep.cree_le) {
            const date = document.createElement('span');
            date.className = 'subtle';
            date.textContent = new Date(ep.cree_le).toLocaleDateString('fr-FR');
            meta.append(date);
          }

          card.append(meta);
          list.append(card);
        });
      })
      .catch((err) => {
        list.replaceChildren();
        const errorCard = document.createElement('div');
        errorCard.className = 'card';
        errorCard.textContent = err.message;
        list.append(errorCard);
      });
  };

  loadEpreuves();
  return page;
};
