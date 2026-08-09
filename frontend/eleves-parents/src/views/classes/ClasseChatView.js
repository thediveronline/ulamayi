import { getClasseById, getMessages, envoyerMessage, getMediasClasse, rejoindreClasse } from '../../services/classe.service.js';
import { createElement, createButton } from '../../utils/dom.js';
import { createIcon } from '../../components/icon/icon.js';
import { createLoadingCard } from '../../utils/loading.js';
import { notify } from '../../components/notifications/notifications.js';
import { getUser, getUserRole } from '../../utils/session.js';

const POLL_INTERVAL = 5000;

const formatHeure = (iso) => {
  try {
    return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
};

const buildBubble = (msg, moi) => {
  const wrap = createElement({ tag: 'div', className: `chat__row ${moi ? 'chat__row--user' : 'chat__row--ai'}` });
  const bubble = createElement({ tag: 'div', className: `chat__msg ${moi ? 'chat__msg--user' : 'chat__msg--ai'}` });

  if (!moi) {
    bubble.append(createElement({ tag: 'span', className: 'chat__sender', text: msg.nom_expediteur || 'Inconnu' }));
  }

  if (msg.media_url) {
    if (msg.media_type === 'pdf') {
      const link = createElement({ tag: 'a', className: 'chat__media-link', text: 'Voir le document', attrs: { href: msg.media_url, target: '_blank', rel: 'noopener' } });
      link.prepend(createIcon('fileText', { size: 14 }));
      bubble.append(link);
    } else {
      const img = document.createElement('img');
      img.src = msg.media_url;
      img.className = 'chat__media-img';
      img.alt = 'Media';
      img.loading = 'lazy';
      bubble.append(img);
    }
  }

  if (msg.contenu) {
    bubble.append(createElement({ tag: 'span', text: msg.contenu }));
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
  const role = getUserRole();
  let lastMsgCount = 0;
  let pollTimer = null;

  // --- HEADER ---
  const bar = createElement({ tag: 'div', className: 'ia-chat-bar' });
  const backBtn = createButton({ icon: 'chevronLeft', variant: 'ghost', size: 'sm' });
  backBtn.addEventListener('click', () => { window.location.hash = '/classes'; });
  bar.append(backBtn);

  const barInfo = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap:0; flex:1;' } });
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

  // Bouton pièce jointe
  const attachLabel = document.createElement('label');
  attachLabel.className = 'ia-attach-btn';
  attachLabel.title = 'Joindre un fichier';
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
  input.placeholder = 'Votre message...';
  form.append(input);

  // Bouton envoyer : ICÔNE UNIQUEMENT
  const sendBtn = document.createElement('button');
  sendBtn.type = 'submit';
  sendBtn.className = 'btn btn-primary ia-send-btn';
  sendBtn.append(createIcon('send', { size: 18 }));
  form.append(sendBtn);

  composerWrap.append(form);
  page.append(composerWrap);

  // Aperçu du fichier sélectionné
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

  // --- Auto-grow textarea ---
  const autoGrow = () => {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
  };
  input.addEventListener('input', autoGrow);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
  });

  const scrollToBottom = () => requestAnimationFrame(() => { scroll.scrollTop = scroll.scrollHeight; });

  // --- CHARGER MESSAGES ---
  const renderMessages = (messages) => {
    const userId = user?.id;
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
      const moi = msg.expediteur_id === userId;
      scroll.append(buildBubble(msg, moi));
    });
    lastMsgCount = messages.length;
    scrollToBottom();
  };

  const chargerMessages = () => {
    return getMessages(classeId).then(renderMessages).catch(() => {});
  };

  // Polling léger
  const startPolling = () => {
    pollTimer = setInterval(async () => {
      try {
        const msgs = await getMessages(classeId);
        if (msgs.length !== lastMsgCount) renderMessages(msgs);
      } catch (_) {}
    }, POLL_INTERVAL);
  };

  // Cleanup quand on quitte la vue
  page.addEventListener('disconnected', () => clearInterval(pollTimer));

  // --- ENVOI MESSAGE ---
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

  // --- CHARGER CLASSE + MESSAGES ---
  getClasseById(classeId)
    .then(classe => {
      barTitle.textContent = classe.nom || 'Classe';
      const membres = classe.nombre_eleves || 0;
      barSub.textContent = `${membres} membre${membres > 1 ? 's' : ''}`;

      // Si l'élève n'est pas encore membre
      if (!classe.estMembre && role === 'eleve') {
        scroll.replaceChildren();
        const joinBox = createElement({ tag: 'div', className: 'empty-state' });
        joinBox.append(createElement({ tag: 'h3', text: 'Vous n\'êtes pas encore membre de cette classe.' }));
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
