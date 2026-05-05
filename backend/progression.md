Progression - 04/05/2026-05/05/2025

1. Mise en place des interactions (Engagement)
Elle permet aux utilisateurs d'interagir directement avec les épreuves. L'URL de base est /api/engagement.

Favoris :
Pour permettre à un élève  de mettre une épreuve de côté.
- Route : POST /api/engagement/:id/favoris

Commentaires :
Pour donner son avis sur une épreuve.
- Ajouter : POST /api/engagement/:id/commentaires 
- Voir : GET /api/engagement/:id/commentaires (Tout le monde peut voir. Ça affiche le nom, le prénom et le titre de l'auteur).

Notes (Système d'étoiles) :
Pour noter une épreuve entre 1 et 5 étoiles.
- Route : POST /api/engagement/:id/noter (Il faut être connecté).
- Si on note une deuxième fois, ça remplace l'ancienne note et recalcule la moyenne.

Compteur de téléchargements :
- Route : POST /api/engagement/:id/telecharger (Public).

2. Enrichissement du profil Enseignant

Nouveaux champs :
- titre
- numero_telephone

Liaison avec les épreuves :
Maintenant, quand on récupère les détails d'une épreuve (GET /api/publications/:id), on reçoit aussi les infos de l'enseignant qui l'a publiée (nom, prénom, titre, téléphone, photo). 

3. Administration (Dashboard)
 /api/admin.m

Statistiques :
- Route : GET /api/admin/stats
- Pour voir le nombre total d'élèves, d'enseignants, de parents et de publications

Validation des tuteurs :
- Route : PATCH /api/adin/enseignants/:id/valider
- Pour qu'un admin puisse valider officiellement le profil d'un enseignant.
