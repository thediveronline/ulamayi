import { getSession, clearSession, saveSession } from '../../utils/session.js';
import { createIcon } from '../../components/icon/icon.js';
import { notify } from '../../components/notifications/notifications.js';
import { updateAdminProfile } from '../../services/admin.service.js';
import { createField, createButton } from '../../utils/dom.js';

export const createProfileView = () => {
  const page = document.createElement('section');
  page.className = 'page';

  const session = getSession();
  const user = session?.utilisateur;

  if (!user) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = '<p class="muted">Vous devez être connecté pour voir votre profil.</p>';
    page.append(card);
    return page;
  }

  const header = document.createElement('div');
  header.className = 'page-header';

  const titleWrap = document.createElement('div');
  titleWrap.className = 'stack';
  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = 'Mon profil';
  titleWrap.append(title);

  const subtitle = document.createElement('p');
  subtitle.className = 'page-subtitle';
  subtitle.textContent = 'Informations de votre compte administrateur.';
  titleWrap.append(subtitle);

  header.append(titleWrap);
  page.append(header);

  const card = document.createElement('div');
  card.className = 'card stack';

  const avatarRow = document.createElement('div');
  avatarRow.className = 'row';

  const avatar = document.createElement('div');
  avatar.style.cssText = 'display:grid;place-items:center;width:52px;height:52px;border-radius:var(--radius-md);background:var(--color-primary-soft);color:var(--color-text)';
  avatar.append(createIcon('user', { size: 24 }));
  avatarRow.append(avatar);

  const nameInfo = document.createElement('div');
  nameInfo.className = 'stack';
  nameInfo.style.gap = '2px';

  const name = document.createElement('strong');
  name.style.fontSize = '1.125rem';
  name.textContent = user.nom || 'Admin';
  nameInfo.append(name);

  const roleBadge = document.createElement('span');
  roleBadge.className = 'badge badge-primary';
  roleBadge.textContent = 'Administrateur';
  nameInfo.append(roleBadge);

  avatarRow.append(nameInfo);
  card.append(avatarRow);

  const divider = document.createElement('hr');
  divider.className = 'divider';
  card.append(divider);

  const emailRow = document.createElement('div');
  emailRow.className = 'stack';
  emailRow.style.gap = '2px';
  const emailLabel = document.createElement('span');
  emailLabel.className = 'subtle';
  emailLabel.textContent = 'Email';
  emailRow.append(emailLabel);
  const emailValue = document.createElement('span');
  emailValue.textContent = user.email || '-';
  emailRow.append(emailValue);
  card.append(emailRow);

  const idRow = document.createElement('div');
  idRow.className = 'stack';
  idRow.style.gap = '2px';
  const idLabel = document.createElement('span');
  idLabel.className = 'subtle';
  idLabel.textContent = 'ID';
  idRow.append(idLabel);
  const idValue = document.createElement('span');
  idValue.textContent = `#${user.id}`;
  idRow.append(idValue);
  card.append(idRow);

  page.append(card);

  const editCard = document.createElement('div');
  editCard.className = 'card stack';

  const editTitle = document.createElement('h3');
  editTitle.textContent = 'Modifier mes informations';
  editCard.append(editTitle);

  const editForm = document.createElement('form');
  editForm.className = 'form';

  const nomField = createField({ label: 'Nom', name: 'nom', value: user.nom || '', required: true });
  const emailField = createField({ label: 'Email', name: 'email', type: 'email', value: user.email || '', required: true });

  const saveBtn = createButton({ label: 'Enregistrer', type: 'submit', variant: 'primary' });
  editForm.append(nomField.element, emailField.element, saveBtn);

  const formFeedback = document.createElement('div');
  formFeedback.className = 'stack';

  editCard.append(editForm, formFeedback);
  page.append(editCard);

  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    formFeedback.replaceChildren();
    saveBtn.disabled = true;
    saveBtn.textContent = 'Enregistrement...';

    const payload = {
      nom: nomField.input.value.trim(),
      email: emailField.input.value.trim(),
      photo_profil: user.photo_profil || null
    };

    try {
      const updated = await updateAdminProfile(user.id, payload);
      const newName = updated?.nom || payload.nom;

      name.textContent = newName;
      const session = getSession();
      if (session?.utilisateur) {
        session.utilisateur.nom = newName;
        session.utilisateur.email = updated?.email || payload.email;
        saveSession(session);
      }
      notify({ tone: 'success', message: 'Profil mis à jour.' });
    } catch (error) {
      const alert = document.createElement('div');
      alert.className = 'alert alert-danger';
      alert.textContent = error.message;
      formFeedback.append(alert);
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Enregistrer';
    }
  });

  const actionsCard = document.createElement('div');
  actionsCard.className = 'card stack';

  const actionsTitle = document.createElement('h3');
  actionsTitle.textContent = 'Actions';
  actionsCard.append(actionsTitle);

  const logoutBtn = document.createElement('button');
  logoutBtn.type = 'button';
  logoutBtn.className = 'btn btn-danger';
  logoutBtn.append(createIcon('logout', { size: 18 }));
  logoutBtn.append(' Se déconnecter');
  logoutBtn.addEventListener('click', () => {
    clearSession();
    notify({ tone: 'info', message: 'Déconnecté.' });
    window.location.hash = '/connexion';
  });
  actionsCard.append(logoutBtn);

  page.append(actionsCard);

  return page;
};
