import { registerUser } from '../../services/auth.service.js';
import { createAlert } from '../../components/alert/alert.js';
import { notify } from '../../components/notifications/notifications.js';
import { createElement, createButton, createField, createSelectField } from '../../utils/dom.js';
import { SCHOOL_LEVELS } from '../../utils/constants.js';
import { setLoadingState } from '../../utils/loading.js';

export const createRegisterView = () => {
  const page = createElement({ tag: 'section', className: 'page' });
  const wrapper = createElement({ tag: 'div', className: 'card stack-lg', attrs: { style: 'max-width: 520px; margin: 0 auto; width: 100%;' } });

  const header = createElement({ tag: 'div', className: 'stack' });
  header.append(
    createElement({ tag: 'span', className: 'badge badge-accent', text: 'Inscription' }),
    createElement({ tag: 'h1', className: 'page-title', text: 'Crée ton compte' }),
    createElement({ tag: 'p', className: 'page-subtitle', text: 'Renseigne tes informations. Tu recevras un code OTP par email pour activer ton compte.' })
  );

  const feedback = createElement({ tag: 'div', className: 'stack' });
  const form = createElement({ tag: 'form', className: 'form' });

  const fields = {
    nom: createField({ name: 'nom', label: 'Nom', required: true, autocomplete: 'family-name' }),
    prenom: createField({ name: 'prenom', label: 'Prénom', required: true, autocomplete: 'given-name' }),
    email: createField({ name: 'email', label: 'Adresse email', type: 'email', required: true, autocomplete: 'email' }),
    password: createField({ name: 'mot_de_passe', label: 'Mot de passe', type: 'password', required: true, autocomplete: 'new-password', hint: '8 caractères minimum' }),
    role: createSelectField({
      name: 'role',
      label: 'Je suis',
      required: true,
      options: [
        { value: 'eleve', label: 'Élève' },
        { value: 'parent', label: 'Parent' }
      ]
    }),
    level: createSelectField({
      name: 'niveau_scolaire',
      label: 'Niveau scolaire',
      options: SCHOOL_LEVELS
    })
  };

  form.append(
    fields.nom, fields.prenom, fields.email, fields.password, fields.role, fields.level
  );

  const submitButton = createButton({ label: 'Continuer', icon: 'chevronRight', iconPosition: 'right', type: 'submit', variant: 'primary', block: true });
  form.append(submitButton);

  const footer = createElement({ tag: 'p', className: 'subtle', attrs: { style: 'text-align: center;' } });
  footer.append(document.createTextNode('Déjà un compte ? '));
  footer.append(createElement({ tag: 'a', text: 'Se connecter', attrs: { href: '#/connexion' } }));

  wrapper.append(header, feedback, form, footer);
  page.append(wrapper);

  const roleSelect = fields.role.querySelector('select');
  const syncFields = () => {
    fields.level.style.display = roleSelect.value === 'eleve' ? '' : 'none';
  };
  roleSelect.addEventListener('change', syncFields);
  syncFields();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    feedback.replaceChildren();
    setLoadingState({ button: submitButton, isLoading: true, idleLabel: 'Continuer' });

    const payload = Object.fromEntries(new FormData(form).entries());
    if (payload.role !== 'eleve') {
      delete payload.niveau_scolaire;
    }

    try {
      await registerUser(payload);
      sessionStorage.setItem('ulamayi-otp-email', payload.email);
      sessionStorage.setItem('ulamayi-otp-role', payload.role);
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
