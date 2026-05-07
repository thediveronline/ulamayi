// sscript de migration pour cree toutes les tables dans la base de donnees

require('dotenv').config();
const pool = require('../config/connexion');

const creerTables = async () => {
    // On utilise une transaction : si une table echoue, on  annnule tout
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Suppression de la ligne DROP TABLE pour éviter de perdre les données
        // await client.query('DROP TABLE IF EXISTS notes_publications, commentaires, favoris, otps, publications, parents_eleves, parents, enseignants, eleves, administrateurs CASCADE');

        await client.query(`
            CREATE TABLE IF NOT EXISTS administrateurs (
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
            CREATE TABLE IF NOT EXISTS eleves (
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
            CREATE TABLE IF NOT EXISTS enseignants (
                id SERIAL PRIMARY KEY,
                nom VARCHAR(100) NOT NULL,
                prenom VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                mot_de_passe TEXT NOT NULL,
                matiere VARCHAR(100),
                titre VARCHAR(100), 
                numero_telephone VARCHAR(20),
                photo_profil TEXT,
                note_moyenne NUMERIC(3, 2) DEFAULT 0.00,
                nombre_avis INTEGER DEFAULT 0,
                est_verifie BOOLEAN DEFAULT false,
                cree_le TIMESTAMP DEFAULT NOW()
            )
        `);

        // Ajout des colonnes au cas où la table existe déjà (pour Neon.tech)
        await client.query('ALTER TABLE enseignants ADD COLUMN IF NOT EXISTS titre VARCHAR(100)');
        await client.query('ALTER TABLE enseignants ADD COLUMN IF NOT EXISTS numero_telephone VARCHAR(20)');

        await client.query(`
            CREATE TABLE IF NOT EXISTS parents (
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
            CREATE TABLE IF NOT EXISTS parents_eleves (
                id SERIAL PRIMARY KEY,
                parent_id INTEGER REFERENCES parents(id) ON DELETE CASCADE,
                eleve_id INTEGER REFERENCES eleves(id) ON DELETE CASCADE,
                UNIQUE(parent_id, eleve_id)
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS publications (
                id SERIAL PRIMARY KEY,
                titre VARCHAR(200) NOT NULL,
                description TEXT,
                contenu TEXT NOT NULL,
                media_url TEXT,
                media_type VARCHAR(20),
                media_public_id TEXT,
                niveau_scolaire VARCHAR(50) NOT NULL,
                prix NUMERIC(10, 2) DEFAULT 0,
                enseignant_id INTEGER REFERENCES enseignants(id) ON DELETE SET NULL,
                nombre_telechargements INTEGER DEFAULT 0,
                cree_le TIMESTAMP DEFAULT NOW()
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS favoris (
                id SERIAL PRIMARY KEY,
                utilisateur_id INTEGER NOT NULL,
                role_utilisateur VARCHAR(20) NOT NULL,
                publication_id INTEGER REFERENCES publications(id) ON DELETE CASCADE,
                cree_le TIMESTAMP DEFAULT NOW(),
                UNIQUE(utilisateur_id, role_utilisateur, publication_id)
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS commentaires (
                id SERIAL PRIMARY KEY,
                utilisateur_id INTEGER NOT NULL,
                role_utilisateur VARCHAR(20) NOT NULL,
                publication_id INTEGER REFERENCES publications(id) ON DELETE CASCADE,
                contenu TEXT NOT NULL,
                cree_le TIMESTAMP DEFAULT NOW()
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS notes_publications (
                id SERIAL PRIMARY KEY,
                utilisateur_id INTEGER NOT NULL,
                role_utilisateur VARCHAR(20) NOT NULL,
                publication_id INTEGER REFERENCES publications(id) ON DELETE CASCADE,
                note INTEGER CHECK (note >= 1 AND note <= 5),
                cree_le TIMESTAMP DEFAULT NOW(),
                UNIQUE(utilisateur_id, role_utilisateur, publication_id)
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS otps (
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
