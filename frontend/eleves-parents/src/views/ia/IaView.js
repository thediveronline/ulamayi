import { poserQuestion, getHistorique } from '../../services/ia.service.js';
import { createIcon } from '../../components/icon/icon.js';
import { notify } from '../../components/notifications/notifications.js';
import { createLoadingCard, createEmptyState } from '../../utils/loading.js';
import { createElement, createButton } from '../../utils/dom.js';

const appendMessage = (container, content, isUser) => {
  const msg = createElement({ tag: 'div', className: `chat__msg ${isUser ? 'chat__msg--user' : 'chat__msg--ai'}`, text: content });
  container.append(msg);
  container.scrollTop = container.scrollHeight;
};

const buildHistItem = (item) => {
  const itemEl = createElement({ tag: 'div', className: 'hist-item' });

  const head = createElement({ tag: 'button', className: 'hist-item__head', attrs: { type: 'button' } });
  head.append(createIcon('messageSquare', { size: 16 }));
  head.append(createElement({ tag: 'span', className: 'hist-item__q', text: item.question }));

  const chevron = createElement({ tag: 'span', className: 'hist-item__chevron' });
  chevron.append(createIcon('chevronRight', { size: 16 }));
  head.append(chevron);

  const body = createElement({ tag: 'div', className: 'hist-item__body' });
  const chat = createElement({ tag: 'div', className: 'chat' });
  chat.append(
    createElement({ tag: 'div', className: 'chat__msg chat__msg--user', text: item.question }),
    createElement({ tag: 'div', className: 'chat__msg chat__msg--ai', text: item.reponse })
  );
  body.append(chat);
  if (item.cree_le) {
    body.append(createElement({ tag: 'span', className: 'subtle', text: new Date(item.cree_le).toLocaleDateString('fr-FR') }));
  }

  head.addEventListener('click', () => {
    itemEl.classList.toggle('is-open');
  });

  itemEl.append(head, body);
  return itemEl;
};

export const createIaView = () => {
  const page = createElement({ tag: 'section', className: 'page' });

  const header = createElement({ tag: 'div', className: 'page-header' });
  const titleWrap = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap: 0.25rem;' } });
  titleWrap.append(
    createElement({ tag: 'h1', className: 'page-title', text: 'Tuteur IA' }),
    createElement({ tag: 'p', className: 'page-subtitle', text: 'Posez vos questions et obtenez des réponses instantanées.' })
  );
  header.append(titleWrap);
  page.append(header);

  const chatCard = createElement({ tag: 'div', className: 'stack' });

  const messagesContainer = createElement({ tag: 'div', className: 'chat', attrs: { style: 'max-height: 55vh; overflow-y: auto; padding: var(--space-3) 0;' } });
  appendMessage(messagesContainer, 'Bonjour ! Je suis votre tuteur virtuel. Posez-moi une question sur vos cours.', false);

  chatCard.append(messagesContainer);

  const form = createElement({ tag: 'form', className: 'row', attrs: { style: 'display: flex; gap: var(--space-3);' } });

  const input = createElement({ tag: 'input', className: 'input', attrs: { type: 'text', placeholder: 'Posez votre question...', required: '' } });
  input.style.flex = '1';
  form.append(input);

  const submitBtn = createButton({ label: 'Demander', icon: 'sparkle', variant: 'primary' });
  submitBtn.type = 'submit';
  form.append(submitBtn);

  chatCard.append(form);
  page.append(chatCard);

  page.append(createElement({ tag: 'hr', className: 'divider' }));

  const historiqueCard = createElement({ tag: 'div', className: 'stack' });
  historiqueCard.append(createElement({ tag: 'h3', text: 'Historique' }));

  const histContainer = createElement({ tag: 'div', className: 'stack' });
  histContainer.append(createLoadingCard('Chargement de l\'historique...'));
  historiqueCard.append(histContainer);

  getHistorique()
    .then((historique) => {
      histContainer.replaceChildren();
      if (!historique || !historique.length) {
        histContainer.append(
          createEmptyState({
            icon: 'book',
            title: 'Aucune question',
            description: 'Vous n\'avez pas encore posé de question.'
          })
        );
        return;
      }

      historique.forEach((item) => histContainer.append(buildHistItem(item)));
    })
    .catch(() => {
      histContainer.replaceChildren();
    });

  page.append(historiqueCard);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const question = input.value.trim();
    if (!question) return;

    appendMessage(messagesContainer, question, true);
    input.value = '';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Réflexion...';

    try {
      const result = await poserQuestion(question);
      const reponse = result?.donnees?.reponse || result?.message || 'Je n\'ai pas pu traiter votre question.';
      appendMessage(messagesContainer, reponse, false);
    } catch (err) {
      appendMessage(messagesContainer, `Erreur : ${err.message}`, false);
    } finally {
      submitBtn.disabled = false;
      submitBtn.replaceChildren();
      submitBtn.append(createIcon('sparkle', { size: 18 }));
      submitBtn.append(createElement({ tag: 'span', text: 'Demander' }));
    }
  });

  return page;
};
