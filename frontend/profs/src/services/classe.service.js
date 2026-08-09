import { apiRequest } from './api.js';

export const getMesClasses = () => apiRequest('/classes/mes-classes');

export const createClasse = (payload) => apiRequest('/classes', {
  method: 'POST',
  body: JSON.stringify(payload)
});

export const ajouterEleve = (classeId, eleveId) => apiRequest(`/classes/${classeId}/eleves`, {
  method: 'POST',
  body: JSON.stringify({ eleve_id: eleveId })
});

export const listerEleves = (classeId) => apiRequest(`/classes/${classeId}/eleves`);

export const supprimerClasse = (id) => apiRequest(`/classes/${id}`, {
  method: 'DELETE'
});
