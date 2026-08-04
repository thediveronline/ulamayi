// Modèle de la table "corrections" (proposées par les enseignants)
const pool = require('../config/connexion');

const creer = async ({ enseignant_id, epreuve_id, titre, description, contenu, media_url, media_type, media_public_id, prix }) => {
    const resultat = await pool.query(
        'INSERT INTO corrections (enseignant_id, epreuve_id, titre, description, contenu, media_url, media_type, media_public_id, prix) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [enseignant_id, epreuve_id, titre, description, contenu, media_url || null, media_type || null, media_public_id || null, prix || 0]
    );
    return resultat.rows[0];
};

const trouverParId = async (id) => {
    const sql = `
        SELECT 
            c.*,
            e.nom as enseignant_nom,
            e.prenom as enseignant_prenom,
            e.matiere as enseignant_matiere,
            e.titre as enseignant_titre,
            e.photo_profil as enseignant_photo
        FROM corrections c
        LEFT JOIN enseignants e ON c.enseignant_id = e.id
        WHERE c.id = $1
    `;
    const resultat = await pool.query(sql, [id]);
    return resultat.rows[0];
};

// Renvoie les métadonnées de la correction SANS son contenu privé pour l'aperçu public
const trouverParEpreuve = async (epreuve_id) => {
    const sql = `
        SELECT 
            c.id, c.epreuve_id, c.titre, c.description, c.prix, c.nombre_telechargements, c.cree_le,
            e.id as enseignant_id,
            e.nom as enseignant_nom,
            e.prenom as enseignant_prenom,
            e.matiere as enseignant_matiere,
            e.titre as enseignant_titre,
            e.photo_profil as enseignant_photo
        FROM corrections c
        LEFT JOIN enseignants e ON c.enseignant_id = e.id
        WHERE c.epreuve_id = $1
        ORDER BY c.cree_le ASC
    `;
    const resultat = await pool.query(sql, [epreuve_id]);
    return resultat.rows;
};

const compterParEpreuve = async (epreuve_id) => {
    const resultat = await pool.query('SELECT COUNT(*) FROM corrections WHERE epreuve_id = $1', [epreuve_id]);
    return parseInt(resultat.rows[0].count, 10);
};

const supprimerParId = async (id) => {
    await pool.query('DELETE FROM corrections WHERE id = $1', [id]);
};

module.exports = { creer, trouverParId, trouverParEpreuve, compterParEpreuve, supprimerParId };
