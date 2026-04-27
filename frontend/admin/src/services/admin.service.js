import { apiRequest } from './api.js';

export const getUsers = () => apiRequest('/admin/utilisateurs');
export const updateAdminProfile = (id, payload) => apiRequest(`/admin/utilisateurs/${id}`, {
  method: 'PUT',
  body: JSON.stringify(payload)
});
export const deleteUser = (id, role) => apiRequest(`/admin/utilisateurs/${id}?role=${role}`, {
  method: 'DELETE'
});
