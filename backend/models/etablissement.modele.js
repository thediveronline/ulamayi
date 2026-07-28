// Modèle pour la gestion des établissements scolaires
const pool = require('../config/connexion');

const creer = async ({ nom, email, mot_de_passe, adresse, telephone, photo_profil }) => {
    const resultat = await pool.query(
        'INSERT INTO etablissements (nom, email, mot_de_passe, adresse, telephone, photo_profil) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [nom, email, mot_de_passe, adresse || null, telephone || null, photo_profil || null]
    );
    return resultat.rows[0];
};

const trouverTous = async () => {
    const resultat = await pool.query('SELECT id, nom, email, adresse, telephone, photo_profil, est_verifie, cree_le FROM etablissements ORDER BY cree_le DESC');
    return resultat.rows;
};

const trouverParId = async (id) => {
    const resultat = await pool.query('SELECT id, nom, email, adresse, telephone, photo_profil, est_verifie, cree_le FROM etablissements WHERE id = $1', [id]);
    return resultat.rows[0];
};

const validerEtablissement = async (id, statut = true) => {
    const resultat = await pool.query('UPDATE etablissements SET est_verifie = $1 WHERE id = $2 RETURNING *', [statut, id]);
    return resultat.rows[0];
};

module.exports = {
    creer,
    trouverTous,
    trouverParId,
    validerEtablissement
};
