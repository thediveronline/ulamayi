import { apiRequest } from './api.js';

export const getMyProfile = () => apiRequest('/enseignants/profil');

export const updateMyProfile = (payload) => apiRequest('/enseignants/profil', {
  method: 'PUT',
  body: JSON.stringify(payload)
});

export const getMyPublications = () => apiRequest('/enseignants/publications');
