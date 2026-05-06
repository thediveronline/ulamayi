const modeleEngagement = require('../models/engagement.modele');
const modelePublication = require('../models/publication.modele');


const basculerFavori = async (utilisateur_id, role_utilisateur, publication_id) => {
    const publication = await modelePublication.trouverParId(publication_id);
    if (!publication) {
        throw new Error("La publication spécifiée n'existe pas. Impossible de l'ajouter aux favoris.");
    }

    const estDejaFavori = await modeleEngagement.estEnFavori(utilisateur_id, role_utilisateur, publication_id);

    if (estDejaFavori) {
        await modeleEngagement.retirerFavori(utilisateur_id, role_utilisateur, publication_id);
        return { message: "Publication retirée de vos favoris avec succès.", favori: false };
    } else {
        await modeleEngagement.ajouterFavori(utilisateur_id, role_utilisateur, publication_id);
        return { message: "Publication ajoutée à vos favoris avec succès.", favori: true };
    }
};


const posterCommentaire = async (utilisateur_id, role_utilisateur, publication_id, contenu) => {
    if (!contenu || contenu.trim().length === 0) {
        throw new Error("Le contenu du commentaire ne peut pas être vide.");
    }

    const publication = await modelePublication.trouverParId(publication_id);
    if (!publication) {
        throw new Error("La publication spécifiée n'existe pas. Impossible de commenter.");
    }

    const commentaire = await modeleEngagement.ajouterCommentaire(utilisateur_id, role_utilisateur, publication_id, contenu);
    return { message: "Commentaire posté avec succès.", commentaire };
};


const recupererCommentaires = async (publication_id) => {
    const publication = await modelePublication.trouverParId(publication_id);
    if (!publication) {
        throw new Error("La publication spécifiée n'existe pas.");
    }

    const commentaires = await modeleEngagement.trouverCommentairesParPublication(publication_id);
    return commentaires;
};


const noterPublication = async (utilisateur_id, role_utilisateur, publication_id, note) => {
    if (!note || note < 1 || note > 5) {
        throw new Error("La note doit être un nombre entier compris entre 1 et 5 étoiles.");
    }

    const publication = await modelePublication.trouverParId(publication_id);
    if (!publication) {
        throw new Error("La publication spécifiée n'existe pas. Impossible de la noter.");
    }

    await modeleEngagement.noterPublication(utilisateur_id, role_utilisateur, publication_id, note);
    const stats = await modeleEngagement.calculerStatsPublication(publication_id);

    return { 
        message: "Votre note a été enregistrée avec succès.", 
        note_moyenne: stats.note_moyenne,
        nombre_notes: stats.nombre_notes
    };
};


const telechargerEpreuve = async (publication_id) => {
    const publication = await modelePublication.trouverParId(publication_id);
    if (!publication) {
        throw new Error("La publication spécifiée n'existe pas.");
    }

    const resultat = await modeleEngagement.incrementerTelechargements(publication_id);
    return { 
        message: "Téléchargement enregistré.", 
        nombre_telechargements: resultat.nombre_telechargements 
    };
};

module.exports = {
    basculerFavori,
    posterCommentaire,
    recupererCommentaires,
    noterPublication,
    telechargerEpreuve
};
