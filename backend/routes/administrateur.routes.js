// Routes de l'administrateur (protegees : token + role admin requis)
// @route GET    /api/admin/utilisateurs      - Liste tous les utilisateurs
// @route PUT    /api/admin/utilisateurs/:id  - Modifier un administrateur
// @route DELETE /api/admin/utilisateurs/:id  - Supprimer un utilisateur (?role=eleve)
const { Router } = require('express');
const serviceAdmin = require('../services/administrateur.service');
const { verifierAuthentification } = require('../middlewares/authentification.middleware');
const { autoriser } = require('../middlewares/role.middleware');

const routeur = Router();

// Toutes les routes ci-dessous exigent : token valide + role "admin"
routeur.use(verifierAuthentification, autoriser('admin'));

routeur.get('/utilisateurs', async (req, res) => {
    try {
        const utilisateurs = await serviceAdmin.listerUtilisateurs();
        res.status(200).json(utilisateurs);
    } catch (erreur) {
        res.status(500).json({ message: erreur.message });
    }
});

routeur.put('/utilisateurs/:id', async (req, res) => {
    try {
        const admin = await serviceAdmin.modifierAdmin(req.params.id, req.body);
        res.status(200).json(admin);
    } catch (erreur) {
        res.status(400).json({ message: erreur.message });
    }
});

// Le role de l'utilisateur a supprimer est passe en query string : ?role=eleve
routeur.delete('/utilisateurs/:id', async (req, res) => {
    try {
        await serviceAdmin.supprimerUtilisateur(req.params.id, req.query.role);
        res.status(200).json({ message: 'Utilisateur supprime avec succes.' });
    } catch (erreur) {
        res.status(400).json({ message: erreur.message });
    }
});

module.exports = routeur;
