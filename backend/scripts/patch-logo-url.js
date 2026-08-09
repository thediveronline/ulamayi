const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = require('../config/connexion');

async function patchLogoUrl() {
    try {
        console.log('Ajout de la colonne logo_url dans classes si absente...');
        await pool.query(`
            ALTER TABLE classes ADD COLUMN IF NOT EXISTS logo_url TEXT;
        `);
        console.log('✅ Base de données mise à jour avec succès !');
        process.exit(0);
    } catch (err) {
        console.error('❌ Erreur lors de la mise à jour de la BD:', err.message || err);
        process.exit(1);
    }
}

patchLogoUrl();
