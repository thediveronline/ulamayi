import { getTousEnseignants } from '../../services/classe.service.js';
import { createElement, createButton } from '../../utils/dom.js';
import { createIcon } from '../../components/icon/icon.js';
import { createLoadingCard, createEmptyState } from '../../utils/loading.js';

const buildTeacherCard = (ens) => {
  const card = createElement({ tag: 'article', className: 'teacher-card' });

  const avatar = createElement({ tag: 'div', className: 'teacher-card__avatar' });
  if (ens.photo_profil) {
    const img = document.createElement('img');
    img.src = ens.photo_profil;
    img.alt = '';
    img.loading = 'lazy';
    avatar.append(img);
  } else {
    avatar.append(createIcon('user', { size: 24 }));
  }
  card.append(avatar);

  const body = createElement({ tag: 'div', className: 'teacher-card__body' });

  const nom = [ens.titre, ens.prenom, ens.nom].filter(Boolean).join(' ');
  body.append(createElement({ tag: 'h3', className: 'teacher-card__nom', text: nom || 'Enseignant' }));

  if (ens.matiere) {
    body.append(createElement({ tag: 'span', className: 'badge badge-primary', text: ens.matiere }));
  }

  if (Number(ens.note_moyenne) > 0) {
    const noteRow = createElement({ tag: 'div', className: 'teacher-card__note' });
    noteRow.append(createIcon('star', { size: 13 }));
    noteRow.append(document.createTextNode(` ${Number(ens.note_moyenne).toFixed(1)} (${ens.nombre_avis} avis)`));
    body.append(noteRow);
  }

  card.append(body);

  const chevron = createElement({ tag: 'div', className: 'teacher-card__chevron' });
  chevron.append(createIcon('chevronRight', { size: 16 }));
  card.append(chevron);

  card.style.cursor = 'pointer';
  card.addEventListener('click', () => { window.location.hash = `/enseignants/${ens.id}`; });

  return card;
};

export const createEnseignantsView = () => {
  const page = createElement({ tag: 'section', className: 'page' });
  page.append(createElement({ tag: 'h1', className: 'page-title', text: 'Nos enseignants' }));
  page.append(createElement({ tag: 'p', className: 'page-subtitle', text: 'Retrouvez les enseignants disponibles sur Ulamayi.' }));

  const list = createElement({ tag: 'div', className: 'teacher-list' });
  list.append(createLoadingCard('Chargement des enseignants...'));
  page.append(list);

  getTousEnseignants()
    .then(items => {
      list.replaceChildren();
      if (!items.length) {
        list.append(createEmptyState({
          icon: 'graduation',
          title: 'Aucun enseignant',
          description: 'Aucun enseignant n\'est encore inscrit sur la plateforme.'
        }));
        return;
      }
      items.forEach(ens => list.append(buildTeacherCard(ens)));
    })
    .catch(() => {
      list.replaceChildren(createElement({ tag: 'p', className: 'muted', text: 'Impossible de charger les enseignants.' }));
    });

  return page;
};
