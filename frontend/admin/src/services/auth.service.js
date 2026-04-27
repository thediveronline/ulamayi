import { apiRequest, clearSession, saveSession } from './api.js';

export const loginAdmin = async (payload) => {
  const result = await apiRequest('/auth/connexion', {
    method: 'POST',
    body: JSON.stringify({ ...payload, role: 'admin' })
  });

  saveSession(result);
  return result;
};

export const logoutAdmin = () => {
  clearSession();
  window.location.hash = '/connexion';
};
