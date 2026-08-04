import { getStats } from '../../services/admin.service.js';
import { createIcon } from '../../components/icon/icon.js';
import { createLoadingCard } from '../../utils/loading.js';
import { isAuthenticated, getSession } from '../../utils/session.js';

const StatCard = ({ icon, label, value, color = 'primary' }) => {
  const card = document.createElement('div');
  card.className = 'card card-hover';
  card.style.cssText = 'display:grid;gap:var(--space-3)';

  const header = document.createElement('div');
  header.className = 'row';
  header.style.cssText = 'display:flex;align-items:center;gap:var(--space-3)';

  const iconWrap = document.createElement('div');
  iconWrap.style.cssText = `display:grid;place-items:center;width:44px;height:44px;border-radius:var(--radius-md);background:var(--color-${color}-soft);color:var(--color-${color})`;
  iconWrap.append(createIcon(icon, { size: 22 }));
  header.append(iconWrap);

  const info = document.createElement('div');
  info.style.cssText = 'display:grid;gap:2px';

  const count = document.createElement('span');
  count.style.cssText = 'font-size:1.75rem;font-weight:800;font-family:var(--font-display);letter-spacing:-0.03em';
  count.textContent = value ?? '—';
  info.append(count);

  const lbl = document.createElement('span');
  lbl.className = 'subtle';
  lbl.textContent = label;
  info.append(lbl);

  header.append(info);
  card.append(header);

  return card;
};

export const createHomeView = () => {
  const page = document.createElement('section');
  page.className = 'page';

  if (!isAuthenticated()) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.cssText = 'text-align:center;padding:var(--space-7) var(--space-5);max-width:560px;margin:10vh auto';

    const iconWrap = document.createElement('div');
    iconWrap.style.cssText = 'display:grid;place-items:center;width:64px;height:64px;border-radius:50%;background:var(--color-primary-soft);color:var(--color-primary);margin:0 auto';
    iconWrap.append(createIcon('shield', { size: 28 }));
    card.append(iconWrap);

    const title = document.createElement('h2');
    title.textContent = 'Administration Ulamayi';
    card.append(title);

    const desc = document.createElement('p');
    desc.className = 'page-subtitle';
    desc.textContent = 'Connectez-vous pour accéder au tableau de bord de gestion de la plateforme.';
    card.append(desc);

    const btn = document.createElement('a');
    btn.className = 'btn btn-primary';
    btn.href = '#/connexion';
    btn.textContent = 'Se connecter';
    card.append(btn);

    page.append(card);
    return page;
  }

  const header = document.createElement('div');
  header.className = 'page-header';

  const titleWrap = document.createElement('div');
  titleWrap.className = 'stack';
  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = 'Tableau de bord';
  titleWrap.append(title);

  const session = getSession();
  const userName = session?.utilisateur?.nom || 'Admin';
  const subtitle = document.createElement('p');
  subtitle.className = 'page-subtitle';
  subtitle.textContent = `Bienvenue, ${userName}. Voici un aperçu de la plateforme.`;
  titleWrap.append(subtitle);

  header.append(titleWrap);
  page.append(header);

  const statsGrid = document.createElement('div');
  statsGrid.className = 'grid-cards';
  statsGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
  page.append(statsGrid);

  const loadingCard = createLoadingCard('Chargement des statistiques...');
  statsGrid.append(loadingCard);

  getStats()
    .then((stats) => {
      statsGrid.replaceChildren(
        StatCard({ icon: 'users', label: 'Élèves', value: stats.total_eleves, color: 'primary' }),
        StatCard({ icon: 'user', label: 'Enseignants', value: stats.total_enseignants, color: 'accent' }),
        StatCard({ icon: 'users', label: 'Parents', value: stats.total_parents, color: 'info' }),
        StatCard({ icon: 'book', label: 'Publications', value: stats.total_publications, color: 'success' })
      );
    })
    .catch((err) => {
      statsGrid.replaceChildren();
      const errorCard = document.createElement('div');
      errorCard.className = 'card';
      errorCard.textContent = `Erreur : ${err.message}`;
      statsGrid.append(errorCard);
    });

  return page;
};
