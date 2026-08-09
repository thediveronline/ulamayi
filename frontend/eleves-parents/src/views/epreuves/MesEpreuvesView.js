import { getMesEpreuves, deleteEpreuve } from '../../services/epreuve.service.js';
import { createIcon } from '../../components/icon/icon.js';
import { notify } from '../../components/notifications/notifications.js';
import { createLoadingCard, createEmptyState } from '../../utils/loading.js';
import { createElement } from '../../utils/dom.js';

export const createMesEpreuvesView = () => {
  const page = createElement({ tag: 'section', className: 'page' });

  const header = createElement({ tag: 'div', className: 'page-header' });
  const titleWrap = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap: 0.25rem;' } });
  titleWrap.append(
    createElement({ tag: 'h1', className: 'page-title', text: 'Mes épreuves' }),
    createElement({ tag: 'p', className: 'page-subtitle', text: 'Les épreuves que vous avez publiées.' })
  );
  header.append(titleWrap);

  const createBtn = document.createElement('a');
  createBtn.className = 'btn btn-primary';
  createBtn.href = '#/epreuves/nouvelle';
  createBtn.append(createIcon('plus', { size: 18 }));
  createBtn.append(' Nouvelle épreuve');
  header.append(createBtn);

  page.append(header);

  const list = createElement({ tag: 'div', className: 'stack' });
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
        epreuves.forEach((ep, index) => {
          if (index > 0) {
            list.append(createElement({ tag: 'hr', className: 'divider' }));
          }

          const row = createElement({ tag: 'article', className: 'row', attrs: { style: 'align-items: center; gap: 1rem; cursor: pointer; padding: var(--space-3) 0;' } });
          row.dataset.id = ep.id;

          const body = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap: 0.25rem; flex: 1; min-width: 0;' } });
          body.append(createElement({ tag: 'h3', text: ep.titre || 'Sans titre' }));

          const meta = createElement({ tag: 'div', className: 'row', attrs: { style: 'gap: var(--space-2);' } });
          if (ep.niveau_scolaire) {
            meta.append(createElement({ tag: 'span', className: 'badge badge-primary', text: ep.niveau_scolaire }));
          }
          if (ep.cree_le) {
            meta.append(createElement({ tag: 'span', className: 'subtle', text: new Date(ep.cree_le).toLocaleDateString('fr-FR') }));
          }
          body.append(meta);

          row.append(body);

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
          row.append(deleteBtn);

          row.addEventListener('click', () => {
            window.location.hash = `/epreuves/${ep.id}`;
          });

          list.append(row);
        });
      })
      .catch((err) => {
        list.replaceChildren(createElement({ tag: 'div', className: 'alert alert-danger' }));
        list.lastChild.textContent = err.message;
      });
  };

  loadEpreuves();
  return page;
};
