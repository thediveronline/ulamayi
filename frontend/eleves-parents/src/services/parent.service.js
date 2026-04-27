import { apiRequest } from './api.js';

export const getChildren = () => apiRequest('/parents/enfants');

export const getChildFollowup = (childId) => apiRequest(`/parents/enfants/${childId}/suivi`);
