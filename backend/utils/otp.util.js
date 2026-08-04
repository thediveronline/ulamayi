// Utilitaire pour les codes OTP (One Time Password)
// Un OTP est un code a usage unique valable quelques minutes
// Utilise lors de l'inscription pour verifier que l'email appartient bien a l'utilisateur
const crypto = require('crypto');

// Genere un code OTP de 6 chiffres de facon aleatoire et securisee
const genererOTP = () => {
    // randomInt genere un entier securise entre 100000 et 999999 inclus
    return crypto.randomInt(100000, 999999).toString();
};

// Calcule la date d'expiration a partir de maintenant
// Par defaut : le code expire dans 10 minutes
// Retourne une chaîne ISO pour compatibilité SQLite et PostgreSQL
const calculerExpiration = (minutes = 10) => {
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + minutes);
    return expiration.toISOString(); // Format ISO standard: "2024-08-04T15:30:00.000Z"
};

// Verifie que le code OTP n'est pas encore expire
const estOTPValide = (expireLeDB) => {
    const maintenant = new Date();
    const expiration = new Date(expireLeDB);
    return maintenant < expiration;
};

module.exports = { genererOTP, calculerExpiration, estOTPValide };
