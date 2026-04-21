// Utilitaire pour hacher et comparer les mots de passe
// On ne stocke JAMAIS un mot de passe en clair dans la base de donnees
// bcrypt transforme "monMotDePasse123" en une chaine illisible et unique
const bcrypt = require('bcryptjs');

// Transforme un mot de passe lisible en hash securise
// saltRounds = 10 : equilibre bon entre securite et performance
const hacherMotDePasse = async (motDePasse) => {
    return await bcrypt.hash(motDePasse, 10);
};

// Compare le mot de passe saisi avec le hash stocke en base
// Retourne true si identique, false sinon
const comparerMotDePasse = async (motDePasse, hash) => {
    return await bcrypt.compare(motDePasse, hash);
};

module.exports = { hacherMotDePasse, comparerMotDePasse };
