import { createRouter } from './router.js';
import { createShell } from '../components/layout/layout.js';
import { routes } from '../views/routes.js';
import { logoutUser } from '../services/auth.service.js';
import { getUserRole, isAuthenticated } from '../utils/session.js';

const createNavItems = () => {
  const authenticated = isAuthenticated();
  const role = getUserRole();

  if (!authenticated) {
    return [
      { label: 'Accueil', href: '#/', icon: 'home' },
      { label: 'Connexion', href: '#/connexion', icon: 'login' },
      { label: 'Inscription', href: '#/inscription', icon: 'signup' }
    ];
  }

  if (role === 'parent') {
    return [
      { label: 'Accueil', href: '#/', icon: 'home' },
      { label: 'Enfants', href: '#/enfants', icon: 'users' },
      { label: 'Publications', href: '#/publications', icon: 'book' },
      { label: 'Profil', href: '#/profil', icon: 'user' },
      { label: 'Paramètres', href: '#/parametres', icon: 'settings' }
    ];
  }

  return [
    { label: 'Accueil', href: '#/', icon: 'home' },
    { label: 'Publications', href: '#/publications', icon: 'book' },
    { label: 'Profil', href: '#/profil', icon: 'user' },
    { label: 'Paramètres', href: '#/parametres', icon: 'settings' }
  ];
};

const resolveRouteAccess = (route) => {
  const authenticated = isAuthenticated();
  const role = getUserRole();

  if (route.guestOnly && authenticated) {
    return routes.find((item) => item.path === '/profil');
  }

  if (route.requiresAuth && !authenticated) {
    window.location.hash = '/connexion';
    return routes.find((item) => item.path === '/connexion');
  }

  if (route.roles?.length && !route.roles.includes(role)) {
    return routes.find((item) => item.path === '/404');
  }

  if (route.path === '/deconnexion') {
    logoutUser();
    return routes.find((item) => item.path === '/connexion');
  }

  return route;
};

export const createApp = (mountNode) => {
  const router = createRouter(routes);
  const shell = createShell({
    title: 'Ulamayi',
    navItems: createNavItems()
  });

  mountNode.replaceChildren(shell.element);
  router.subscribe((route, context) => {
    const currentRoute = resolveRouteAccess(route);
    shell.setNavItems(createNavItems());
    shell.setContent(currentRoute.render(context));
    shell.setActiveRoute(currentRoute.path);
  });

  router.start();
};
