// Regles de validation pour les formulaires d'authentification
// Joi verifie les donnees AVANT qu'elles arrivent a la base de donnees
// Si une donnee est incorrecte, on bloque la requete et on retourne une erreur claire
const Joi = require('joi');

// Schema pour la creation de compte
const schemaInscription = Joi.object({
    nom: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Le nom doit contenir au moins 2 caracteres',
        'any.required': 'Le nom est obligatoire',
    }),
    prenom: Joi.string().min(2).max(100).required().messages({
        'any.required': 'Le prenom est obligatoire',
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Adresse email invalide',
        'any.required': "L'email est obligatoire",
    }),
    mot_de_passe: Joi.string().min(8).required().messages({
        'string.min': 'Le mot de passe doit contenir au moins 8 caracteres',
    }),
    // Le role determine si c'est un eleve, un enseignant ou un parent
    role: Joi.string().valid('eleve', 'enseignant', 'parent').required(),
    // Obligatoire uniquement si le role est "eleve"
    niveau_scolaire: Joi.when('role', {
        is: 'eleve',
        then: Joi.string().required().messages({ 'any.required': 'Le niveau scolaire est obligatoire pour un eleve' }),
        otherwise: Joi.optional(),
    }),
    // Obligatoire uniquement si le role est "enseignant"
    matiere: Joi.when('role', {
        is: 'enseignant',
        then: Joi.string().required().messages({ 'any.required': 'La matiere est obligatoire pour un enseignant' }),
        otherwise: Joi.optional(),
    }),
});

// Schema pour la connexion
const schemaConnexion = Joi.object({
    email: Joi.string().email().required(),
    mot_de_passe: Joi.string().required(),
    role: Joi.string().valid('eleve', 'enseignant', 'parent', 'admin').required(),
});

// Schema pour la verification du code OTP
const schemaVerificationOTP = Joi.object({
    email: Joi.string().email().required(),
    code: Joi.string().length(6).required().messages({
        'string.length': 'Le code OTP doit contenir exactement 6 chiffres',
    }),
    role: Joi.string().valid('eleve', 'enseignant', 'parent').required(),
});

module.exports = { schemaInscription, schemaConnexion, schemaVerificationOTP };
