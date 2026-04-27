import { apiRequest } from './api.js';
import { getSession } from '../utils/session.js';

export const getMyProfile = () => {
  const session = getSession();
  const role = session?.utilisateur?.role;

  if (role === 'parent') {
    return apiRequest('/parents/profil');
  }

  return apiRequest('/eleves/profil');
};

export const updateMyProfile = (payload) => {
  const session = getSession();
  const role = session?.utilisateur?.role;

  if (role === 'parent') {
    return apiRequest('/parents/profil', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  return apiRequest('/eleves/profil', {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
};
