// Modele de la table "enseignants"
const pool = require('../config/connexion');

const trouverParEmail = async (email) => {
    const resultat = await pool.query('SELECT * FROM enseignants WHERE email = $1', [email]);
    return resultat.rows[0];
};

const trouverParId = async (id) => {
    const resultat = await pool.query(
        'SELECT id, nom, prenom, email, matiere, photo_profil, note_moyenne, nombre_avis, est_verifie, cree_le FROM enseignants WHERE id = $1',
        [id]
    );
    return resultat.rows[0];
};

const trouverTous = async () => {
    const resultat = await pool.query(
        'SELECT id, nom, prenom, email, matiere, photo_profil, note_moyenne, nombre_avis, est_verifie, cree_le FROM enseignants ORDER BY cree_le DESC'
    );
    return resultat.rows;
};

const creer = async ({ nom, prenom, email, mot_de_passe, matiere }) => {
    const resultat = await pool.query(
        'INSERT INTO enseignants (nom, prenom, email, mot_de_passe, matiere) VALUES ($1, $2, $3, $4, $5) RETURNING id, nom, prenom, email',
        [nom, prenom, email, mot_de_passe, matiere]
    );
    return resultat.rows[0];
};

const activerCompte = async (email) => {
    await pool.query('UPDATE enseignants SET est_verifie = true WHERE email = $1', [email]);
};

const modifierParId = async (id, { nom, prenom, matiere, photo_profil }) => {
    const resultat = await pool.query(
        'UPDATE enseignants SET nom = $1, prenom = $2, matiere = $3, photo_profil = $4 WHERE id = $5 RETURNING id, nom, prenom, email, matiere, photo_profil',
        [nom, prenom, matiere, photo_profil, id]
    );
    return resultat.rows[0];
};

// Permet de mettre a jour la note d'un enseignant lorsqu'un parent/eleve donne un avis
const noterEnseignant = async (id, nouvelleNote) => {
    const resultat = await pool.query(
        `UPDATE enseignants 
     SET note_moyenne = ((note_moyenne * nombre_avis) + $1) / (nombre_avis + 1),
         nombre_avis = nombre_avis + 1
     WHERE id = $2 RETURNING id, note_moyenne, nombre_avis`,
        [nouvelleNote, id]
    );
    return resultat.rows[0];
};

const mettreAJour = async (id, { nom, prenom, mot_de_passe, matiere }) => {
    const resultat = await pool.query(
        'UPDATE enseignants SET nom = $1, prenom = $2, mot_de_passe = $3, matiere = $4 WHERE id = $5 RETURNING id',
        [nom, prenom, mot_de_passe, matiere, id]
    );
    return resultat.rows[0];
};

module.exports = { trouverParEmail, trouverParId, trouverTous, creer, activerCompte, modifierParId, noterEnseignant, mettreAJour };
