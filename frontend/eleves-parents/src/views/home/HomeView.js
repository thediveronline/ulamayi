import { createElement, createButton } from '../../utils/dom.js';
import { createIcon } from '../../components/icon/icon.js';
import { isAuthenticated, getUser, getUserRole } from '../../utils/session.js';
import { getPublicationsForCurrentUser } from '../../services/publication.service.js';
import { getTousEnseignants } from '../../services/classe.service.js';
import { createLoadingCard } from '../../utils/loading.js';

const buildTile = ({ icon, label, hint, href }) => {
  const tile = createElement({ tag: 'a', className: 'dash-tile', attrs: { href: `#${href}` } });
  const iconWrap = createElement({ tag: 'div', className: 'dash-tile__icon' });
  iconWrap.append(createIcon(icon, { size: 18 }));
  const text = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap: 0.125rem;' } });
  text.append(createElement({ tag: 'span', className: 'dash-tile__label', text: label }));
  if (hint) text.append(createElement({ tag: 'span', className: 'dash-tile__hint', text: hint }));
  tile.append(iconWrap, text);
  return tile;
};

const buildActions = (role) => {
  const actions = [];
  if (role === 'eleve') {
    actions.push(
      { icon: 'graduation', label: 'Classes', hint: 'Rejoindre une classe', href: '/classes' },
      { icon: 'bookOpen', label: 'Épreuves', hint: 'Catalogue et mes épreuves', href: '/epreuves' },
      { icon: 'book', label: 'Publications', hint: 'Épreuves et exercices', href: '/publications' },
      { icon: 'sparkle', label: 'Tuteur IA', hint: 'Pose tes questions', href: '/ia' }
    );
  } else if (role === 'parent') {
    actions.push(
      { icon: 'users', label: 'Enfants', hint: 'Suivi scolaire', href: '/enfants' },
      { icon: 'book', label: 'Publications', hint: 'Épreuves et exercices', href: '/publications' },
      { icon: 'graduation', label: 'Enseignants', hint: 'Annuaire', href: '/enseignants' }
    );
  }
  actions.push(
    { icon: 'user', label: 'Profil', href: '/profil' },
    { icon: 'settings', label: 'Paramètres', href: '/parametres' }
  );
  return actions;
};

const buildTeacherSlider = (page) => {
  const section = createElement({ tag: 'section', className: 'stack-lg' });
  const header = createElement({ tag: 'div', className: 'row-between' });
  header.append(createElement({ tag: 'h2', text: 'Nos enseignants' }));
  const seeAll = createElement({ tag: 'a', attrs: { href: '#/enseignants' }, text: 'Voir tous' });
  header.append(seeAll);
  section.append(header);

  const track = createElement({ tag: 'div', className: 'teacher-slider' });
  track.append(createLoadingCard('Chargement...'));
  section.append(track);

  getTousEnseignants().then(items => {
    track.replaceChildren();
    if (!items.length) {
      track.append(createElement({ tag: 'p', className: 'muted', text: 'Aucun enseignant disponible.' }));
      return;
    }
    items.slice(0, 8).forEach(ens => {
      const card = createElement({ tag: 'article', className: 'teacher-mini-card', attrs: { style: 'cursor:pointer;' } });

      const avatar = createElement({ tag: 'div', className: 'teacher-mini-card__avatar' });
      if (ens.photo_profil) {
        const img = document.createElement('img');
        img.src = ens.photo_profil;
        img.alt = '';
        img.loading = 'lazy';
        avatar.append(img);
      } else {
        avatar.append(createIcon('user', { size: 22 }));
      }
      card.append(avatar);

      const nom = [ens.titre, ens.prenom, ens.nom].filter(Boolean).join(' ');
      card.append(createElement({ tag: 'span', className: 'teacher-mini-card__nom', text: nom }));
      if (ens.matiere) card.append(createElement({ tag: 'span', className: 'teacher-mini-card__matiere', text: ens.matiere }));

      card.addEventListener('click', () => { window.location.hash = `/enseignants/${ens.id}`; });
      track.append(card);
    });
  }).catch(() => { track.replaceChildren(); });

  page.append(section);
};

