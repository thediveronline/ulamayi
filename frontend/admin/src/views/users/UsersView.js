import { deleteUser, getUsers } from '../../services/admin.service.js';

const createRoleSection = (title, role, items, refresh) => {
  const section = document.createElement('section');
  section.className = 'card grid';

  const heading = document.createElement('h2');
  heading.textContent = title;
  section.append(heading);

  if (!items.length) {
    const empty = document.createElement('p');
    empty.textContent = 'Aucun utilisateur dans cette catégorie.';
    section.append(empty);
    return section;
  }

  items.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'card grid';
    const name = item.prenom ? `${item.prenom} ${item.nom}` : item.nom;
    row.innerHTML = `
      <strong>${name || 'Utilisateur'}</strong>
      <span>${item.email || '-'}</span>
    `;

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'Supprimer';
    removeButton.addEventListener('click', async () => {
      try {
        await deleteUser(item.id, role);
        refresh();
      } catch (error) {
        alert(error.message);
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
  const list = document.createElement('div');
  list.className = 'grid';

  page.innerHTML = `
    <div class="card grid">
      <h1 class="page-title">Utilisateurs</h1>
      <p class="page-subtitle">Liste des utilisateurs groupés par rôle.</p>
    </div>
  `;

  page.append(list);

  const loadUsers = () => {
    list.replaceChildren();

    getUsers()
      .then((data) => {
        list.append(
          createRoleSection('Administrateurs', 'admin', data.admins || [], loadUsers),
          createRoleSection('Enseignants', 'enseignant', data.enseignants || [], loadUsers),
          createRoleSection('Élèves', 'eleve', data.eleves || [], loadUsers),
          createRoleSection('Parents', 'parent', data.parents || [], loadUsers)
        );
      })
      .catch((error) => {
        const message = document.createElement('div');
        message.className = 'card';
        message.textContent = error.message;
        list.append(message);
      });
  };

  loadUsers();
  return page;
};
