// Routes du parent (protegees : token + role "parent" requis)
// @route GET /api/parents/profil              - Voir son profil
// @route PUT /api/parents/profil              - Modifier son profil
// @route GET /api/parents/enfants             - Voir la liste de ses enfants
// @route GET /api/parents/enfants/:id/suivi   - Suivre un enfant specifique
const { Router } = require('express');
const serviceParent = require('../services/parent.service');
const { verifierAuthentification } = require('../middlewares/authentification.middleware');
const { autoriser } = require('../middlewares/role.middleware');

const routeur = Router();
routeur.use(verifierAuthentification, autoriser('parent'));

routeur.get('/profil', async (req, res) => {
    try {
        const profil = await serviceParent.obtenirProfil(req.utilisateur.id);
        res.status(200).json(profil);
    } catch (erreur) {
        res.status(404).json({ message: erreur.message });
    }
});

routeur.put('/profil', async (req, res) => {
    try {
        const profil = await serviceParent.mettreAJourProfil(req.utilisateur.id, req.body);
        res.status(200).json(profil);
    } catch (erreur) {
        res.status(400).json({ message: erreur.message });
    }
});

routeur.get('/enfants', async (req, res) => {
    try {
        const enfants = await serviceParent.obtenirMesEnfants(req.utilisateur.id);
        res.status(200).json(enfants);
    } catch (erreur) {
        res.status(500).json({ message: erreur.message });
    }
});

routeur.get('/enfants/:id/suivi', async (req, res) => {
    try {
        const suivi = await serviceParent.obtenirSuiviEnfant(req.utilisateur.id, req.params.id);
        res.status(200).json(suivi);
    } catch (erreur) {
        res.status(403).json({ message: erreur.message });
    }
});

module.exports = routeur;
