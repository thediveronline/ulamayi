import { loginAdmin } from '../../services/auth.service.js';
import { createIcon } from '../../components/icon/icon.js';
import { notify } from '../../components/notifications/notifications.js';
import { createField } from '../../utils/dom.js';

export const createLoginView = () => {
  const page = document.createElement('section');
  page.className = 'page';

  const card = document.createElement('div');
  card.className = 'card';
  card.style.maxWidth = '420px';
  card.style.margin = '10vh auto';

  const header = document.createElement('div');
  header.className = 'stack';
  header.style.textAlign = 'center';

  const iconWrap = document.createElement('div');
  iconWrap.style.cssText = 'display:grid;place-items:center;width:48px;height:48px;border-radius:var(--radius-md);background:var(--color-primary-soft);color:var(--color-text);margin:0 auto';
  iconWrap.append(createIcon('shield', { size: 24 }));
  header.append(iconWrap);

  const title = document.createElement('h2');
  title.textContent = 'Connexion Admin';
  header.append(title);

  const subtitle = document.createElement('p');
  subtitle.className = 'page-subtitle';
  subtitle.textContent = 'Accès réservé aux administrateurs';
  header.append(subtitle);

  card.append(header);

  const form = document.createElement('form');
  form.className = 'form';
  form.style.marginTop = 'var(--space-5)';

  const { element: emailField, input: emailInput } = createField({
    label: 'Email',
    type: 'email',
    name: 'email',
    placeholder: 'admin@example.com',
    required: true
  });
  form.append(emailField);

  const { element: passwordField, input: passwordInput } = createField({
    label: 'Mot de passe',
    type: 'password',
    name: 'mot_de_passe',
    placeholder: '••••••••',
    required: true
  });
  form.append(passwordField);

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-primary btn-block';
  submitBtn.textContent = 'Se connecter';
  form.append(submitBtn);

  const errorEl = document.createElement('div');
  errorEl.className = 'alert alert-danger';
  errorEl.style.display = 'none';
  form.prepend(errorEl);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Connexion...';
    errorEl.style.display = 'none';

    try {
      await loginAdmin({
        email: emailInput.value.trim(),
        mot_de_passe: passwordInput.value
      });
      notify({ tone: 'success', message: 'Connecté avec succès.' });
      window.location.hash = '/';
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.style.display = 'flex';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Se connecter';
    }
  });

  card.append(form);
  page.append(card);

  return page;
};
