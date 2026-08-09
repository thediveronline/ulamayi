import { getEnseignantPublic } from '../../services/classe.service.js';
import { createElement, createButton } from '../../utils/dom.js';
import { createIcon } from '../../components/icon/icon.js';
import { createLoadingCard } from '../../utils/loading.js';
import { notify } from '../../components/notifications/notifications.js';

const formatPrix = (prix) => {
  const v = Number(prix);
  return v > 0 ? `${v.toLocaleString('fr-FR')} F` : 'Gratuit';
};

export const createEnseignantProfilView = (context = {}) => {
  const enseignantId = parseInt(context?.params?.id, 10);
  const page = createElement({ tag: 'section', className: 'page' });

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

      // --- Bannière profil ---
      const profil = createElement({ tag: 'div', className: 'teacher-profil' });

      const avatar = createElement({ tag: 'div', className: 'teacher-profil__avatar' });
      if (data.photo_profil) {
        const img = document.createElement('img');
        img.src = data.photo_profil;
        img.alt = '';
        avatar.append(img);
      } else {
        avatar.append(createIcon('user', { size: 40 }));
      }
      profil.append(avatar);

      const info = createElement({ tag: 'div', className: 'teacher-profil__info' });
      const nom = [data.titre, data.prenom, data.nom].filter(Boolean).join(' ');
      info.append(createElement({ tag: 'h1', className: 'page-title', text: nom }));

      const badges = createElement({ tag: 'div', className: 'row', attrs: { style: 'flex-wrap:wrap; gap:0.5rem;' } });
      if (data.matiere) badges.append(createElement({ tag: 'span', className: 'badge badge-primary', text: data.matiere }));
      if (Number(data.note_moyenne) > 0) {
        const nb = createElement({ tag: 'span', className: 'badge', attrs: { style: 'display:flex;align-items:center;gap:0.25rem;' } });
        nb.append(createIcon('star', { size: 12 }));
        nb.append(document.createTextNode(` ${Number(data.note_moyenne).toFixed(1)} (${data.nombre_avis} avis)`));
        badges.append(nb);
      }
      info.append(badges);

      // Contact
      if (data.numero_telephone) {
        const tel = createElement({ tag: 'a', className: 'teacher-profil__contact', attrs: { href: `tel:${data.numero_telephone}` } });
        tel.append(createIcon('phone', { size: 14 }));
        tel.append(document.createTextNode(` ${data.numero_telephone}`));
        info.append(tel);
      }

      profil.append(info);
      page.append(profil);

      // --- Classes de l'enseignant ---
      if (data.classes?.length) {
        const section = createElement({ tag: 'section', className: 'stack-lg' });
        section.append(createElement({ tag: 'h2', text: 'Classes' }));
        const list = createElement({ tag: 'div', className: 'stack' });
        data.classes.forEach(c => {
          const row = createElement({ tag: 'div', className: 'list-row', attrs: { style: 'cursor:pointer;' } });
          const txt = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap:0.125rem; flex:1;' } });
          txt.append(createElement({ tag: 'span', className: 'list-row__title', text: c.nom }));
          const sub = `${c.niveau_scolaire || ''} — ${formatPrix(c.prix)}`;
          txt.append(createElement({ tag: 'span', className: 'list-row__meta', text: sub.trim() }));
          row.append(txt);
          row.append(createIcon('chevronRight', { size: 16 }));
          row.addEventListener('click', () => { window.location.hash = `/classes/${c.id}`; });
          list.append(row);
        });
        section.append(list);
        page.append(section);
      }

      // --- Publications de l'enseignant ---
      if (data.publications?.length) {
        const section = createElement({ tag: 'section', className: 'stack-lg' });
        section.append(createElement({ tag: 'h2', text: 'Publications' }));
        const list = createElement({ tag: 'div', className: 'stack' });
        data.publications.slice(0, 6).forEach(p => {
          const row = createElement({ tag: 'div', className: 'list-row', attrs: { style: 'cursor:pointer;' } });
          const txt = createElement({ tag: 'div', className: 'stack', attrs: { style: 'gap:0.125rem; flex:1;' } });
          txt.append(createElement({ tag: 'span', className: 'list-row__title', text: p.titre || 'Sans titre' }));
          txt.append(createElement({ tag: 'span', className: 'list-row__meta', text: p.niveau_scolaire || '' }));
          row.append(txt);
          row.append(createIcon('chevronRight', { size: 16 }));
          row.addEventListener('click', () => { window.location.hash = `/publications/${p.id}`; });
          list.append(row);
        });
        section.append(list);
        page.append(section);
      }
    })
    .catch(err => {
      page.removeChild(loader);
      notify({ tone: 'danger', message: err.message });
      page.append(createElement({ tag: 'p', className: 'muted', text: 'Impossible de charger ce profil.' }));
    });

  return page;
};
