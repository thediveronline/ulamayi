import { getClasseById, getMessages, envoyerMessage, getMediasClasse, rejoindreClasse } from '../../services/classe.service.js';
import { createElement, createButton } from '../../utils/dom.js';
import { createIcon } from '../../components/icon/icon.js';
import { createLoadingCard } from '../../utils/loading.js';
import { notify } from '../../components/notifications/notifications.js';
import { getUser, getUserRole } from '../../utils/session.js';

const POLL_INTERVAL = 4000;

const formatHeure = (iso) => {
  try {
    return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
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

export const createClasseChatView = (context = {}) => {
  const classeId = parseInt(context?.params?.id, 10);
  const page = createElement({ tag: 'section', className: 'ia-chat-screen classe-chat' });

  if (!classeId || Number.isNaN(classeId)) {
    page.append(createElement({ tag: 'p', className: 'muted', text: 'Classe introuvable.' }));
    return page;
  }

  const user = getUser();
  const currentUserId = user?.id;
  const currentUserRole = getUserRole();
  let lastMsgCount = 0;
  let pollTimer = null;

  // --- BARRE DE TITRE DE LA CLASSE ---
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

  const mediaBtn = createButton({ icon: 'image', variant: 'ghost', size: 'sm' });
  mediaBtn.title = 'Médias partagés';
  bar.append(mediaBtn);

  page.append(bar);

  // --- ZONE MESSAGES ---
  const scroll = createElement({ tag: 'div', className: 'ia-chat__scroll' });
  scroll.append(createLoadingCard('Chargement des messages...'));
  page.append(scroll);

  // --- PANNEAU MÉDIAS ---
  const mediaPanel = createElement({ tag: 'div', className: 'ia-history-panel' });
  const mediaPanelHead = createElement({ tag: 'div', className: 'ia-history-panel__head' });
  mediaPanelHead.append(createElement({ tag: 'span', className: 'ia-history-panel__title', text: 'Fichiers partagés' }));
  const closePanelBtn = createButton({ icon: 'x', variant: 'ghost', size: 'sm' });
  mediaPanelHead.append(closePanelBtn);
  mediaPanel.append(mediaPanelHead);
  const mediaList = createElement({ tag: 'div', className: 'ia-history-panel__list' });
  mediaPanel.append(mediaList);
  page.append(mediaPanel);

  mediaBtn.addEventListener('click', () => {
    mediaPanel.classList.toggle('is-open');
    getMediasClasse(classeId).then((items) => {
      mediaList.replaceChildren();
      if (!items.length) {
        mediaList.append(createElement({ tag: 'p', className: 'muted', text: 'Aucun fichier partagé.' }));
        return;
      }
      items.forEach(item => {
        const row = createElement({ tag: 'a', className: 'ia-history-item', attrs: { href: item.media_url, target: '_blank', rel: 'noopener' } });
        const icon = item.media_type === 'pdf' ? createIcon('fileText', { size: 16 }) : createIcon('image', { size: 16 });
        row.append(icon);
        row.append(createElement({ tag: 'span', text: item.nom_expediteur || 'Fichier' }));
        mediaList.append(row);
      });
    }).catch(() => {});
  });
  closePanelBtn.addEventListener('click', () => mediaPanel.classList.remove('is-open'));

  // --- COMPOSITEUR ---
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
  input.placeholder = 'Écrire un message...';
  form.append(input);

  const sendBtn = document.createElement('button');
  sendBtn.type = 'submit';
  sendBtn.className = 'btn btn-primary ia-send-btn';
  sendBtn.title = 'Envoyer';
  sendBtn.append(createIcon('send', { size: 18 }));
  form.append(sendBtn);

  composerWrap.append(form);
  page.append(composerWrap);

  let fichierSelectionne = null;
  const previewWrap = createElement({ tag: 'div', className: 'chat__file-preview', attrs: { style: 'display:none;' } });
  const previewLabel = createElement({ tag: 'span', className: 'subtle' });
  const removeFileBtn = createButton({ icon: 'x', variant: 'ghost', size: 'sm' });
  previewWrap.append(createIcon('paperclip', { size: 14 }), previewLabel, removeFileBtn);
  composerWrap.prepend(previewWrap);

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

  const autoGrow = () => {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
  };
  input.addEventListener('input', autoGrow);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
  });

  const scrollToBottom = () => requestAnimationFrame(() => { scroll.scrollTop = scroll.scrollHeight; });

  const renderMessages = (messages) => {
    scroll.replaceChildren();
    if (!messages.length) {
      const empty = createElement({ tag: 'div', className: 'chat__empty', text: 'Aucun message. Soyez le premier à écrire !' });
      scroll.append(empty);
      return;
    }
    let lastDate = '';
    messages.forEach(msg => {
      const dateStr = msg.cree_le ? new Date(msg.cree_le).toLocaleDateString('fr-FR') : '';
      if (dateStr && dateStr !== lastDate) {
        const sep = createElement({ tag: 'div', className: 'chat__date-sep', text: dateStr });
        scroll.append(sep);
        lastDate = dateStr;
      }
      scroll.append(buildBubble(msg, currentUserId, currentUserRole));
    });
    lastMsgCount = messages.length;
    scrollToBottom();
  };

  const chargerMessages = () => {
    return getMessages(classeId).then(renderMessages).catch(() => {});
  };

  const startPolling = () => {
    pollTimer = setInterval(async () => {
      try {
        const msgs = await getMessages(classeId);
        if (msgs.length !== lastMsgCount) renderMessages(msgs);
      } catch (_) {}
    }, POLL_INTERVAL);
  };

  page.addEventListener('disconnected', () => clearInterval(pollTimer));

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
      await chargerMessages();
    } catch (err) {
      notify({ tone: 'danger', message: err.message });
    } finally {
      sendBtn.disabled = false;
    }
  });

  getClasseById(classeId)
    .then(classe => {
      barTitle.textContent = classe.nom || 'Classe sans nom';
      const membres = classe.nombre_eleves || 0;
      const enseignantName = [classe.enseignant_titre, classe.enseignant_prenom, classe.enseignant_nom].filter(Boolean).join(' ');
      barSub.textContent = `${classe.niveau_scolaire || ''} · ${membres} élève${membres > 1 ? 's' : ''}${enseignantName ? ' · ' + enseignantName : ''}`;

      if (classe.logo_url) {
        barAvatar.replaceChildren();
        const img = document.createElement('img');
        img.src = classe.logo_url;
        img.alt = 'Logo de la classe';
        img.style.cssText = 'width:100%; height:100%; object-fit:cover; border-radius:var(--radius-md);';
        barAvatar.append(img);
      }

      if (!classe.estMembre && currentUserRole === 'eleve') {
        scroll.replaceChildren();
        const joinBox = createElement({ tag: 'div', className: 'empty-state' });
        joinBox.append(createElement({ tag: 'h3', text: `Rejoindre "${classe.nom}"` }));
        joinBox.append(createElement({ tag: 'p', className: 'muted', text: `Niveau : ${classe.niveau_scolaire || '-'}` }));
        const joinBtn = createButton({ label: 'Rejoindre la classe', icon: 'plus', variant: 'primary' });
        joinBtn.addEventListener('click', async () => {
          joinBtn.disabled = true;
          try {
            await rejoindreClasse(classeId);
            notify({ tone: 'success', message: 'Vous avez rejoint la classe !' });
            window.location.hash = `/classes/${classeId}`;
          } catch (err) {
            notify({ tone: 'danger', message: err.message });
            joinBtn.disabled = false;
          }
        });
        joinBox.append(joinBtn);
        scroll.append(joinBox);
        composerWrap.style.display = 'none';
        return;
      }

      chargerMessages().then(startPolling);
    })
    .catch(() => {
      scroll.replaceChildren(createElement({ tag: 'p', className: 'muted', text: 'Classe introuvable.' }));
    });

  return page;
};
