import { getMyProfile } from '../../services/teacher.service.js';
import { apiRequest } from '../../services/api.js';
import { createAlert } from '../../components/alert/alert.js';
import { notify } from '../../components/notifications/notifications.js';
import { createElement, createButton, createField } from '../../utils/dom.js';
import { createLoadingCard, setLoadingState } from '../../utils/loading.js';
import { createIcon } from '../../components/icon/icon.js';

const formatDate = (iso) => {
  if (!iso) return '-';
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }); }
  catch { return iso; }
};

export const createProfileView = () => {
  const page = createElement({ tag: 'section', className: 'page' });

  const header = createElement({ tag: 'div', className: 'page-header' });
  const headerLeft = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap:0.25rem;' } });
  headerLeft.append(
    createElement({ tag: 'h1', className: 'page-title', text: 'Mon profil' }),
    createElement({ tag: 'p', className: 'page-subtitle', text: 'Gérez vos informations personnelles et professionnelles.' })
  );
  header.append(headerLeft);
  page.append(header);

  const feedback = createElement({ tag: 'div', className: 'stack' });
  page.append(feedback);

  // --- Carte résumé ---
  const summaryCard = createElement({ tag: 'div', className: 'card stack' });
  summaryCard.append(createLoadingCard('Chargement du profil...'));
  page.append(summaryCard);

  // --- Formulaire de modification ---
  const formCard = createElement({ tag: 'div', className: 'card stack' });
  formCard.append(createElement({ tag: 'h2', text: 'Modifier mes informations' }));

  const form = createElement({ tag: 'form', className: 'form' });

  // Photo de profil
  const photoWrap = createElement({ tag: 'div', className: 'profil-photo-wrap' });
  const photoPreview = createElement({ tag: 'div', className: 'profil-photo-preview' });
  photoPreview.append(createIcon('user', { size: 32 }));

  const photoLabel = document.createElement('label');
  photoLabel.className = 'profil-photo-label';
  photoLabel.append(createIcon('edit', { size: 14 }));
  photoLabel.append(document.createTextNode(' Changer la photo'));
  const photoInput = document.createElement('input');
  photoInput.type = 'file';
  photoInput.accept = 'image/*';
  photoInput.hidden = true;
  photoLabel.append(photoInput);

  photoInput.addEventListener('change', () => {
    if (photoInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        photoPreview.replaceChildren();
        const img = document.createElement('img');
        img.src = e.target.result;
        photoPreview.append(img);
      };
      reader.readAsDataURL(photoInput.files[0]);
    }
  });

  photoWrap.append(photoPreview, photoLabel);
  form.append(photoWrap);

  // Champs
  form.append(createField({ name: 'prenom', label: 'Prénom', required: true }));
  form.append(createField({ name: 'nom', label: 'Nom', required: true }));
  form.append(createField({ name: 'matiere', label: 'Matière(s) enseignée(s)', placeholder: 'Ex: Mathématiques, Physique' }));
  form.append(createField({ name: 'titre', label: 'Titre / Institution', placeholder: 'Ex: Étudiant à l\'ENS de Yaoundé, Dr, Prof...' }));
  form.append(createField({ name: 'numero_telephone', label: 'Téléphone', type: 'tel', placeholder: '+237 6XX XXX XXX' }));

  const submitButton = createButton({ label: 'Enregistrer', icon: 'save', type: 'submit', variant: 'primary' });
  const actions = createElement({ tag: 'div', className: 'row' });
  actions.append(submitButton);
  form.append(actions);

  formCard.append(form);
  page.append(formCard);

  // --- Rendu de la carte résumé ---
  const renderSummary = (profile) => {
    summaryCard.replaceChildren();

    const top = createElement({ tag: 'div', className: 'teacher-profil' });

    const avatar = createElement({ tag: 'div', className: 'teacher-profil__avatar' });
    if (profile.photo_profil) {
      const img = document.createElement('img');
      img.src = profile.photo_profil;
      img.alt = '';
      avatar.append(img);
    } else {
      avatar.append(createIcon('user', { size: 32 }));
    }

    const info = createElement({ tag: 'div', className: 'teacher-profil__info' });
    const nom = [profile.titre, profile.prenom, profile.nom].filter(Boolean).join(' ');
    info.append(createElement({ tag: 'h2', text: nom || 'Enseignant' }));

    if (profile.matiere) {
      info.append(createElement({ tag: 'span', className: 'badge badge-primary', text: profile.matiere }));
    }

    if (profile.numero_telephone) {
      const tel = createElement({ tag: 'a', className: 'teacher-profil__contact', attrs: { href: `tel:${profile.numero_telephone}` } });
      tel.append(createIcon('phone', { size: 13 }));
      tel.append(document.createTextNode(` ${profile.numero_telephone}`));
      info.append(tel);
    }

    const meta = createElement({ tag: 'div', className: 'subtle', attrs: { style: 'font-size:0.8rem;' } });
    meta.textContent = `Membre depuis ${formatDate(profile.cree_le)}`;
    info.append(meta);

    top.append(avatar, info);
    summaryCard.append(top);

    // Remettre l'aperçu photo
    const currentImg = photoPreview.querySelector('img');
    if (!currentImg && profile.photo_profil) {
      photoPreview.replaceChildren();
      const img = document.createElement('img');
      img.src = profile.photo_profil;
      photoPreview.append(img);
    }
  };

  const fillForm = (profile) => {
    if (form.elements.nom) form.elements.nom.value = profile.nom || '';
    if (form.elements.prenom) form.elements.prenom.value = profile.prenom || '';
    if (form.elements.matiere) form.elements.matiere.value = profile.matiere || '';
    if (form.elements.titre) form.elements.titre.value = profile.titre || '';
    if (form.elements.numero_telephone) form.elements.numero_telephone.value = profile.numero_telephone || '';
  };

  getMyProfile()
    .then((profile) => { renderSummary(profile); fillForm(profile); })
    .catch((err) => {
      summaryCard.replaceChildren(createAlert({ tone: 'danger', message: err.message }));
      notify({ tone: 'danger', message: err.message });
    });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    feedback.replaceChildren();
    setLoadingState({ button: submitButton, isLoading: true, idleLabel: 'Enregistrer' });

    try {
      const formData = new FormData();
      formData.append('nom', form.elements.nom?.value || '');
      formData.append('prenom', form.elements.prenom?.value || '');
      formData.append('matiere', form.elements.matiere?.value || '');
      formData.append('titre', form.elements.titre?.value || '');
      formData.append('numero_telephone', form.elements.numero_telephone?.value || '');
      if (photoInput.files[0]) {
        formData.append('photo', photoInput.files[0]);
      }

      const updated = await apiRequest('/enseignants/profil', { method: 'PUT', body: formData });
      renderSummary(updated);
      fillForm(updated);
      feedback.append(createAlert({ tone: 'success', message: 'Profil mis à jour avec succès.' }));
      notify({ tone: 'success', message: 'Profil mis à jour.' });
    } catch (err) {
      feedback.append(createAlert({ tone: 'danger', message: err.message }));
      notify({ tone: 'danger', message: err.message });
    } finally {
      setLoadingState({ button: submitButton, isLoading: false, idleLabel: 'Enregistrer' });
    }
  });

  return page;
};
