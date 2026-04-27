export const createHomeView = () => {
  const page = document.createElement('section');
  page.className = 'page';
  page.innerHTML = `
    <div class="card grid">
      <h1 class="page-title">Espace administration</h1>
      <p class="page-subtitle">Gestion des utilisateurs et supervision générale.</p>
      <span class="status info">Structure initiale prête</span>
    </div>
  `;
  return page;
};
