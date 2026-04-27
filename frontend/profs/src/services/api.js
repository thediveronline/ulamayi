import { getSession } from '../utils/session.js';

// URL de l'API : configurable via la variable d'environnement Vite VITE_API_BASE_URL
// (a definir dans .env / .env.production ou dans Cloudflare Pages > Environment variables)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const parseBody = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
  try {
    const text = await response.text();
    return text ? { message: text } : null;
  } catch {
    return null;
  }
};

export const apiRequest = async (path, options = {}) => {
  const session = getSession();
  const headers = new Headers(options.headers || {});

  // Pour les FormData (upload de fichier), on laisse le navigateur poser
  // automatiquement le Content-Type avec la bonne boundary multipart.
  const bodyEstFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!headers.has('Content-Type') && options.body && !bodyEstFormData) {
    headers.set('Content-Type', 'application/json');
  }

  if (session?.token) {
    headers.set('Authorization', `Bearer ${session.token}`);
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch (networkError) {
    throw new Error('Impossible de joindre le serveur. Vérifie que le backend est démarré.');
  }

  const data = await parseBody(response);

  if (!response.ok) {
    const message = data?.message || data?.error || `Erreur ${response.status} ${response.statusText || ''}`.trim();
    throw new Error(message);
  }

  return data;
};
