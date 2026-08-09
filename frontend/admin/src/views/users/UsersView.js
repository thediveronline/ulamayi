import { getUsers, deleteUser } from '../../services/admin.service.js';
import { createIcon } from '../../components/icon/icon.js';
import { notify } from '../../components/notifications/notifications.js';
import { createLoadingCard, createEmptyState } from '../../utils/loading.js';

const createRoleSection = (title, role, items, refresh) => {
  const section = document.createElement('section');
  section.className = 'card stack';

  const heading = document.createElement('h3');
  heading.textContent = title;
  section.append(heading);

  if (!items.length) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = 'Aucun utilisateur dans cette catégorie.';
    section.append(empty);
    return section;
  }

  items.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'row-between';
    row.style.cssText = 'padding:var(--space-3) 0;border-bottom:1px solid var(--color-border)';
    if (item === items[items.length - 1]) {
      row.style.borderBottom = 'none';
    }

    const info = document.createElement('div');
    info.className = 'stack';
    info.style.gap = '2px';

    const name = document.createElement('strong');
    const fullName = item.prenom ? `${item.prenom} ${item.nom}` : item.nom;
    name.textContent = fullName || 'Utilisateur';
    info.append(name);

    const email = document.createElement('span');
    email.className = 'subtle';
    email.textContent = item.email || '-';
    info.append(email);

    if (item.niveau_scolaire) {
      const niveau = document.createElement('span');
      niveau.className = 'badge badge-primary';
      niveau.textContent = item.niveau_scolaire;
      info.append(niveau);
    }

    row.append(info);

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'btn btn-danger btn-sm';
    removeButton.append(createIcon('trash', { size: 16 }));
    removeButton.append(' Supprimer');
    removeButton.addEventListener('click', async () => {
      if (!window.confirm(`Supprimer ${fullName} ?`)) return;
      try {
        await deleteUser(item.id, role);
        notify({ tone: 'success', message: 'Utilisateur supprimé.' });
        refresh();
      } catch (error) {
        notify({ tone: 'danger', message: error.message });
      }
    });

    row.append(removeButton);
    section.append(row);
  });

  return section;
};

export const createUsersView = () => {
  const page = document.createElement('section');
  page.className = 'page';

  const header = document.createElement('div');
  header.className = 'page-header';

  const titleWrap = document.createElement('div');
  titleWrap.className = 'stack';
  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = 'Utilisateurs';
  titleWrap.append(title);

  const subtitle = document.createElement('p');
  subtitle.className = 'page-subtitle';
  subtitle.textContent = 'Liste des utilisateurs groupés par rôle.';
  titleWrap.append(subtitle);

  header.append(titleWrap);
  page.append(header);

  const list = document.createElement('div');
  list.className = 'stack-lg';
  page.append(list);

  const loadingCard = createLoadingCard('Chargement des utilisateurs...');
  list.append(loadingCard);

  const loadUsers = () => {
    list.replaceChildren(createLoadingCard('Chargement...'));

    getUsers()
      .then((data) => {
        list.replaceChildren(
          createRoleSection('Administrateurs', 'admin', data.admins || [], loadUsers),
          createRoleSection('Enseignants', 'enseignant', data.enseignants || [], loadUsers),
          createRoleSection('Élèves', 'eleve', data.eleves || [], loadUsers),
          createRoleSection('Parents', 'parent', data.parents || [], loadUsers)
        );
      })
      .catch((error) => {
        list.replaceChildren();
        const errorCard = document.createElement('div');
        errorCard.className = 'card';
        errorCard.textContent = error.message;
        list.append(errorCard);
      });
  };

  loadUsers();
  return page;
};
