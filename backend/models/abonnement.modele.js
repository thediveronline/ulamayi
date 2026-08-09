// Modèle de la table "abonnements" (droits d'accès aux corrections achetées par les élèves)
const pool = require('../config/connexion');

const creer = async (eleve_id, correction_id) => {
    // La contrainte UNIQUE(eleve_id, correction_id) garantira qu'un élève ne paye/s'abonne qu'une seule fois
    const resultat = await pool.query(
        'INSERT INTO abonnements (eleve_id, correction_id) VALUES ($1, $2) RETURNING *',
        [eleve_id, correction_id]
    );
    return resultat.rows[0];
};

const exister = async (eleve_id, correction_id) => {
    const resultat = await pool.query(
        'SELECT 1 FROM abonnements WHERE eleve_id = $1 AND correction_id = $2',
        [eleve_id, correction_id]
    );
    return resultat.rowCount > 0;
};

const trouverParEleve = async (eleve_id) => {
    const sql = `
        SELECT 
            a.id as abonnement_id, a.cree_le as abonnement_cree_le,
            c.id as correction_id, c.titre as correction_titre, c.prix, c.epreuve_id,
            ep.titre as epreuve_titre,
            en.nom as enseignant_nom, en.prenom as enseignant_prenom, en.titre as enseignant_titre
        FROM abonnements a
        JOIN corrections c ON a.correction_id = c.id
        JOIN epreuves ep ON c.epreuve_id = ep.id
        LEFT JOIN enseignants en ON c.enseignant_id = en.id
        WHERE a.eleve_id = $1
        ORDER BY a.cree_le DESC
    `;
    const resultat = await pool.query(sql, [eleve_id]);
    return resultat.rows;
};

const supprimerParId = async (id) => {
    await pool.query('DELETE FROM abonnements WHERE id = $1', [id]);
};

module.exports = { creer, exister, trouverParEleve, supprimerParId };
