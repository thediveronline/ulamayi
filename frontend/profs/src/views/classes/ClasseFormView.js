import { createClasse } from '../../services/classe.service.js';
import { createIcon } from '../../components/icon/icon.js';
import { notify } from '../../components/notifications/notifications.js';
import { createField, createSelectField } from '../../utils/dom.js';
import { SCHOOL_LEVELS } from '../../utils/constants.js';

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
  header.append(title);

  const subtitle = document.createElement('p');
  subtitle.className = 'page-subtitle';
  subtitle.textContent = 'Créez une classe pour y inscrire vos élèves.';
  header.append(subtitle);

  card.append(header);

  const form = document.createElement('form');
  form.className = 'form';

  const nomField = createField({
    label: 'Nom de la classe',
    name: 'nom',
    placeholder: 'Ex: Terminale A',
    required: true
  });
  form.append(nomField);
  const nomInput = nomField.querySelector('input');

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

  const descField = createField({ label: 'Description (optionnelle)', name: 'description', type: 'textarea', placeholder: 'Décrivez le contenu de la classe...' });
  form.append(descField);

  const prixField = createField({ label: 'Prix d\'accès (0 = Gratuit)', name: 'prix', type: 'number', placeholder: '0' });
  form.append(prixField);
  const prixInput = prixField.querySelector('input');

  const planField = createField({ label: 'Planning', name: 'planning', placeholder: 'Ex: Lun/Mer 18h-20h' });
  form.append(planField);
  const planInput = planField.querySelector('input');

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
      const res = await createClasse({
        nom: nomInput.value.trim(),
        niveau_scolaire: niveauSelect.value,
        description: form.querySelector('[name="description"]')?.value?.trim() || '',
        prix: parseFloat(prixInput.value) || 0,
        planning: planInput.value.trim() || ''
      });
      notify({ tone: 'success', message: 'Classe créée avec succès.' });
      const id = res?.classe?.id;
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
