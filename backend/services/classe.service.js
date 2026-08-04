const classeModele = require('../models/classe.modele');
const Joi = require('joi');

const schemaCreationClasse = Joi.object({
    nom: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Le nom de la classe doit contenir au moins 2 caractères',
        'any.required': 'Le nom de la classe est obligatoire'
    }),
    niveau_scolaire: Joi.string().required().messages({
        'any.required': 'Le niveau scolaire est obligatoire'
    })
});

const creerClasse = async (donnees, enseignantId) => {
    const { error, value } = schemaCreationClasse.validate(donnees, { abortEarly: false });
    if (error) {
        throw { status: 400, message: 'Données invalides', details: error.details.map(d => d.message) };
    }

    return await classeModele.creer({
        ...value,
        enseignant_id: enseignantId
    });
};

const mesClasses = async (enseignantId) => {
    return await classeModele.trouverParEnseignant(enseignantId);
};

const ajouterEleveAClasse = async (classeId, eleveId, enseignantId) => {
    const classe = await classeModele.trouverParId(classeId);
    if (!classe) {
        throw { status: 404, message: 'Classe introuvable.' };
    }

    if (classe.enseignant_id !== enseignantId) {
        throw { status: 403, message: 'Seul l\'enseignant responsable peut ajouter des élèves à cette classe.' };
    }

    return await classeModele.ajouterEleve(classeId, eleveId);
};

const listerElevesClasse = async (classeId, enseignantId) => {
    const classe = await classeModele.trouverParId(classeId);
    if (!classe) {
        throw { status: 404, message: 'Classe introuvable.' };
    }

    if (classe.enseignant_id !== enseignantId) {
        throw { status: 403, message: 'Accès refusé.' };
    }

    return await classeModele.listerEleves(classeId);
};

const supprimerClasse = async (classeId, enseignantId, role) => {
    const classe = await classeModele.trouverParId(classeId);
    if (!classe) {
        throw { status: 404, message: 'Classe introuvable.' };
    }

    if (role !== 'admin' && classe.enseignant_id !== enseignantId) {
        throw { status: 403, message: 'Accès refusé.' };
    }

    await classeModele.supprimerParId(classeId);
};

module.exports = {
    creerClasse,
    mesClasses,
    ajouterEleveAClasse,
    listerElevesClasse,
    supprimerClasse
};
