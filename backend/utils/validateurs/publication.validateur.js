// Regles de validation pour la creation et modification de publications
const Joi = require('joi');

// Schema pour creer une nouvelle publication (epreuve, exercice...)
const schemaCreation = Joi.object({
    titre: Joi.string().min(5).max(200).required().messages({
        'string.min': 'Le titre doit contenir au moins 5 caracteres',
        'any.required': 'Le titre est obligatoire',
    }),
    description: Joi.string().max(500).allow('').optional(),
    contenu: Joi.string().required().messages({
        'any.required': 'Le contenu de la publication est obligatoire',
    }),
    niveau_scolaire: Joi.string().required().messages({
        'any.required': 'Le niveau scolaire cible est obligatoire',
    }),
    // Prix en FCFA, 0 par defaut (gratuit). En multipart on recoit une string, on convertit.
    prix: Joi.number().min(0).default(0),
});

// Schema pour modifier une publication : aucun champ n'est oblitatoire
const schemaMiseAJour = Joi.object({
    titre: Joi.string().min(5).max(200),
    description: Joi.string().max(500).allow(''),
    contenu: Joi.string(),
    niveau_scolaire: Joi.string(),
    prix: Joi.number().min(0),
    // Drapeau pour supprimer le media existant sans en uploader un nouveau
    supprimer_media: Joi.boolean(),
});

module.exports = { schemaCreation, schemaMiseAJour };
