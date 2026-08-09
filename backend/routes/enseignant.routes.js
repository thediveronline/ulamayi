const { Router } = require('express');
const serviceEnseignant = require('../services/enseignant.service');
const { verifierAuthentification } = require('../middlewares/authentification.middleware');
const { autoriser } = require('../middlewares/role.middleware');
const multer = require('multer');
const { uploaderBuffer } = require('../config/cloudinary');

const routeur = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Routes publiques — annuaire et profil public (pas d'auth requise)
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

// PUT /profil — avec upload photo optionnel
routeur.put('/profil', autoriser('enseignant'), upload.single('photo'), async (req, res) => {
    try {
        let photo_profil = undefined;

        if (req.file) {
            const result = await uploaderBuffer(req.file.buffer, { folder: 'ulamayi/enseignants' });
            photo_profil = result.secure_url;
        }

        const donnees = {
            nom: req.body.nom,
            prenom: req.body.prenom,
            matiere: req.body.matiere,
            titre: req.body.titre,
            numero_telephone: req.body.numero_telephone,
            ...(photo_profil !== undefined && { photo_profil })
        };

        const profil = await serviceEnseignant.mettreAJourProfil(req.utilisateur.id, donnees);
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
