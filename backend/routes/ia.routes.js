const express = require('express');
const router = express.Router();
const iaService = require('../services/ia.service');
const { verifierAuthentification } = require('../middlewares/authentification.middleware');
const { autoriser } = require('../middlewares/role.middleware');

// POST /api/ia/poser-question
// Action réservée uniquement aux élèves
router.post('/poser-question', verifierAuthentification, autoriser('eleve'), async (req, res) => {
    try {
        const eleveId = req.utilisateur.id;
        const { question } = req.body;
        
        const discussion = await iaService.poserQuestion(eleveId, question);
        
        res.status(200).json({
            message: 'Le tuteur virtuel a répondu avec succès.',
            donnees: discussion
        });
    } catch (erreur) {
        res.status(erreur.status || 500).json({ message: erreur.message });
    }
});

// GET /api/ia/historique
// Permet à l'élève de retrouver toutes ses anciennes questions posées à l'IA
router.get('/historique', verifierAuthentification, autoriser('eleve'), async (req, res) => {
    try {
        const eleveId = req.utilisateur.id;
        const historique = await iaService.historiqueEleve(eleveId);
        res.status(200).json(historique);
    } catch (erreur) {
        res.status(500).json({ message: erreur.message });
    }
});

module.exports = router;
