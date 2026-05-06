const pool = require('../config/connexion');


const ajouterFavori = async (utilisateur_id, role_utilisateur, publication_id) => {
    const resultat = await pool.query(
        'INSERT INTO favoris (utilisateur_id, role_utilisateur, publication_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING *',
        [utilisateur_id, role_utilisateur, publication_id]
    );
    return resultat.rows[0];
};

const retirerFavori = async (utilisateur_id, role_utilisateur, publication_id) => {
    await pool.query(
        'DELETE FROM favoris WHERE utilisateur_id = $1 AND role_utilisateur = $2 AND publication_id = $3',
        [utilisateur_id, role_utilisateur, publication_id]
    );
};

const estEnFavori = async (utilisateur_id, role_utilisateur, publication_id) => {
    const resultat = await pool.query(
        'SELECT id FROM favoris WHERE utilisateur_id = $1 AND role_utilisateur = $2 AND publication_id = $3',
        [utilisateur_id, role_utilisateur, publication_id]
    );
    return resultat.rowCount > 0;
};

const trouverFavorisUtilisateur = async (utilisateur_id, role_utilisateur) => {
    const resultat = await pool.query(
        'SELECT p.* FROM favoris f JOIN publications p ON f.publication_id = p.id WHERE f.utilisateur_id = $1 AND f.role_utilisateur = $2 ORDER BY f.cree_le DESC',
        [utilisateur_id, role_utilisateur]
    );
    return resultat.rows;
};

// --- COMMENTAIRES ---

const ajouterCommentaire = async (utilisateur_id, role_utilisateur, publication_id, contenu) => {
    const resultat = await pool.query(
        'INSERT INTO commentaires (utilisateur_id, role_utilisateur, publication_id, contenu) VALUES ($1, $2, $3, $4) RETURNING *',
        [utilisateur_id, role_utilisateur, publication_id, contenu]
    );
    return resultat.rows[0];
};

const trouverCommentairesParPublication = async (publication_id) => {
        const sql = `
        SELECT 
            c.*,
            COALESCE(e.nom, ens.nom, p.nom) as nom_utilisateur,
            COALESCE(e.prenom, ens.prenom, p.prenom) as prenom_utilisateur
        FROM commentaires c
        LEFT JOIN eleves e ON (c.utilisateur_id = e.id AND c.role_utilisateur = 'eleve')
        LEFT JOIN enseignants ens ON (c.utilisateur_id = ens.id AND c.role_utilisateur = 'enseignant')
        LEFT JOIN parents p ON (c.utilisateur_id = p.id AND c.role_utilisateur = 'parent')
        WHERE c.publication_id = $1
        ORDER BY c.cree_le DESC
    `;
    const resultat = await pool.query(sql, [publication_id]);
    return resultat.rows;
};



const noterPublication = async (utilisateur_id, role_utilisateur, publication_id, note) => {
    const resultat = await pool.query(
        'INSERT INTO notes_publications (utilisateur_id, role_utilisateur, publication_id, note) VALUES ($1, $2, $3, $4) ON CONFLICT (utilisateur_id, role_utilisateur, publication_id) DO UPDATE SET note = EXCLUDED.note RETURNING *',
        [utilisateur_id, role_utilisateur, publication_id, note]
    );
    return resultat.rows[0];
};

const calculerStatsPublication = async (publication_id) => {
    const sql = `
        SELECT 
            COUNT(*) as nombre_notes,
            AVG(note)::NUMERIC(3,2) as note_moyenne
        FROM notes_publications 
        WHERE publication_id = $1
    `;
    const resultat = await pool.query(sql, [publication_id]);
    return resultat.rows[0];
};



const incrementerTelechargements = async (publication_id) => {
    const resultat = await pool.query(
        'UPDATE publications SET nombre_telechargements = nombre_telechargements + 1 WHERE id = $1 RETURNING nombre_telechargements',
        [publication_id]
    );
    return resultat.rows[0];
};

module.exports = {
    ajouterFavori,
    retirerFavori,
    estEnFavori,
    trouverFavorisUtilisateur,
    ajouterCommentaire,
    trouverCommentairesParPublication,
    noterPublication,
    calculerStatsPublication,
    incrementerTelechargements
};
