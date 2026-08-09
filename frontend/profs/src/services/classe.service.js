import { apiRequest } from './api.js';

export const getMesClasses = () => apiRequest('/classes/mes-classes');

export const getClasseById = (id) => apiRequest(`/classes/${id}`);

export const createClasse = (payload) => apiRequest('/classes', {
  method: 'POST',
  body: JSON.stringify(payload)
});

export const updateClasse = (id, payload) => apiRequest(`/classes/${id}`, {
  method: 'PUT',
  body: JSON.stringify(payload)
});

export const ajouterEleve = (classeId, eleveId) => apiRequest(`/classes/${classeId}/eleves`, {
  method: 'POST',
  body: JSON.stringify({ eleve_id: eleveId })
});

export const listerEleves = (classeId) => apiRequest(`/classes/${classeId}/eleves`);

export const supprimerClasse = (id) => apiRequest(`/classes/${id}`, { method: 'DELETE' });

// Chat de classe
export const getMessages = (classeId) => apiRequest(`/classes/${classeId}/messages`);
export const getMediasClasse = (classeId) => apiRequest(`/classes/${classeId}/medias`);

export const envoyerMessage = (classeId, contenu, fichier) => {
  const form = new FormData();
  if (contenu) form.append('contenu', contenu);
  if (fichier) form.append('media', fichier);
  return apiRequest(`/classes/${classeId}/messages`, { method: 'POST', body: form });
};
