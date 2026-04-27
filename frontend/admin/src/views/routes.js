import { createHomeView } from './home/HomeView.js';
import { createUsersView } from './users/UsersView.js';
import { createProfileView } from './profile/ProfileView.js';
import { createNotFoundView } from './not-found/NotFoundView.js';

export const routes = [
  { path: '/', render: createHomeView },
  { path: '/utilisateurs', render: createUsersView },
  { path: '/profil', render: createProfileView },
  { path: '/404', render: createNotFoundView }
];
