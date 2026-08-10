import './layout.css';
import { createIcon } from '../icon/icon.js';

const createNavLink = (item, className, { withLabel = true } = {}) => {
  const link = document.createElement('a');
  link.className = className;
  link.href = item.href;
  link.dataset.path = item.href.replace(/^#/, '');

  if (item.icon) {
    link.append(createIcon(item.icon, { size: 20 }));
  }

  if (withLabel) {
    const label = document.createElement('span');
    label.textContent = item.label;
    link.append(label);
  }

  return link;
};

const fillNav = (container, items, className, options) => {
  container.replaceChildren();
  items.forEach((item) => container.append(createNavLink(item, className, options)));
};

export const createShell = ({ title, navItems }) => {
  const element = document.createElement('div');
  element.className = 'shell';

  // Header
  const header = document.createElement('header');
  header.className = 'shell__header';

  const headerInner = document.createElement('div');
  headerInner.className = 'shell__header-inner';

  const brand = document.createElement('a');
  const brandMark = document.createElement('img');
  brandMark.className = 'shell__brand-logo';
  brandMark.src = '/logo_ulamayi_bg.png';
  brandMark.alt = 'Ulamayi';
  brandMark.style.cssText = 'height: 58px; width: auto; object-fit: contain; display: block;';

  brand.append(brandMark);

  const hamburger = document.createElement('button');
  hamburger.className = 'shell__hamburger';
  hamburger.type = 'button';
  hamburger.setAttribute('aria-label', 'Ouvrir le menu');
  hamburger.append(createIcon('menu', { size: 20 }));

  const desktopNav = document.createElement('nav');
  desktopNav.className = 'shell__desktop-nav';
  fillNav(desktopNav, navItems, 'shell__nav-link');

  headerInner.append(brand, desktopNav, hamburger);
  header.append(headerInner);

  // Main + body
  const main = document.createElement('main');
  main.className = 'shell__main';

  const body = document.createElement('div');
  body.className = 'shell__body';

  const content = document.createElement('section');
  content.className = 'shell__content';

  body.append(content);
  main.append(body);

  // Mobile drawer
  const drawer = document.createElement('div');
  drawer.className = 'shell__drawer';
  const drawerPanel = document.createElement('nav');
  drawerPanel.className = 'shell__drawer-panel';
  fillNav(drawerPanel, navItems, 'shell__sidebar-link');
  drawer.append(drawerPanel);

  // Bottom nav
  const bottomNav = document.createElement('nav');
  bottomNav.className = 'shell__bottom-nav';
  fillNav(bottomNav, navItems, 'shell__bottom-link', { withLabel: true });

  // Wire hamburger / drawer
  const closeDrawer = () => drawer.classList.remove('is-open');
  hamburger.addEventListener('click', () => drawer.classList.toggle('is-open'));
  drawer.addEventListener('click', (event) => {
    if (event.target === drawer) closeDrawer();
  });
  drawerPanel.addEventListener('click', (event) => {
    if (event.target.closest('.shell__sidebar-link')) closeDrawer();
  });

  element.append(header, main, drawer, bottomNav);

  return {
    element,
    setContent(node) {
      content.replaceChildren(node);
      window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    },
    setFlush(flush) {
      // Mode "plein écran" : supprime paddings + contrainte de largeur (vue Tchat IA / Classe)
      main.classList.toggle('shell__main--flush', flush);
      body.classList.toggle('shell__body--flush', flush);
      // Masquer la bottom-nav en mode flush pour libérer l'espace du compositeur
      bottomNav.style.display = flush ? 'none' : '';
    },
    setNavItems(items) {
      fillNav(desktopNav, items, 'shell__nav-link');
      fillNav(drawerPanel, items, 'shell__sidebar-link');
      fillNav(bottomNav, items, 'shell__bottom-link', { withLabel: true });
    },
    setActiveRoute(path) {
      element.querySelectorAll('[data-path]').forEach((link) => {
        link.classList.toggle('is-active', link.dataset.path === path);
      });
    }
  };
};
