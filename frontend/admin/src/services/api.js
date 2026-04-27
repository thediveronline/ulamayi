// URL de l'API : configurable via la variable d'environnement Vite VITE_API_BASE_URL
// (a definir dans .env / .env.production ou dans Cloudflare Pages > Environment variables)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const SESSION_KEY = 'ulamayi-admin-session';

export const saveSession = (session) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const getSession = () => {
  const rawSession = localStorage.getItem(SESSION_KEY);
  return rawSession ? JSON.parse(rawSession) : null;
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const apiRequest = async (path, options = {}) => {
  const session = getSession();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (session?.token) {
    headers.set('Authorization', `Bearer ${session.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'Une erreur est survenue.');
  }

  return data;
};
