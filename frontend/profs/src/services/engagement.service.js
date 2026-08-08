import { apiRequest } from './api.js';

export const getCommentaires = (publicationId) => apiRequest(`/engagement/${publicationId}/commentaires`);

export const posterCommentaire = (publicationId, contenu) => apiRequest(`/engagement/${publicationId}/commentaires`, {
  method: 'POST',
  body: JSON.stringify({ contenu })
});
