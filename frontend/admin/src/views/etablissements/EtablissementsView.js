import { getEtablissements, validerEtablissement } from '../../services/admin.service.js';
import { createIcon } from '../../components/icon/icon.js';
import { notify } from '../../components/notifications/notifications.js';
import { createLoadingCard, createEmptyState } from '../../utils/loading.js';

export const createEtablissementsView = () => {
  const page = document.createElement('section');
  page.className = 'page';

  const header = document.createElement('div');
  header.className = 'page-header';

  const titleWrap = document.createElement('div');
  titleWrap.className = 'stack';
  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = 'Établissements';
  titleWrap.append(title);

  const subtitle = document.createElement('p');
  subtitle.className = 'page-subtitle';
  subtitle.textContent = 'Gérez les établissements partenaires.';
  titleWrap.append(subtitle);

  header.append(titleWrap);
  page.append(header);

  const list = document.createElement('div');
  list.className = 'stack-lg';
  page.append(list);

  const loadEtablissements = () => {
    list.replaceChildren(createLoadingCard('Chargement...'));

    getEtablissements()
      .then((etablissements) => {
        if (!etablissements || !etablissements.length) {
          list.replaceChildren(
            createEmptyState({
              icon: 'building',
              title: 'Aucun établissement',
              description: 'Aucun établissement inscrit pour le moment.'
            })
          );
          return;
        }

        list.replaceChildren();
        etablissements.forEach((etab) => {
          const card = document.createElement('div');
          card.className = 'card row-between';

          const info = document.createElement('div');
          info.className = 'stack';
          info.style.gap = '2px';

          const name = document.createElement('strong');
          name.textContent = etab.nom || 'Établissement';
          info.append(name);

          const email = document.createElement('span');
          email.className = 'subtle';
          email.textContent = etab.email || '-';
          info.append(email);

          if (etab.adresse) {
            const adresse = document.createElement('span');
            adresse.className = 'subtle';
            adresse.textContent = etab.adresse;
            info.append(adresse);
          }

          card.append(info);

          const actions = document.createElement('div');
          actions.className = 'row';

          if (etab.est_verifie) {
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
                await validerEtablissement(etab.id);
                notify({ tone: 'success', message: `${etab.nom} validé.` });
                loadEtablissements();
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

  loadEtablissements();
  return page;
};
