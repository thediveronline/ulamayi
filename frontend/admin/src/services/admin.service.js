import { apiRequest } from './api.js';

export const getUsers = () => apiRequest('/admin/utilisateurs');
export const getStats = () => apiRequest('/admin/stats');
export const validerEnseignant = (id) => apiRequest(`/admin/enseignants/${id}/valider`, {
  method: 'PATCH'
});
export const getEtablissements = () => apiRequest('/etablissements');
export const validerEtablissement = (id) => apiRequest(`/etablissements/${id}/valider`, {
  method: 'PUT'
});
export const updateAdminProfile = (id, payload) => apiRequest(`/admin/utilisateurs/${id}`, {
  method: 'PUT',
  body: JSON.stringify(payload)
});
export const deleteUser = (id, role) => apiRequest(`/admin/utilisateurs/${id}?role=${role}`, {
  method: 'DELETE'
});
