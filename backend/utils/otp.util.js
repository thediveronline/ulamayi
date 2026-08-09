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
const calculerExpiration = (minutes = 10) => {
    return new Date(Date.now() + minutes * 60 * 1000);
};

// Verifie que le code OTP n'est pas encore expire
const estOTPValide = (expireLeDB) => {
    const maintenant = Date.now();
    const expiration = new Date(expireLeDB).getTime();
    return maintenant < expiration;
};

module.exports = { genererOTP, calculerExpiration, estOTPValide };
