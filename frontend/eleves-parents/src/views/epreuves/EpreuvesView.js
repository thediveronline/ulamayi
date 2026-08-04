import { getAllEpreuves, deleteEpreuve } from '../../services/epreuve.service.js';
import { createIcon } from '../../components/icon/icon.js';
import { notify } from '../../components/notifications/notifications.js';
import { createLoadingCard, createEmptyState } from '../../utils/loading.js';
import { getSession } from '../../utils/session.js';

const EpreuveCard = (epreuve, isOwner, onDelete) => {
  const card = document.createElement('a');
  card.className = 'card card-hover';
  card.href = `#/epreuves/${epreuve.id}`;
  card.style.cssText = 'display:grid;gap:var(--space-2)';

  const title = document.createElement('h3');
  title.textContent = epreuve.titre || 'Sans titre';
  card.append(title);

  if (epreuve.description) {
    const desc = document.createElement('p');
    desc.className = 'muted';
    desc.style.cssText = 'font-size:0.9rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden';
    desc.textContent = epreuve.description;
    card.append(desc);
  }

  const meta = document.createElement('div');
  meta.className = 'row-between';
  meta.style.marginTop = 'auto';

  const badges = document.createElement('div');
  badges.className = 'row';

  if (epreuve.niveau_scolaire) {
    const niveau = document.createElement('span');
    niveau.className = 'badge badge-primary';
    niveau.textContent = epreuve.niveau_scolaire;
    badges.append(niveau);
  }

  if (epreuve.media_type) {
    const type = document.createElement('span');
    type.className = 'badge badge-accent';
    type.textContent = epreuve.media_type === 'pdf' ? 'PDF' : 'Image';
    badges.append(type);
  }

  meta.append(badges);

  const date = document.createElement('span');
  date.className = 'subtle';
  date.textContent = epreuve.cree_le ? new Date(epreuve.cree_le).toLocaleDateString('fr-FR') : '';
  meta.append(date);

  card.append(meta);

  if (isOwner) {
    const actions = document.createElement('div');
    actions.className = 'row';
    actions.style.marginTop = 'var(--space-2)';

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn btn-danger btn-sm';
    deleteBtn.append(createIcon('trash', { size: 16 }));
    deleteBtn.append(' Supprimer');
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
    actions.append(deleteBtn);
    card.append(actions);
  }

  return card;
};

export const createEpreuvesView = () => {
  const page = document.createElement('section');
  page.className = 'page';

  const header = document.createElement('div');
  header.className = 'page-header';

  const titleWrap = document.createElement('div');
  titleWrap.className = 'stack';
  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = 'Épreuves';
  titleWrap.append(title);

  const subtitle = document.createElement('p');
  subtitle.className = 'page-subtitle';
  subtitle.textContent = 'Catalogue des épreuves publiées par les élèves.';
  titleWrap.append(subtitle);

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

  const list = document.createElement('div');
  list.className = 'stack-lg';
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
        epreuves.forEach((ep) => {
          list.append(EpreuveCard(ep, false, loadEpreuves));
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
