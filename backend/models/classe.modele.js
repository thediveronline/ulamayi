// Modèle pour la gestion des classes, de la relation élèves-classes et du chat de classe
const pool = require('../config/connexion');

const creer = async ({ nom, niveau_scolaire, enseignant_id, description, prix, planning, logo_url }) => {
    const resultat = await pool.query(
        'INSERT INTO classes (nom, niveau_scolaire, enseignant_id, description, prix, planning, logo_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [nom, niveau_scolaire, enseignant_id, description || null, prix || 0, planning || null, logo_url || null]
    );
    return resultat.rows[0];
};

const modifier = async (id, { nom, niveau_scolaire, description, prix, planning, logo_url }) => {
    const resultat = await pool.query(
        `UPDATE classes 
         SET nom = COALESCE($1, nom),
             niveau_scolaire = COALESCE($2, niveau_scolaire),
             description = COALESCE($3, description),
             prix = COALESCE($4, prix),
             planning = COALESCE($5, planning),
             logo_url = COALESCE($6, logo_url)
         WHERE id = $7 RETURNING *`,
        [nom, niveau_scolaire, description, prix, planning, logo_url, id]
    );
    return resultat.rows[0];
};

const trouverParEnseignant = async (enseignant_id) => {
    const sql = `
        SELECT 
            c.*,
            ens.nom AS enseignant_nom,
            ens.prenom AS enseignant_prenom,
            ens.titre AS enseignant_titre,
            ens.matiere AS enseignant_matiere,
            ens.photo_profil AS enseignant_photo,
            COUNT(ec.eleve_id)::INTEGER as nombre_eleves
        FROM classes c
        JOIN enseignants ens ON c.enseignant_id = ens.id
        LEFT JOIN eleves_classes ec ON c.id = ec.classe_id
        WHERE c.enseignant_id = $1
        GROUP BY c.id, ens.id
        ORDER BY c.cree_le DESC
    `;
    const resultat = await pool.query(sql, [enseignant_id]);
    return resultat.rows;
};

const trouverToutes = async () => {
    const sql = `
        SELECT 
            c.*,
            ens.nom AS enseignant_nom,
            ens.prenom AS enseignant_prenom,
            ens.titre AS enseignant_titre,
            ens.matiere AS enseignant_matiere,
            ens.photo_profil AS enseignant_photo,
            COUNT(ec.eleve_id)::INTEGER as nombre_eleves
        FROM classes c
        LEFT JOIN enseignants ens ON c.enseignant_id = ens.id
        LEFT JOIN eleves_classes ec ON c.id = ec.classe_id
        GROUP BY c.id, ens.id
        ORDER BY c.cree_le DESC
    `;
    const resultat = await pool.query(sql);
    return resultat.rows;
};

const trouverParEleve = async (eleve_id) => {
    const sql = `
        SELECT 
            c.*,
            ens.nom AS enseignant_nom,
            ens.prenom AS enseignant_prenom,
            ens.titre AS enseignant_titre,
            ens.matiere AS enseignant_matiere,
            ens.photo_profil AS enseignant_photo,
            COUNT(ec_all.eleve_id)::INTEGER as nombre_eleves
        FROM eleves_classes ec
        JOIN classes c ON ec.classe_id = c.id
        LEFT JOIN enseignants ens ON c.enseignant_id = ens.id
        LEFT JOIN eleves_classes ec_all ON c.id = ec_all.classe_id
        WHERE ec.eleve_id = $1
        GROUP BY c.id, ens.id, ec.rejoint_le
        ORDER BY ec.rejoint_le DESC
    `;
    const resultat = await pool.query(sql, [eleve_id]);
    return resultat.rows;
};

