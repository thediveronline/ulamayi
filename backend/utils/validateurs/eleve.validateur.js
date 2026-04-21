// Regles de validation pour la mise a jour du profil d'un eleve
const Joi = require('joi');

// Tous les champs sont optionnels : l'eleve peut n'en modifier qu'un seul
const schemaMiseAJourProfil = Joi.object({
    nom: Joi.string().min(2).max(100),
    prenom: Joi.string().min(2).max(100),
    niveau_scolaire: Joi.string().valid(
        '6eme', '5eme', '4eme', '3eme',
        '2nde', '1ere', 'Terminale'
    ),
});

module.exports = { schemaMiseAJourProfil };
