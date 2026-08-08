// Modèle pour la gestion des classes et de la relation élèves-classes
const pool = require('../config/connexion');

const creer = async ({ nom, niveau_scolaire, enseignant_id }) => {
    const resultat = await pool.query(
        'INSERT INTO classes (nom, niveau_scolaire, enseignant_id) VALUES ($1, $2, $3) RETURNING *',
        [nom, niveau_scolaire, enseignant_id]
    );
    return resultat.rows[0];
};

const trouverParEnseignant = async (enseignant_id) => {
    const sql = `
        SELECT 
            c.*,
            COUNT(ec.eleve_id) as nombre_eleves
        FROM classes c
        LEFT JOIN eleves_classes ec ON c.id = ec.classe_id
        WHERE c.enseignant_id = $1
        GROUP BY c.id
        ORDER BY c.cree_le DESC
    `;
    const resultat = await pool.query(sql, [enseignant_id]);
    return resultat.rows;
};

const trouverParId = async (id) => {
    const sql = `
        SELECT 
            c.*,
            COUNT(ec.eleve_id) as nombre_eleves
        FROM classes c
        LEFT JOIN eleves_classes ec ON c.id = ec.classe_id
        WHERE c.id = $1
        GROUP BY c.id
    `;
    const resultat = await pool.query(sql, [id]);
    return resultat.rows[0];
};

const ajouterEleve = async (classe_id, eleve_id) => {
    const resultat = await pool.query(
        'INSERT INTO eleves_classes (classe_id, eleve_id) VALUES ($1, $2) RETURNING *',
        [classe_id, eleve_id]
    );
    return resultat.rows[0];
};

const listerEleves = async (classe_id) => {
    const sql = `
        SELECT 
            e.id, e.nom, e.prenom, e.email, e.niveau_scolaire, e.photo_profil, ec.rejoint_le
        FROM eleves_classes ec
        JOIN eleves e ON ec.eleve_id = e.id
        WHERE ec.classe_id = $1
        ORDER BY e.nom ASC, e.prenom ASC
    `;
    const resultat = await pool.query(sql, [classe_id]);
    return resultat.rows;
};

const supprimerParId = async (id) => {
    await pool.query('DELETE FROM classes WHERE id = $1', [id]);
};

module.exports = {
    creer,
    trouverParEnseignant,
    trouverParId,
    ajouterEleve,
    listerEleves,
    supprimerParId
};
