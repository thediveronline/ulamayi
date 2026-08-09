import { apiRequest } from './api.js';

export const poserQuestion = (question) => apiRequest('/ia/poser-question', {
  method: 'POST',
  body: JSON.stringify({ question })
});

export const getHistorique = () => apiRequest('/ia/historique');
