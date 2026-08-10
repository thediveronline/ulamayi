import {
  getClasseById, updateClasse, listerEleves, ajouterEleve, supprimerClasse,
  getMessages, getMediasClasse, envoyerMessage
} from '../../services/classe.service.js';
import { createIcon } from '../../components/icon/icon.js';
import { notify } from '../../components/notifications/notifications.js';
import { createLoadingCard } from '../../utils/loading.js';
import { createElement, createField, createButton } from '../../utils/dom.js';
import { getSession } from '../../utils/session.js';

const POLL = 4000;

const formatHeure = (iso) => {
  try { return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
};

const buildBubble = (msg, currentUserId, currentUserRole) => {
  const moi = (msg.expediteur_id === currentUserId && msg.role_expediteur === currentUserRole);
  const wrap = createElement({ tag: 'div', className: `chat__row ${moi ? 'chat__row--user' : 'chat__row--ai'}` });
  const bubble = createElement({ tag: 'div', className: `chat__msg ${moi ? 'chat__msg--user' : 'chat__msg--ai'}` });

  if (!moi) {
    const senderHeader = createElement({ tag: 'div', className: 'chat__sender' });
    const nomText = msg.nom_expediteur || (msg.role_expediteur === 'enseignant' ? 'Enseignant' : 'Élève');
    const senderName = createElement({ tag: 'span', className: 'chat__sender-name', text: nomText });
    senderHeader.append(senderName);

    const isProf = msg.role_expediteur === 'enseignant';
    const roleBadge = createElement({
      tag: 'span',
      className: `badge ${isProf ? 'badge-accent' : 'badge-primary'}`,
      text: isProf ? 'Prof' : 'Élève'
    });
    roleBadge.style.cssText = 'font-size:0.65rem; padding:1px 6px; margin-left:6px; font-weight:600;';
    senderHeader.append(roleBadge);

    bubble.append(senderHeader);
  }

  if (msg.media_url) {
    if (msg.media_type === 'pdf') {
      const link = createElement({ tag: 'a', className: 'chat__media-link', text: 'Document PDF', attrs: { href: msg.media_url, target: '_blank', rel: 'noopener' } });
      link.prepend(createIcon('fileText', { size: 14 }));
      bubble.append(link);
    } else {
      const img = document.createElement('img');
      img.src = msg.media_url;
      img.className = 'chat__media-img';
      img.alt = 'Média';
      img.loading = 'lazy';
      bubble.append(img);
    }
  }

  if (msg.contenu) {
    bubble.append(createElement({ tag: 'div', className: 'chat__text', text: msg.contenu }));
  }

  bubble.append(createElement({ tag: 'span', className: 'chat__time', text: formatHeure(msg.cree_le) }));
  wrap.append(bubble);
  return wrap;
};

export const createClasseDetailView = (context = {}) => {
  const classeId = parseInt(context?.params?.id, 10);
  const page = createElement({ tag: 'section', className: 'ia-chat-screen classe-chat' });

  if (!classeId || Number.isNaN(classeId)) {
    page.append(createElement({ tag: 'p', className: 'muted', text: 'Classe introuvable.' }));
    return page;
  }

  const session = getSession();
  const currentUserId = session?.utilisateur?.id;
  const currentUserRole = session?.utilisateur?.role || 'enseignant';

  let lastMsgCount = 0;
  let pollTimer = null;
  let classeData = null;

  // --- BARRE DE TITRE & LOGO ---
  const bar = createElement({ tag: 'div', className: 'ia-chat-bar' });
  const backBtn = createButton({ icon: 'chevronLeft', variant: 'ghost', size: 'sm' });
  backBtn.addEventListener('click', () => { window.location.hash = '/classes'; });
  bar.append(backBtn);

  const barAvatar = createElement({ tag: 'div', className: 'ia-chat-bar__avatar' });
  barAvatar.append(createIcon('graduation', { size: 18 }));
  bar.append(barAvatar);

  const barInfo = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap:0; flex:1; min-width:0;' } });
  const barTitle = createElement({ tag: 'span', className: 'ia-chat-bar__title', text: 'Chargement...' });
  const barSub = createElement({ tag: 'span', className: 'ia-chat-bar__status' });
  barInfo.append(barTitle, barSub);
  bar.append(barInfo);

  // Boutons d'onglets
  const tabMediaBtn = createButton({ icon: 'image', variant: 'ghost', size: 'sm' });
  tabMediaBtn.title = 'Fichiers partagés';
  const tabMembersBtn = createButton({ icon: 'users', variant: 'ghost', size: 'sm' });
  tabMembersBtn.title = 'Liste des élèves';
  const tabSettingsBtn = createButton({ icon: 'settings', variant: 'ghost', size: 'sm' });
  tabSettingsBtn.title = 'Paramètres de la classe';
  bar.append(tabMediaBtn, tabMembersBtn, tabSettingsBtn);
  page.append(bar);

  // --- ZONE MESSAGES ---
  const scroll = createElement({ tag: 'div', className: 'ia-chat__scroll' });
  scroll.append(createLoadingCard('Chargement de la classe...'));
  page.append(scroll);

  // --- PANNEAUX DÉROULANTS ---
  const makePanel = (title) => {
    const panel = createElement({ tag: 'div', className: 'ia-history-panel' });
    const head = createElement({ tag: 'div', className: 'ia-history-panel__head' });
    head.append(createElement({ tag: 'span', className: 'ia-history-panel__title', text: title }));
    const closeBtn = createButton({ icon: 'x', variant: 'ghost', size: 'sm' });
    closeBtn.addEventListener('click', () => panel.classList.remove('is-open'));
    head.append(closeBtn);
    panel.append(head);
    const body = createElement({ tag: 'div', className: 'ia-history-panel__list' });
    panel.append(body);
    page.append(panel);
    return { panel, body };
  };

  const { panel: mediaPanel, body: mediaList } = makePanel('Fichiers partagés');
  const { panel: membersPanel, body: membersList } = makePanel('Membres de la classe');
  const { panel: settingsPanel, body: settingsBody } = makePanel('Paramètres de la classe');

  tabMediaBtn.addEventListener('click', () => {
    mediaPanel.classList.toggle('is-open');
    membersPanel.classList.remove('is-open');
    settingsPanel.classList.remove('is-open');
    getMediasClasse(classeId).then(items => {
      mediaList.replaceChildren();
      if (!items.length) { mediaList.append(createElement({ tag: 'p', className: 'muted', text: 'Aucun fichier.' })); return; }
      items.forEach(item => {
        const row = createElement({ tag: 'a', className: 'ia-history-item', attrs: { href: item.media_url, target: '_blank', rel: 'noopener' } });
        row.append(item.media_type === 'pdf' ? createIcon('fileText', { size: 16 }) : createIcon('image', { size: 16 }));
        row.append(createElement({ tag: 'span', text: item.nom_expediteur || 'Fichier' }));
        mediaList.append(row);
      });
    }).catch(() => {});
  });

  tabMembersBtn.addEventListener('click', () => {
    membersPanel.classList.toggle('is-open');
    mediaPanel.classList.remove('is-open');
    settingsPanel.classList.remove('is-open');
    listerEleves(classeId).then(eleves => {
      membersList.replaceChildren();
      if (!eleves.length) { membersList.append(createElement({ tag: 'p', className: 'muted', text: 'Aucun élève inscrit.' })); return; }
      eleves.forEach(e => {
        const row = createElement({ tag: 'div', className: 'ia-history-item' });
        const nom = `${e.prenom || ''} ${e.nom || ''}`.trim() || e.email;
        row.append(createIcon('user', { size: 14 }));
        row.append(createElement({ tag: 'span', text: nom }));
        membersList.append(row);
      });
    }).catch(() => {});
  });

  tabSettingsBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('is-open');
    mediaPanel.classList.remove('is-open');
    membersPanel.classList.remove('is-open');
    if (!classeData) return;
    settingsBody.replaceChildren();

    const form = createElement({ tag: 'form', className: 'stack' });
    const nomField = createField({ label: 'Nom de la classe', name: 'nom', value: classeData.nom || '', required: true });
    const niveauField = createField({ label: 'Niveau scolaire', name: 'niveau_scolaire', value: classeData.niveau_scolaire || '' });
    const descField = createField({ label: 'Description', name: 'description', type: 'textarea', value: classeData.description || '' });
    const prixField = createField({ label: 'Prix d\'accès (0 = Gratuit)', name: 'prix', type: 'number', value: classeData.prix || '0' });
    const planField = createField({ label: 'Planning des cours', name: 'planning', value: classeData.planning || '' });

    form.append(nomField, niveauField, descField, prixField, planField);

    const saveBtn = createButton({ label: 'Enregistrer', icon: 'save', variant: 'primary', size: 'sm' });
    saveBtn.type = 'submit';
    form.append(saveBtn);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        nom: form.querySelector('[name="nom"]')?.value,
        niveau_scolaire: form.querySelector('[name="niveau_scolaire"]')?.value,
        description: form.querySelector('[name="description"]')?.value,
        prix: parseFloat(form.querySelector('[name="prix"]')?.value) || 0,
        planning: form.querySelector('[name="planning"]')?.value
      };
      saveBtn.disabled = true;
      try {
        const updated = await updateClasse(classeId, payload);
        classeData = updated.classe || classeData;
        barTitle.textContent = classeData.nom || 'Classe';
        notify({ tone: 'success', message: 'Classe mise à jour.' });
      } catch (err) {
        notify({ tone: 'danger', message: err.message });
      } finally {
        saveBtn.disabled = false;
      }
    });

    const deleteBtn = createButton({ label: 'Supprimer la classe', icon: 'trash', variant: 'danger', size: 'sm' });
    deleteBtn.addEventListener('click', async () => {
      if (!window.confirm(`Supprimer la classe "${classeData.nom}" ?`)) return;
      try {
        await supprimerClasse(classeId);
        notify({ tone: 'success', message: 'Classe supprimée.' });
        window.location.hash = '/classes';
      } catch (err) {
        notify({ tone: 'danger', message: err.message });
      }
    });

    const ajouter = createElement({ tag: 'div', className: 'stack', attrs: { style: 'margin-top:var(--space-4);' } });
    ajouter.append(createElement({ tag: 'h4', text: 'Inscrire un élève (par ID)' }));
    const addForm = createElement({ tag: 'form', className: 'row' });
    const eleveField = createField({ label: '', name: 'eleve_id', type: 'number', placeholder: 'ID élève', required: true });
    eleveField.style.flex = '1';
    const addBtn = createButton({ label: 'Ajouter', icon: 'plus', variant: 'secondary', size: 'sm' });
    addBtn.type = 'submit';
    addForm.append(eleveField, addBtn);

    addForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = parseInt(eleveField.querySelector('input')?.value, 10);
      if (!id) return;
      addBtn.disabled = true;
      try {
        await ajouterEleve(classeId, id);
        notify({ tone: 'success', message: 'Élève inscrit à la classe.' });
        eleveField.querySelector('input').value = '';
      } catch (err) {
        notify({ tone: 'danger', message: err.message });
      } finally { addBtn.disabled = false; }
    });
    ajouter.append(addForm);

    settingsBody.append(form, ajouter, createElement({ tag: 'hr', className: 'divider' }), deleteBtn);
  });

  // --- COMPOSITEUR DE MESSAGE ---
  const composerWrap = createElement({ tag: 'div', className: 'ia-composer-wrap' });
  const form = createElement({ tag: 'form', className: 'ia-composer' });

  const attachLabel = document.createElement('label');
  attachLabel.className = 'ia-attach-btn';
  attachLabel.title = 'Joindre une photo ou un document PDF';
  attachLabel.append(createIcon('paperclip', { size: 18 }));
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*,.pdf';
  fileInput.hidden = true;
  attachLabel.append(fileInput);
  form.append(attachLabel);

  const input = document.createElement('textarea');
  input.className = 'ia-input';
  input.rows = 1;
  input.placeholder = 'Envoyer un message dans la classe...';
  form.append(input);

  const sendBtn = document.createElement('button');
  sendBtn.type = 'submit';
  sendBtn.className = 'btn btn-primary ia-send-btn';
  sendBtn.title = 'Envoyer';
  sendBtn.append(createIcon('send', { size: 18 }));
  form.append(sendBtn);

  composerWrap.append(form);
  page.append(composerWrap);

  const previewWrap = createElement({ tag: 'div', className: 'chat__file-preview', attrs: { style: 'display:none;' } });
  const previewLabel = createElement({ tag: 'span', className: 'subtle' });
  const removeFileBtn = createButton({ icon: 'x', variant: 'ghost', size: 'sm' });
  previewWrap.append(createIcon('paperclip', { size: 14 }), previewLabel, removeFileBtn);
  composerWrap.prepend(previewWrap);

  let fichierSelectionne = null;
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) {
      fichierSelectionne = fileInput.files[0];
      previewLabel.textContent = fichierSelectionne.name;
      previewWrap.style.display = 'flex';
    }
  });
  removeFileBtn.addEventListener('click', () => {
    fichierSelectionne = null;
    fileInput.value = '';
    previewWrap.style.display = 'none';
  });

  const autoGrow = () => { input.style.height = 'auto'; input.style.height = `${Math.min(input.scrollHeight, 120)}px`; };
  input.addEventListener('input', autoGrow);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
  });
  const scrollToBottom = () => requestAnimationFrame(() => { scroll.scrollTop = scroll.scrollHeight; });

  // --- RENDU DES MESSAGES STYLE WHATSAPP ---
  const renderMessages = (messages) => {
    scroll.replaceChildren();
    if (!messages.length) {
      scroll.append(createElement({ tag: 'div', className: 'chat__empty', text: 'Aucun message dans ce chat de classe. Écrivez le premier !' }));
      return;
    }
    let lastDate = '';
    messages.forEach(msg => {
      const d = msg.cree_le ? new Date(msg.cree_le).toLocaleDateString('fr-FR') : '';
      if (d && d !== lastDate) {
        scroll.append(createElement({ tag: 'div', className: 'chat__date-sep', text: d }));
        lastDate = d;
      }
      scroll.append(buildBubble(msg, currentUserId, currentUserRole));
    });
    lastMsgCount = messages.length;
    scrollToBottom();
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const texte = input.value.trim();
    if (!texte && !fichierSelectionne) return;

    sendBtn.disabled = true;
    try {
      await envoyerMessage(classeId, texte, fichierSelectionne);
      input.value = '';
      fichierSelectionne = null;
      fileInput.value = '';
      previewWrap.style.display = 'none';
      autoGrow();
      const msgs = await getMessages(classeId);
      renderMessages(msgs);
    } catch (err) {
      notify({ tone: 'danger', message: err.message });
    } finally {
      sendBtn.disabled = false;
    }
  });

  // --- CHARGEMENT INITIAL ---
  getClasseById(classeId).then(classe => {
    classeData = classe;
    barTitle.textContent = classe.nom || 'Classe';
    barSub.textContent = `${classe.nombre_eleves || 0} élève(s) · ${classe.niveau_scolaire || ''}`;

    if (classe.logo_url) {
      barAvatar.replaceChildren();
      const img = document.createElement('img');
      img.src = classe.logo_url;
      img.alt = 'Logo';
      img.style.cssText = 'width:100%; height:100%; object-fit:cover; border-radius:var(--radius-md);';
      barAvatar.append(img);
    }

    return getMessages(classeId);
  }).then(msgs => {
    renderMessages(msgs);
    pollTimer = setInterval(async () => {
      try {
        const msgs = await getMessages(classeId);
        if (msgs.length !== lastMsgCount) renderMessages(msgs);
      } catch (_) {}
    }, POLL);
  }).catch(err => {
    scroll.replaceChildren(createElement({ tag: 'p', className: 'muted', text: err.message }));
  });

  page.addEventListener('disconnected', () => clearInterval(pollTimer));
  return page;
};
