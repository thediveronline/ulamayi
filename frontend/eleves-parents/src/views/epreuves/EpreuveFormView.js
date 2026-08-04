import { createEpreuve } from '../../services/epreuve.service.js';
import { createIcon } from '../../components/icon/icon.js';
import { notify } from '../../components/notifications/notifications.js';
import { createField, createSelectField } from '../../utils/dom.js';
import { SCHOOL_LEVELS } from '../../utils/constants.js';

export const createEpreuveFormView = () => {
  const page = document.createElement('section');
  page.className = 'page';

  const backLink = document.createElement('a');
  backLink.className = 'btn btn-ghost';
  backLink.href = '#/epreuves';
  backLink.append(createIcon('chevronLeft', { size: 18 }));
  backLink.append(' Retour');
  page.append(backLink);

  const card = document.createElement('div');
  card.className = 'card stack-lg';

  const header = document.createElement('div');
  header.className = 'stack';

  const title = document.createElement('h2');
  title.textContent = 'Nouvelle épreuve';
  header.append(title);

  const subtitle = document.createElement('p');
  subtitle.className = 'page-subtitle';
  subtitle.textContent = 'Publiez une épreuve pour que les enseignants puissent proposer des corrections.';
  header.append(subtitle);

  card.append(header);

  const form = document.createElement('form');
  form.className = 'form';

  const titreField = createField({
    label: 'Titre',
    name: 'titre',
    placeholder: 'Ex: Bac Blanc Maths 2025',
    required: true
  });
  form.append(titreField);
  const titreInput = titreField.querySelector('input');

  const descField = createField({
    label: 'Description (optionnelle)',
    name: 'description',
    placeholder: 'Décrivez brièvement l\'épreuve...'
  });
  form.append(descField);
  const descInput = descField.querySelector('input');

  const niveauField = createSelectField({
    label: 'Niveau scolaire',
    name: 'niveau_scolaire',
    required: true,
    options: [
      { value: '', label: 'Sélectionnez un niveau' },
      ...SCHOOL_LEVELS.map((n) => ({ value: n, label: n }))
    ]
  });
  form.append(niveauField);
  const niveauSelect = niveauField.querySelector('select');

  const contenuField = document.createElement('div');
  contenuField.className = 'field';
  const contenuLabel = document.createElement('label');
  contenuLabel.className = 'field-label';
  contenuLabel.textContent = 'Contenu';
  contenuLabel.setAttribute('for', 'contenu');
  contenuField.append(contenuLabel);

  const contenuTextarea = document.createElement('textarea');
  contenuTextarea.className = 'textarea';
  contenuTextarea.id = 'contenu';
  contenuTextarea.name = 'contenu';
  contenuTextarea.placeholder = 'Détaillez le contenu de l\'épreuve...';
  contenuTextarea.rows = 6;
  contenuTextarea.required = true;
  contenuField.append(contenuTextarea);
  form.append(contenuField);

  const mediaField = document.createElement('div');
  mediaField.className = 'field';
  const mediaLabel = document.createElement('label');
  mediaLabel.className = 'field-label';
  mediaLabel.textContent = 'Fichier média (optionnel)';
  mediaLabel.setAttribute('for', 'media');
  mediaField.append(mediaLabel);

  const mediaInput = document.createElement('input');
  mediaInput.className = 'input';
  mediaInput.type = 'file';
  mediaInput.id = 'media';
  mediaInput.name = 'media';
  mediaInput.accept = 'image/jpeg,image/png,image/webp,image/gif,application/pdf';
  mediaField.append(mediaInput);

  const mediaHint = document.createElement('span');
  mediaHint.className = 'field-hint';
  mediaHint.textContent = 'JPG, PNG, WEBP, GIF ou PDF. Max 10 Mo.';
  mediaField.append(mediaHint);
  form.append(mediaField);

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-primary btn-block';
  submitBtn.textContent = 'Publier l\'épreuve';
  form.append(submitBtn);

  const errorEl = document.createElement('div');
  errorEl.className = 'alert alert-danger';
  errorEl.style.display = 'none';
  form.prepend(errorEl);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Publication...';
    errorEl.style.display = 'none';

    const formData = new FormData();
    formData.append('titre', titreInput.value.trim());
    formData.append('contenu', contenuTextarea.value.trim());
    formData.append('niveau_scolaire', niveauSelect.value);

    if (descInput.value.trim()) {
      formData.append('description', descInput.value.trim());
    }

    if (mediaInput.files[0]) {
      formData.append('media', mediaInput.files[0]);
    }

    try {
      await createEpreuve(formData);
      notify({ tone: 'success', message: 'Épreuve publiée avec succès.' });
      window.location.hash = '#/epreuves';
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.style.display = 'flex';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Publier l\'épreuve';
    }
  });

  card.append(form);
  page.append(card);

  return page;
};
