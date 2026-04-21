// Service des publications (epreuves, exercices)
// Les enseignants publient, les eleves et parents consultent
const modelePublication = require('../models/publication.modele');

const creerPublication = async (donnees, idEnseignant) => {
    return await modelePublication.creer({ ...donnees, enseignant_id: idEnseignant });
};

const obtenirToutes = async () => {
    return await modelePublication.trouverTous();
};

const obtenirUne = async (id) => {
    const publication = await modelePublication.trouverParId(id);
    if (!publication) throw new Error('Publication introuvable.');
    return publication;
};

const modifierPublication = async (id, donnees, idEnseignant) => {
    const publication = await modelePublication.trouverParId(id);
    if (!publication) throw new Error('Publication introuvable.');

    // Un enseignant ne peut modifier que ses propres publications
    if (publication.enseignant_id !== idEnseignant) {
        throw new Error('Acces refuse : vous ne pouvez modifier que vos propres publications.');
    }

    const champsMAJ = {
        titre: donnees.titre || publication.titre,
        description: donnees.description || publication.description,
        contenu: donnees.contenu || publication.contenu,
        media_url: donnees.media_url !== undefined ? donnees.media_url : publication.media_url,
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

    await modelePublication.supprimerParId(id);
};

module.exports = { creerPublication, obtenirToutes, obtenirUne, modifierPublication, supprimerPublication };
