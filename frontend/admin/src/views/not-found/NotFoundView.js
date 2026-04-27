export const createNotFoundView = () => {
  const page = document.createElement('section');
  page.className = 'page';
  page.innerHTML = `
    <div class="card grid">
      <h1 class="page-title">Page introuvable</h1>
      <p class="page-subtitle">La route demandée n'existe pas.</p>
    </div>
  `;
  return page;
};
