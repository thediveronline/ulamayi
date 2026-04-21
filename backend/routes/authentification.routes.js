// Routes d'authentification (publiques, pas besoin de token)
// @route POST /api/auth/inscription      - Creer un compte, envoie un OTP
// @route POST /api/auth/verification-otp - Valider le code OTP recu
// @route POST /api/auth/connexion        - Se connecter, retourne le token JWT
const { Router } = require('express');
const serviceAuth = require('../services/authentification.service');
const { schemaInscription, schemaConnexion, schemaVerificationOTP } = require('../utils/validateurs/authentification.validateur');

const routeur = Router();

routeur.post('/inscription', async (req, res) => {
    const { error } = schemaInscription.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const resultat = await serviceAuth.inscrire(req.body);
        res.status(201).json(resultat);
    } catch (erreur) {
        res.status(400).json({ message: erreur.message });
    }
});

routeur.post('/verification-otp', async (req, res) => {
    const { error } = schemaVerificationOTP.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const resultat = await serviceAuth.verifierOTP(req.body);
        res.status(200).json(resultat);
    } catch (erreur) {
        res.status(400).json({ message: erreur.message });
    }
});

routeur.post('/connexion', async (req, res) => {
    const { error } = schemaConnexion.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const resultat = await serviceAuth.connecter(req.body);
        res.status(200).json(resultat);
    } catch (erreur) {
        res.status(401).json({ message: erreur.message });
    }
});

module.exports = routeur;
