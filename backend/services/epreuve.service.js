const epreuveModele = require('../models/epreuve.modele');
const { uploaderBuffer, supprimerMedia } = require('../config/cloudinary');
const { schemaCreationEpreuve } = require('../utils/validateurs/epreuve.validateur');

const creerEpreuve = async (donnees, fichier, eleveId) => {
    // Validation des données entrantes avec Joi (stricte)
    const { error, value } = schemaCreationEpreuve.validate(donnees, { abortEarly: false });
    if (error) {
        const messages = error.details.map((d) => d.message);
        throw { status: 400, message: 'Les données envoyées sont invalides', details: messages };
    }

    let media_url = null;
    let media_type = null;
    let media_public_id = null;

    if (fichier) {
        // Upload du média en mémoire vers Cloudinary de manière optimisée
        const resUpload = await uploaderBuffer(fichier.buffer, { folder: 'ulamayi/epreuves' });
        media_url = resUpload.secure_url;
        media_type = resUpload.resource_type;
        media_public_id = resUpload.public_id;
    }

    // Sauvegarde en base de données via le modèle
    const nouvelleEpreuve = await epreuveModele.creer({
        ...value,
        media_url,
        media_type,
        media_public_id,
        eleve_id: eleveId
    });

    return nouvelleEpreuve;
};

const listerEpreuvesPubliques = async () => {
    const epreuves = await epreuveModele.trouverToutes();
    
    // RÈGLE MÉTIER ABSOLUE : Anonymat strict.
    // On nettoie manuellement les données sensibles avant envoi au front-end
    return epreuves.map(e => ({
        id: e.id,
        titre: e.titre,
        description: e.description,
        contenu: e.contenu,
        media_url: e.media_url,
        media_type: e.media_type,
        niveau_scolaire: e.niveau_scolaire,
        nombre_telechargements: e.nombre_telechargements,
        cree_le: e.cree_le,
        nombre_corrections: e.nombre_corrections || 0
        // IMPORTANT: eleve_id n'est pas transmis
    }));
};

const obtenirEpreuvePublique = async (id) => {
    const epreuve = await epreuveModele.trouverParId(id);
    if (!epreuve) {
        throw { status: 404, message: 'Cette épreuve est introuvable ou a été supprimée.' };
    }

    // Anonymat pour la vue détaillée (pas d'eleve_id)
    return {
        id: epreuve.id,
        titre: epreuve.titre,
        description: epreuve.description,
        contenu: epreuve.contenu,
        media_url: epreuve.media_url,
        media_type: epreuve.media_type,
        niveau_scolaire: epreuve.niveau_scolaire,
        nombre_telechargements: epreuve.nombre_telechargements,
        cree_le: epreuve.cree_le,
        nombre_corrections: epreuve.nombre_corrections || 0
    };
};

const mesEpreuves = async (eleveId) => {
    // Le propriétaire a bien sûr le droit de voir ses propres épreuves avec toutes les métadonnées
    return await epreuveModele.trouverParEleve(eleveId);
};

const supprimerEpreuve = async (id, utilisateurId, roleUtilisateur) => {
    const epreuve = await epreuveModele.trouverParId(id);
    if (!epreuve) {
        throw { status: 404, message: 'Cette épreuve est introuvable.' };
    }

    // Vérification de sécurité drastique : seul l'auteur ou l'administrateur a le droit de la supprimer
    if (roleUtilisateur !== 'admin' && epreuve.eleve_id !== utilisateurId) {
        throw { status: 403, message: 'Accès refusé : vous ne pouvez pas supprimer une épreuve qui ne vous appartient pas.' };
    }

    // Si une image/PDF existait, on nettoie proprement l'espace de stockage Cloudinary
    if (epreuve.media_public_id) {
        await supprimerMedia(epreuve.media_public_id, epreuve.media_type);
    }

    await epreuveModele.supprimerParId(id);
};

module.exports = {
    creerEpreuve,
    listerEpreuvesPubliques,
    obtenirEpreuvePublique,
    mesEpreuves,
    supprimerEpreuve
};
