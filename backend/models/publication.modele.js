// Modele de la table "publications" (epreuves et exercices publies par les enseignants)
const pool = require('../config/connexion');

const creer = async ({ titre, description, contenu, media_url, media_type, media_public_id, niveau_scolaire, prix, enseignant_id }) => {
    const resultat = await pool.query(
        'INSERT INTO publications (titre, description, contenu, media_url, media_type, media_public_id, niveau_scolaire, prix, enseignant_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [titre, description, contenu, media_url || null, media_type || null, media_public_id || null, niveau_scolaire, prix || 0, enseignant_id]
    );
    return resultat.rows[0];
};

const trouverTous = async () => {
    const resultat = await pool.query('SELECT * FROM publications ORDER BY cree_le DESC');
    return resultat.rows;
};

const trouverParId = async (id) => {
    const resultat = await pool.query('SELECT * FROM publications WHERE id = $1', [id]);
    return resultat.rows[0];
};

// Filtre par niveau : un eleve ne voit que les publications de son niveau scolaire
const trouverParNiveau = async (niveau) => {
    const resultat = await pool.query(
        'SELECT * FROM publications WHERE niveau_scolaire = $1 ORDER BY cree_le DESC',
        [niveau]
    );
    return resultat.rows;
};

const trouverParEnseignant = async (enseignant_id) => {
    const resultat = await pool.query(
        'SELECT * FROM publications WHERE enseignant_id = $1 ORDER BY cree_le DESC',
        [enseignant_id]
    );
    return resultat.rows;
};

const modifierParId = async (id, { titre, description, contenu, media_url, media_type, media_public_id, niveau_scolaire, prix }) => {
    const resultat = await pool.query(
        'UPDATE publications SET titre=$1, description=$2, contenu=$3, media_url=$4, media_type=$5, media_public_id=$6, niveau_scolaire=$7, prix=$8 WHERE id=$9 RETURNING *',
        [titre, description, contenu, media_url, media_type, media_public_id, niveau_scolaire, prix, id]
    );
    return resultat.rows[0];
};

const supprimerParId = async (id) => {
    await pool.query('DELETE FROM publications WHERE id = $1', [id]);
};

module.exports = { creer, trouverTous, trouverParId, trouverParNiveau, trouverParEnseignant, modifierParId, supprimerParId };
