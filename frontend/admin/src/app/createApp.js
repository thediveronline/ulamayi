import { createRouter } from './router.js';
import { createShell } from '../components/layout/layout.js';
import { routes } from '../views/routes.js';

export const createApp = (mountNode) => {
  const router = createRouter(routes);
  const shell = createShell({
    title: 'Ulamayi Admin',
    navItems: [
      { label: 'Accueil', href: '#/' },
      { label: 'Utilisateurs', href: '#/utilisateurs' },
      { label: 'Profil', href: '#/profil' }
    ]
  });

  mountNode.replaceChildren(shell.element);
  router.subscribe((route) => {
    shell.setContent(route.render());
    shell.setActiveRoute(route.path);
  });
  router.start();
};
