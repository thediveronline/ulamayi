import { createRouter } from './router.js';
import { createShell } from '../components/layout/layout.js';
import { routes } from '../views/routes.js';
import { isAuthenticated } from '../utils/session.js';
import { initTheme } from '../utils/theme.js';

export const createApp = (mountNode) => {
  initTheme();

  const router = createRouter(routes);
  const shell = createShell({
    title: 'Ulamayi Admin',
    navItems: [
      { label: 'Accueil', href: '#/', icon: 'home' },
      { label: 'Utilisateurs', href: '#/utilisateurs', icon: 'users' },
      { label: 'Enseignants', href: '#/enseignants', icon: 'user' },
      { label: 'Établissements', href: '#/etablissements', icon: 'building' },
      { label: 'Profil', href: '#/profil', icon: 'settings' }
    ]
  });

  mountNode.replaceChildren(shell.element);

  router.subscribe((route, params) => {
    const requiresAuth = route.requiresAuth;
    const guestOnly = route.guestOnly;

    if (requiresAuth && !isAuthenticated()) {
      window.location.hash = '/connexion';
      return;
    }

    if (guestOnly && isAuthenticated()) {
      window.location.hash = '/';
      return;
    }

    shell.setContent(route.render(params));
    shell.setActiveRoute(route.path);
  });

  router.start();
};
