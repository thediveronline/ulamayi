// Utilitaire pour gerer les tokens JWT (JSON Web Token)
// Un JWT c'est comme un badge numerique signe : il prouve qui tu es
// sans avoir a interroger la base de donnees a chaque requete
// Structure d'un JWT : header.payload.signature (visible mais non falsifiable)
const jwt = require('jsonwebtoken');

// Cree un token JWT avec les infos de l'utilisateur dedans
// payload : objet contenant l'id, le role et l'email
const genererJeton = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

// Verifie qu'un token est valide et retourne son contenu decode
// Lance une erreur si le token est falsifie ou expire
const verifierJeton = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { genererJeton, verifierJeton };
