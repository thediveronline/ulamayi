import { getEnseignantPublic } from '../../services/classe.service.js';
import { createElement, createButton } from '../../utils/dom.js';
import { createIcon } from '../../components/icon/icon.js';
import { createLoadingCard } from '../../utils/loading.js';
import { notify } from '../../components/notifications/notifications.js';

const formatPrix = (prix) => {
  const v = Number(prix);
  return v > 0 ? `${v.toLocaleString('fr-FR')} F CFA` : 'Gratuit';
};

export const createEnseignantProfilView = (context = {}) => {
  const enseignantId = parseInt(context?.params?.id, 10);
  const page = createElement({ tag: 'section', className: 'page enseignant-profil-page' });

  const backBtn = createButton({ label: 'Retour', icon: 'chevronLeft', variant: 'ghost', size: 'sm' });
  backBtn.addEventListener('click', () => { window.location.hash = '/enseignants'; });
  page.append(backBtn);

  if (!enseignantId || Number.isNaN(enseignantId)) {
    page.append(createElement({ tag: 'p', className: 'muted', text: 'Identifiant invalide.' }));
    return page;
  }

  const loader = createLoadingCard('Chargement du profil...');
  page.append(loader);

  getEnseignantPublic(enseignantId)
    .then(data => {
      page.removeChild(loader);

      // ── Carte hero profil ────────────────────────────────────
      const hero = createElement({ tag: 'div', className: 'ep-hero-card' });

      // Bannière gradient
      const banner = createElement({ tag: 'div', className: 'ep-hero-banner' });
      hero.append(banner);

      const heroBody = createElement({ tag: 'div', className: 'ep-hero-body' });

      // Avatar grand format
      const avatar = createElement({ tag: 'div', className: 'ep-hero-avatar' });
      if (data.photo_profil) {
        const img = document.createElement('img');
        img.src = data.photo_profil;
        img.alt = '';
        avatar.append(img);
      } else {
        avatar.append(createIcon('user', { size: 44 }));
      }
      heroBody.append(avatar);

      const heroInfo = createElement({ tag: 'div', className: 'ep-hero-info' });

      const nom = [data.prenom, data.nom].filter(Boolean).join(' ');
      heroInfo.append(createElement({ tag: 'h1', className: 'ep-hero-nom', text: nom || 'Enseignant' }));

      if (data.titre) {
        heroInfo.append(createElement({ tag: 'p', className: 'ep-hero-titre', text: data.titre }));
      }

      // Badges matière + note
      const badges = createElement({ tag: 'div', className: 'ep-hero-badges' });
      if (data.matiere) {
        badges.append(createElement({ tag: 'span', className: 'badge badge-accent', text: data.matiere }));
      }
      if (Number(data.note_moyenne) > 0) {
        const nb = createElement({ tag: 'span', className: 'badge ep-note-badge' });
        nb.append(createIcon('star', { size: 12 }));
        nb.append(document.createTextNode(` ${Number(data.note_moyenne).toFixed(1)}`));
        if (data.nombre_avis > 0) nb.append(document.createTextNode(` (${data.nombre_avis} avis)`));
        badges.append(nb);
      }
      heroInfo.append(badges);

      // Contact téléphone
      if (data.numero_telephone) {
        const tel = createElement({ tag: 'a', className: 'ep-contact-btn', attrs: { href: `tel:${data.numero_telephone}` } });
        tel.append(createIcon('phone', { size: 15 }));
        tel.append(document.createTextNode(data.numero_telephone));
        heroInfo.append(tel);
      }

      heroBody.append(heroInfo);
      hero.append(heroBody);
      page.append(hero);

      // ── Stats rapides ────────────────────────────────────────
      const stats = createElement({ tag: 'div', className: 'ep-stats' });
      const statItems = [
        { icon: 'graduation', val: data.classes?.length || 0, label: 'Classe(s)' },
        { icon: 'book', val: data.publications?.length || 0, label: 'Publication(s)' },
        { icon: 'star', val: Number(data.note_moyenne || 0).toFixed(1), label: 'Note moy.' }
      ];
      statItems.forEach(s => {
        const item = createElement({ tag: 'div', className: 'ep-stat-item' });
        const icon = createElement({ tag: 'div', className: 'ep-stat-icon' });
        icon.append(createIcon(s.icon, { size: 16 }));
        item.append(icon);
        item.append(createElement({ tag: 'strong', text: String(s.val) }));
        item.append(createElement({ tag: 'span', text: s.label }));
        stats.append(item);
      });
      page.append(stats);

      // ── Classes ──────────────────────────────────────────────
      if (data.classes?.length) {
        const section = createElement({ tag: 'section', className: 'ep-section' });
        section.append(createElement({ tag: 'h2', className: 'ep-section-title', text: 'Ses classes' }));

        const grid = createElement({ tag: 'div', className: 'ep-classes-grid' });
        data.classes.forEach(c => {
          const card = createElement({ tag: 'article', className: 'ep-class-card', attrs: { style: 'cursor:pointer;' } });

          const logo = createElement({ tag: 'div', className: 'ep-class-logo' });
          if (c.logo_url) {
            const img = document.createElement('img');
            img.src = c.logo_url;
            img.alt = '';
            logo.append(img);
          } else {
            logo.append(createIcon('graduation', { size: 20 }));
          }
          card.append(logo);

          const info = createElement({ tag: 'div', className: 'ep-class-info' });
          info.append(createElement({ tag: 'h3', className: 'ep-class-nom', text: c.nom }));

          const meta = createElement({ tag: 'div', className: 'ep-class-meta' });
          if (c.niveau_scolaire) meta.append(createElement({ tag: 'span', className: 'badge badge-primary', text: c.niveau_scolaire }));
          meta.append(createElement({
            tag: 'span',
            className: `badge ${Number(c.prix) > 0 ? 'badge-accent' : 'badge-success'}`,
            text: formatPrix(c.prix)
          }));
          info.append(meta);

          if (c.planning) {
            const plan = createElement({ tag: 'div', className: 'ep-class-planning' });
            plan.append(createIcon('clock', { size: 12 }));
            plan.append(document.createTextNode(c.planning));
            info.append(plan);
          }

          card.append(info);
          const chev = createElement({ tag: 'div', className: 'ep-class-chev' });
          chev.append(createIcon('chevronRight', { size: 16 }));
          card.append(chev);

          card.addEventListener('click', () => { window.location.hash = `/classes/${c.id}`; });
          grid.append(card);
        });
        section.append(grid);
        page.append(section);
      }

      // ── Publications ─────────────────────────────────────────
      if (data.publications?.length) {
        const section = createElement({ tag: 'section', className: 'ep-section' });
        section.append(createElement({ tag: 'h2', className: 'ep-section-title', text: 'Ses publications' }));

        const list = createElement({ tag: 'div', className: 'ep-pub-list' });
        data.publications.slice(0, 6).forEach(p => {
          const row = createElement({ tag: 'div', className: 'ep-pub-row', attrs: { style: 'cursor:pointer;' } });
          const icon = createElement({ tag: 'div', className: 'ep-pub-icon' });
          icon.append(createIcon('book', { size: 16 }));
          row.append(icon);

          const txt = createElement({ tag: 'div', className: 'ep-pub-txt' });
          txt.append(createElement({ tag: 'span', className: 'ep-pub-titre', text: p.titre || 'Sans titre' }));
          if (p.niveau_scolaire) txt.append(createElement({ tag: 'span', className: 'ep-pub-niveau', text: p.niveau_scolaire }));
          row.append(txt);
          row.append(createIcon('chevronRight', { size: 15 }));
          row.addEventListener('click', () => { window.location.hash = `/publications/${p.id}`; });
          list.append(row);
        });
        section.append(list);
        page.append(section);
      }
    })
    .catch(err => {
      if (loader.parentNode) page.removeChild(loader);
      notify({ tone: 'danger', message: err.message });
      page.append(createElement({ tag: 'p', className: 'muted', text: 'Profil introuvable.' }));
    });

  return page;
};
