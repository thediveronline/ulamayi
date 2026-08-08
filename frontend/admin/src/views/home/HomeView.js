import { getStats } from '../../services/admin.service.js';
import { createIcon } from '../../components/icon/icon.js';
import { createLoadingCard } from '../../utils/loading.js';
import { isAuthenticated, getSession } from '../../utils/session.js';

const StatTile = ({ icon, value, label }) => {
  const tile = document.createElement('div');
  tile.className = 'dash-tile';

  const iconWrap = document.createElement('div');
  iconWrap.className = 'dash-tile__icon';
  iconWrap.append(createIcon(icon, { size: 18 }));

  const meta = document.createElement('div');
  meta.className = 'dash-tile__meta';

  const val = document.createElement('span');
  val.className = 'dash-tile__value';
  val.textContent = value ?? '—';
  meta.append(val);

  const lbl = document.createElement('span');
  lbl.className = 'dash-tile__label';
  lbl.textContent = label;
  meta.append(lbl);

  tile.append(iconWrap, meta);
  return tile;
};

export const createHomeView = () => {
  const page = document.createElement('section');
  page.className = 'page';

  if (!isAuthenticated()) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.cssText = 'text-align:center;padding:var(--space-7) var(--space-5);max-width:560px;margin:10vh auto';

    const iconWrap = document.createElement('div');
    iconWrap.style.cssText = 'display:grid;place-items:center;width:48px;height:48px;border-radius:var(--radius-md);background:var(--color-primary-soft);color:var(--color-text);margin:0 auto';
    iconWrap.append(createIcon('shield', { size: 24 }));
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
  statsGrid.className = 'dash-grid';
  page.append(statsGrid);

  statsGrid.append(createLoadingCard('Chargement des statistiques...'));

  getStats()
    .then((stats) => {
      statsGrid.replaceChildren(
        StatTile({ icon: 'users', value: stats.total_eleves, label: 'Élèves' }),
        StatTile({ icon: 'user', value: stats.total_enseignants, label: 'Enseignants' }),
        StatTile({ icon: 'users', value: stats.total_parents, label: 'Parents' }),
        StatTile({ icon: 'book', value: stats.total_publications, label: 'Publications' })
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
