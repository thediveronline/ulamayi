import { apiRequest } from './api.js';

export const basculerFavori = (publicationId) => apiRequest(`/engagement/${publicationId}/favoris`, {
  method: 'POST'
});

export const posterCommentaire = (publicationId, contenu) => apiRequest(`/engagement/${publicationId}/commentaires`, {
  method: 'POST',
  body: JSON.stringify({ contenu })
});

export const getCommentaires = (publicationId) => apiRequest(`/engagement/${publicationId}/commentaires`);

export const noterPublication = (publicationId, note) => apiRequest(`/engagement/${publicationId}/noter`, {
  method: 'POST',
  body: JSON.stringify({ note })
});

export const telechargerPublication = (publicationId) => apiRequest(`/engagement/${publicationId}/telecharger`, {
  method: 'POST'
});
