import './layout.css';

const createLink = (item, className) => {
  const link = document.createElement('a');
  link.className = className;
  link.href = item.href;
  link.dataset.path = item.href.replace(/^#/, '');
  link.textContent = item.label;
  return link;
};

export const createShell = ({ title, navItems }) => {
  const element = document.createElement('div');
  element.className = 'shell';
  const header = document.createElement('header');
  header.className = 'shell__header';
  const headerInner = document.createElement('div');
  headerInner.className = 'shell__header-inner';
  const brand = document.createElement('a');
  brand.className = 'shell__brand';
  brand.href = '#/';
  brand.textContent = title;
  const hamburger = document.createElement('button');
  hamburger.className = 'shell__hamburger';
  hamburger.type = 'button';
  hamburger.textContent = '☰';
  const desktopNav = document.createElement('nav');
  desktopNav.className = 'shell__desktop-nav';
  navItems.forEach((item) => desktopNav.append(createLink(item, 'shell__nav-link')));
  headerInner.append(brand, hamburger, desktopNav);
  header.append(headerInner);
  const main = document.createElement('main');
  main.className = 'shell__main';
  const body = document.createElement('div');
  body.className = 'shell__body';
  const sidebar = document.createElement('aside');
  sidebar.className = 'shell__sidebar';
  const sidebarNav = document.createElement('nav');
  sidebarNav.className = 'shell__sidebar-nav';
  navItems.forEach((item) => sidebarNav.append(createLink(item, 'shell__sidebar-link')));
  sidebar.append(sidebarNav);
  const content = document.createElement('section');
  content.className = 'shell__content';
  body.append(sidebar, content);
  main.append(body);
  const bottomNav = document.createElement('nav');
  bottomNav.className = 'shell__bottom-nav';
  navItems.forEach((item) => bottomNav.append(createLink(item, 'shell__bottom-link')));
  const footer = document.createElement('footer');
  footer.className = 'shell__footer';
  const footerInner = document.createElement('div');
  footerInner.className = 'shell__footer-inner';
  footerInner.textContent = 'Ulamayi · Administration';
  footer.append(footerInner);
  hamburger.addEventListener('click', () => sidebar.classList.toggle('is-open'));
  sidebar.addEventListener('click', (event) => {
    if (event.target.matches('.shell__sidebar-link')) {
      sidebar.classList.remove('is-open');
    }
  });
  element.append(header, main, bottomNav, footer);
  return {
    element,
    setContent(node) {
      content.replaceChildren(node);
    },
    setActiveRoute(path) {
      element.querySelectorAll('[data-path]').forEach((link) => {
        link.classList.toggle('is-active', link.dataset.path === path);
      });
    }
  };
};
