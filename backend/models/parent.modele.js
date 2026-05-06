// Modele de la table "parents"
const pool = require('../config/connexion');

const trouverParEmail = async (email) => {
    const resultat = await pool.query('SELECT * FROM parents WHERE email = $1', [email]);
    return resultat.rows[0];
};

const trouverParId = async (id) => {
    const resultat = await pool.query(
        'SELECT id, nom, prenom, email, photo_profil, est_verifie, cree_le FROM parents WHERE id = $1',
        [id]
    );
    return resultat.rows[0];
};

const creer = async ({ nom, prenom, email, mot_de_passe }) => {
    const resultat = await pool.query(
        'INSERT INTO parents (nom, prenom, email, mot_de_passe) VALUES ($1, $2, $3, $4) RETURNING id, nom, prenom, email',
        [nom, prenom, email, mot_de_passe]
    );
    return resultat.rows[0];
};

const activerCompte = async (email) => {
    await pool.query('UPDATE parents SET est_verifie = true WHERE email = $1', [email]);
};

const modifierParId = async (id, { nom, prenom, photo_profil }) => {
    const resultat = await pool.query(
        'UPDATE parents SET nom = $1, prenom = $2, photo_profil = $3 WHERE id = $4 RETURNING id, nom, prenom, email, photo_profil',
        [nom, prenom, photo_profil, id]
    );
    return resultat.rows[0];
};

const mettreAJour = async (id, { nom, prenom, mot_de_passe }) => {
    const resultat = await pool.query(
        'UPDATE parents SET nom = $1, prenom = $2, mot_de_passe = $3 WHERE id = $4 RETURNING id',
        [nom, prenom, mot_de_passe, id]
    );
    return resultat.rows[0];
};

module.exports = { trouverParEmail, trouverParId, creer, activerCompte, modifierParId, mettreAJour };
