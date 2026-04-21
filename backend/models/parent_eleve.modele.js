// Modele de la table de liaison "parents_eleves"
// Cette table fait le lien entre un parent et ses enfants (eleves)
// Un parent peut avoir plusieurs enfants, et un enfant peut avoir deux parents
const pool = require('../config/connexion');

// Cree un lien entre un parent et un eleve
// ON CONFLICT DO NOTHING evite les doublons si le lien existe deja
const lier = async (parent_id, eleve_id) => {
    const resultat = await pool.query(
        'INSERT INTO parents_eleves (parent_id, eleve_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
        [parent_id, eleve_id]
    );
    return resultat.rows[0];
};

// Retourne tous les enfants d'un parent avec leurs infos de base
// On utilise un INNER JOIN pour combiner les deux tables en une seule requete
const trouverEnfantsParParent = async (parent_id) => {
    const resultat = await pool.query(
        `SELECT e.id, e.nom, e.prenom, e.niveau_scolaire, e.email
     FROM eleves e
     INNER JOIN parents_eleves pe ON pe.eleve_id = e.id
     WHERE pe.parent_id = $1`,
        [parent_id]
    );
    return resultat.rows;
};

module.exports = { lier, trouverEnfantsParParent };
