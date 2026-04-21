// Service de l'enseignant
// Un enseignant peut gerer son profil et ses publications
const modeleEnseignant = require('../models/enseignant.modele');
const modelePublication = require('../models/publication.modele');

const obtenirProfil = async (id) => {
    const enseignant = await modeleEnseignant.trouverParId(id);
    if (!enseignant) throw new Error('Enseignant introuvable.');
    return enseignant;
};

const mettreAJourProfil = async (id, donnees) => {
    const enseignant = await modeleEnseignant.trouverParId(id);
    if (!enseignant) throw new Error('Enseignant introuvable.');

    const champsMAJ = {
        nom: donnees.nom || enseignant.nom,
        prenom: donnees.prenom || enseignant.prenom,
        matiere: donnees.matiere || enseignant.matiere,
    };

    return await modeleEnseignant.modifierParId(id, champsMAJ);
};

// Retourne uniquement les publications que cet enseignant a creees
const obtenirMesPublications = async (idEnseignant) => {
    return await modelePublication.trouverParEnseignant(idEnseignant);
};

module.exports = { obtenirProfil, mettreAJourProfil, obtenirMesPublications };
