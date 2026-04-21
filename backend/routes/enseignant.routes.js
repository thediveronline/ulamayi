// Routes de l'enseignant (protegees : token + role "enseignant" requis)
// @route GET /api/enseignants/profil       - Voir son propre profil
// @route PUT /api/enseignants/profil       - Modifier son profil
// @route GET /api/enseignants/publications - Voir ses propres publications
const { Router } = require('express');
const serviceEnseignant = require('../services/enseignant.service');
const { verifierAuthentification } = require('../middlewares/authentification.middleware');
const { autoriser } = require('../middlewares/role.middleware');

const routeur = Router();
routeur.use(verifierAuthentification, autoriser('enseignant'));

routeur.get('/profil', async (req, res) => {
    try {
        const profil = await serviceEnseignant.obtenirProfil(req.utilisateur.id);
        res.status(200).json(profil);
    } catch (erreur) {
        res.status(404).json({ message: erreur.message });
    }
});

routeur.put('/profil', async (req, res) => {
    try {
        const profil = await serviceEnseignant.mettreAJourProfil(req.utilisateur.id, req.body);
        res.status(200).json(profil);
    } catch (erreur) {
        res.status(400).json({ message: erreur.message });
    }
});

routeur.get('/publications', async (req, res) => {
    try {
        const publications = await serviceEnseignant.obtenirMesPublications(req.utilisateur.id);
        res.status(200).json(publications);
    } catch (erreur) {
        res.status(500).json({ message: erreur.message });
    }
});

module.exports = routeur;
