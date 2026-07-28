// Règles de validation pour la création et modification des épreuves par les élèves
const Joi = require('joi');

const schemaCreationEpreuve = Joi.object({
    titre: Joi.string().min(5).max(200).required().messages({
        'string.min': 'Le titre doit contenir au moins 5 caractères',
        'any.required': 'Le titre de l\'épreuve est obligatoire',
        'string.empty': 'Le titre ne peut pas être vide'
    }),
    description: Joi.string().max(500).allow('').optional().messages({
        'string.max': 'La description ne doit pas dépasser 500 caractères'
    }),
    contenu: Joi.string().required().messages({
        'any.required': 'Le contenu (ou énoncé) de l\'épreuve est obligatoire',
        'string.empty': 'Le contenu de l\'épreuve ne peut pas être vide'
    }),
    niveau_scolaire: Joi.string().required().messages({
        'any.required': 'Le niveau scolaire est obligatoire',
        'string.empty': 'Le niveau scolaire ne peut pas être vide'
    }),
});

const schemaMiseAJourEpreuve = Joi.object({
    titre: Joi.string().min(5).max(200).messages({
        'string.min': 'Le titre doit contenir au moins 5 caractères'
    }),
    description: Joi.string().max(500).allow(''),
    contenu: Joi.string(),
    niveau_scolaire: Joi.string(),
    supprimer_media: Joi.boolean(),
});

module.exports = { schemaCreationEpreuve, schemaMiseAJourEpreuve };
