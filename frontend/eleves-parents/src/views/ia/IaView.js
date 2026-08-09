import { poserQuestion, getHistorique } from '../../services/ia.service.js';
import { createIcon } from '../../components/icon/icon.js';
import { notify } from '../../components/notifications/notifications.js';
import { createLoadingCard, createEmptyState } from '../../utils/loading.js';
import { createElement, createButton } from '../../utils/dom.js';

const WELCOME =
  'Bonjour ! Je suis le tuteur Ulamayi. Posez-moi une question sur un de vos cours : je peux ' +
  'expliquer une notion, vous aider sur un exercice ou préparer une révision.';

const bubble = (content, isUser) =>
  createElement({ tag: 'div', className: `chat__msg ${isUser ? 'chat__msg--user' : 'chat__msg--ai'}`, text: content });

const messageRow = (content, isUser) => {
  const row = createElement({ tag: 'div', className: `chat__row ${isUser ? 'chat__row--user' : 'chat__row--ai'}` });
  row.append(bubble(content, isUser));
  return row;
};

const blankBubble = (isUser) =>
  createElement({ tag: 'div', className: `chat__msg ${isUser ? 'chat__msg--user' : 'chat__msg--ai'}` });

export const createIaView = () => {
  const screen = createElement({ tag: 'section', className: 'ia-chat-screen' });

  // Barre du tchat (compacte, sans texte descriptif)
  const bar = createElement({ tag: 'div', className: 'ia-chat-bar' });

  const avatar = createElement({ tag: 'div', className: 'ia-chat-bar__avatar' });
  avatar.append(createIcon('sparkle', { size: 18 }));

  const barInfo = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap: 0;' } });
  barInfo.append(createElement({ tag: 'span', className: 'ia-chat-bar__title', text: 'Tuteur Ulamayi' }));
  const status = createElement({ tag: 'span', className: 'ia-chat-bar__status' });
  status.append(createElement({ tag: 'span', className: 'ia-dot' }));
  status.append(document.createTextNode('En ligne'));
  barInfo.append(status);

  const barActions = createElement({ tag: 'div', className: 'ia-chat-bar__actions' });
  const histBtn = createButton({ label: 'Historique', icon: 'messageSquare', variant: 'secondary', size: 'sm' });
  barActions.append(histBtn);

  bar.append(avatar, barInfo, barActions);
  screen.append(bar);

  // Zone des messages (scrollable en interne)
  const scroll = createElement({ tag: 'div', className: 'ia-chat__scroll' });
  const welcomeRow = createElement({ tag: 'div', className: 'chat__row chat__row--ai' });
  welcomeRow.append(bubble(WELCOME, false));
  scroll.append(welcomeRow);
  screen.append(scroll);

  // Zone de saisie (fixe, au-dessus de la bottom nav)
  const composerWrap = createElement({ tag: 'div', className: 'ia-composer-wrap' });

  const form = createElement({ tag: 'form', className: 'ia-composer' });
  const input = document.createElement('textarea');
  input.className = 'ia-input';
  input.rows = 1;
  input.placeholder = 'Posez votre question...';
  input.setAttribute('required', '');
  form.append(input);

  const sendBtn = document.createElement('button');
  sendBtn.type = 'submit';
  sendBtn.className = 'btn btn-primary ia-send-btn';
  sendBtn.append(createIcon('send', { size: 18 }));
  form.append(sendBtn);

  composerWrap.append(form);
  screen.append(composerWrap);

  // Panneau historique (overlay)
  const histPanel = createElement({ tag: 'div', className: 'ia-history-panel' });
  const histHead = createElement({ tag: 'div', className: 'ia-history-panel__head' });
  histHead.append(createElement({ tag: 'span', className: 'ia-history-panel__title', text: 'Historique' }));
  const closeBtn = createButton({ label: 'Fermer', icon: 'x', variant: 'ghost', size: 'sm' });
  histHead.append(closeBtn);
  histPanel.append(histHead);

  const histList = createElement({ tag: 'div', className: 'ia-history-panel__list' });
  histPanel.append(histList);
  screen.append(histPanel);

  // --- Comportement ---

  const autoGrow = () => {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
  };
  input.addEventListener('input', autoGrow);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scroll.scrollTop = scroll.scrollHeight;
    });
  };

  const openPanel = () => histPanel.classList.add('is-open');
  const closePanel = () => histPanel.classList.remove('is-open');

  histBtn.addEventListener('click', openPanel);
  closeBtn.addEventListener('click', closePanel);

  const loadChatEntry = (question, reponse) => {
    scroll.append(messageRow(question, true));
    scroll.append(messageRow(reponse, false));
    closePanel();
    scrollToBottom();
  };

  const loadHistory = () => {
    histList.replaceChildren(createLoadingCard('Chargement de l\'historique...'));
    getHistorique()
      .then((historique) => {
        histList.replaceChildren();
        if (!historique || !historique.length) {
          histList.append(
            createEmptyState({
              icon: 'messageSquare',
              title: 'Aucune question',
              description: 'Vous n\'avez pas encore posé de question au tuteur.',
              action: undefined
            })
          );
          return;
        }
        historique.forEach((item) => {
          const row = createElement({ tag: 'button', className: 'ia-history-item', attrs: { type: 'button' } });
          row.append(createElement({ tag: 'span', className: 'ia-history-item__q', text: item.question }));
          if (item.cree_le) {
            row.append(createElement({ tag: 'span', className: 'ia-history-item__date', text: new Date(item.cree_le).toLocaleDateString('fr-FR') }));
          }
          row.addEventListener('click', () => loadChatEntry(item.question, item.reponse));
          histList.append(row);
        });
      })
      .catch(() => {
        histList.replaceChildren(createElement({ tag: 'p', className: 'muted', text: 'Impossible de charger l\'historique.' }));
      });
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const question = input.value.trim();
    if (!question) return;

    scroll.append(messageRow(question, true));
    input.value = '';
    autoGrow();
    sendBtn.disabled = true;
    scrollToBottom();

    const aiRow = createElement({ tag: 'div', className: 'chat__row chat__row--ai' });
    const aiBubble = blankBubble(false);
    const typing = createElement({ tag: 'span', className: 'typing' });
    typing.append(createElement({ tag: 'span' }), createElement({ tag: 'span' }), createElement({ tag: 'span' }));
    aiBubble.append(typing);
    aiRow.append(aiBubble);
    scroll.append(aiRow);
    scrollToBottom();

    try {
      const result = await poserQuestion(question);
      const reponse = result?.donnees?.reponse || result?.message || 'Je n\'ai pas pu traiter votre question.';
      aiBubble.replaceChildren();
      aiBubble.textContent = reponse;
    } catch (err) {
      aiBubble.replaceChildren();
      aiBubble.textContent = `Erreur : ${err.message}`;
    } finally {
      sendBtn.disabled = false;
      scrollToBottom();
    }
  });

  loadHistory();

  return screen;
};
