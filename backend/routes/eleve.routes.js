// Routes de l'eleve (protegees : token + role "eleve" requis)
// @route GET /api/eleves/profil       - Voir son propre profil
// @route PUT /api/eleves/profil       - Modifier son profil
// @route GET /api/eleves/publications - Voir les publications de son niveau scolaire
const { Router } = require('express');
const serviceEleve = require('../services/eleve.service');
const { verifierAuthentification } = require('../middlewares/authentification.middleware');
const { autoriser } = require('../middlewares/role.middleware');
const { schemaMiseAJourProfil } = require('../utils/validateurs/eleve.validateur');

const routeur = Router();
routeur.use(verifierAuthentification, autoriser('eleve'));

routeur.get('/profil', async (req, res) => {
    try {
        const profil = await serviceEleve.obtenirProfil(req.utilisateur.id);
        res.status(200).json(profil);
    } catch (erreur) {
        res.status(404).json({ message: erreur.message });
    }
});

routeur.put('/profil', async (req, res) => {
    const { error } = schemaMiseAJourProfil.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const profil = await serviceEleve.mettreAJourProfil(req.utilisateur.id, req.body);
        res.status(200).json(profil);
    } catch (erreur) {
        res.status(400).json({ message: erreur.message });
    }
});

routeur.get('/publications', async (req, res) => {
    try {
        const publications = await serviceEleve.obtenirPublicationsDuNiveau(req.utilisateur.id);
        res.status(200).json(publications);
    } catch (erreur) {
        res.status(500).json({ message: erreur.message });
    }
});

module.exports = routeur;
