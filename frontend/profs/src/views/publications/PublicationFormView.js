import { createPublication, updatePublication, getPublicationById } from '../../services/publication.service.js';
import { createElement, createButton, createField, createSelectField } from '../../utils/dom.js';
import { SCHOOL_LEVELS } from '../../utils/constants.js';
import { createAlert } from '../../components/alert/alert.js';
import { notify } from '../../components/notifications/notifications.js';
import { createIcon } from '../../components/icon/icon.js';
import { createLoadingCard, setLoadingState } from '../../utils/loading.js';

const TYPES_AUTORISES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
const TAILLE_MAX_OCTETS = 10 * 1024 * 1024;

const buildTextareaField = ({ name, label, required = false, hint = '', rows = 8, placeholder = '' }) => {
  const wrapper = createElement({ tag: 'label', className: 'field' });
  wrapper.append(createElement({ tag: 'span', className: 'field-label', text: label }));

  const textarea = document.createElement('textarea');
  textarea.className = 'textarea';
  textarea.name = name;
  textarea.rows = rows;
  if (required) textarea.required = true;
  if (placeholder) textarea.placeholder = placeholder;
  wrapper.append(textarea);

  if (hint) wrapper.append(createElement({ tag: 'span', className: 'field-hint', text: hint }));
  return wrapper;
};

