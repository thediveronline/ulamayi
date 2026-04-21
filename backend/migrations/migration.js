// sscript de migration pour cree toutes les tables dans la base de donnees

require('dotenv').config();
const pool = require('../config/connexion');

const creerTables = async () => {
    // On utilise une transaction : si une table echoue, on  annnule tout
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query('DROP TABLE IF EXISTS otps, publications, parents_eleves, parents, enseignants, eleves, administrateurs CASCADE');

        await client.query(`
            CREATE TABLE administrateurs (
                id SERIAL PRIMARY KEY,
                nom VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                mot_de_passe TEXT NOT NULL,
                photo_profil TEXT,
                est_actif BOOLEAN DEFAULT true,
                cree_le TIMESTAMP DEFAULT NOW()
            )
        `);

        await client.query(`
            CREATE TABLE eleves (
                id SERIAL PRIMARY KEY,
                nom VARCHAR(100) NOT NULL,
                prenom VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                mot_de_passe TEXT NOT NULL,
                niveau_scolaire VARCHAR(50) NOT NULL,
                photo_profil TEXT,
                est_verifie BOOLEAN DEFAULT false,
                cree_le TIMESTAMP DEFAULT NOW()
            )
        `);

        await client.query(`
            CREATE TABLE enseignants (
                id SERIAL PRIMARY KEY,
                nom VARCHAR(100) NOT NULL,
                prenom VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                mot_de_passe TEXT NOT NULL,
                matiere VARCHAR(100),
                photo_profil TEXT,
                note_moyenne NUMERIC(3, 2) DEFAULT 0.00,
                nombre_avis INTEGER DEFAULT 0,
                est_verifie BOOLEAN DEFAULT false,
                cree_le TIMESTAMP DEFAULT NOW()
            )
        `);

        await client.query(`
            CREATE TABLE parents (
                id SERIAL PRIMARY KEY,
                nom VARCHAR(100) NOT NULL,
                prenom VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                mot_de_passe TEXT NOT NULL,
                photo_profil TEXT,
                est_verifie BOOLEAN DEFAULT false,
                cree_le TIMESTAMP DEFAULT NOW()
            )
        `);

        await client.query(`
            CREATE TABLE parents_eleves (
                id SERIAL PRIMARY KEY,
                parent_id INTEGER REFERENCES parents(id) ON DELETE CASCADE,
                eleve_id INTEGER REFERENCES eleves(id) ON DELETE CASCADE,
                UNIQUE(parent_id, eleve_id)
            )
        `);

        await client.query(`
            CREATE TABLE publications (
                id SERIAL PRIMARY KEY,
                titre VARCHAR(200) NOT NULL,
                description TEXT,
                contenu TEXT NOT NULL,
                media_url TEXT,
                niveau_scolaire VARCHAR(50) NOT NULL,
                prix NUMERIC(10, 2) DEFAULT 0,
                enseignant_id INTEGER REFERENCES enseignants(id) ON DELETE SET NULL,
                cree_le TIMESTAMP DEFAULT NOW()
            )
        `);

        await client.query(`
            CREATE TABLE otps (
                id SERIAL PRIMARY KEY,
                email VARCHAR(150) NOT NULL,
                code VARCHAR(6) NOT NULL,
                expire_le TIMESTAMP NOT NULL,
                cree_le TIMESTAMP DEFAULT NOW()
            )
        `);

        await client.query('COMMIT');
        console.log('Migration reussie : toutes les tables ont ete creees.');
    } catch (erreur) {
        await client.query('ROLLBACK');
        console.error('Echec de la migration :', erreur.message);
    } finally {
        client.release();
        process.exit(0);
    }
};

creerTables();