const renderAuthenticated = (page) => {
  const user = getUser();
  const role = getUserRole();
  const prenom = user?.prenom || user?.nom || '';

  const greeting = createElement({ tag: 'section', className: 'stack', attrs: { style: 'gap: 0.25rem;' } });
  greeting.append(
    createElement({ tag: 'h1', className: 'page-title', text: prenom ? `Bonjour, ${prenom}` : 'Bonjour' }),
    createElement({ tag: 'p', className: 'muted', text: 'Que veux-tu faire aujourd\'hui ?' })
  );
  page.append(greeting);

  const grid = createElement({ tag: 'div', className: 'dash-grid' });
  buildActions(role).forEach((action) => grid.append(buildTile(action)));
  page.append(grid);

  // Annuaire enseignants (carrousel horizontal)
  buildTeacherSlider(page);

  // Publications récentes
  const recent = createElement({ tag: 'section', className: 'stack-lg' });
  const recentHeader = createElement({ tag: 'div', className: 'row-between' });
  recentHeader.append(createElement({ tag: 'h2', text: 'Publications récentes' }));
  recentHeader.append(createElement({ tag: 'a', attrs: { href: '#/publications' }, text: 'Tout voir' }));
  recent.append(recentHeader);

  const list = createElement({ tag: 'div', className: 'stack' });
  list.append(createLoadingCard('Chargement...'));
  recent.append(list);
  page.append(recent);

  getPublicationsForCurrentUser()
    .then((items) => {
      const pubs = Array.isArray(items) ? items.slice(0, 4) : [];
      list.replaceChildren();
      if (!pubs.length) {
        list.append(createElement({ tag: 'p', className: 'muted', text: 'Aucune publication disponible pour le moment.' }));
        return;
      }
      pubs.forEach((item, index) => {
        if (index > 0) list.append(createElement({ tag: 'hr', className: 'divider' }));
        const row = createElement({ tag: 'div', className: 'list-row' });
        const text = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap: 0.125rem; flex: 1; min-width: 0;' } });
        text.append(
          createElement({ tag: 'span', className: 'list-row__title', text: item.titre || 'Sans titre' }),
          createElement({ tag: 'span', className: 'list-row__meta', text: item.niveau_scolaire || 'Tous niveaux' })
        );
        row.append(text);
        row.append(createIcon('chevronRight', { size: 16 }));
        row.addEventListener('click', () => { window.location.hash = `/publications/${item.id}`; });
        list.append(row);
      });
    })
    .catch(() => {
      list.replaceChildren(createElement({ tag: 'p', className: 'muted', text: 'Impossible de charger les publications.' }));
    });
};

const renderGuest = (page) => {
  const hero = createElement({ tag: 'section', className: 'stack' });
  hero.append(
    createElement({ tag: 'h1', className: 'page-title', text: 'Apprends, suis, progresse avec Ulamayi' }),
    createElement({ tag: 'p', className: 'page-subtitle', text: 'Accède aux épreuves, aux exercices et au suivi scolaire de tes enfants.' })
  );
  const actions = createElement({ tag: 'div', className: 'row' });
  const btnSignup = createButton({ label: 'Créer un compte', icon: 'signup', variant: 'primary' });
  btnSignup.addEventListener('click', () => { window.location.hash = '/inscription'; });
  const btnLogin = createButton({ label: 'Se connecter', icon: 'login', variant: 'secondary' });
  btnLogin.addEventListener('click', () => { window.location.hash = '/connexion'; });
  actions.append(btnSignup, btnLogin);
  hero.append(actions);
  page.append(hero);

  // Annuaire enseignants visible même hors connexion
  buildTeacherSlider(page);
};

export const createHomeView = () => {
  const page = createElement({ tag: 'section', className: 'page' });
  if (isAuthenticated()) {
    renderAuthenticated(page);
  } else {
    renderGuest(page);
  }
  return page;
};