// Champ d'upload de fichier avec apercu image/PDF, suppression et indicateur "media existant"
const buildMediaField = ({ initialMediaUrl, initialMediaType }) => {
  const wrapper = createElement({ tag: 'div', className: 'field' });
  wrapper.append(createElement({ tag: 'span', className: 'field-label', text: 'Média (image ou PDF)' }));

  const dropZone = createElement({
    tag: 'div',
    className: 'media-drop',
    attrs: { style: 'border: 1px dashed var(--color-border-strong); border-radius: var(--radius-md); padding: var(--space-4); display: grid; gap: var(--space-3); background: var(--color-surface-muted);' }
  });

  const input = document.createElement('input');
  input.type = 'file';
  input.name = 'media';
  input.accept = TYPES_AUTORISES.join(',');
  input.style.display = 'none';

  const previewArea = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap: var(--space-2);' } });
  const placeholder = createElement({ tag: 'p', className: 'muted', attrs: { style: 'margin: 0;' } });
  placeholder.textContent = 'Aucun fichier sélectionné. Formats acceptés : JPG, PNG, WEBP, GIF, PDF (max 10 Mo).';

  const actions = createElement({ tag: 'div', className: 'row' });
  const pickBtn = createButton({ label: 'Choisir un fichier', icon: 'plus', variant: 'secondary', size: 'sm' });
  pickBtn.addEventListener('click', () => input.click());
  actions.append(pickBtn);

  // Etat : fichier nouvellement choisi
  let nouveauFichier = null;
  // Etat : flag pour supprimer le media existant
  let supprimerMediaExistant = false;

  const renderState = () => {
    previewArea.replaceChildren();

    if (nouveauFichier) {
      const info = createElement({ tag: 'div', className: 'row', attrs: { style: 'gap: var(--space-3); align-items: center;' } });
      const isImage = nouveauFichier.type.startsWith('image/');
      if (isImage) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(nouveauFichier);
        img.alt = nouveauFichier.name;
        img.style.cssText = 'width: 96px; height: 96px; object-fit: cover; border-radius: var(--radius-md); border: 1px solid var(--color-border);';
        info.append(img);
      } else {
        const pdfIcon = createElement({ tag: 'div', className: 'empty-state-icon', attrs: { style: 'width: 64px; height: 64px;' } });
        pdfIcon.append(createIcon('book', { size: 28 }));
        info.append(pdfIcon);
      }
      const meta = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap: 0;' } });
      meta.append(
        createElement({ tag: 'strong', text: nouveauFichier.name }),
        createElement({ tag: 'span', className: 'subtle', text: `${(nouveauFichier.size / 1024).toFixed(0)} Ko · ${nouveauFichier.type}` })
      );
      info.append(meta);
      previewArea.append(info);

      const clearBtn = createButton({ label: 'Retirer ce fichier', icon: 'x', variant: 'ghost', size: 'sm' });
      clearBtn.addEventListener('click', () => {
        nouveauFichier = null;
        input.value = '';
        renderState();
      });
      previewArea.append(clearBtn);
      return;
    }

    if (initialMediaUrl && !supprimerMediaExistant) {
      const info = createElement({ tag: 'div', className: 'row', attrs: { style: 'gap: var(--space-3); align-items: center;' } });
      if (initialMediaType === 'pdf') {
        const pdfIcon = createElement({ tag: 'div', className: 'empty-state-icon', attrs: { style: 'width: 64px; height: 64px;' } });
        pdfIcon.append(createIcon('book', { size: 28 }));
        info.append(pdfIcon);
      } else {
        const img = document.createElement('img');
        img.src = initialMediaUrl;
        img.alt = 'Média existant';
        img.style.cssText = 'width: 96px; height: 96px; object-fit: cover; border-radius: var(--radius-md); border: 1px solid var(--color-border);';
        info.append(img);
      }
      const meta = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap: 0;' } });
      const link = createElement({ tag: 'a', text: 'Voir le média actuel', attrs: { href: initialMediaUrl, target: '_blank', rel: 'noopener noreferrer' } });
      meta.append(createElement({ tag: 'strong', text: 'Média actuel' }), link);
      info.append(meta);
      previewArea.append(info);

      const removeBtn = createButton({ label: 'Supprimer le média actuel', icon: 'trash', variant: 'ghost', size: 'sm' });
      removeBtn.addEventListener('click', () => {
        supprimerMediaExistant = true;
        renderState();
      });
      previewArea.append(removeBtn);
      return;
    }

    previewArea.append(placeholder);
    if (supprimerMediaExistant) {
      const undo = createButton({ label: 'Annuler la suppression', icon: 'chevronLeft', variant: 'ghost', size: 'sm' });
      undo.addEventListener('click', () => {
        supprimerMediaExistant = false;
        renderState();
      });
      previewArea.append(undo);
    }
  };

  input.addEventListener('change', () => {
    const fichier = input.files?.[0];
    if (!fichier) {
      nouveauFichier = null;
      renderState();
      return;
    }
    if (!TYPES_AUTORISES.includes(fichier.type)) {
      notify({ tone: 'danger', message: `Type de fichier non autorisé : ${fichier.type}.` });
      input.value = '';
      return;
    }
    if (fichier.size > TAILLE_MAX_OCTETS) {
      notify({ tone: 'danger', message: 'Fichier trop volumineux (max 10 Mo).' });
      input.value = '';
      return;
    }
    nouveauFichier = fichier;
    supprimerMediaExistant = false;
    renderState();
  });

  dropZone.append(previewArea, actions, input);
  wrapper.append(dropZone);

  return {
    element: wrapper,
    getFile: () => nouveauFichier,
    shouldRemoveExisting: () => supprimerMediaExistant
  };
};

