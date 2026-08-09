import { apiRequest } from './api.js';

export const getToutesClasses = () => apiRequest('/classes');
export const getMesClassesEleve = () => apiRequest('/classes/mes-classes-eleve');
export const getClasseById = (id) => apiRequest(`/classes/${id}`);
export const rejoindreClasse = (id) => apiRequest(`/classes/${id}/rejoindre`, { method: 'POST', body: '{}' });

// Enseignants
export const getTousEnseignants = () => apiRequest('/enseignants');
export const getEnseignantPublic = (id) => apiRequest(`/enseignants/profil-public/${id}`);

// Messages de classe
export const getMessages = (classeId) => apiRequest(`/classes/${classeId}/messages`);
export const envoyerMessage = (classeId, contenu, fichier) => {
  const form = new FormData();
  if (contenu) form.append('contenu', contenu);
  if (fichier) form.append('media', fichier);
  return apiRequest(`/classes/${classeId}/messages`, { method: 'POST', body: form });
};
export const getMediasClasse = (classeId) => apiRequest(`/classes/${classeId}/medias`);
