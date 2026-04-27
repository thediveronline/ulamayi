import { loginUser } from '../../services/auth.service.js';
import { createAlert } from '../../components/alert/alert.js';
import { notify } from '../../components/notifications/notifications.js';
import { createElement, createButton, createField, createSelectField } from '../../utils/dom.js';
import { setLoadingState } from '../../utils/loading.js';

export const createLoginView = () => {
  const page = createElement({ tag: 'section', className: 'page' });
  const wrapper = createElement({ tag: 'div', className: 'card stack-lg', attrs: { style: 'max-width: 460px; margin: 0 auto; width: 100%;' } });

  const header = createElement({ tag: 'div', className: 'stack' });
  header.append(
    createElement({ tag: 'span', className: 'badge badge-primary', text: 'Connexion' }),
    createElement({ tag: 'h1', className: 'page-title', text: 'Bon retour' }),
    createElement({ tag: 'p', className: 'page-subtitle', text: 'Connecte-toi à ton compte élève ou parent.' })
  );

  const feedback = createElement({ tag: 'div', className: 'stack' });

  const form = createElement({ tag: 'form', className: 'form' });
  form.append(
    createField({ name: 'email', label: 'Adresse email', type: 'email', required: true, autocomplete: 'email', placeholder: 'exemple@email.com' }),
    createField({ name: 'mot_de_passe', label: 'Mot de passe', type: 'password', required: true, autocomplete: 'current-password', placeholder: '••••••••' }),
    createSelectField({
      name: 'role',
      label: 'Rôle',
      required: true,
      options: [
        { value: 'eleve', label: 'Élève' },
        { value: 'parent', label: 'Parent' }
      ]
    })
  );

  const submitButton = createButton({ label: 'Se connecter', icon: 'login', type: 'submit', variant: 'primary', block: true });
  form.append(submitButton);

  const footer = createElement({ tag: 'p', className: 'subtle', attrs: { style: 'text-align: center;' } });
  footer.append(document.createTextNode('Pas encore de compte ? '));
  const signupLink = createElement({ tag: 'a', text: 'Créer un compte', attrs: { href: '#/inscription' } });
  footer.append(signupLink);

  wrapper.append(header, feedback, form, footer);
  page.append(wrapper);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    feedback.replaceChildren();
    setLoadingState({ button: submitButton, isLoading: true, idleLabel: 'Se connecter' });

    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      await loginUser(payload);
      notify({ tone: 'success', message: 'Connexion réussie.' });
      window.location.hash = '/';
    } catch (error) {
      feedback.append(createAlert({ tone: 'danger', message: error.message }));
      notify({ tone: 'danger', message: error.message });
    } finally {
      setLoadingState({ button: submitButton, isLoading: false, idleLabel: 'Se connecter' });
    }
  });

  return page;
};
