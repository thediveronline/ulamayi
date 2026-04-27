import { createElement, createButton } from '../../utils/dom.js';
import { createIcon } from '../../components/icon/icon.js';
import { isAuthenticated, getUser, getUserRole } from '../../utils/session.js';

const FEATURES = [
  {
    icon: 'book',
    title: 'Publications',
    text: 'Consulte les épreuves et exercices publiés par les enseignants, filtrés selon ton niveau scolaire.'
  },
  {
    icon: 'users',
    title: 'Suivi des enfants',
    text: 'En tant que parent, accède à la liste de tes enfants et suis leurs publications adaptées.'
  },
  {
    icon: 'shield',
    title: 'Compte sécurisé',
    text: 'Authentification par email avec vérification OTP et session protégée par jeton JWT.'
  }
];

const renderHeroAuthenticated = (page) => {
  const user = getUser();
  const role = getUserRole();
  const prenom = user?.nom || user?.prenom || 'toi';

  const hero = createElement({ tag: 'section', className: 'card' });
  const inner = createElement({ tag: 'div', className: 'stack' });

  inner.append(
    createElement({ tag: 'span', className: 'badge badge-primary', text: role === 'parent' ? 'Espace parent' : 'Espace élève' }),
    createElement({ tag: 'h1', className: 'page-title', text: `Content de te revoir, ${prenom}` }),
    createElement({ tag: 'p', className: 'page-subtitle', text: 'Reprends là où tu en étais : explore les publications, mets à jour ton profil ou consulte les paramètres.' })
  );

  const actions = createElement({ tag: 'div', className: 'row' });
  const btnPubs = createButton({ label: 'Voir les publications', icon: 'book', variant: 'primary' });
  btnPubs.addEventListener('click', () => { window.location.hash = '/publications'; });

  const btnProfil = createButton({ label: 'Mon profil', icon: 'user', variant: 'secondary' });
  btnProfil.addEventListener('click', () => { window.location.hash = '/profil'; });

  actions.append(btnPubs, btnProfil);

  if (role === 'parent') {
    const btnEnfants = createButton({ label: 'Enfants', icon: 'users', variant: 'secondary' });
    btnEnfants.addEventListener('click', () => { window.location.hash = '/enfants'; });
    actions.append(btnEnfants);
  }

  inner.append(actions);
  hero.append(inner);
  page.append(hero);
};

const renderHeroGuest = (page) => {
  const hero = createElement({ tag: 'section', className: 'card' });
  const inner = createElement({ tag: 'div', className: 'stack' });

  inner.append(
    createElement({ tag: 'span', className: 'badge badge-accent', text: 'Plateforme éducative' }),
    createElement({ tag: 'h1', className: 'page-title', text: 'Apprends, suis, progresse avec Ulamayi' }),
    createElement({ tag: 'p', className: 'page-subtitle', text: 'Une plateforme dédiée aux élèves et aux parents pour accéder aux épreuves et au suivi scolaire.' })
  );

  const actions = createElement({ tag: 'div', className: 'row' });

  const btnSignup = createButton({ label: "Créer un compte", icon: 'signup', variant: 'primary' });
  btnSignup.addEventListener('click', () => { window.location.hash = '/inscription'; });

  const btnLogin = createButton({ label: 'Se connecter', icon: 'login', variant: 'secondary' });
  btnLogin.addEventListener('click', () => { window.location.hash = '/connexion'; });

  actions.append(btnSignup, btnLogin);
  inner.append(actions);
  hero.append(inner);
  page.append(hero);
};

const renderFeatures = (page) => {
  const section = createElement({ tag: 'section', className: 'stack' });
  section.append(createElement({ tag: 'h2', text: 'Ce que tu peux faire' }));

  const grid = createElement({ tag: 'div', className: 'grid-cards' });

  FEATURES.forEach((feature) => {
    const card = createElement({ tag: 'article', className: 'card stack' });

    const iconWrapper = createElement({ tag: 'div', className: 'empty-state-icon' });
    iconWrapper.append(createIcon(feature.icon, { size: 24 }));

    card.append(
      iconWrapper,
      createElement({ tag: 'h3', text: feature.title }),
      createElement({ tag: 'p', className: 'muted', text: feature.text })
    );
    grid.append(card);
  });

  section.append(grid);
  page.append(section);
};

export const createHomeView = () => {
  const page = createElement({ tag: 'section', className: 'page' });

  if (isAuthenticated()) {
    renderHeroAuthenticated(page);
  } else {
    renderHeroGuest(page);
  }

  renderFeatures(page);
  return page;
};
