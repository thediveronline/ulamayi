// Modele de la table "otps" (codes de verification a usage unique)
const pool = require('../config/connexion');

// Enregistre un OTP en base. On supprime d'abord les anciens pour cet email.
const creer = async (email, code, expireLe) => {
    // Suppression des anciens OTP pour eviter les doublons
    await pool.query('DELETE FROM otps WHERE email = $1', [email]);

    const resultat = await pool.query(
        'INSERT INTO otps (email, code, expire_le) VALUES ($1, $2, $3) RETURNING *',
        [email, code, expireLe]
    );
    return resultat.rows[0];
};

// Retrouve le dernier OTP associe a un email
const trouverParEmail = async (email) => {
    const resultat = await pool.query(
        'SELECT * FROM otps WHERE email = $1 ORDER BY cree_le DESC LIMIT 1',
        [email]
    );
    return resultat.rows[0];
};

// Supprime l'OTP apres utilisation : un OTP ne peut servir qu'une seule fois
const supprimerParEmail = async (email) => {
    await pool.query('DELETE FROM otps WHERE email = $1', [email]);
};

module.exports = { creer, trouverParEmail, supprimerParEmail };
