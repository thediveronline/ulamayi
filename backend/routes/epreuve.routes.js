const express = require('express');
const router = express.Router();
const epreuveService = require('../services/epreuve.service');
const { verifierAuthentification } = require('../middlewares/authentification.middleware');
const { autoriser } = require('../middlewares/role.middleware');
const { uploadMedia } = require('../middlewares/upload.middleware');

// =========================================================================
// ROUTES PROTÉGÉES (Réservées aux élèves connectés)
// Note: Placées AVANT les routes avec paramètres `/:id` pour éviter les conflits
// =========================================================================

// GET /api/epreuves/prive/mes-epreuves
router.get('/prive/mes-epreuves', verifierAuthentification, autoriser('eleve'), async (req, res) => {
    try {
        const epreuves = await epreuveService.mesEpreuves(req.utilisateur.id);
        res.status(200).json(epreuves);
    } catch (erreur) {
        res.status(erreur.status || 500).json({ message: erreur.message, details: erreur.details });
    }
});

// POST /api/epreuves - Créer une nouvelle épreuve (Supporte multipart/form-data)
router.post('/', verifierAuthentification, autoriser('eleve'), uploadMedia, async (req, res) => {
    try {
        const eleveId = req.utilisateur.id;
        // req.file contient le fichier, req.body contient les textes
        const nouvelleEpreuve = await epreuveService.creerEpreuve(req.body, req.file, eleveId);
        res.status(201).json({
            message: 'Votre épreuve a été publiée avec succès.',
            epreuve: nouvelleEpreuve
        });
    } catch (erreur) {
        res.status(erreur.status || 500).json({ message: erreur.message, details: erreur.details });
    }
});

// DELETE /api/epreuves/:id - Supprimer une de ses épreuves
router.delete('/:id', verifierAuthentification, autoriser('eleve', 'admin'), async (req, res) => {
    try {
        const idEpreuve = req.params.id;
        const utilisateurId = req.utilisateur.id;
        const role = req.utilisateur.role;

        await epreuveService.supprimerEpreuve(idEpreuve, utilisateurId, role);
        res.status(200).json({ message: 'L\'épreuve a été supprimée avec succès de la plateforme.' });
    } catch (erreur) {
        res.status(erreur.status || 500).json({ message: erreur.message, details: erreur.details });
    }
});

// =========================================================================
// ROUTES PUBLIQUES (Accessibles par tous)
// =========================================================================

// GET /api/epreuves - Récupérer le catalogue des épreuves
router.get('/', async (req, res) => {
    try {
        const epreuves = await epreuveService.listerEpreuvesPubliques();
        res.status(200).json(epreuves);
    } catch (erreur) {
        res.status(erreur.status || 500).json({ message: erreur.message, details: erreur.details });
    }
});

// GET /api/epreuves/:id - Récupérer le détail d'une épreuve spécifique
router.get('/:id', async (req, res) => {
    try {
        const epreuve = await epreuveService.obtenirEpreuvePublique(req.params.id);
        res.status(200).json(epreuve);
    } catch (erreur) {
        res.status(erreur.status || 500).json({ message: erreur.message, details: erreur.details });
    }
});

module.exports = router;
