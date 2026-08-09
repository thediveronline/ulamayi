import { createEpreuve } from '../../services/epreuve.service.js';
import { createIcon } from '../../components/icon/icon.js';
import { notify } from '../../components/notifications/notifications.js';
import { createElement, createButton, createField, createSelectField } from '../../utils/dom.js';
import { SCHOOL_LEVELS } from '../../utils/constants.js';

export const createEpreuveFormView = () => {
  const page = createElement({ tag: 'section', className: 'page' });

  const backLink = createElement({ tag: 'a', className: 'btn btn-ghost', attrs: { href: '#/epreuves' } });
  backLink.append(createIcon('chevronLeft', { size: 18 }));
  backLink.append(createElement({ tag: 'span', text: ' Retour' }));
  page.append(backLink);

  const card = createElement({ tag: 'div', className: 'stack-lg' });

  const header = createElement({ tag: 'div', className: 'stack' });
  header.append(
    createElement({ tag: 'h2', text: 'Nouvelle épreuve' }),
    createElement({ tag: 'p', className: 'page-subtitle', text: 'Publiez une épreuve pour que les enseignants puissent proposer des corrections.' })
  );
  card.append(header);

  const form = createElement({ tag: 'form', className: 'form' });

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

  const contenuField = createElement({ tag: 'div', className: 'field' });
  const contenuLabel = createElement({ tag: 'label', className: 'field-label', attrs: { for: 'contenu' }, text: 'Contenu' });
  contenuField.append(contenuLabel);

  const contenuTextarea = createElement({ tag: 'textarea', className: 'textarea', attrs: { id: 'contenu', name: 'contenu', placeholder: 'Détaillez le contenu de l\'épreuve...', rows: '6', required: '' } });
  contenuField.append(contenuTextarea);
  form.append(contenuField);

  const mediaField = createElement({ tag: 'div', className: 'field' });
  const mediaLabel = createElement({ tag: 'label', className: 'field-label', attrs: { for: 'media' }, text: 'Fichier média (optionnel)' });
  mediaField.append(mediaLabel);

  const mediaInput = createElement({ tag: 'input', className: 'input', attrs: { type: 'file', id: 'media', name: 'media', accept: 'image/jpeg,image/png,image/webp,image/gif,application/pdf' } });
  mediaField.append(mediaInput);

  mediaField.append(createElement({ tag: 'span', className: 'field-hint', text: 'JPG, PNG, WEBP, GIF ou PDF. Max 10 Mo.' }));
  form.append(mediaField);

  const submitBtn = createButton({ label: 'Publier l\'épreuve', type: 'submit', variant: 'primary', block: true });
  form.append(submitBtn);

  const errorEl = createElement({ tag: 'div', className: 'alert alert-danger', attrs: { style: 'display: none;' } });
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
      const res = await createEpreuve(formData);
      notify({ tone: 'success', message: 'Épreuve publiée avec succès.' });
      const createdId = res?.epreuve?.id || res?.id;
      if (createdId) {
        window.location.hash = `#/epreuves/${createdId}`;
      } else {
        window.location.hash = '#/epreuves';
      }
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
