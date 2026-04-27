import { apiRequest } from './api.js';
import { clearSession, saveSession } from '../utils/session.js';

export const registerUser = (payload) => apiRequest('/auth/inscription', {
  method: 'POST',
  body: JSON.stringify(payload)
});

export const verifyOtp = (payload) => apiRequest('/auth/verification-otp', {
  method: 'POST',
  body: JSON.stringify(payload)
});

export const loginUser = async (payload) => {
  const result = await apiRequest('/auth/connexion', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  saveSession(result);
  return result;
};

export const logoutUser = () => {
  clearSession();
  window.location.hash = '/connexion';
};
