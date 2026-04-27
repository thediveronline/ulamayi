# Progression frontend Ulamayi

## Vision retenue
- Architecture en trois projets distincts : `frontend/eleves-parents`, `frontend/profs`, `frontend/admin`
- Chaque projet sera une SPA Vanilla JS avec Vite
- Routing par hash
- Structure séparée par vues, composants, services et feuilles de style
- Variables CSS centralisées localement dans chaque projet
- Palette principale : blanc, bleu, gris, noir
- Couleurs d'état : vert, rouge, jaune, bleu
- Responsive attendu :
  - mobile : header + bottom navigation
  - tablette : header + bouton hamburger + sidebar
  - grand écran : layout standard avec footer

## Audit backend
- Le backend Express est déjà structuré en `routes`, `services`, `models`, `middlewares`, `utils`
- Les flux d'authentification disponibles sont : inscription, vérification OTP, connexion
- Les rôles couverts sont : `eleve`, `enseignant`, `parent`, `admin`
- Les routes métier sont présentes pour les profils, publications, parents/enfants et administration

## Points de vigilance backend
- La documentation backend et le code ne sont pas totalement alignés sur certaines routes protégées
- Le rôle `admin` est accepté au niveau de la validation de connexion, mais sa prise en charge semble incomplète dans le service d'authentification
- Les routes de mise à jour ne sont pas toutes validées de façon homogène
- Le code OTP est journalisé côté serveur en environnement local

## Avancement
### Terminé
- Audit initial du backend et alignement des endpoints
- Création des trois projets frontend `eleves-parents`, `profs` et `admin`
- Routeur hash avec support des paramètres dynamiques (`/publications/:id`, `/enfants/:id/suivi`) dans `eleves-parents`
- Correction du bug critique de port API (`localhost:300` -> `localhost:3000`) dans les trois frontends
- Refonte complète du design system de `eleves-parents` :
  - Tokens (couleurs, ombres, rayons, espacements, typographie) dans `variables.css`
  - Base `base.css` avec boutons, formulaires, cartes, badges, alertes, notifications, loading et empty states
  - Layout responsive avec header sticky, sidebar desktop, drawer mobile et bottom-nav
- Bibliothèque d'icônes SVG inline dans `components/icon/icon.js` (pas d'emoji)
- Composants partagés : `Alert` à icône, `NotificationCenter` (toasts), helpers `createButton` / `createField` / `createSelectField`
- Vues `eleves-parents` reconstruites de manière professionnelle :
  - `Home` : landing publique + tableau de bord pour utilisateur connecté
  - `Login`, `Register`, `OtpView` : cartes centrées, badges et formulaires propres
  - `Profile` : carte récap (avatar, infos, badge rôle) et formulaire d'édition
  - `Settings` (nouveau) : compte, sécurité (placeholder mot de passe) et déconnexion
  - `Publications` : recherche en temps réel, cartes hover, badges niveau/prix, empty state
  - `PublicationDetail` (nouveau) : page dédiée à une publication via `/publications/:id`
  - `Children` : cartes parent enfants avec navigation vers le suivi
  - `ChildFollowup` : profil enfant + publications adaptées (URL en path param)
  - `NotFound` : page 404 avec icône et bouton de retour
- Notifications globales et états de chargement uniformisés sur toutes les vues data-driven

### En cours
- Appliquer le même design system dans `admin`

### À faire
- Compléter les services API dans `admin`
- Mettre en place la connexion admin une fois le backend complété pour ce rôle
- Remplacer les `alert()` restants par les notifications UI dans `admin`

