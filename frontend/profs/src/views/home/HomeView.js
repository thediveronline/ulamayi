import { createElement, createButton } from '../../utils/dom.js';
import { createIcon } from '../../components/icon/icon.js';
import { isAuthenticated, getUser } from '../../utils/session.js';
import { getMyPublications } from '../../services/teacher.service.js';
import { createLoadingCard } from '../../utils/loading.js';
import { createAlert } from '../../components/alert/alert.js';

const FEATURES = [
  {
    icon: 'book',
    title: 'Mes publications',
    text: 'Crée, modifie ou supprime tes épreuves et exercices à destination des élèves.'
  },
  {
    icon: 'edit',
    title: 'Édition rapide',
    text: 'Un éditeur clair pour rédiger et publier en quelques minutes.'
  },
  {
    icon: 'shield',
    title: 'Compte sécurisé',
    text: 'Authentification par email avec session protégée par jeton JWT.'
  }
];

const formatDate = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
};

const renderHeroAuthenticated = (page) => {
  const user = getUser();
  const prenom = user?.prenom || user?.nom || 'enseignant';

  const hero = createElement({ tag: 'section', className: 'card' });
  const inner = createElement({ tag: 'div', className: 'stack' });

  inner.append(
    createElement({ tag: 'span', className: 'badge badge-primary', text: 'Espace enseignant' }),
    createElement({ tag: 'h1', className: 'page-title', text: `Bienvenue, ${prenom}` }),
    createElement({ tag: 'p', className: 'page-subtitle', text: 'Gère tes publications et ton profil. Crée une nouvelle épreuve en un clic.' })
  );

  const actions = createElement({ tag: 'div', className: 'row' });
  const btnNew = createButton({ label: 'Nouvelle publication', icon: 'plus', variant: 'primary' });
  btnNew.addEventListener('click', () => { window.location.hash = '/publications/nouvelle'; });

  const btnPubs = createButton({ label: 'Mes publications', icon: 'book', variant: 'secondary' });
  btnPubs.addEventListener('click', () => { window.location.hash = '/publications'; });

  actions.append(btnNew, btnPubs);
  inner.append(actions);
  hero.append(inner);
  page.append(hero);
};

const renderHeroGuest = (page) => {
  const hero = createElement({ tag: 'section', className: 'card' });
  const inner = createElement({ tag: 'div', className: 'stack' });

  inner.append(
    createElement({ tag: 'span', className: 'badge badge-accent', text: 'Plateforme éducative' }),
    createElement({ tag: 'h1', className: 'page-title', text: 'Espace enseignants Ulamayi' }),
    createElement({ tag: 'p', className: 'page-subtitle', text: 'Connecte-toi pour publier tes épreuves et exercices à destination des élèves.' })
  );

  const actions = createElement({ tag: 'div', className: 'row' });
  const btnLogin = createButton({ label: 'Se connecter', icon: 'login', variant: 'primary' });
  btnLogin.addEventListener('click', () => { window.location.hash = '/connexion'; });
  actions.append(btnLogin);

  inner.append(actions);
  hero.append(inner);
  page.append(hero);
};

const renderStats = (page) => {
  const section = createElement({ tag: 'section', className: 'stack' });
  section.append(createElement({ tag: 'h2', text: 'Aperçu' }));

  const grid = createElement({ tag: 'div', className: 'grid-cards' });
  grid.append(createLoadingCard('Chargement de tes publications...'));
  section.append(grid);
  page.append(section);

  getMyPublications()
    .then((items) => {
      grid.replaceChildren();
      const list = Array.isArray(items) ? items : [];

      const total = list.length;
      const last = list[0];

      const totalCard = createElement({ tag: 'article', className: 'card stack' });
      const totalIcon = createElement({ tag: 'div', className: 'empty-state-icon' });
      totalIcon.append(createIcon('book', { size: 22 }));
      totalCard.append(
        totalIcon,
        createElement({ tag: 'h3', text: String(total) }),
        createElement({ tag: 'p', className: 'muted', text: total > 1 ? 'publications créées' : 'publication créée' })
      );
      grid.append(totalCard);

      const lastCard = createElement({ tag: 'article', className: 'card stack' });
      const lastIcon = createElement({ tag: 'div', className: 'empty-state-icon' });
      lastIcon.append(createIcon('calendar', { size: 22 }));
      lastCard.append(
        lastIcon,
        createElement({ tag: 'h3', text: last?.titre ? last.titre : 'Aucune publication' }),
        createElement({ tag: 'p', className: 'muted', text: last?.cree_le ? `Dernière publication le ${formatDate(last.cree_le)}` : 'Crée ta première publication.' })
      );
      grid.append(lastCard);

      const ctaCard = createElement({ tag: 'article', className: 'card stack' });
      const ctaIcon = createElement({ tag: 'div', className: 'empty-state-icon' });
      ctaIcon.append(createIcon('plus', { size: 22 }));
      ctaCard.append(
        ctaIcon,
        createElement({ tag: 'h3', text: 'Nouvelle publication' }),
        createElement({ tag: 'p', className: 'muted', text: 'Rédige une nouvelle épreuve ou un exercice.' })
      );
      const ctaBtn = createButton({ label: 'Créer', icon: 'plus', variant: 'primary', size: 'sm' });
      ctaBtn.addEventListener('click', () => { window.location.hash = '/publications/nouvelle'; });
      ctaCard.append(ctaBtn);
      grid.append(ctaCard);
    })
    .catch((error) => {
      grid.replaceChildren(createAlert({ tone: 'danger', message: error.message }));
    });
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
    renderStats(page);
  } else {
    renderHeroGuest(page);
    renderFeatures(page);
  }

  return page;
};
