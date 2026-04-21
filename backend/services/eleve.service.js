// Service de l'eleve
// Un eleve peut voir son profil et les publications de son niveau scolaire uniquement
const modeleEleve = require('../models/eleve.modele');
const modelePublication = require('../models/publication.modele');

const obtenirProfil = async (id) => {
    const eleve = await modeleEleve.trouverParId(id);
    if (!eleve) throw new Error('Eleve introuvable.');
    return eleve;
};

const mettreAJourProfil = async (id, donnees) => {
    const eleve = await modeleEleve.trouverParId(id);
    if (!eleve) throw new Error('Eleve introuvable.');

    // On applique les nouvelles valeurs sur les anciennes pour ne rien ecraser a tort
    const champsMAJ = {
        nom: donnees.nom || eleve.nom,
        prenom: donnees.prenom || eleve.prenom,
        niveau_scolaire: donnees.niveau_scolaire || eleve.niveau_scolaire,
    };

    return await modeleEleve.modifierParId(id, champsMAJ);
};

// Restriction d'acces : un eleve ne voit que les publications de son propre niveau
const obtenirPublicationsDuNiveau = async (idEleve) => {
    const eleve = await modeleEleve.trouverParId(idEleve);
    if (!eleve) throw new Error('Eleve introuvable.');
    return await modelePublication.trouverParNiveau(eleve.niveau_scolaire);
};

module.exports = { obtenirProfil, mettreAJourProfil, obtenirPublicationsDuNiveau };
