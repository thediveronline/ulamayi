import { getAllEpreuves, deleteEpreuve } from '../../services/epreuve.service.js';
import { createIcon } from '../../components/icon/icon.js';
import { notify } from '../../components/notifications/notifications.js';
import { createLoadingCard, createEmptyState } from '../../utils/loading.js';
import { createElement } from '../../utils/dom.js';
import { getSession } from '../../utils/session.js';

const EpreuveRow = (epreuve, isOwner, onDelete) => {
  const row = createElement({ tag: 'article', className: 'row', attrs: { style: 'align-items: flex-start; gap: 1rem; cursor: pointer; padding: var(--space-3) 0;' } });
  row.dataset.id = epreuve.id;

  const body = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap: 0.25rem; flex: 1; min-width: 0;' } });
  body.append(createElement({ tag: 'h3', text: epreuve.titre || 'Sans titre' }));

  if (epreuve.description) {
    body.append(createElement({ tag: 'p', className: 'muted', attrs: { style: 'font-size: 0.9rem;' } }));
    body.lastChild.textContent = epreuve.description;
  }

  const meta = createElement({ tag: 'div', className: 'row', attrs: { style: 'gap: var(--space-2);' } });
  if (epreuve.niveau_scolaire) {
    meta.append(createElement({ tag: 'span', className: 'badge badge-primary', text: epreuve.niveau_scolaire }));
  }
  if (epreuve.media_type) {
    meta.append(createElement({ tag: 'span', className: 'badge', text: epreuve.media_type === 'pdf' ? 'PDF' : 'Image' }));
  }
  if (epreuve.cree_le) {
    meta.append(createElement({ tag: 'span', className: 'subtle', text: new Date(epreuve.cree_le).toLocaleDateString('fr-FR') }));
  }
  body.append(meta);

  row.append(body);

  if (isOwner) {
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn btn-danger btn-sm';
    deleteBtn.append(createIcon('trash', { size: 16 }));
    deleteBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!window.confirm(`Supprimer l'épreuve "${epreuve.titre}" ?`)) return;
      try {
        await deleteEpreuve(epreuve.id);
        notify({ tone: 'success', message: 'Épreuve supprimée.' });
        onDelete();
      } catch (err) {
        notify({ tone: 'danger', message: err.message });
      }
    });
    row.append(deleteBtn);
  }

  row.addEventListener('click', () => {
    const id = epreuve.id || epreuve.id_epreuve;
    if (id) {
      window.location.hash = `/epreuves/${id}`;
    }
  });

  return row;
};

export const createEpreuvesView = () => {
  const page = createElement({ tag: 'section', className: 'page' });

  const header = createElement({ tag: 'div', className: 'page-header' });
  const titleWrap = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap: 0.25rem;' } });
  titleWrap.append(
    createElement({ tag: 'h1', className: 'page-title', text: 'Épreuves' }),
    createElement({ tag: 'p', className: 'page-subtitle', text: 'Catalogue des épreuves publiées par les élèves.' })
  );
  header.append(titleWrap);

  const session = getSession();
  const isEleve = session?.utilisateur?.role === 'eleve';

  if (isEleve) {
    const createBtn = document.createElement('a');
    createBtn.className = 'btn btn-primary';
    createBtn.href = '#/epreuves/nouvelle';
    createBtn.append(createIcon('plus', { size: 18 }));
    createBtn.append(' Nouvelle épreuve');
    header.append(createBtn);
  }

  page.append(header);

  const list = createElement({ tag: 'div', className: 'stack' });
  page.append(list);

  const loadEpreuves = () => {
    list.replaceChildren(createLoadingCard('Chargement des épreuves...'));

    getAllEpreuves()
      .then((epreuves) => {
        if (!epreuves || !epreuves.length) {
          list.replaceChildren(
            createEmptyState({
              icon: 'book',
              title: 'Aucune épreuve',
              description: 'Aucune épreuve publiée pour le moment.'
            })
          );
          return;
        }

        list.replaceChildren();
        epreuves.forEach((ep, index) => {
          if (index > 0) {
            list.append(createElement({ tag: 'hr', className: 'divider' }));
          }
          list.append(EpreuveRow(ep, isEleve && session?.utilisateur?.id === ep.eleve_id, loadEpreuves));
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
