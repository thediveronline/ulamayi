import { createHomeView } from './home/HomeView.js';
import { createLoginView } from './login/LoginView.js';
import { createUsersView } from './users/UsersView.js';
import { createEnseignantsView } from './enseignants/EnseignantsView.js';
import { createEtablissementsView } from './etablissements/EtablissementsView.js';
import { createProfileView } from './profile/ProfileView.js';
import { createNotFoundView } from './not-found/NotFoundView.js';

export const routes = [
  { path: '/', render: createHomeView },
  { path: '/connexion', render: createLoginView, guestOnly: true },
  { path: '/utilisateurs', render: createUsersView, requiresAuth: true },
  { path: '/enseignants', render: createEnseignantsView, requiresAuth: true },
  { path: '/etablissements', render: createEtablissementsView, requiresAuth: true },
  { path: '/profil', render: createProfileView, requiresAuth: true },
  { path: '/404', render: createNotFoundView }
];
