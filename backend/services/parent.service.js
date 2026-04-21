// Service du parent
// Un parent peut consulter son profil et suivre UNIQUEMENT ses propres enfants
const modeleParent = require('../models/parent.modele');
const modeleParentEleve = require('../models/parent_eleve.modele');
const modeleEleve = require('../models/eleve.modele');
const modelePublication = require('../models/publication.modele');

const obtenirProfil = async (id) => {
    const parent = await modeleParent.trouverParId(id);
    if (!parent) throw new Error('Parent introuvable.');
    return parent;
};

const mettreAJourProfil = async (id, donnees) => {
    const parent = await modeleParent.trouverParId(id);
    if (!parent) throw new Error('Parent introuvable.');
    const champsMAJ = {
        nom: donnees.nom || parent.nom,
        prenom: donnees.prenom || parent.prenom,
    };
    return await modeleParent.modifierParId(id, champsMAJ);
};

const obtenirMesEnfants = async (idParent) => {
    return await modeleParentEleve.trouverEnfantsParParent(idParent);
};

// Retourne le profil d'un enfant ET ses publications disponibles
// Verifie d'abord que cet enfant appartient bien a ce parent (securite)
const obtenirSuiviEnfant = async (idParent, idEleve) => {
    const enfants = await modeleParentEleve.trouverEnfantsParParent(idParent);
    const appartient = enfants.some((e) => e.id === parseInt(idEleve));
    if (!appartient) throw new Error('Acces refuse : cet eleve n\'est pas votre enfant.');

    const eleve = await modeleEleve.trouverParId(idEleve);
    const publications = await modelePublication.trouverParNiveau(eleve.niveau_scolaire);
    return { eleve, publications };
};

module.exports = { obtenirProfil, mettreAJourProfil, obtenirMesEnfants, obtenirSuiviEnfant };
