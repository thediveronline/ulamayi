const modeleEnseignant = require('../models/enseignant.modele');
const modelePublication = require('../models/publication.modele');
const modeleClasse = require('../models/classe.modele');

const listerTousEnseignants = async () => {
    return await modeleEnseignant.trouverTous();
};

const obtenirProfil = async (id) => {
    const enseignant = await modeleEnseignant.trouverParId(id);
    if (!enseignant) throw new Error('Enseignant introuvable.');
    return enseignant;
};

const obtenirProfilPublic = async (id) => {
    const enseignant = await modeleEnseignant.trouverParId(id);
    if (!enseignant) throw new Error('Enseignant introuvable.');

    const classes = await modeleClasse.trouverParEnseignant(id);
    const publications = await modelePublication.trouverParEnseignant(id);

    return {
        ...enseignant,
        classes: classes || [],
        publications: publications || []
    };
};

const mettreAJourProfil = async (id, donnees) => {
    const enseignant = await modeleEnseignant.trouverParId(id);
    if (!enseignant) throw new Error('Enseignant introuvable.');

    const champsMAJ = {
        nom: donnees.nom !== undefined ? donnees.nom : enseignant.nom,
        prenom: donnees.prenom !== undefined ? donnees.prenom : enseignant.prenom,
        matiere: donnees.matiere !== undefined ? donnees.matiere : enseignant.matiere,
        titre: donnees.titre !== undefined ? donnees.titre : enseignant.titre,
        numero_telephone: donnees.numero_telephone !== undefined ? donnees.numero_telephone : enseignant.numero_telephone,
        photo_profil: donnees.photo_profil !== undefined ? donnees.photo_profil : enseignant.photo_profil
    };

    return await modeleEnseignant.modifierParId(id, champsMAJ);
};

const obtenirMesPublications = async (idEnseignant) => {
    return await modelePublication.trouverParEnseignant(idEnseignant);
};

module.exports = {
    listerTousEnseignants,
    obtenirProfil,
    obtenirProfilPublic,
    mettreAJourProfil,
    obtenirMesPublications
};
