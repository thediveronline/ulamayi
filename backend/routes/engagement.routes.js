const { Router } = require('express');
const serviceEngagement = require('../services/engagement.service');
const { verifierAuthentification } = require('../middlewares/authentification.middleware');

const routeur = Router();


routeur.post('/:id/favoris', verifierAuthentification, async (req, res) => {
    try {
        const { id: utilisateur_id, role: role_utilisateur } = req.utilisateur;
        const publication_id = req.params.id;

        const resultat = await serviceEngagement.basculerFavori(utilisateur_id, role_utilisateur, publication_id);
        res.status(200).json(resultat);
    } catch (erreur) {
        console.error('[ERREUR] Favoris:', erreur);
        res.status(erreur.message.includes('n\'existe pas') ? 404 : 400).json({ 
            message: erreur.message || "Une erreur est survenue lors de la gestion des favoris." 
        });
    }
});


routeur.post('/:id/commentaires', verifierAuthentification, async (req, res) => {
    try {
        const { id: utilisateur_id, role: role_utilisateur } = req.utilisateur;
        const publication_id = req.params.id;
        const { contenu } = req.body;

        const resultat = await serviceEngagement.posterCommentaire(utilisateur_id, role_utilisateur, publication_id, contenu);
        res.status(201).json(resultat);
    } catch (erreur) {
        console.error('[ERREUR] Poster Commentaire:', erreur);
        res.status(erreur.message.includes('n\'existe pas') ? 404 : 400).json({ 
            message: erreur.message || "Impossible de poster le commentaire." 
        });
    }
});


routeur.get('/:id/commentaires', async (req, res) => {
    try {
        const publication_id = req.params.id;
        const commentaires = await serviceEngagement.recupererCommentaires(publication_id);
        res.status(200).json(commentaires);
    } catch (erreur) {
        console.error('[ERREUR] Recuperer Commentaires:', erreur);
        res.status(erreur.message.includes('n\'existe pas') ? 404 : 500).json({ 
            message: erreur.message || "Une erreur est survenue lors de la récupération des commentaires." 
        });
    }
});



routeur.post('/:id/noter', verifierAuthentification, async (req, res) => {
    try {
        const { id: utilisateur_id, role: role_utilisateur } = req.utilisateur;
        const publication_id = req.params.id;
        const { note } = req.body;

        const resultat = await serviceEngagement.noterPublication(utilisateur_id, role_utilisateur, publication_id, note);
        res.status(200).json(resultat);
    } catch (erreur) {
        console.error('[ERREUR] Noter Publication:', erreur);
        res.status(erreur.message.includes('n\'existe pas') ? 404 : 400).json({ 
            message: erreur.message || "Une erreur est survenue lors de l'enregistrement de votre note." 
        });
    }
});



routeur.post('/:id/telecharger', async (req, res) => {
    try {
        const publication_id = req.params.id;
        const resultat = await serviceEngagement.telechargerEpreuve(publication_id);
        res.status(200).json(resultat);
    } catch (erreur) {
        console.error('[ERREUR] Telechargement:', erreur);
        res.status(erreur.message.includes('n\'existe pas') ? 404 : 500).json({ 
            message: erreur.message || "Une erreur est survenue lors de l'enregistrement du téléchargement." 
        });
    }
});

module.exports = routeur;
