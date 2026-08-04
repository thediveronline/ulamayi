import { getUsers, validerEnseignant } from '../../services/admin.service.js';
import { createIcon } from '../../components/icon/icon.js';
import { notify } from '../../components/notifications/notifications.js';
import { createLoadingCard, createEmptyState } from '../../utils/loading.js';

export const createEnseignantsView = () => {
  const page = document.createElement('section');
  page.className = 'page';

  const header = document.createElement('div');
  header.className = 'page-header';

  const titleWrap = document.createElement('div');
  titleWrap.className = 'stack';
  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = 'Enseignants';
  titleWrap.append(title);

  const subtitle = document.createElement('p');
  subtitle.className = 'page-subtitle';
  subtitle.textContent = 'Validez les profils des enseignants inscrits.';
  titleWrap.append(subtitle);

  header.append(titleWrap);
  page.append(header);

  const list = document.createElement('div');
  list.className = 'stack-lg';
  page.append(list);

  const loadEnseignants = () => {
    list.replaceChildren(createLoadingCard('Chargement...'));

    getUsers()
      .then((data) => {
        const enseignants = data.enseignants || [];
        if (!enseignants.length) {
          list.replaceChildren(
            createEmptyState({
              icon: 'user',
              title: 'Aucun enseignant',
              description: 'Aucun enseignant inscrit pour le moment.'
            })
          );
          return;
        }

        list.replaceChildren();
        enseignants.forEach((ens) => {
          const card = document.createElement('div');
          card.className = 'card row-between';

          const info = document.createElement('div');
          info.className = 'stack';
          info.style.gap = '2px';

          const name = document.createElement('strong');
          name.textContent = `${ens.prenom || ''} ${ens.nom || ''}`.trim() || 'Enseignant';
          info.append(name);

          const email = document.createElement('span');
          email.className = 'subtle';
          email.textContent = ens.email || '-';
          info.append(email);

          if (ens.matiere) {
            const matiere = document.createElement('span');
            matiere.className = 'badge badge-accent';
            matiere.textContent = ens.matiere;
            info.append(matiere);
          }

          card.append(info);

          const actions = document.createElement('div');
          actions.className = 'row';

          if (ens.est_verifie) {
            const verified = document.createElement('span');
            verified.className = 'badge badge-success';
            verified.append(createIcon('check', { size: 14 }));
            verified.append(' Validé');
            actions.append(verified);
          } else {
            const validateBtn = document.createElement('button');
            validateBtn.type = 'button';
            validateBtn.className = 'btn btn-primary btn-sm';
            validateBtn.append(createIcon('check', { size: 16 }));
            validateBtn.append(' Valider');
            validateBtn.addEventListener('click', async () => {
              try {
                await validerEnseignant(ens.id);
                notify({ tone: 'success', message: `${ens.prenom || ''} ${ens.nom || ''} validé.` });
                loadEnseignants();
              } catch (err) {
                notify({ tone: 'danger', message: err.message });
              }
            });
            actions.append(validateBtn);
          }

          card.append(actions);
          list.append(card);
        });
      })
      .catch((error) => {
        list.replaceChildren();
        const errorCard = document.createElement('div');
        errorCard.className = 'card';
        errorCard.textContent = error.message;
        list.append(errorCard);
      });
  };

  loadEnseignants();
  return page;
};
