// Service d'authentification
// Contient toute la logique metier pour l'inscription, la verification OTP et la connexion
// Ce fichier ne connait pas Express : il recoit des donnees brutes et retourne un resultat
const { hacherMotDePasse, comparerMotDePasse } = require('../utils/hachage.util');
const { genererJeton } = require('../utils/jeton.util');
const { genererOTP, calculerExpiration, estOTPValide } = require('../utils/otp.util');
const modeleOTP = require('../models/otp.modele');
const { envoyerCodeOTP } = require('./email.service');
const modeleEleve = require('../models/eleve.modele');
const modeleEnseignant = require('../models/enseignant.modele');
const modeleParent = require('../models/parent.modele');

// Mappe chaque role vers son modele de base de donnees
// Ca permet d'ecrire une seule fonction inscrire() au lieu de trois
const modeles = {
    eleve: modeleEleve,
    enseignant: modeleEnseignant,
    parent: modeleParent,
};

const inscrire = async (donnees) => {
    const { nom, prenom, email, mot_de_passe, role, niveau_scolaire, matiere } = donnees;
    const modele = modeles[role];
    if (!modele) throw new Error('Role invalide : le type d’utilisateur spécifié n’est pas reconnu.');

    let existant;
    try {
        existant = await modele.trouverParEmail(email);
    } catch (err) {
        throw new Error(`Erreur lors de la vérification de l'email : ${err.message}`);
    }

    if (existant && existant.est_verifie) {
        throw new Error('Cet email est déjà lié à un compte actif. Veuillez vous connecter.');
    }

    const motDePasseHache = await hacherMotDePasse(mot_de_passe);

    try {
        if (existant && !existant.est_verifie) {
            // Mise à jour si compte non vérifié
            await modele.mettreAJour(existant.id, { nom, prenom, mot_de_passe: motDePasseHache, niveau_scolaire, matiere });
        } else {
            // Création si nouveau compte
            await modele.creer({ nom, prenom, email, mot_de_passe: motDePasseHache, niveau_scolaire, matiere });
        }
    } catch (err) {
        throw new Error(`Erreur lors de l'enregistrement des informations : ${err.message}`);
    }

    try {
        // Gestion de l'OTP
        await modeleOTP.supprimerParEmail(email);
        const dureeMinutes = Number(process.env.OTP_EXPIRES_MINUTES) || 10;
        const code = genererOTP();
        const expiration = calculerExpiration(dureeMinutes);
        await modeleOTP.creer(email, code, expiration);

        // Tentative d'envoi de l'email
        await envoyerCodeOTP({ email, code, minutes: dureeMinutes });
    } catch (err) {
        // Ici, on ne bloque pas forcément tout si l'email échoue en dev, 
        // mais on prévient l'utilisateur que le code n'a pas pu être envoyé.
        throw new Error(`Compte créé, mais l'envoi de l'email OTP a échoué : ${err.message}`);
    }

    return { message: 'Inscription enregistrée avec succès. Veuillez vérifier vos emails pour le code OTP.' };
};


const verifierOTP = async ({ email, code, role }) => {
    const modele = modeles[role];
    if (!modele) throw new Error('Role invalide.');

    const otpEnBase = await modeleOTP.trouverParEmail(email);
    if (!otpEnBase) throw new Error('Aucun code OTP trouve pour cet email.');
    if (otpEnBase.code !== code) throw new Error('Code OTP incorrect.');
    if (!estOTPValide(otpEnBase.expire_le)) throw new Error('Code OTP expire. Veuillez recommencer.');

    await modele.activerCompte(email);
    await modeleOTP.supprimerParEmail(email);

    return { message: 'Compte verifie avec succes. Vous pouvez maintenant vous connecter.' };
};

const connecter = async ({ email, mot_de_passe, role }) => {
    const modele = modeles[role];
    if (!modele) throw new Error('Role invalide.');

    const utilisateur = await modele.trouverParEmail(email);
    if (!utilisateur) throw new Error('Email ou mot de passe incorrect.');
    if (!utilisateur.est_verifie) throw new Error('Compte non verifie. Verifiez votre email.');

    const motDePasseCorrect = await comparerMotDePasse(mot_de_passe, utilisateur.mot_de_passe);
    if (!motDePasseCorrect) throw new Error('Email ou mot de passe incorrect.');

    const token = genererJeton({ id: utilisateur.id, role, email: utilisateur.email });
    return { token, utilisateur: { id: utilisateur.id, nom: utilisateur.nom, email: utilisateur.email, role } };
};

const renvoyerOTP = async ({ email, role }) => {
    const modele = modeles[role];
    if (!modele) throw new Error('Role invalide.');

    const utilisateur = await modele.trouverParEmail(email);
    if (!utilisateur) throw new Error('Aucun compte trouvé avec cet email.');
    if (utilisateur.est_verifie) throw new Error('Ce compte est déjà vérifié.');

    // Génération et stockage du nouvel OTP
    await modeleOTP.supprimerParEmail(email);
    const dureeMinutes = Number(process.env.OTP_EXPIRES_MINUTES) || 10;
    const code = genererOTP();
    const expiration = calculerExpiration(dureeMinutes);
    await modeleOTP.creer(email, code, expiration);

    // Envoi de l'email
    await envoyerCodeOTP({ email, code, minutes: dureeMinutes });

    return { message: 'Un nouveau code OTP a été envoyé à votre adresse email.' };
};

module.exports = { inscrire, verifierOTP, connecter, renvoyerOTP };
