// Routes d'authentification (publiques, pas besoin de token)
// @route POST /api/auth/inscription      - Creer un compte, envoie un OTP
// @route POST /api/auth/verification-otp - Valider le code OTP recu
// @route POST /api/auth/connexion        - Se connecter, retourne le token JWT
const { Router } = require('express');
const serviceAuth = require('../services/authentification.service');
const { schemaInscription, schemaConnexion, schemaVerificationOTP } = require('../utils/validateurs/authentification.validateur');

const routeur = Router();

// Helper: extrait un message lisible d'une erreur Joi quelle que soit la version
const formaterErreurValidation = (error) => {
    const detail = error?.details?.[0];
    if (detail?.message) return detail.message;
    if (error?.message) return error.message;
    if (detail?.path?.length) return `Le champ "${detail.path.join('.')}" est invalide.`;
    return 'Donnees invalides.';
};

routeur.post('/inscription', async (req, res) => {
    const { error } = schemaInscription.validate(req.body);
    if (error) {
        console.warn('[VALIDATION] inscription:', error?.details || error?.message);
        return res.status(400).json({ message: formaterErreurValidation(error) });
    }

    try {
        const resultat = await serviceAuth.inscrire(req.body);
        res.status(201).json(resultat);
    } catch (erreur) {
        console.warn('[ERREUR] inscription:', erreur);
        res.status(400).json({ message: erreur.message || 'Inscription impossible.' });
    }
});

routeur.post('/verification-otp', async (req, res) => {
    const { error } = schemaVerificationOTP.validate(req.body);
    if (error) {
        console.warn('[VALIDATION] otp:', error?.details || error?.message);
        return res.status(400).json({ message: formaterErreurValidation(error) });
    }

    try {
        const resultat = await serviceAuth.verifierOTP(req.body);
        res.status(200).json(resultat);
    } catch (erreur) {
        console.warn('[ERREUR] otp:', erreur);
        res.status(400).json({ message: erreur.message || 'Verification impossible.' });
    }
});

routeur.post('/connexion', async (req, res) => {
    const { error } = schemaConnexion.validate(req.body);
    if (error) {
        console.warn('[VALIDATION] connexion:', error?.details || error?.message);
        return res.status(400).json({ message: formaterErreurValidation(error) });
    }

    try {
        const resultat = await serviceAuth.connecter(req.body);
        res.status(200).json(resultat);
    } catch (erreur) {
        console.warn('[ERREUR] connexion:', erreur);
        res.status(401).json({ message: erreur.message || 'Connexion impossible.' });
    }
});

routeur.post('/renvoyer-otp', async (req, res) => {
    try {
        const { email, role } = req.body;
        if (!email || !role) {
            return res.status(400).json({ message: 'Email et rôle sont requis.' });
        }
        const resultat = await serviceAuth.renvoyerOTP({ email, role });
        res.status(200).json(resultat);
    } catch (erreur) {
        console.warn('[ERREUR] renvoyer-otp:', erreur);
        res.status(400).json({ message: erreur.message || 'Envoi impossible.' });
    }
});

module.exports = routeur;
