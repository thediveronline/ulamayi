// Modèle de la table "epreuves" (soumises par les élèves)
const pool = require('../config/connexion');

const creer = async ({ titre, description, contenu, media_url, media_type, media_public_id, niveau_scolaire, eleve_id }) => {
    const resultat = await pool.query(
        'INSERT INTO epreuves (eleve_id, titre, description, contenu, media_url, media_type, media_public_id, niveau_scolaire) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [eleve_id, titre, description, contenu, media_url || null, media_type || null, media_public_id || null, niveau_scolaire]
    );
    return resultat.rows[0];
};

const trouverParId = async (id) => {
    const sql = `
        SELECT 
            e.*,
            COUNT(c.id)::INTEGER AS nombre_corrections
        FROM epreuves e
        LEFT JOIN corrections c ON c.epreuve_id = e.id
        WHERE e.id = $1
        GROUP BY e.id
    `;
    const resultat = await pool.query(sql, [id]);
    return resultat.rows[0];
};

const trouverToutes = async () => {
    const sql = `
        SELECT 
            e.*,
            COUNT(c.id)::INTEGER AS nombre_corrections
        FROM epreuves e
        LEFT JOIN corrections c ON c.epreuve_id = e.id
        GROUP BY e.id
        ORDER BY e.cree_le DESC
    `;
    const resultat = await pool.query(sql);
    return resultat.rows;
};

const trouverParEleve = async (eleve_id) => {
    // Permet à un élève de voir ses épreuves et de savoir combien de corrections ont été postées
    const sql = `
        SELECT 
            e.*,
            COUNT(c.id)::INTEGER AS nombre_corrections
        FROM epreuves e
        LEFT JOIN corrections c ON c.epreuve_id = e.id
        WHERE e.eleve_id = $1
        GROUP BY e.id
        ORDER BY e.cree_le DESC
    `;
    const resultat = await pool.query(sql, [eleve_id]);
    return resultat.rows;
};

const modifierParId = async (id, { titre, description, contenu, media_url, media_type, media_public_id, niveau_scolaire }) => {
    const resultat = await pool.query(
        'UPDATE epreuves SET titre=$1, description=$2, contenu=$3, media_url=$4, media_type=$5, media_public_id=$6, niveau_scolaire=$7 WHERE id=$8 RETURNING *',
        [titre, description, contenu, media_url, media_type, media_public_id, niveau_scolaire, id]
    );
    return resultat.rows[0];
};

const supprimerParId = async (id) => {
    await pool.query('DELETE FROM epreuves WHERE id = $1', [id]);
};

module.exports = { creer, trouverParId, trouverToutes, trouverParEleve, modifierParId, supprimerParId };
