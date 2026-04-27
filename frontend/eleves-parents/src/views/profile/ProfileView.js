import { getMyProfile, updateMyProfile } from '../../services/profile.service.js';
import { createAlert } from '../../components/alert/alert.js';
import { notify } from '../../components/notifications/notifications.js';
import { createElement, createButton, createField, createSelectField } from '../../utils/dom.js';
import { SCHOOL_LEVELS } from '../../utils/constants.js';
import { getUserRole } from '../../utils/session.js';
import { createLoadingCard, setLoadingState } from '../../utils/loading.js';
import { createIcon } from '../../components/icon/icon.js';

const formatDate = (iso) => {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
};

const renderInfoRow = (icon, label, value) => {
  const row = createElement({ tag: 'div', className: 'row', attrs: { style: 'gap: 0.75rem;' } });
  const iconWrap = createElement({ tag: 'div', className: 'empty-state-icon', attrs: { style: 'width:36px;height:36px;' } });
  iconWrap.append(createIcon(icon, { size: 16 }));

  const text = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap: 0;' } });
  text.append(
    createElement({ tag: 'span', className: 'subtle', text: label }),
    createElement({ tag: 'strong', text: value || '-' })
  );

  row.append(iconWrap, text);
  return row;
};

export const createProfileView = () => {
  const role = getUserRole();
  const page = createElement({ tag: 'section', className: 'page' });

  // Header
  const header = createElement({ tag: 'div', className: 'page-header' });
  const headerLeft = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap: 0.25rem;' } });
  headerLeft.append(
    createElement({ tag: 'h1', className: 'page-title', text: 'Mon profil' }),
    createElement({ tag: 'p', className: 'page-subtitle', text: role === 'parent' ? 'Gère les informations de ton compte parent.' : 'Gère les informations de ton compte élève.' })
  );
  header.append(headerLeft);
  page.append(header);

  const feedback = createElement({ tag: 'div', className: 'stack' });
  page.append(feedback);

  // Profile summary card
  const summaryCard = createElement({ tag: 'div', className: 'card stack' });
  summaryCard.append(createLoadingCard('Chargement du profil...'));
  page.append(summaryCard);

  // Edit form card
  const formCard = createElement({ tag: 'div', className: 'card stack' });
  formCard.append(createElement({ tag: 'h2', text: 'Modifier mes informations' }));

  const form = createElement({ tag: 'form', className: 'form' });

  const fields = {
    nom: createField({ name: 'nom', label: 'Nom', required: true }),
    prenom: createField({ name: 'prenom', label: 'Prénom', required: true })
  };

  if (role === 'eleve') {
    fields.level = createSelectField({
      name: 'niveau_scolaire',
      label: 'Niveau scolaire',
      options: SCHOOL_LEVELS
    });
  }

  Object.values(fields).forEach((field) => form.append(field));

  const submitButton = createButton({ label: 'Enregistrer', icon: 'save', type: 'submit', variant: 'primary' });
  const actions = createElement({ tag: 'div', className: 'row' });
  actions.append(submitButton);
  form.append(actions);

  formCard.append(form);
  page.append(formCard);

  // Renderers
  const renderSummary = (profile) => {
    summaryCard.replaceChildren();

    const top = createElement({ tag: 'div', className: 'row-between' });
    const identity = createElement({ tag: 'div', className: 'row' });

    const avatar = createElement({ tag: 'div', className: 'empty-state-icon', attrs: { style: 'width: 56px; height: 56px;' } });
    avatar.append(createIcon('user', { size: 26 }));

    const info = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap: 0.125rem;' } });
    info.append(
      createElement({ tag: 'h2', text: `${profile.prenom || ''} ${profile.nom || ''}`.trim() || 'Utilisateur' }),
      createElement({ tag: 'span', className: 'subtle', text: profile.email || '-' })
    );

    identity.append(avatar, info);
    top.append(identity);

    const badge = createElement({ tag: 'span', className: role === 'parent' ? 'badge badge-accent' : 'badge badge-primary', text: role === 'parent' ? 'Parent' : 'Élève' });
    top.append(badge);

    const grid = createElement({ tag: 'div', className: 'grid-cards' });
    grid.append(renderInfoRow('mail', 'Email', profile.email));
    if (role === 'eleve') {
      grid.append(renderInfoRow('graduation', 'Niveau scolaire', profile.niveau_scolaire));
    }
    grid.append(renderInfoRow('calendar', 'Membre depuis', formatDate(profile.cree_le)));
    if (typeof profile.est_verifie === 'boolean') {
      grid.append(renderInfoRow('shield', 'Compte', profile.est_verifie ? 'Vérifié' : 'Non vérifié'));
    }

    summaryCard.append(top, createElement({ tag: 'hr', className: 'divider' }), grid);
  };

  const fillForm = (profile) => {
    form.elements.nom.value = profile.nom || '';
    form.elements.prenom.value = profile.prenom || '';
    if (form.elements.niveau_scolaire) {
      form.elements.niveau_scolaire.value = profile.niveau_scolaire || SCHOOL_LEVELS[0];
    }
  };

  getMyProfile()
    .then((profile) => {
      renderSummary(profile);
      fillForm(profile);
    })
    .catch((error) => {
      summaryCard.replaceChildren(createAlert({ tone: 'danger', message: error.message }));
      notify({ tone: 'danger', message: error.message });
    });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    feedback.replaceChildren();
    setLoadingState({ button: submitButton, isLoading: true, idleLabel: 'Enregistrer' });

    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const updated = await updateMyProfile(payload);
      renderSummary(updated);
      fillForm(updated);
      feedback.append(createAlert({ tone: 'success', message: 'Profil mis à jour.' }));
      notify({ tone: 'success', message: 'Profil mis à jour.' });
    } catch (error) {
      feedback.append(createAlert({ tone: 'danger', message: error.message }));
      notify({ tone: 'danger', message: error.message });
    } finally {
      setLoadingState({ button: submitButton, isLoading: false, idleLabel: 'Enregistrer' });
    }
  });

  return page;
};
