// Modele de la table "eleves"
const pool = require('../config/connexion');

const trouverParEmail = async (email) => {
    const resultat = await pool.query('SELECT * FROM eleves WHERE email = $1', [email]);
    return resultat.rows[0];
};

const trouverParId = async (id) => {
    const resultat = await pool.query(
        'SELECT id, nom, prenom, email, niveau_scolaire, photo_profil, est_verifie, cree_le FROM eleves WHERE id = $1',
        [id]
    );
    return resultat.rows[0];
};

// Un eleve ne voit que les autres eleves de son niveau : restriction d'acces aux donnees
const trouverParNiveau = async (niveau) => {
    const resultat = await pool.query(
        'SELECT id, nom, prenom, niveau_scolaire, photo_profil FROM eleves WHERE niveau_scolaire = $1',
        [niveau]
    );
    return resultat.rows;
};

const creer = async ({ nom, prenom, email, mot_de_passe, niveau_scolaire }) => {
    const resultat = await pool.query(
        'INSERT INTO eleves (nom, prenom, email, mot_de_passe, niveau_scolaire) VALUES ($1, $2, $3, $4, $5) RETURNING id, nom, prenom, email',
        [nom, prenom, email, mot_de_passe, niveau_scolaire]
    );
    return resultat.rows[0];
};

// Active le compte apres que l'eleve a valide son OTP
const activerCompte = async (email) => {
    await pool.query('UPDATE eleves SET est_verifie = true WHERE email = $1', [email]);
};

const modifierParId = async (id, { nom, prenom, niveau_scolaire, photo_profil }) => {
    const resultat = await pool.query(
        'UPDATE eleves SET nom = $1, prenom = $2, niveau_scolaire = $3, photo_profil = $4 WHERE id = $5 RETURNING id, nom, prenom, email, niveau_scolaire, photo_profil',
        [nom, prenom, niveau_scolaire, photo_profil, id]
    );
    return resultat.rows[0];
};

const mettreAJour = async (id, { nom, prenom, mot_de_passe, niveau_scolaire }) => {
    const resultat = await pool.query(
        'UPDATE eleves SET nom = $1, prenom = $2, mot_de_passe = $3, niveau_scolaire = $4 WHERE id = $5 RETURNING id',
        [nom, prenom, mot_de_passe, niveau_scolaire, id]
    );
    return resultat.rows[0];
};

module.exports = { trouverParEmail, trouverParId, trouverParNiveau, creer, activerCompte, modifierParId, mettreAJour };


// Ajout de la fonction de mise a jour

