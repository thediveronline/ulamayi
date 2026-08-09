const { Router } = require('express');
const serviceEnseignant = require('../services/enseignant.service');
const { verifierAuthentification } = require('../middlewares/authentification.middleware');
const { autoriser } = require('../middlewares/role.middleware');

const routeur = Router();

// Routes publiques (Annuaire et Profil Public)
routeur.get('/', async (req, res) => {
    try {
        const enseignants = await serviceEnseignant.listerTousEnseignants();
        res.status(200).json(enseignants);
    } catch (erreur) {
        res.status(500).json({ message: erreur.message });
    }
});

routeur.get('/profil-public/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ message: 'Identifiant d\'enseignant invalide.' });
        }
        const profil = await serviceEnseignant.obtenirProfilPublic(id);
        res.status(200).json(profil);
    } catch (erreur) {
        res.status(404).json({ message: erreur.message });
    }
});

// Routes protégées pour l'enseignant connecté
routeur.use(verifierAuthentification);

routeur.get('/profil', autoriser('enseignant'), async (req, res) => {
    try {
        const profil = await serviceEnseignant.obtenirProfil(req.utilisateur.id);
        res.status(200).json(profil);
    } catch (erreur) {
        res.status(404).json({ message: erreur.message });
    }
});

routeur.put('/profil', autoriser('enseignant'), async (req, res) => {
    try {
        const profil = await serviceEnseignant.mettreAJourProfil(req.utilisateur.id, req.body);
        res.status(200).json(profil);
    } catch (erreur) {
        res.status(400).json({ message: erreur.message });
    }
});

routeur.get('/publications', autoriser('enseignant'), async (req, res) => {
    try {
        const publications = await serviceEnseignant.obtenirMesPublications(req.utilisateur.id);
        res.status(200).json(publications);
    } catch (erreur) {
        res.status(500).json({ message: erreur.message });
    }
});

module.exports = routeur;