const trouverParId = async (id) => {
    const sql = `
        SELECT 
            c.*,
            ens.nom AS enseignant_nom,
            ens.prenom AS enseignant_prenom,
            ens.titre AS enseignant_titre,
            ens.matiere AS enseignant_matiere,
            ens.photo_profil AS enseignant_photo,
            ens.numero_telephone AS enseignant_telephone,
            COUNT(ec.eleve_id)::INTEGER as nombre_eleves
        FROM classes c
        LEFT JOIN enseignants ens ON c.enseignant_id = ens.id
        LEFT JOIN eleves_classes ec ON c.id = ec.classe_id
        WHERE c.id = $1
        GROUP BY c.id, ens.id
    `;
    const resultat = await pool.query(sql, [id]);
    return resultat.rows[0];
};

const estEleveInscrit = async (classe_id, eleve_id) => {
    const sql = 'SELECT * FROM eleves_classes WHERE classe_id = $1 AND eleve_id = $2';
    const resultat = await pool.query(sql, [classe_id, eleve_id]);
    return resultat.rows.length > 0;
};

const ajouterEleve = async (classe_id, eleve_id) => {
    const resultat = await pool.query(
        'INSERT INTO eleves_classes (classe_id, eleve_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
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

// --- CHAT MESSAGES ---
const ajouterMessage = async ({ classe_id, expediteur_id, role_expediteur, nom_expediteur, photo_expediteur, contenu, media_url, media_type, media_public_id }) => {
    const sql = `
        INSERT INTO messages_classes 
        (classe_id, expediteur_id, role_expediteur, nom_expediteur, photo_expediteur, contenu, media_url, media_type, media_public_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
    `;
    const resultat = await pool.query(sql, [
        classe_id,
        expediteur_id,
        role_expediteur,
        nom_expediteur,
        photo_expediteur || null,
        contenu || null,
        media_url || null,
        media_type || null,
        media_public_id || null
    ]);
    return resultat.rows[0];
};

const listerMessages = async (classe_id) => {
    const sql = `
        SELECT 
            m.*,
            COALESCE(
                NULLIF(NULLIF(m.nom_expediteur, 'Utilisateur'), ''),
                CASE 
                    WHEN m.role_expediteur = 'enseignant' THEN NULLIF(TRIM(CONCAT(COALESCE(ens.titre, ''), ' ', COALESCE(ens.prenom, ''), ' ', COALESCE(ens.nom, ''))), '')
                    WHEN m.role_expediteur = 'eleve' THEN NULLIF(TRIM(CONCAT(COALESCE(el.prenom, ''), ' ', COALESCE(el.nom, ''))), '')
                    ELSE 'Utilisateur'
                END,
                'Utilisateur'
            ) AS nom_expediteur,
            COALESCE(
                m.photo_expediteur,
                CASE 
                    WHEN m.role_expediteur = 'enseignant' THEN ens.photo_profil
                    WHEN m.role_expediteur = 'eleve' THEN el.photo_profil
                    ELSE NULL
                END
            ) AS photo_expediteur
        FROM messages_classes m
        LEFT JOIN enseignants ens ON m.role_expediteur = 'enseignant' AND m.expediteur_id = ens.id
        LEFT JOIN eleves el ON m.role_expediteur = 'eleve' AND m.expediteur_id = el.id
        WHERE m.classe_id = $1
        ORDER BY m.cree_le ASC
    `;
    const resultat = await pool.query(sql, [classe_id]);
    return resultat.rows;
};

const listerMedias = async (classe_id) => {
    const sql = `
        SELECT id, nom_expediteur, media_url, media_type, cree_le
        FROM messages_classes
        WHERE classe_id = $1 AND media_url IS NOT NULL
        ORDER BY cree_le DESC
    `;
    const resultat = await pool.query(sql, [classe_id]);
    return resultat.rows;
};

module.exports = {
    creer,
    modifier,
    trouverParEnseignant,
    trouverToutes,
    trouverParEleve,
    trouverParId,
    estEleveInscrit,
    ajouterEleve,
    listerEleves,
    supprimerParId,
    ajouterMessage,
    listerMessages,
    listerMedias
};
