import { apiRequest } from './api.js';
import { getUserRole } from '../utils/session.js';

export const getAllPublications = () => apiRequest('/publications');
export const getStudentPublications = () => apiRequest('/eleves/publications');
export const getPublicationById = (id) => apiRequest(`/publications/${id}`);

export const getPublicationsForCurrentUser = () => {
  const role = getUserRole();

  if (role === 'eleve') {
    return getStudentPublications();
  }

  return getAllPublications();
};
