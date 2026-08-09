const express = require('express');
const router = express.Router();
const classeService = require('../services/classe.service');
const { verifierAuthentification } = require('../middlewares/authentification.middleware');
const { autoriser } = require('../middlewares/role.middleware');
const { uploadMedia } = require('../middlewares/upload.middleware');
const multer = require('multer');
const { uploaderBuffer } = require('../config/cloudinary');
const uploadLogo = multer({ storage: multer.memoryStorage(), limits: { fileSize: 3 * 1024 * 1024 } });

router.use(verifierAuthentification);

// GET /api/classes - Obtenir la liste de toutes les classes (élèves, parents, profs)
router.get('/', async (req, res) => {
    try {
        const classes = await classeService.listerToutesClasses();
        res.status(200).json(classes);
    } catch (erreur) {
        res.status(500).json({ message: erreur.message });
    }
});

// GET /api/classes/mes-classes - Récupérer les classes créées par l'enseignant
router.get('/mes-classes', autoriser('enseignant'), async (req, res) => {
    try {
        const classes = await classeService.mesClasses(req.utilisateur.id);
        res.status(200).json(classes);
    } catch (erreur) {
        res.status(500).json({ message: erreur.message });
    }
});

// GET /api/classes/mes-classes-eleve - Récupérer les classes rejointes par l'élève
router.get('/mes-classes-eleve', autoriser('eleve'), async (req, res) => {
    try {
        const classes = await classeService.mesClassesEleve(req.utilisateur.id);
        res.status(200).json(classes);
    } catch (erreur) {
        res.status(500).json({ message: erreur.message });
    }
});

// POST /api/classes - Créer une nouvelle classe (Enseignant) — avec logo optionnel
router.post('/', autoriser('enseignant'), uploadLogo.single('logo'), async (req, res) => {
    try {
        let logo_url = undefined;
        if (req.file) {
            const result = await uploaderBuffer(req.file.buffer, { folder: 'ulamayi/classes/logos' });
            logo_url = result.secure_url;
        }
        const donnees = { ...req.body, ...(logo_url !== undefined && { logo_url }) };
        const nouvelleClasse = await classeService.creerClasse(donnees, req.utilisateur.id);
        res.status(201).json({ message: 'Classe créée avec succès.', classe: nouvelleClasse });
    } catch (erreur) {
        res.status(erreur.status || 500).json({ message: erreur.message, details: erreur.details });
    }
});

// GET /api/classes/:id - Obtenir les détails d'une classe
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ message: 'Identifiant de classe invalide.' });
        }
        const classe = await classeService.obtenirClasseParId(id, req.utilisateur.id, req.utilisateur.role);
        res.status(200).json(classe);
    } catch (erreur) {
        res.status(erreur.status || 500).json({ message: erreur.message });
    }
});

// PUT /api/classes/:id - Modifier les paramètres d'une classe — avec logo optionnel
router.put('/:id', autoriser('enseignant', 'admin'), uploadLogo.single('logo'), async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ message: 'Identifiant de classe invalide.' });
        }
        let logo_url = undefined;
        if (req.file) {
            const result = await uploaderBuffer(req.file.buffer, { folder: 'ulamayi/classes/logos' });
            logo_url = result.secure_url;
        }
        const donnees = { ...req.body, ...(logo_url !== undefined && { logo_url }) };
        const classe = await classeService.modifierClasse(id, donnees, req.utilisateur.id, req.utilisateur.role);
        res.status(200).json({ message: 'Classe mise à jour avec succès.', classe });
    } catch (erreur) {
        res.status(erreur.status || 500).json({ message: erreur.message });
    }
});

// POST /api/classes/:id/rejoindre - Rejoindre une classe (Élève)
router.post('/:id/rejoindre', autoriser('eleve'), async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ message: 'Identifiant de classe invalide.' });
        }
        const result = await classeService.rejoindreClasse(id, req.utilisateur.id);
        res.status(200).json(result);
    } catch (erreur) {
        res.status(erreur.status || 500).json({ message: erreur.message });
    }
});

// POST /api/classes/:id/eleves - Inscrire un élève dans la classe (Enseignant)
router.post('/:id/eleves', autoriser('enseignant'), async (req, res) => {
    try {
        const { eleve_id } = req.body;
        const inscription = await classeService.ajouterEleveAClasse(req.params.id, eleve_id, req.utilisateur.id);
        res.status(201).json({ message: 'Élève ajouté à la classe avec succès.', inscription });
    } catch (erreur) {
        res.status(erreur.status || 500).json({ message: erreur.message });
    }
});

// GET /api/classes/:id/eleves - Lister les élèves d'une classe
router.get('/:id/eleves', async (req, res) => {
    try {
        const eleves = await classeService.listerElevesClasse(req.params.id, req.utilisateur.id, req.utilisateur.role);
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

// --- CHAT DE CLASSE (WHATSAPP-LIKE) ---
// GET /api/classes/:id/messages - Récupérer l'historique des messages
router.get('/:id/messages', async (req, res) => {
    try {
        const messages = await classeService.listerMessagesClasse(req.params.id);
        res.status(200).json(messages);
    } catch (erreur) {
        res.status(500).json({ message: erreur.message });
    }
});

// POST /api/classes/:id/messages - Poster un message dans le chat avec fichier optionnel
router.post('/:id/messages', uploadMedia, async (req, res) => {
    try {
        const message = await classeService.envoyerMessage(
            req.params.id,
            req.utilisateur,
            req.body.contenu,
            req.file
        );
        res.status(201).json(message);
    } catch (erreur) {
        res.status(erreur.status || 500).json({ message: erreur.message });
    }
});

// GET /api/classes/:id/medias - Obtenir les fichiers/médias partagés dans la classe
router.get('/:id/medias', async (req, res) => {
    try {
        const medias = await classeService.listerMediasClasse(req.params.id);
        res.status(200).json(medias);
    } catch (erreur) {
        res.status(500).json({ message: erreur.message });
    }
});

module.exports = router;
