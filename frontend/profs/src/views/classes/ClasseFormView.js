import { createClasse } from '../../services/classe.service.js';
import { createIcon } from '../../components/icon/icon.js';
import { notify } from '../../components/notifications/notifications.js';
import { createField, createSelectField } from '../../utils/dom.js';
import { SCHOOL_LEVELS } from '../../utils/constants.js';
import { apiRequest } from '../../services/api.js';

export const createClasseFormView = () => {
  const page = document.createElement('section');
  page.className = 'page';

  const backLink = document.createElement('a');
  backLink.className = 'btn btn-ghost';
  backLink.href = '#/classes';
  backLink.append(createIcon('chevronLeft', { size: 18 }));
  backLink.append(' Retour');
  page.append(backLink);

  const card = document.createElement('div');
  card.className = 'card stack-lg';

  const header = document.createElement('div');
  header.className = 'stack';
  const title = document.createElement('h2');
  title.textContent = 'Nouvelle classe';
  const subtitle = document.createElement('p');
  subtitle.className = 'page-subtitle';
  subtitle.textContent = 'Créez une classe pour y inscrire vos élèves.';
  header.append(title, subtitle);
  card.append(header);

  const form = document.createElement('form');
  form.className = 'form';

  // ── Logo de la classe ──────────────────────────────────
  const logoWrap = document.createElement('div');
  logoWrap.className = 'classe-logo-wrap';

  const logoPreview = document.createElement('div');
  logoPreview.className = 'classe-logo-preview';
  logoPreview.append(createIcon('graduation', { size: 24 }));

  const logoLabel = document.createElement('label');
  logoLabel.className = 'classe-logo-label';
  logoLabel.append(createIcon('edit', { size: 13 }));
  logoLabel.append(document.createTextNode(' Logo de la classe'));
  const logoInput = document.createElement('input');
  logoInput.type = 'file';
  logoInput.accept = 'image/*';
  logoInput.hidden = true;
  logoLabel.append(logoInput);

  logoInput.addEventListener('change', () => {
    if (logoInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        logoPreview.replaceChildren();
        const img = document.createElement('img');
        img.src = e.target.result;
        logoPreview.append(img);
      };
      reader.readAsDataURL(logoInput.files[0]);
    }
  });

  logoWrap.append(logoPreview, logoLabel);
  form.append(logoWrap);

  // ── Champs texte ───────────────────────────────────────
  const nomField = createField({ label: 'Nom de la classe', name: 'nom', placeholder: 'Ex: Terminale A', required: true });
  form.append(nomField);
  const nomInput = nomField.querySelector('input');

  const niveauField = createSelectField({
    label: 'Niveau scolaire', name: 'niveau_scolaire', required: true,
    options: [{ value: '', label: 'Sélectionnez un niveau' }, ...SCHOOL_LEVELS.map((n) => ({ value: n, label: n }))]
  });
  form.append(niveauField);
  const niveauSelect = niveauField.querySelector('select');

  const descField = createField({ label: 'Description', name: 'description', type: 'textarea', placeholder: 'Décrivez le contenu, les objectifs de la classe...' });
  form.append(descField);

  const prixField = createField({ label: 'Prix d\'accès (FCFA — 0 = Gratuit)', name: 'prix', type: 'number', placeholder: '0' });
  form.append(prixField);
  const prixInput = prixField.querySelector('input');

  const planField = createField({ label: 'Planning des cours', name: 'planning', placeholder: 'Ex: Lun/Mer 18h-20h, Sam 10h-12h' });
  form.append(planField);
  const planInput = planField.querySelector('input');

  // ── Bouton ─────────────────────────────────────────────
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-primary btn-block';
  submitBtn.textContent = 'Créer la classe';
  form.append(submitBtn);

  const errorEl = document.createElement('div');
  errorEl.className = 'alert alert-danger';
  errorEl.style.display = 'none';
  form.prepend(errorEl);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Création...';
    errorEl.style.display = 'none';

    try {
      const fd = new FormData();
      fd.append('nom', nomInput.value.trim());
      fd.append('niveau_scolaire', niveauSelect.value);
      fd.append('description', descField.querySelector('textarea')?.value?.trim() || '');
      fd.append('prix', parseFloat(prixInput.value) || 0);
      fd.append('planning', planInput.value.trim() || '');
      if (logoInput.files[0]) fd.append('logo', logoInput.files[0]);

      const res = await apiRequest('/classes', { method: 'POST', body: fd });
      notify({ tone: 'success', message: 'Classe créée avec succès.' });
      const id = res?.classe?.id || res?.id;
      window.location.hash = id ? `#/classes/${id}` : '#/classes';
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.style.display = 'flex';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Créer la classe';
    }
  });

  card.append(form);
  page.append(card);
  return page;
};
