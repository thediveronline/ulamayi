import { registerUser } from '../../services/auth.service.js';
import { createAlert } from '../../components/alert/alert.js';
import { notify } from '../../components/notifications/notifications.js';
import { createElement, createButton, createField } from '../../utils/dom.js';
import { setLoadingState } from '../../utils/loading.js';

export const createRegisterView = () => {
  const page = createElement({ tag: 'section', className: 'page' });
  const wrapper = createElement({ tag: 'div', className: 'card stack-lg', attrs: { style: 'max-width: 520px; margin: 0 auto; width: 100%;' } });

  const header = createElement({ tag: 'div', className: 'stack' });
  header.append(
    createElement({ tag: 'span', className: 'badge badge-accent', text: 'Inscription enseignant' }),
    createElement({ tag: 'h1', className: 'page-title', text: 'Créer un compte enseignant' }),
    createElement({ tag: 'p', className: 'page-subtitle', text: 'Renseigne tes informations. Tu recevras un code OTP par email pour activer ton compte.' })
  );

  const feedback = createElement({ tag: 'div', className: 'stack' });
  const form = createElement({ tag: 'form', className: 'form' });

  form.append(
    createField({ name: 'nom', label: 'Nom', required: true, autocomplete: 'family-name' }),
    createField({ name: 'prenom', label: 'Prénom', required: true, autocomplete: 'given-name' }),
    createField({ name: 'email', label: 'Adresse email', type: 'email', required: true, autocomplete: 'email' }),
    createField({ name: 'mot_de_passe', label: 'Mot de passe', type: 'password', required: true, autocomplete: 'new-password', hint: '8 caractères minimum' }),
    createField({ name: 'matiere', label: 'Matière enseignée', required: true, placeholder: 'Mathématiques, Français...' })
  );

  const submitButton = createButton({ label: 'Continuer', icon: 'chevronRight', iconPosition: 'right', type: 'submit', variant: 'primary', block: true });
  form.append(submitButton);

  const footer = createElement({ tag: 'p', className: 'subtle', attrs: { style: 'text-align: center;' } });
  footer.append(document.createTextNode('Déjà un compte ? '));
  footer.append(createElement({ tag: 'a', text: 'Se connecter', attrs: { href: '#/connexion' } }));

  wrapper.append(header, feedback, form, footer);
  page.append(wrapper);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    feedback.replaceChildren();
    setLoadingState({ button: submitButton, isLoading: true, idleLabel: 'Continuer' });

    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      await registerUser(payload);
      sessionStorage.setItem('ulamayi-profs-otp-email', payload.email);
      notify({ tone: 'success', message: 'Compte créé. Un code OTP a été envoyé.' });
      window.location.hash = '/verification-otp';
    } catch (error) {
      feedback.append(createAlert({ tone: 'danger', message: error.message }));
      notify({ tone: 'danger', message: error.message });
    } finally {
      setLoadingState({ button: submitButton, isLoading: false, idleLabel: 'Continuer' });
    }
  });

  return page;
};
