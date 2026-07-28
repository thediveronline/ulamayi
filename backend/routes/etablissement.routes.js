const express = require('express');
const router = express.Router();
const etablissementService = require('../services/etablissement.service');
const { verifierAuthentification } = require('../middlewares/authentification.middleware');
const { autoriser } = require('../middlewares/role.middleware');

// GET /api/etablissements - Lister les établissements partenaires/inscrits
router.get('/', async (req, res) => {
    try {
        const etablissements = await etablissementService.listerEtablissements();
        res.status(200).json(etablissements);
    } catch (erreur) {
        res.status(500).json({ message: erreur.message });
    }
});

// PUT /api/etablissements/:id/valider - Validation par l'Admin
router.put('/:id/valider', verifierAuthentification, autoriser('admin'), async (req, res) => {
    try {
        const etablissement = await etablissementService.validerEtablissement(req.params.id);
        res.status(200).json({ message: 'Établissement validé avec succès.', etablissement });
    } catch (erreur) {
        res.status(erreur.status || 500).json({ message: erreur.message });
    }
});

module.exports = router;
