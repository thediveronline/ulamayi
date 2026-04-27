import { verifyOtp } from '../../services/auth.service.js';
import { createAlert } from '../../components/alert/alert.js';
import { notify } from '../../components/notifications/notifications.js';
import { createElement, createButton, createField } from '../../utils/dom.js';
import { setLoadingState } from '../../utils/loading.js';

export const createOtpView = () => {
  const page = createElement({ tag: 'section', className: 'page' });
  const wrapper = createElement({ tag: 'div', className: 'card stack-lg', attrs: { style: 'max-width: 460px; margin: 0 auto; width: 100%;' } });

  const email = sessionStorage.getItem('ulamayi-otp-email') || '';
  const role = sessionStorage.getItem('ulamayi-otp-role') || 'eleve';

  const header = createElement({ tag: 'div', className: 'stack' });
  header.append(
    createElement({ tag: 'span', className: 'badge badge-info', text: 'Vérification' }),
    createElement({ tag: 'h1', className: 'page-title', text: 'Confirme ton email' }),
    createElement({ tag: 'p', className: 'page-subtitle', text: 'Saisis le code à 6 chiffres reçu par email pour activer ton compte.' })
  );

  const feedback = createElement({ tag: 'div', className: 'stack' });

  const form = createElement({ tag: 'form', className: 'form' });
  form.append(
    createField({ name: 'email', label: 'Adresse email', type: 'email', value: email, required: true }),
    createField({ name: 'code', label: 'Code OTP', placeholder: '6 chiffres', required: true, hint: 'Le code expire après quelques minutes' })
  );

  const codeInput = form.querySelector('input[name="code"]');
  codeInput.setAttribute('inputmode', 'numeric');
  codeInput.setAttribute('minlength', '6');
  codeInput.setAttribute('maxlength', '6');
  codeInput.setAttribute('autocomplete', 'one-time-code');

  const hidden = document.createElement('input');
  hidden.type = 'hidden';
  hidden.name = 'role';
  hidden.value = role;
  form.append(hidden);

  const submitButton = createButton({ label: 'Valider', icon: 'check', type: 'submit', variant: 'primary', block: true });
  form.append(submitButton);

  wrapper.append(header, feedback, form);
  page.append(wrapper);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    feedback.replaceChildren();
    setLoadingState({ button: submitButton, isLoading: true, idleLabel: 'Valider' });
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      await verifyOtp(payload);
      notify({ tone: 'success', message: 'Compte vérifié. Tu peux te connecter.' });
      window.location.hash = '/connexion';
    } catch (error) {
      feedback.append(createAlert({ tone: 'danger', message: error.message }));
      notify({ tone: 'danger', message: error.message });
    } finally {
      setLoadingState({ button: submitButton, isLoading: false, idleLabel: 'Valider' });
    }
  });

  return page;
};
