// Middleware d'authentification
// Il lit le token JWT dans l'en-tete de la requete, le verifie, puis autorise ou bloque
// Si bloque : la requete s'arrete ici, la route n'est jamais atteinte
const { verifierJeton } = require('../utils/jeton.util');

const verifierAuthentification = (req, res, next) => {
    // Le token est envoye dans le header "Authorization: Bearer <token>"
    const entete = req.headers['authorization'];

    if (!entete) {
        return res.status(401).json({ message: 'Acces refuse : aucun token fourni.' });
    }

    // On extrait le token en retirant le prefixe "Bearer "
    const token = entete.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Acces refuse : format du token invalide.' });
    }

    try {
        // Si le token est valide, on stocke les infos de l'utilisateur dans req.utilisateur
        // Ces infos seront disponibles dans toutes les routes qui suivent ce middleware
        const utilisateurDecode = verifierJeton(token);
        req.utilisateur = utilisateurDecode;
        next(); // On passe a la prochaine etape (la route elle-meme)
    } catch (erreur) {
        return res.status(401).json({ message: 'Token invalide ou expire.' });
    }
};

module.exports = { verifierAuthentification };
