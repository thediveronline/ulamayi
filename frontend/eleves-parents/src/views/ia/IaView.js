import { poserQuestion, getHistorique } from '../../services/ia.service.js';
import { createIcon } from '../../components/icon/icon.js';
import { notify } from '../../components/notifications/notifications.js';
import { createLoadingCard, createEmptyState } from '../../utils/loading.js';

export const createIaView = () => {
  const page = document.createElement('section');
  page.className = 'page';

  const header = document.createElement('div');
  header.className = 'page-header';

  const titleWrap = document.createElement('div');
  titleWrap.className = 'stack';
  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = 'Tuteur IA';
  titleWrap.append(title);

  const subtitle = document.createElement('p');
  subtitle.className = 'page-subtitle';
  subtitle.textContent = 'Posez vos questions et obtenez des réponses instantanées.';
  titleWrap.append(subtitle);

  header.append(titleWrap);
  page.append(header);

  const chatCard = document.createElement('div');
  chatCard.className = 'card stack';

  const messagesContainer = document.createElement('div');
  messagesContainer.className = 'stack';
  messagesContainer.style.cssText = 'max-height:60vh;overflow-y:auto;padding:var(--space-3) 0';

  const welcomeMsg = document.createElement('div');
  welcomeMsg.className = 'alert alert-info';
  welcomeMsg.append(createIcon('sparkle', { size: 18 }));
  const welcomeText = document.createElement('span');
  welcomeText.textContent = 'Bonjour ! Je suis votre tuteur virtuel. Posez-moi une question sur vos cours.';
  welcomeMsg.append(welcomeText);
  messagesContainer.append(welcomeMsg);

  chatCard.append(messagesContainer);

  const form = document.createElement('form');
  form.className = 'row';
  form.style.cssText = 'display:flex;gap:var(--space-3)';

  const input = document.createElement('input');
  input.className = 'input';
  input.type = 'text';
  input.placeholder = 'Posez votre question...';
  input.required = true;
  input.style.flex = '1';
  form.append(input);

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-primary';
  submitBtn.append(createIcon('sparkle', { size: 18 }));
  submitBtn.append(' Demander');
  form.append(submitBtn);

  chatCard.append(form);
  page.append(chatCard);

  const historiqueCard = document.createElement('div');
  historiqueCard.className = 'card stack';

  const histTitle = document.createElement('h3');
  histTitle.textContent = 'Historique';
  historiqueCard.append(histTitle);

  const histContainer = document.createElement('div');
  histContainer.className = 'stack';

  const loadingHist = createLoadingCard('Chargement de l\'historique...');
  histContainer.append(loadingHist);
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

      historique.forEach((item) => {
        const entry = document.createElement('div');
        entry.className = 'stack';
        entry.style.cssText = 'padding:var(--space-3);border:1px solid var(--color-border);border-radius:var(--radius-md)';

        const question = document.createElement('div');
        question.className = 'row';
        question.append(createIcon('user', { size: 16 }));
        const qText = document.createElement('span');
        qText.style.fontWeight = '600';
        qText.textContent = item.question;
        question.append(qText);
        entry.append(question);

        const reponse = document.createElement('div');
        reponse.className = 'row';
        reponse.append(createIcon('sparkle', { size: 16 }));
        const rText = document.createElement('span');
        rText.textContent = item.reponse;
        reponse.append(rText);
        entry.append(reponse);

        if (item.cree_le) {
          const date = document.createElement('span');
          date.className = 'subtle';
          date.textContent = new Date(item.cree_le).toLocaleDateString('fr-FR');
          entry.append(date);
        }

        histContainer.append(entry);
      });
    })
    .catch(() => {
      histContainer.replaceChildren();
    });

  page.append(historiqueCard);

  const appendMessage = (content, isUser = true) => {
    const msg = document.createElement('div');
    msg.className = 'row';
    msg.style.cssText = 'align-items:flex-start';

    msg.append(createIcon(isUser ? 'user' : 'sparkle', { size: 18 }));

    const text = document.createElement('span');
    text.style.cssText = 'flex:1;line-height:1.6';
    text.textContent = content;
    msg.append(text);

    messagesContainer.append(msg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const question = input.value.trim();
    if (!question) return;

    appendMessage(question, true);
    input.value = '';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Réflexion...';

    try {
      const result = await poserQuestion(question);
      const reponse = result?.donnees?.reponse || result?.message || 'Je n\'ai pas pu traiter votre question.';
      appendMessage(reponse, false);
    } catch (err) {
      appendMessage(`Erreur : ${err.message}`, false);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '';
      submitBtn.append(createIcon('sparkle', { size: 18 }));
      submitBtn.append(' Demander');
    }
  });

  return page;
};