### Fait : intégration Cloudinary + UX boutique (avril 2026)
- Backend
  - Dépendances ajoutées : `cloudinary`, `multer`, `multer-storage-cloudinary`
  - `backend/config/cloudinary.js` : init SDK, helpers `uploaderBuffer` et `supprimerMedia`
  - `backend/middlewares/upload.middleware.js` : multer en mémoire, filtre type (JPG/PNG/WEBP/GIF/PDF), limite 10 Mo
  - Table `publications` enrichie : colonnes `media_type` et `media_public_id` (migration mise à jour, à relancer)
  - Validateur Joi : retrait de `media_url` du body (injecté côté serveur), ajout du flag `supprimer_media`, `description` accepte la chaîne vide
  - Routes `POST /api/publications` et `PUT /api/publications/:id` passent en `multipart/form-data` ; le service uploade le buffer vers Cloudinary, gère remplacement et suppression du média existant
  - `DELETE /api/publications/:id` nettoie le média Cloudinary associé
  - Documentation `backend/README.md` mise à jour (multipart, champs renvoyés, variables d'env, migration)
- Front profs
  - `services/api.js` ne force plus `application/json` quand le body est un `FormData`
  - `services/publication.service.js` envoie un `FormData`
  - `views/publications/PublicationFormView.js` : input fichier avec aperçu image/PDF, suppression du média existant, soumission en `FormData`
  - `utils/media.js` : helpers `urlVignette`, `urlVignetteImage`, `urlVignettePdf`, `urlAffichageImage` (transformations Cloudinary insérées dans l'URL)
  - Liste et détail mis à jour pour afficher la vignette type boutique et l'aperçu plein écran (image responsive, PDF en `<iframe>`)
- Front élèves/parents
  - `utils/media.js` partagé (mêmes helpers Cloudinary)
  - `views/publications/PublicationsView.js` redessinée façon boutique : grille de cartes avec vignette en haut (4/3), badges niveau/PDF flottants à gauche, prix flottant à droite, titre/description tronqués, hover zoom léger
  - `views/publications/PublicationDetailView.js` affiche image plein cadre (qualité auto) ou PDF en `<iframe>` plein écran avec lien d'ouverture externe
  - `views/child-followup/ChildFollowupView.js` : cartes publications adaptées au même style boutique
  - Styles boutique ajoutés dans `styles/base.css` (`.pub-card`, `.pub-card__thumb`, `.pub-card__badges`, `.pub-card__price`, `.pub-media`)

### Fait pour `profs` (refonte complète)
- Design system local synchronisé avec `eleves-parents` (variables, base, dark mode, toggle)
- Layout responsive identique (header sticky, sidebar desktop, drawer tablette, bottom-nav mobile, footer desktop)
- Composants partagés copiés : `icon`, `notifications`, `alert`, helpers `dom`, `loading`, `session`, `theme`, `query`
- Router hash avec paramètres dynamiques (`/publications/:id`, `/publications/:id/modifier`)
- Clés `localStorage` distinctes (`ulamayi-profs-session`, `ulamayi-profs-theme`) pour éviter les collisions inter-apps
- Services API alignés sur le backend : `auth`, `teacher`, `publication`
- Vues complètes :
  - `Home` : landing publique + tableau de bord enseignant (total publications, dernière publication, CTA création)
  - `Login`, `Register`, `OtpView` : flux d'authentification professionnel pour enseignant (rôle forcé côté service)
  - `Publications` : liste de mes publications avec recherche en temps réel, badges niveau/prix/date, empty-state avec CTA
  - `PublicationDetail` : détail + actions Modifier / Supprimer avec confirmation
  - `PublicationForm` : création et édition (mêmes vue), validation alignée sur Joi backend
  - `Profile` : carte récap (avatar, infos, badge enseignant) + formulaire (nom, prénom, matière)
  - `Settings` : compte, sécurité (placeholder), thème clair/sombre, déconnexion
  - `NotFound` : 404

## Reprise rapide
Pour reprendre le travail, commencer par vérifier l'état des dossiers suivants :
- `frontend/eleves-parents`
- `frontend/profs`
- `frontend/admin`

### État actuel des dossiers
- `frontend/eleves-parents` : design system pro complet, toutes les vues finalisées (Home, Login, Register, OTP, Profil, Paramètres, Publications, Détail publication, Enfants, Suivi, 404), icônes SVG, notifications centralisées, états de chargement, alignement total avec le backend
- `frontend/profs` : refonte complète, design system aligné, dark mode, CRUD publications, profil, paramètres, inscription + OTP + login
- `frontend/admin` : URL API corrigée, services admin ajoutés, vue utilisateurs branchée au backend, design à harmoniser, profil admin en attente d'une API dédiée

Puis mettre à jour cette section avec les étapes terminées et les décisions éventuelles.
