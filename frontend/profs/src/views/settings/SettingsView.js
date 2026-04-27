import { createElement, createButton } from '../../utils/dom.js';
import { createIcon } from '../../components/icon/icon.js';
import { logoutUser } from '../../services/auth.service.js';
import { getUser, clearSession } from '../../utils/session.js';
import { notify } from '../../components/notifications/notifications.js';
import { isDarkTheme, toggleTheme } from '../../utils/theme.js';

const renderRow = ({ icon, title, description, action }) => {
  const row = createElement({ tag: 'div', className: 'row-between card card-compact settings-row' });

  const left = createElement({ tag: 'div', className: 'row' });
  const iconWrap = createElement({ tag: 'div', className: 'empty-state-icon', attrs: { style: 'width: 40px; height: 40px;' } });
  iconWrap.append(createIcon(icon, { size: 18 }));

  const text = createElement({ tag: 'div', className: 'stack settings-row__main', attrs: { style: 'gap: 0.125rem;' } });
  text.append(
    createElement({ tag: 'strong', text: title }),
    createElement({ tag: 'span', className: 'subtle', text: description })
  );

  left.append(iconWrap, text);
  row.append(left);

  if (action) {
    const actionWrap = createElement({ tag: 'div', className: 'settings-row__action' });
    actionWrap.append(action);
    row.append(actionWrap);
  }

  return row;
};

export const createSettingsView = () => {
  const user = getUser();
  const page = createElement({ tag: 'section', className: 'page' });
  let darkModeEnabled = isDarkTheme();

  const header = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap: 0.25rem;' } });
  header.append(
    createElement({ tag: 'h1', className: 'page-title', text: 'Paramètres' }),
    createElement({ tag: 'p', className: 'page-subtitle', text: 'Préférences de compte et actions sensibles.' })
  );
  page.append(header);

  const accountCard = createElement({ tag: 'div', className: 'card stack' });
  accountCard.append(createElement({ tag: 'h2', text: 'Compte' }));

  const editProfileBtn = createButton({ label: 'Modifier', icon: 'edit', variant: 'secondary', size: 'sm' });
  editProfileBtn.addEventListener('click', () => { window.location.hash = '/profil'; });

  accountCard.append(
    renderRow({
      icon: 'user',
      title: `${user?.prenom || ''} ${user?.nom || ''}`.trim() || 'Enseignant',
      description: user?.email || '-',
      action: editProfileBtn
    }),
    renderRow({
      icon: 'shield',
      title: 'Rôle',
      description: 'Enseignant'
    })
  );

  page.append(accountCard);

  const securityCard = createElement({ tag: 'div', className: 'card stack' });
  securityCard.append(createElement({ tag: 'h2', text: 'Sécurité' }));
  securityCard.append(renderRow({
    icon: 'lock',
    title: 'Mot de passe',
    description: 'La modification du mot de passe sera disponible prochainement.'
  }));
  page.append(securityCard);

  const appearanceCard = createElement({ tag: 'div', className: 'card stack' });
  appearanceCard.append(createElement({ tag: 'h2', text: 'Apparence' }));

  const toggleLabel = createElement({ tag: 'span', className: 'subtle', text: darkModeEnabled ? 'Mode sombre activé' : 'Mode clair activé' });
  const toggleControl = createElement({
    tag: 'button',
    className: `theme-toggle__control${darkModeEnabled ? ' is-active' : ''}`,
    attrs: {
      type: 'button',
      'aria-label': 'Basculer entre le mode clair et le mode sombre',
      'aria-pressed': darkModeEnabled ? 'true' : 'false'
    }
  });

  const toggleWrap = createElement({ tag: 'div', className: 'theme-toggle' });
  toggleWrap.append(
    createIcon('sun', { size: 16 }),
    toggleControl,
    createIcon('moon', { size: 16 })
  );

  const syncToggle = () => {
    toggleControl.classList.toggle('is-active', darkModeEnabled);
    toggleControl.setAttribute('aria-pressed', darkModeEnabled ? 'true' : 'false');
    toggleLabel.textContent = darkModeEnabled ? 'Mode sombre activé' : 'Mode clair activé';
  };

  toggleControl.addEventListener('click', () => {
    darkModeEnabled = toggleTheme() === 'dark';
    syncToggle();
  });

  appearanceCard.append(renderRow({
    icon: 'settings',
    title: 'Thème de l\u2019interface',
    description: 'Choisis entre une interface claire et sombre.',
    action: toggleWrap
  }));
  appearanceCard.append(toggleLabel);
  page.append(appearanceCard);

  const dangerCard = createElement({ tag: 'div', className: 'card stack' });
  dangerCard.append(createElement({ tag: 'h2', text: 'Session' }));

  const logoutBtn = createButton({ label: 'Se déconnecter', icon: 'logout', variant: 'danger' });
  logoutBtn.addEventListener('click', () => {
    clearSession();
    notify({ tone: 'info', message: 'Tu as été déconnecté.' });
    logoutUser();
  });

  dangerCard.append(renderRow({
    icon: 'logout',
    title: 'Déconnexion',
    description: 'Termine ta session sur cet appareil.',
    action: logoutBtn
  }));

  page.append(dangerCard);

  return page;
};
