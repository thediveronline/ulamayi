import { apiRequest } from './api.js';

export const getCommentaires = (publicationId) => apiRequest(`/engagement/${publicationId}/commentaires`);
