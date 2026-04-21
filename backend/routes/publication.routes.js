// Routes des publications (epreuves)
// @route POST   /api/publications/          - Publier une epreuve (enseignant seulement)
// @route GET    /api/publications/           - Voir toutes les publications
// @route GET    /api/publications/:id        - Voir une publication en detail
// @route PUT    /api/publications/:id        - Modifier (enseignant auteur seulement)
// @route DELETE /api/publications/:id        - Supprimer (auteur ou admin)
const { Router } = require('express');
const servicePublication = require('../services/publication.service');
const { verifierAuthentification } = require('../middlewares/authentification.middleware');
const { autoriser } = require('../middlewares/role.middleware');
const { schemaCreation, schemaMiseAJour } = require('../utils/validateurs/publication.validateur');

const routeur = Router();

// Toutes les routes requierent d'etre authentifie
routeur.use(verifierAuthentification);

routeur.post('/', autoriser('enseignant'), async (req, res) => {
    const { error } = schemaCreation.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const publication = await servicePublication.creerPublication(req.body, req.utilisateur.id);
        res.status(201).json(publication);
    } catch (erreur) {
        res.status(400).json({ message: erreur.message });
    }
});

routeur.get('/', async (req, res) => {
    try {
        const publications = await servicePublication.obtenirToutes();
        res.status(200).json(publications);
    } catch (erreur) {
        res.status(500).json({ message: erreur.message });
    }
});

routeur.get('/:id', async (req, res) => {
    try {
        const publication = await servicePublication.obtenirUne(req.params.id);
        res.status(200).json(publication);
    } catch (erreur) {
        res.status(404).json({ message: erreur.message });
    }
});

routeur.put('/:id', autoriser('enseignant'), async (req, res) => {
    const { error } = schemaMiseAJour.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const publication = await servicePublication.modifierPublication(req.params.id, req.body, req.utilisateur.id);
        res.status(200).json(publication);
    } catch (erreur) {
        res.status(403).json({ message: erreur.message });
    }
});

routeur.delete('/:id', autoriser('enseignant', 'admin'), async (req, res) => {
    try {
        await servicePublication.supprimerPublication(req.params.id, req.utilisateur.id, req.utilisateur.role);
        res.status(200).json({ message: 'Publication supprimee avec succes.' });
    } catch (erreur) {
        res.status(403).json({ message: erreur.message });
    }
});

module.exports = routeur;
