const express = require('express');
const router = express.Router();
const classeService = require('../services/classe.service');
const { verifierAuthentification } = require('../middlewares/authentification.middleware');
const { autoriser } = require('../middlewares/role.middleware');

// Tout le sous-système classe est réservé aux enseignants et admins
router.use(verifierAuthentification);

// POST /api/classes - Créer une nouvelle classe (Enseignant)
router.post('/', autoriser('enseignant'), async (req, res) => {
    try {
        const nouvelleClasse = await classeService.creerClasse(req.body, req.utilisateur.id);
        res.status(201).json({ message: 'Classe créée avec succès.', classe: nouvelleClasse });
    } catch (erreur) {
        res.status(erreur.status || 500).json({ message: erreur.message, details: erreur.details });
    }
});

// GET /api/classes/mes-classes - Récupérer la liste des classes créées par l'enseignant
router.get('/mes-classes', autoriser('enseignant'), async (req, res) => {
    try {
        const classes = await classeService.mesClasses(req.utilisateur.id);
        res.status(200).json(classes);
    } catch (erreur) {
        res.status(500).json({ message: erreur.message });
    }
});

// POST /api/classes/:id/eleves - Inscrire un élève dans la classe
router.post('/:id/eleves', autoriser('enseignant'), async (req, res) => {
    try {
        const { eleve_id } = req.body;
        const inscription = await classeService.ajouterEleveAClasse(req.params.id, eleve_id, req.utilisateur.id);
        res.status(201).json({ message: 'Élève ajouté à la classe avec succès.', inscription });
    } catch (erreur) {
        res.status(erreur.status || 500).json({ message: erreur.message });
    }
});

// GET /api/classes/:id/eleves - Lister les élèves inscrits dans une classe
router.get('/:id/eleves', autoriser('enseignant'), async (req, res) => {
    try {
        const eleves = await classeService.listerElevesClasse(req.params.id, req.utilisateur.id);
        res.status(200).json(eleves);
    } catch (erreur) {
        res.status(erreur.status || 500).json({ message: erreur.message });
    }
});

// DELETE /api/classes/:id - Supprimer une classe
router.delete('/:id', autoriser('enseignant', 'admin'), async (req, res) => {
    try {
        await classeService.supprimerClasse(req.params.id, req.utilisateur.id, req.utilisateur.role);
        res.status(200).json({ message: 'Classe supprimée avec succès.' });
    } catch (erreur) {
        res.status(erreur.status || 500).json({ message: erreur.message });
    }
});

module.exports = router;
