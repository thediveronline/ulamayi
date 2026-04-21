// Service de l'administrateur
// CRUD complet : l'admin peut tout voir et tout modifier
const pool = require('../config/connexion');
const modeleAdmin = require('../models/administrateur.modele');
const modeleEnseignant = require('../models/enseignant.modele');

// Retourne tous les utilisateurs groupes par role en une seule fois
// Promise.all execute les 4 requetes en parallele, c'est plus rapide que d'attendre chacune
const listerUtilisateurs = async () => {
    const [admins, enseignants, elevesRes, parentsRes] = await Promise.all([
        modeleAdmin.trouverTous(),
        modeleEnseignant.trouverTous(),
        pool.query('SELECT id, nom, prenom, email, niveau_scolaire FROM eleves ORDER BY cree_le DESC'),
        pool.query('SELECT id, nom, prenom, email FROM parents ORDER BY cree_le DESC'),
    ]);
    return { admins, enseignants, eleves: elevesRes.rows, parents: parentsRes.rows };
};

const obtenirAdmin = async (id) => {
    const admin = await modeleAdmin.trouverParId(id);
    if (!admin) throw new Error('Administrateur introuvable.');
    return admin;
};

const modifierAdmin = async (id, donnees) => {
    const admin = await modeleAdmin.trouverParId(id);
    if (!admin) throw new Error('Administrateur introuvable.');
    return await modeleAdmin.modifierParId(id, donnees);
};

// Supprime un utilisateur selon son role
// On utilise des conditions explicites plutot qu'un tableau dynamique
// pour eviter tout risque d'injection SQL via le parametre role
const supprimerUtilisateur = async (id, role) => {
    if (role === 'admin') await pool.query('DELETE FROM administrateurs WHERE id = $1', [id]);
    else if (role === 'eleve') await pool.query('DELETE FROM eleves WHERE id = $1', [id]);
    else if (role === 'enseignant') await pool.query('DELETE FROM enseignants WHERE id = $1', [id]);
    else if (role === 'parent') await pool.query('DELETE FROM parents WHERE id = $1', [id]);
    else throw new Error('Role invalide.');
};

module.exports = { listerUtilisateurs, obtenirAdmin, modifierAdmin, supprimerUtilisateur };
