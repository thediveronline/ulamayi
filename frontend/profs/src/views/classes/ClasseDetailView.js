import { getMesClasses, listerEleves, ajouterEleve, supprimerClasse } from '../../services/classe.service.js';
import { createIcon } from '../../components/icon/icon.js';
import { notify } from '../../components/notifications/notifications.js';
import { createLoadingCard, createEmptyState } from '../../utils/loading.js';
import { createField } from '../../utils/dom.js';

export const createClasseDetailView = (params) => {
  const page = document.createElement('section');
  page.className = 'page';

  const backLink = document.createElement('a');
  backLink.className = 'btn btn-ghost';
  backLink.href = '#/classes';
  backLink.append(createIcon('chevronLeft', { size: 18 }));
  backLink.append(' Retour aux classes');
  page.append(backLink);

  const loadingCard = createLoadingCard('Chargement de la classe...');
  page.append(loadingCard);

  const classeId = params?.id;

  const loadDetail = () => {
    page.replaceChildren();
    page.append(backLink);

    getMesClasses()
      .then((classes) => {
        const classe = classes.find((c) => String(c.id) === String(classeId));
        if (!classe) {
          page.append(createEmptyState({
            icon: 'graduation',
            title: 'Classe introuvable',
            description: 'Cette classe n\'existe pas ou a été supprimée.'
          }));
          return;
        }

        const header = document.createElement('div');
        header.className = 'page-header';

        const titleWrap = document.createElement('div');
        titleWrap.className = 'stack';
        const title = document.createElement('h1');
        title.className = 'page-title';
        title.textContent = classe.nom || 'Classe';
        titleWrap.append(title);

        if (classe.niveau_scolaire) {
          const niveau = document.createElement('span');
          niveau.className = 'badge badge-primary';
          niveau.textContent = classe.niveau_scolaire;
          titleWrap.append(niveau);
        }

        header.append(titleWrap);

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn btn-danger';
        deleteBtn.append(createIcon('trash', { size: 18 }));
        deleteBtn.append(' Supprimer');
        deleteBtn.addEventListener('click', async () => {
          if (!window.confirm(`Supprimer la classe "${classe.nom}" ?`)) return;
          try {
            await supprimerClasse(classe.id);
            notify({ tone: 'success', message: 'Classe supprimée.' });
            window.location.hash = '#/classes';
          } catch (err) {
            notify({ tone: 'danger', message: err.message });
          }
        });
        header.append(deleteBtn);

        page.append(header);

        const elevesCard = document.createElement('div');
        elevesCard.className = 'card stack';

        const elevesHeader = document.createElement('div');
        elevesHeader.className = 'row-between';
        elevesHeader.append(createElement('h3', 'Élèves inscrits'));
        elevesCard.append(elevesHeader);

        const elevesList = document.createElement('div');
        elevesList.className = 'stack';
        elevesList.append(createLoadingCard('Chargement des élèves...'));
        elevesCard.append(elevesList);

        listerEleves(classe.id)
          .then((eleves) => {
            elevesList.replaceChildren();
            if (!eleves || !eleves.length) {
              elevesList.append(
                createEmptyState({
                  icon: 'users',
                  title: 'Aucun élève',
                  description: 'Aucun élève inscrit dans cette classe.'
                })
              );
              return;
            }

            eleves.forEach((eleve) => {
              const row = document.createElement('div');
              row.className = 'row-between';
              row.style.cssText = 'padding:var(--space-3) 0;border-bottom:1px solid var(--color-border)';

              const info = document.createElement('div');
              info.className = 'stack';
              info.style.gap = '2px';

              const name = document.createElement('strong');
              name.textContent = `${eleve.prenom || ''} ${eleve.nom || ''}`.trim() || 'Élève';
              info.append(name);

              if (eleve.email) {
                const email = document.createElement('span');
                email.className = 'subtle';
                email.textContent = eleve.email;
                info.append(email);
              }

              row.append(info);
              elevesList.append(row);
            });
          })
          .catch(() => {
            elevesList.replaceChildren();
            elevesList.append(createElement('p', 'Erreur lors du chargement des élèves.'));
          });

        page.append(elevesCard);

        const addCard = document.createElement('div');
        addCard.className = 'card stack';

        const addTitle = document.createElement('h3');
        addTitle.textContent = 'Ajouter un élève';
        addCard.append(addTitle);

        const addForm = document.createElement('form');
        addForm.className = 'row';
        addForm.style.cssText = 'display:flex;gap:var(--space-3)';

        const eleveIdField = createField({
          label: 'ID de l\'élève',
          name: 'eleve_id',
          type: 'number',
          placeholder: 'Entrez l\'ID de l\'élève',
          required: true
        });
        eleveIdField.style.flex = '1';
        addForm.append(eleveIdField);
        const eleveIdInput = eleveIdField.querySelector('input');

        const addBtn = document.createElement('button');
        addBtn.type = 'submit';
        addBtn.className = 'btn btn-primary';
        addBtn.append(createIcon('plus', { size: 18 }));
        addBtn.append(' Ajouter');
        addForm.append(addBtn);

        addForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const eleveId = parseInt(eleveIdInput.value, 10);
          if (!eleveId) return;

          addBtn.disabled = true;
          try {
            await ajouterEleve(classe.id, eleveId);
            notify({ tone: 'success', message: 'Élève ajouté à la classe.' });
            eleveIdInput.value = '';
            loadDetail();
          } catch (err) {
            notify({ tone: 'danger', message: err.message });
          } finally {
            addBtn.disabled = false;
          }
        });

        addCard.append(addForm);
        page.append(addCard);
      })
      .catch((err) => {
        page.append(createElement('div', { className: 'card', text: err.message }));
      });
  };

  loadDetail();
  return page;
};

const createElement = (tag, content) => {
  if (typeof content === 'string') {
    const el = document.createElement(tag);
    el.textContent = content;
    return el;
  }
  if (content?.className) {
    const el = document.createElement(tag);
    el.className = content.className;
    if (content.text) el.textContent = content.text;
    return el;
  }
  return document.createElement(tag);
};
