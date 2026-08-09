import { apiRequest } from './api.js';
import { getSession } from '../utils/session.js';

export const getAllEpreuves = () => apiRequest('/epreuves');

export const getEpreuveById = (id) => apiRequest(`/epreuves/${id}`);

export const getMesEpreuves = () => apiRequest('/epreuves/prive/mes-epreuves');

export const createEpreuve = (formData) => apiRequest('/epreuves', {
  method: 'POST',
  body: formData
});

export const deleteEpreuve = (id) => apiRequest(`/epreuves/${id}`, {
  method: 'DELETE'
});
