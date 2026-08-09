import { createHomeView } from './home/HomeView.js';
import { createLoginView } from './login/LoginView.js';
import { createRegisterView } from './register/RegisterView.js';
import { createOtpView } from './otp/OtpView.js';
import { createPublicationsView } from './publications/PublicationsView.js';
import { createPublicationDetailView } from './publications/PublicationDetailView.js';
import { createProfileView } from './profile/ProfileView.js';
import { createSettingsView } from './settings/SettingsView.js';
import { createChildrenView } from './children/ChildrenView.js';
import { createChildFollowupView } from './child-followup/ChildFollowupView.js';
import { createEpreuvesView } from './epreuves/EpreuvesView.js';
import { createEpreuveDetailView } from './epreuves/EpreuveDetailView.js';
import { createEpreuveFormView } from './epreuves/EpreuveFormView.js';
import { createMesEpreuvesView } from './epreuves/MesEpreuvesView.js';
import { createIaView } from './ia/IaView.js';
import { createNotFoundView } from './not-found/NotFoundView.js';

export const routes = [
  { path: '/', render: createHomeView },
  { path: '/connexion', render: createLoginView, guestOnly: true },
  { path: '/inscription', render: createRegisterView, guestOnly: true },
  { path: '/verification-otp', render: createOtpView, guestOnly: true },
  { path: '/publications', render: createPublicationsView, requiresAuth: true, roles: ['eleve', 'parent'] },
  { path: '/publications/:id', render: createPublicationDetailView, requiresAuth: true, roles: ['eleve', 'parent'] },
  { path: '/epreuves', render: createEpreuvesView },
  { path: '/epreuves/mes-epreuves', render: createMesEpreuvesView, requiresAuth: true, roles: ['eleve'] },
  { path: '/epreuves/nouvelle', render: createEpreuveFormView, requiresAuth: true, roles: ['eleve'] },
  { path: '/epreuves/:id', render: createEpreuveDetailView },
  { path: '/ia', render: createIaView, requiresAuth: true, roles: ['eleve'] },
  { path: '/profil', render: createProfileView, requiresAuth: true, roles: ['eleve', 'parent'] },
  { path: '/parametres', render: createSettingsView, requiresAuth: true, roles: ['eleve', 'parent'] },
  { path: '/enfants', render: createChildrenView, requiresAuth: true, roles: ['parent'] },
  { path: '/enfants/:id/suivi', render: createChildFollowupView, requiresAuth: true, roles: ['parent'] },
  { path: '/deconnexion', render: createHomeView, requiresAuth: true, roles: ['eleve', 'parent'] },
  { path: '/404', render: createNotFoundView }
];
