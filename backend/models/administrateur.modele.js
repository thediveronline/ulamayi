// Modele de la table "administrateurs"
// Chaque fonction = une operation SQL precise sur cette table
// On ne met jamais de logique metier ici, uniquement des requetes SQL
const pool = require('../config/connexion');

const trouverParEmail = async (email) => {
    const resultat = await pool.query(
        'SELECT * FROM administrateurs WHERE email = $1',
        [email]
    );
    return resultat.rows[0];
};

const trouverParId = async (id) => {
    const resultat = await pool.query(
        'SELECT id, nom, email, photo_profil, est_actif, cree_le FROM administrateurs WHERE id = $1',
        [id]
    );
    return resultat.rows[0];
};

const trouverTous = async () => {
    const resultat = await pool.query(
        'SELECT id, nom, email, photo_profil, est_actif, cree_le FROM administrateurs ORDER BY cree_le DESC'
    );
    return resultat.rows;
};

const creer = async ({ nom, email, mot_de_passe }) => {
    const resultat = await pool.query(
        'INSERT INTO administrateurs (nom, email, mot_de_passe) VALUES ($1, $2, $3) RETURNING id, nom, email',
        [nom, email, mot_de_passe]
    );
    return resultat.rows[0];
};

const modifierParId = async (id, { nom, email, photo_profil }) => {
    const resultat = await pool.query(
        'UPDATE administrateurs SET nom = $1, email = $2, photo_profil = $3 WHERE id = $4 RETURNING id, nom, email, photo_profil',
        [nom, email, photo_profil, id]
    );
    return resultat.rows[0];
};

const supprimerParId = async (id) => {
    await pool.query('DELETE FROM administrateurs WHERE id = $1', [id]);
};

module.exports = { trouverParEmail, trouverParId, trouverTous, creer, modifierParId, supprimerParId };