export const createPublicationFormView = (context = {}) => {
  const id = context?.params?.id;
  const isEdit = Boolean(id);

  const page = createElement({ tag: 'section', className: 'page' });

  const backBtn = createButton({ label: 'Retour', icon: 'chevronLeft', variant: 'ghost', size: 'sm' });
  backBtn.addEventListener('click', () => {
    window.location.hash = isEdit ? `/publications/${id}` : '/publications';
  });
  page.append(backBtn);

  const header = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap: 0.25rem;' } });
  header.append(
    createElement({ tag: 'h1', className: 'page-title', text: isEdit ? 'Modifier la publication' : 'Nouvelle publication' }),
    createElement({ tag: 'p', className: 'page-subtitle', text: isEdit ? 'Mets à jour ta publication.' : 'Rédige une nouvelle épreuve ou un exercice.' })
  );
  page.append(header);

  const feedback = createElement({ tag: 'div', className: 'stack' });
  page.append(feedback);

  const formCard = createElement({ tag: 'div', className: 'card stack' });

  if (isEdit) {
    formCard.append(createLoadingCard('Chargement de la publication...'));
  }
  page.append(formCard);

  const buildForm = (initial = {}) => {
    formCard.replaceChildren();

    const form = createElement({ tag: 'form', className: 'form' });

    const titreField = createField({ name: 'titre', label: 'Titre', required: true, value: initial.titre || '', placeholder: '5 caractères minimum' });
    const descField = buildTextareaField({ name: 'description', label: 'Description', rows: 3, placeholder: 'Courte description (max 500 caractères)' });
    const contenuField = buildTextareaField({ name: 'contenu', label: 'Contenu', required: true, rows: 10, placeholder: 'Énoncé, consignes, questions...' });
    const niveauField = createSelectField({
      name: 'niveau_scolaire',
      label: 'Niveau scolaire',
      required: true,
      options: SCHOOL_LEVELS,
      value: initial.niveau_scolaire || ''
    });
    const prixField = createField({
      name: 'prix',
      label: 'Prix (FCFA)',
      type: 'number',
      value: initial.prix != null ? String(initial.prix) : '0',
      hint: 'Mets 0 pour une publication gratuite.'
    });
    const mediaField = buildMediaField({ initialMediaUrl: initial.media_url || '', initialMediaType: initial.media_type || '' });

    form.append(titreField, descField, contenuField, niveauField, prixField, mediaField.element);

    if (initial.description) descField.querySelector('textarea').value = initial.description;
    if (initial.contenu) contenuField.querySelector('textarea').value = initial.contenu;

    const submitButton = createButton({
      label: isEdit ? 'Enregistrer les modifications' : 'Publier',
      icon: 'save',
      type: 'submit',
      variant: 'primary'
    });
    const actions = createElement({ tag: 'div', className: 'row' });
    actions.append(submitButton);
    form.append(actions);

    formCard.append(form);

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      feedback.replaceChildren();

      const formData = new FormData();
      formData.append('titre', form.elements.titre.value);
      formData.append('description', descField.querySelector('textarea').value || '');
      formData.append('contenu', contenuField.querySelector('textarea').value);
      formData.append('niveau_scolaire', form.elements.niveau_scolaire.value);
      formData.append('prix', form.elements.prix.value || '0');

      const fichier = mediaField.getFile();
      if (fichier) formData.append('media', fichier);
      if (isEdit && mediaField.shouldRemoveExisting() && !fichier) {
        formData.append('supprimer_media', 'true');
      }

      const idleLabel = isEdit ? 'Enregistrer les modifications' : 'Publier';
      setLoadingState({ button: submitButton, isLoading: true, idleLabel });

      try {
        if (isEdit) {
          await updatePublication(id, formData);
          notify({ tone: 'success', message: 'Publication mise à jour.' });
          window.location.hash = `/publications/${id}`;
        } else {
          const created = await createPublication(formData);
          notify({ tone: 'success', message: 'Publication créée.' });
          if (created?.id) {
            window.location.hash = `/publications/${created.id}`;
          } else {
            window.location.hash = '/publications';
          }
        }
      } catch (error) {
        feedback.append(createAlert({ tone: 'danger', message: error.message }));
        notify({ tone: 'danger', message: error.message });
      } finally {
        setLoadingState({ button: submitButton, isLoading: false, idleLabel });
      }
    });
  };

  if (isEdit) {
    getPublicationById(id)
      .then((pub) => buildForm(pub || {}))
      .catch((error) => {
        formCard.replaceChildren(createAlert({ tone: 'danger', message: error.message }));
        notify({ tone: 'danger', message: error.message });
      });
  } else {
    buildForm();
  }

  return page;
};
