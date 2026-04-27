// Service des publications (epreuves, exercices)
// Les enseignants publient, les eleves et parents consultent
const modelePublication = require('../models/publication.modele');
const { uploaderBuffer, supprimerMedia } = require('../config/cloudinary');

// Helpers pour deduire le type de media a partir du resultat Cloudinary
// On distingue "image" (jpg, png, webp...) et "pdf" pour permettre un apercu adapte cote front
const deduireType = (resultatCloud, mimetype) => {
    if (mimetype === 'application/pdf' || resultatCloud?.format === 'pdf') return 'pdf';
    if ((mimetype || '').startsWith('image/')) return 'image';
    return resultatCloud?.resource_type === 'image' ? 'image' : 'autre';
};

const creerPublication = async (donnees, fichier, idEnseignant) => {
    let mediaUrl = null;
    let mediaType = null;
    let mediaPublicId = null;

    if (fichier?.buffer) {
        const resultat = await uploaderBuffer(fichier.buffer);
        mediaUrl = resultat.secure_url;
        mediaType = deduireType(resultat, fichier.mimetype);
        mediaPublicId = resultat.public_id;
    }

    return await modelePublication.creer({
        ...donnees,
        media_url: mediaUrl,
        media_type: mediaType,
        media_public_id: mediaPublicId,
        enseignant_id: idEnseignant,
    });
};

const obtenirToutes = async () => {
    return await modelePublication.trouverTous();
};

const obtenirUne = async (id) => {
    const publication = await modelePublication.trouverParId(id);
    if (!publication) throw new Error('Publication introuvable.');
    return publication;
};

const modifierPublication = async (id, donnees, fichier, idEnseignant) => {
    const publication = await modelePublication.trouverParId(id);
    if (!publication) throw new Error('Publication introuvable.');

    // Un enseignant ne peut modifier que ses propres publications
    if (publication.enseignant_id !== idEnseignant) {
        throw new Error('Acces refuse : vous ne pouvez modifier que vos propres publications.');
    }

    // Gestion du media : 3 cas
    //  - nouveau fichier   -> on supprime l'ancien sur Cloudinary, on remplace
    //  - supprimer_media   -> on supprime sans en mettre de nouveau
    //  - rien              -> on garde l'existant
    let mediaUrl = publication.media_url;
    let mediaType = publication.media_type;
    let mediaPublicId = publication.media_public_id;

    if (fichier?.buffer) {
        const resultat = await uploaderBuffer(fichier.buffer);
        if (publication.media_public_id) {
            await supprimerMedia(publication.media_public_id, publication.media_type === 'pdf' ? 'image' : 'image');
        }
        mediaUrl = resultat.secure_url;
        mediaType = deduireType(resultat, fichier.mimetype);
        mediaPublicId = resultat.public_id;
    } else if (donnees.supprimer_media === true || donnees.supprimer_media === 'true') {
        if (publication.media_public_id) {
            await supprimerMedia(publication.media_public_id, 'image');
        }
        mediaUrl = null;
        mediaType = null;
        mediaPublicId = null;
    }

    const champsMAJ = {
        titre: donnees.titre || publication.titre,
        description: donnees.description !== undefined ? donnees.description : publication.description,
        contenu: donnees.contenu || publication.contenu,
        media_url: mediaUrl,
        media_type: mediaType,
        media_public_id: mediaPublicId,
        niveau_scolaire: donnees.niveau_scolaire || publication.niveau_scolaire,
        prix: donnees.prix !== undefined ? donnees.prix : publication.prix,
    };

    return await modelePublication.modifierParId(id, champsMAJ);
};

const supprimerPublication = async (id, idUtilisateur, role) => {
    const publication = await modelePublication.trouverParId(id);
    if (!publication) throw new Error('Publication introuvable.');

    // L'admin peut tout supprimer. Un enseignant ne supprime que les siennes.
    if (role !== 'admin' && publication.enseignant_id !== idUtilisateur) {
        throw new Error('Acces refuse : vous ne pouvez supprimer que vos propres publications.');
    }

    // On nettoie aussi le media sur Cloudinary pour ne pas accumuler de fichiers orphelins
    if (publication.media_public_id) {
        await supprimerMedia(publication.media_public_id, 'image');
    }

    await modelePublication.supprimerParId(id);
};

module.exports = { creerPublication, obtenirToutes, obtenirUne, modifierPublication, supprimerPublication };
