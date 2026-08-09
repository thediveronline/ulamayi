const classeModele = require('../models/classe.modele');
const Joi = require('joi');
const { uploaderMedia } = require('../utils/cloudinary.util');

const schemaCreationClasse = Joi.object({
    nom: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Le nom de la classe doit contenir au moins 2 caractères',
        'any.required': 'Le nom de la classe est obligatoire'
    }),
    niveau_scolaire: Joi.string().required().messages({
        'any.required': 'Le niveau scolaire est obligatoire'
    }),
    description: Joi.string().allow('', null),
    prix: Joi.number().min(0).allow(null),
    planning: Joi.string().allow('', null)
});

const creerClasse = async (donnees, enseignantId) => {
    const { error, value } = schemaCreationClasse.validate(donnees, { abortEarly: false });
    if (error) {
        throw { status: 400, message: 'Données invalides', details: error.details.map(d => d.message) };
    }

    return await classeModele.creer({
        ...value,
        enseignant_id: enseignantId
    });
};

const modifierClasse = async (classeId, donnees, enseignantId, role) => {
    const classe = await classeModele.trouverParId(classeId);
    if (!classe) {
        throw { status: 404, message: 'Classe introuvable.' };
    }

    if (role !== 'admin' && classe.enseignant_id !== enseignantId) {
        throw { status: 403, message: 'Seul l\'enseignant responsable peut modifier cette classe.' };
    }

    return await classeModele.modifier(classeId, donnees);
};

const mesClasses = async (enseignantId) => {
    return await classeModele.trouverParEnseignant(enseignantId);
};

const mesClassesEleve = async (eleveId) => {
    return await classeModele.trouverParEleve(eleveId);
};

const listerToutesClasses = async () => {
    return await classeModele.trouverToutes();
};

const obtenirClasseParId = async (classeId, utilisateurId, role) => {
    const classe = await classeModele.trouverParId(classeId);
    if (!classe) {
        throw { status: 404, message: 'Classe introuvable.' };
    }

    let estMembre = false;
    if (role === 'enseignant' && classe.enseignant_id === utilisateurId) {
        estMembre = true;
    } else if (role === 'eleve') {
        estMembre = await classeModele.estEleveInscrit(classeId, utilisateurId);
    } else if (role === 'admin') {
        estMembre = true;
    }

    return { ...classe, estMembre };
};

const rejoindreClasse = async (classeId, eleveId) => {
    const classe = await classeModele.trouverParId(classeId);
    if (!classe) {
        throw { status: 404, message: 'Classe introuvable.' };
    }

    const dejaInscrit = await classeModele.estEleveInscrit(classeId, eleveId);
    if (dejaInscrit) {
        return { message: 'Vous êtes déjà inscrit dans cette classe.' };
    }

    await classeModele.ajouterEleve(classeId, eleveId);
    return { message: 'Vous avez rejoint la classe avec succès.' };
};

const ajouterEleveAClasse = async (classeId, eleveId, enseignantId) => {
    const classe = await classeModele.trouverParId(classeId);
    if (!classe) {
        throw { status: 404, message: 'Classe introuvable.' };
    }

    if (classe.enseignant_id !== enseignantId) {
        throw { status: 403, message: 'Seul l\'enseignant responsable peut ajouter des élèves à cette classe.' };
    }

    return await classeModele.ajouterEleve(classeId, eleveId);
};

const listerElevesClasse = async (classeId, utilisateurId, role) => {
    const classe = await classeModele.trouverParId(classeId);
    if (!classe) {
        throw { status: 404, message: 'Classe introuvable.' };
    }

    return await classeModele.listerEleves(classeId);
};

const supprimerClasse = async (classeId, enseignantId, role) => {
    const classe = await classeModele.trouverParId(classeId);
    if (!classe) {
        throw { status: 404, message: 'Classe introuvable.' };
    }

    if (role !== 'admin' && classe.enseignant_id !== enseignantId) {
        throw { status: 403, message: 'Accès refusé.' };
    }

    await classeModele.supprimerParId(classeId);
};

// --- CHAT LOGIC ---
const envoyerMessage = async (classeId, utilisateur, contenu, fichier) => {
    const classe = await classeModele.trouverParId(classeId);
    if (!classe) {
        throw { status: 404, message: 'Classe introuvable.' };
    }

    let media_url = null;
    let media_type = null;
    let media_public_id = null;

    if (fichier) {
        const resultUpload = await uploaderMedia(fichier.buffer, fichier.mimetype);
        media_url = resultUpload.secure_url;
        media_type = resultUpload.media_type;
        media_public_id = resultUpload.public_id;
    }

    const nomExpediteur = utilisateur.prenom && utilisateur.nom
        ? `${utilisateur.prenom} ${utilisateur.nom}`
        : (utilisateur.nom || 'Utilisateur');

    return await classeModele.ajouterMessage({
        classe_id: parseInt(classeId, 10),
        expediteur_id: utilisateur.id,
        role_expediteur: utilisateur.role,
        nom_expediteur: nomExpediteur,
        photo_expediteur: utilisateur.photo_profil || null,
        contenu: contenu || null,
        media_url,
        media_type,
        media_public_id
    });
};

const listerMessagesClasse = async (classeId) => {
    return await classeModele.listerMessages(parseInt(classeId, 10));
};

const listerMediasClasse = async (classeId) => {
    return await classeModele.listerMedias(parseInt(classeId, 10));
};

module.exports = {
    creerClasse,
    modifierClasse,
    mesClasses,
    mesClassesEleve,
    listerToutesClasses,
    obtenirClasseParId,
    rejoindreClasse,
    ajouterEleveAClasse,
    listerElevesClasse,
    supprimerClasse,
    envoyerMessage,
    listerMessagesClasse,
    listerMediasClasse
};
