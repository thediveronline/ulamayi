import { getToutesClasses, getMesClassesEleve, rejoindreClasse } from '../../services/classe.service.js';
import { createElement, createButton } from '../../utils/dom.js';
import { createIcon } from '../../components/icon/icon.js';
import { createLoadingCard, createEmptyState } from '../../utils/loading.js';
import { notify } from '../../components/notifications/notifications.js';
import { isAuthenticated, getUserRole } from '../../utils/session.js';

const formatPrix = (prix) => {
  const v = Number(prix);
  if (!v) return 'Gratuit';
  return `${v.toLocaleString('fr-FR')} F`;
};

const buildClasseCard = (classe, moi, onJoindre) => {
  const card = createElement({ tag: 'article', className: 'classe-card' });

  const header = createElement({ tag: 'div', className: 'classe-card__header' });

  const avatar = createElement({ tag: 'div', className: 'classe-card__avatar' });
  if (classe.enseignant_photo) {
    const img = document.createElement('img');
    img.src = classe.enseignant_photo;
    img.alt = '';
    img.loading = 'lazy';
    avatar.append(img);
  } else {
    avatar.append(createIcon('user', { size: 18 }));
  }
  header.append(avatar);

  const info = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap: 0.25rem; flex:1; min-width:0;' } });
  info.append(createElement({ tag: 'h3', className: 'classe-card__nom', text: classe.nom || 'Classe' }));

  const enseignantNom = [classe.enseignant_titre, classe.enseignant_prenom, classe.enseignant_nom]
    .filter(Boolean).join(' ');
  if (enseignantNom) {
    info.append(createElement({ tag: 'span', className: 'classe-card__prof', text: enseignantNom }));
  }
  header.append(info);
  card.append(header);

  const meta = createElement({ tag: 'div', className: 'classe-card__meta' });
  meta.append(createElement({ tag: 'span', className: 'badge badge-primary', text: classe.niveau_scolaire || '-' }));
  meta.append(createElement({
    tag: 'span',
    className: `badge ${Number(classe.prix) > 0 ? 'badge-primary' : 'badge-success'}`,
    text: formatPrix(classe.prix)
  }));
  if (classe.nombre_eleves !== undefined) {
    const membresEl = createElement({ tag: 'span', className: 'badge', attrs: { style: 'display:flex;align-items:center;gap:0.25rem;' } });
    membresEl.append(createIcon('users', { size: 12 }));
    membresEl.append(document.createTextNode(`${classe.nombre_eleves}`));
    meta.append(membresEl);
  }
  card.append(meta);

  if (classe.description) {
    card.append(createElement({ tag: 'p', className: 'classe-card__desc', text: classe.description }));
  }

  if (classe.planning) {
    const planRow = createElement({ tag: 'div', className: 'classe-card__planning' });
    planRow.append(createIcon('clock', { size: 13 }));
    planRow.append(document.createTextNode(classe.planning));
    card.append(planRow);
  }

  const footer = createElement({ tag: 'div', className: 'classe-card__footer' });

  if (classe.estMembre) {
    const openBtn = createButton({ label: 'Ouvrir', icon: 'messageSquare', variant: 'primary', size: 'sm' });
    openBtn.addEventListener('click', () => { window.location.hash = `/classes/${classe.id}`; });
    footer.append(openBtn);
  } else {
    const joinBtn = createButton({
      label: Number(classe.prix) > 0 ? 'Demander à rejoindre' : 'Rejoindre',
      icon: 'plus',
      variant: 'secondary',
      size: 'sm'
    });
    joinBtn.addEventListener('click', async () => {
      if (!isAuthenticated()) { window.location.hash = '/connexion'; return; }
      joinBtn.disabled = true;
      try {
        await onJoindre(classe.id);
        notify({ tone: 'success', message: `Vous avez rejoint "${classe.nom}".` });
        window.location.hash = `/classes/${classe.id}`;
      } catch (err) {
        notify({ tone: 'danger', message: err.message });
        joinBtn.disabled = false;
      }
    });
    footer.append(joinBtn);
  }

  card.append(footer);
  return card;
};

export const createClassesView = (context = {}) => {
  const page = createElement({ tag: 'section', className: 'page' });
  const role = getUserRole();
  const estEleve = role === 'eleve';

  page.append(createElement({ tag: 'h1', className: 'page-title', text: 'Classes disponibles' }));

  const grid = createElement({ tag: 'div', className: 'classe-grid' });
  grid.append(createLoadingCard('Chargement des classes...'));
  page.append(grid);

  const charger = async () => {
    try {
      const toutes = await getToutesClasses();
      let mesIds = new Set();
      if (estEleve) {
        try {
          const mes = await getMesClassesEleve();
          mes.forEach(c => mesIds.add(c.id));
        } catch (_) {}
      }

      grid.replaceChildren();
      if (!toutes.length) {
        grid.append(createEmptyState({
          icon: 'graduation',
          title: 'Aucune classe disponible',
          description: 'Il n\'y a pas encore de classe créée sur la plateforme.'
        }));
        return;
      }

      toutes.forEach(c => {
        c.estMembre = mesIds.has(c.id);
        grid.append(buildClasseCard(c, null, rejoindreClasse));
      });
    } catch (err) {
      grid.replaceChildren(createElement({ tag: 'p', className: 'muted', text: 'Impossible de charger les classes.' }));
    }
  };

  charger();
  return page;
};
