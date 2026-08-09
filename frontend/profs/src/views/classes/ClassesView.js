import { getMesClasses, supprimerClasse } from '../../services/classe.service.js';
import { createIcon } from '../../components/icon/icon.js';
import { notify } from '../../components/notifications/notifications.js';
import { createLoadingCard, createEmptyState } from '../../utils/loading.js';

const ClasseCard = (classe, onDelete) => {
  const card = document.createElement('a');
  card.className = 'card card-hover';
  card.href = `#/classes/${classe.id}`;
  card.style.cssText = 'display:grid;gap:var(--space-2)';

  const header = document.createElement('div');
  header.className = 'row-between';

  const title = document.createElement('h3');
  title.textContent = classe.nom || 'Sans nom';
  header.append(title);

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'btn btn-danger btn-sm';
  deleteBtn.append(createIcon('trash', { size: 16 }));
  deleteBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Supprimer la classe "${classe.nom}" ?`)) return;
    try {
      await supprimerClasse(classe.id);
      notify({ tone: 'success', message: 'Classe supprimée.' });
      onDelete();
    } catch (err) {
      notify({ tone: 'danger', message: err.message });
    }
  });
  header.append(deleteBtn);

  card.append(header);

  const meta = document.createElement('div');
  meta.className = 'row';

  if (classe.niveau_scolaire) {
    const niveau = document.createElement('span');
    niveau.className = 'badge badge-primary';
    niveau.textContent = classe.niveau_scolaire;
    meta.append(niveau);
  }

  if (classe.cree_le) {
    const date = document.createElement('span');
    date.className = 'subtle';
    date.textContent = new Date(classe.cree_le).toLocaleDateString('fr-FR');
    meta.append(date);
  }

  card.append(meta);

  return card;
};

export const createClassesView = () => {
  const page = document.createElement('section');
  page.className = 'page';

  const header = document.createElement('div');
  header.className = 'page-header';

  const titleWrap = document.createElement('div');
  titleWrap.className = 'stack';
  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = 'Mes classes';
  titleWrap.append(title);

  const subtitle = document.createElement('p');
  subtitle.className = 'page-subtitle';
  subtitle.textContent = 'Gérez vos classes et inscrivez vos élèves.';
  titleWrap.append(subtitle);

  header.append(titleWrap);

  const createBtn = document.createElement('a');
  createBtn.className = 'btn btn-primary';
  createBtn.href = '#/classes/nouvelle';
  createBtn.append(createIcon('plus', { size: 18 }));
  createBtn.append(' Nouvelle classe');
  header.append(createBtn);

  page.append(header);

  const list = document.createElement('div');
  list.className = 'grid-cards';
  page.append(list);

  const loadClasses = () => {
    list.replaceChildren(createLoadingCard('Chargement des classes...'));

    getMesClasses()
      .then((classes) => {
        if (!classes || !classes.length) {
          list.replaceChildren(
            createEmptyState({
              icon: 'graduation',
              title: 'Aucune classe',
              description: 'Vous n\'avez pas encore créé de classe.',
              action: (() => {
                const btn = document.createElement('a');
                btn.className = 'btn btn-primary';
                btn.href = '#/classes/nouvelle';
                btn.append(createIcon('plus', { size: 18 }));
                btn.append(' Créer une classe');
                return btn;
              })()
            })
          );
          return;
        }

        list.replaceChildren();
        classes.forEach((cl) => {
          list.append(ClasseCard(cl, loadClasses));
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

  loadClasses();
  return page;
};
