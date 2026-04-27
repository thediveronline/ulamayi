# API Ulamayi- Documentation Backend

Cette docum liste toutes les APIs disponibles pour le dev ve la partie front-end

**URL de base :** http://localhost:300

## 1. Authentification `/api/auth`

Toutes cess routes sont **publiques** pas e token

### 1.1 Inscription
- **Route :** `POST /api/auth/inscription`
- **Body JSON :**
  ```json
  {
    "nom": "nsounjou",
    "prenom": "james",
    "email": "james@mail.com",
    "mot_de_passe": "kali_linux2.0",
    "role": "eleve",  // Peut etre: "eleve", "enseeignant", "parent"
    "niveau_scolaire": "Terminale" // Uniquement requis pour les eleves

  }
  ```
- **Réponse (201) :** `{"message": "Inscription reussie. Verifiez votre email pour le code de confirmation."}`

### 1.2 Vérification OTP
- **Route :** `POST /api/auth/verification-otp`
- **Body JSON :**
  ```json
  {
    "email": "james@gmail.com",
    "code": "123456",
    "role": "eleve"
  }
  ```
- **Réponse (200) :** `{"message": "Compte verifie avec succes. Vous pouvez maintenant vous connecter."}`

### 1.3 Connexion
- **Route :** `POST /api/auth/connexion`
- **Body JSON :**
  ```json
  {
    "email": "james@gmail.com",
    "mot_de_passe": "kali_linux2.0",
    "role": "eleve"
  }
  ```
- **Réponse (200) :** Retourne le profil utilisateur ET le `token`. **il faut que le tokken soit e sauvé coté Front **.
  ```json
  {
    "token": "eyJhbG",
    "utilisateur": { "id": 1, "nom": "james", "email": "...", "role": "eleve" }
  }
  ```

---

## 2. Accès Proteges (Token Requis)

Pour TOUTES ces routes ci-dessous, le Front-End DOIT inclure le Header suivant dans sa requête :
`Authorization: Bearer <TON_TOKEN_JWT>`

---

## 3. Administrateurs (`/api/admin`)
*(Seul un Admin peut utiliser ces routes)*

- `GET /api/admin/utilisateurs` : Liste tous les utilisateurs groupés par rôle (admins, enseignants, eleves, parents).
- `PUT /api/admin/utilisateurs/:id` : Modifie les infos d'un admin.
- `DELETE /api/admin/utilisateurs/:id?role=eleve` : Supprime un utilisateur (le `=eleve` peut être remplacé par `=enseignant` ou `=parent`).



## 4. Élèves (`/api/eleves`)
*(Seul un Élève peut utiliser ces routes)*

- `GET /api/eleves/profil` : Retourne toutes les informations du profil de l'élève connecté.
- `PUT /api/eleves/profil` : Modifie le profil de l'élève (nom, prénom, niveau).
- `GET /api/eleves/publications` : Retourne **uniquement** la liste des épreuves et exercices qui correspondent au niveau scolaire de l'élève.

---

## 5. Enseignants (`/api/enseignants`)
*(Seul un Enseignant peut utiliser ces routes)*

- `GET /api/enseignants/profil` : Retourne le profil de l'enseignant.
- `PUT /api/enseignants/profil` : Modifie le profil (nom, prénom, matière).
- `GET /api/enseignants/publications` : Retourne la liste des épreuves publiées par l'enseignant lui-même.

---

## 6. Parents (`/api/parents`)
*(Seul un Parent peut utiliser ces routes)*

- `GET /api/parents/profil` : Retourne le profil du parent.
- `PUT /api/parents/profil` : Modifie le profil.
- `GET /api/parents/enfants` : Retourne la liste des enfants liés à ce parent.
- `GET /api/parents/enfants/:id/suivi` : Retourne les informations de l'enfant (id) ET la liste des épreuves disponibles pour son niveau scolaire. 
---

## 7. Publications / Épreuves (`/api/publications`)

- `POST /api/publications/` : (Enseignants uniquement) -> Crée une nouvelle épreuve.
  *(Format : `multipart/form-data`. Champs requis : `titre`, `contenu`, `niveau_scolaire`. Optionnels : `description`, `prix`, `media` (fichier image JPG/PNG/WEBP/GIF ou PDF, max 10 Mo, uploadé sur Cloudinary).)*
- `GET /api/publications/` : (Accessible à tous les connectés) -> Liste absolument toutes les publications.
- `GET /api/publications/:id` : (Accessible à tous) -> Détail d'une publication spécifique.
- `PUT /api/publications/:id` : (Enseignants uniquement) -> Modifier une de SA PROPRE publication.
  *(Format : `multipart/form-data`. Tous les champs sont optionnels. Pour remplacer le média joindre un nouveau fichier `media`. Pour supprimer le média existant sans le remplacer envoyer `supprimer_media=true`.)*
- `DELETE /api/publications/:id` : (Enseignant auteur de la publication OU Admin) -> Supprime l'épreuve et le média Cloudinary associé.

### Champs renvoyés par les publications

Chaque publication retournée par l'API contient :
- `media_url` : URL Cloudinary sécurisée du média (ou `null`).
- `media_type` : `image`, `pdf` ou `null`.
- `media_public_id` : identifiant Cloudinary pour la suppression (interne).

Les vignettes côté front sont générées via les transformations Cloudinary (ex. `c_fill,w_480,h_360,q_auto,f_auto` pour les images, `pg_1,...,f_jpg` pour rendre la première page d'un PDF).

### Variables d'environnement PostgreSQL (connexion a la base)

Deux modes sont supportes par le `backend/config/connexion.js` :

**Option A : URL complete (recommande pour Neon.tech ou toute base cloud)**
```
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
```
Quand `DATABASE_URL` est definie, le backend se connecte via cette URL avec SSL obligatoire (`rejectUnauthorized: false`). C'est le mode par defaut en production.

**Option B : Variables separees (dev local avec PostgreSQL installe sur la machine)**
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ulamayi
DB_USER=ulamayi
DB_PASSWORD=ton_mot_de_passe
```

### Variables d'environnement Cloudinary

À ajouter dans `backend/.env` :
```
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Variables d'environnement Mailgun (envoi des OTP par email)

À ajouter dans `backend/.env` :
```
MAILGUN_API_KEY=...
MAILGUN_DOMAIN=mg.mondomaine.com
MAILGUN_FROM=Ulamayi <noreply@mg.mondomaine.com>
MAILGUN_REGION=eu                # optionnel : "eu" ou "us" (defaut: us)
OTP_EXPIRES_MINUTES=10           # optionnel : duree de validite des codes
```

Si ces variables ne sont pas définies, le code OTP sera affiché dans la console du serveur (mode dev). Cela permet de continuer à tester l'inscription sans clé Mailgun.

### Migration de la base

Les colonnes `media_type` et `media_public_id` ont été ajoutées à la table `publications`. Si tu as déjà une base, relance la migration :
```bash
npm run migrate
```
(la migration drop / recrée toutes les tables, donc à n'utiliser qu'en dev).
