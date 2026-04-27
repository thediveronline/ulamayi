import { apiRequest } from './api.js';

export const getPublicationById = (id) => apiRequest(`/publications/${id}`);

// Les routes POST/PUT acceptent du multipart/form-data : on envoie un FormData
// pour permettre l'upload du fichier media (image ou PDF) vers Cloudinary cote serveur.
export const createPublication = (formData) => apiRequest('/publications', {
  method: 'POST',
  body: formData
});

export const updatePublication = (id, formData) => apiRequest(`/publications/${id}`, {
  method: 'PUT',
  body: formData
});

export const deletePublication = (id) => apiRequest(`/publications/${id}`, {
  method: 'DELETE'
});
