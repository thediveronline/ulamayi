export const createProfileView = () => {
  const page = document.createElement('section');
  page.className = 'page';
  page.innerHTML = `
    <div class="card grid">
      <h1 class="page-title">Profil admin</h1>
      <p class="page-subtitle">Le backend expose la gestion des utilisateurs, mais pas encore de route dédiée pour lire directement le profil administrateur connecté.</p>
      <span class="status warning">Point backend à compléter</span>
    </div>
  `;
  return page;
};
