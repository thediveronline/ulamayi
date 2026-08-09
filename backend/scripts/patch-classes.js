// Script de patch : ajoute les nouvelles colonnes et tables sans toucher aux données existantes
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const pool = require('../config/connexion');

const patch = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Nouvelles colonnes dans la table classes
        await client.query('ALTER TABLE classes ADD COLUMN IF NOT EXISTS description TEXT');
        await client.query('ALTER TABLE classes ADD COLUMN IF NOT EXISTS prix NUMERIC(10, 2) DEFAULT 0');
        await client.query('ALTER TABLE classes ADD COLUMN IF NOT EXISTS planning TEXT');
        console.log('✅ Colonnes description/prix/planning ajoutées à classes');

        // Nouvelle table messages_classes
        await client.query(`
            CREATE TABLE IF NOT EXISTS messages_classes (
                id SERIAL PRIMARY KEY,
                classe_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
                expediteur_id INTEGER NOT NULL,
                role_expediteur VARCHAR(20) NOT NULL,
                nom_expediteur VARCHAR(100) NOT NULL,
                photo_expediteur TEXT,
                contenu TEXT,
                media_url TEXT,
                media_type VARCHAR(20),
                media_public_id TEXT,
                cree_le TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ Table messages_classes créée');

        await client.query('COMMIT');
        console.log('✅ Patch appliqué avec succès !');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Erreur patch :', err.message);
    } finally {
        client.release();
        process.exit(0);
    }
};

patch();
