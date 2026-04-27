import { createHomeView } from './home/HomeView.js';
import { createLoginView } from './login/LoginView.js';
import { createRegisterView } from './register/RegisterView.js';
import { createOtpView } from './otp/OtpView.js';
import { createPublicationsView } from './publications/PublicationsView.js';
import { createPublicationDetailView } from './publications/PublicationDetailView.js';
import { createPublicationFormView } from './publications/PublicationFormView.js';
import { createProfileView } from './profile/ProfileView.js';
import { createSettingsView } from './settings/SettingsView.js';
import { createNotFoundView } from './not-found/NotFoundView.js';

export const routes = [
  { path: '/', render: createHomeView },
  { path: '/connexion', render: createLoginView, guestOnly: true },
  { path: '/inscription', render: createRegisterView, guestOnly: true },
  { path: '/verification-otp', render: createOtpView, guestOnly: true },
  { path: '/publications', render: createPublicationsView, requiresAuth: true, roles: ['enseignant'] },
  { path: '/publications/nouvelle', render: createPublicationFormView, requiresAuth: true, roles: ['enseignant'] },
  { path: '/publications/:id', render: createPublicationDetailView, requiresAuth: true, roles: ['enseignant'] },
  { path: '/publications/:id/modifier', render: createPublicationFormView, requiresAuth: true, roles: ['enseignant'] },
  { path: '/profil', render: createProfileView, requiresAuth: true, roles: ['enseignant'] },
  { path: '/parametres', render: createSettingsView, requiresAuth: true, roles: ['enseignant'] },
  { path: '/deconnexion', render: createHomeView, requiresAuth: true, roles: ['enseignant'] },
  { path: '/404', render: createNotFoundView }
];
