// Règles de validation pour la création des corrections par les enseignants
const Joi = require('joi');

const schemaCreationCorrection = Joi.object({
    epreuve_id: Joi.number().integer().required().messages({
        'number.base': 'L\'identifiant de l\'épreuve doit être un nombre valide',
        'any.required': 'L\'identifiant de l\'épreuve cible est obligatoire',
    }),
    titre: Joi.string().min(5).max(200).required().messages({
        'string.min': 'Le titre de la correction doit contenir au moins 5 caractères',
        'any.required': 'Le titre de la correction est obligatoire',
        'string.empty': 'Le titre de la correction ne peut pas être vide'
    }),
    description: Joi.string().max(500).allow('').optional().messages({
        'string.max': 'La description ne doit pas dépasser 500 caractères'
    }),
    contenu: Joi.string().required().messages({
        'any.required': 'Le contenu détaillé de la correction est obligatoire',
        'string.empty': 'Le contenu de la correction ne peut pas être vide'
    }),
    // Prix en FCFA, 0 par défaut pour les corrections gratuites
    prix: Joi.number().min(0).default(0).messages({
        'number.min': 'Le prix de la correction ne peut pas être négatif',
        'number.base': 'Le prix doit être un nombre valide'
    }),
});

module.exports = { schemaCreationCorrection };
