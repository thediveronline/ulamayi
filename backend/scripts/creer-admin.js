const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { hacherMotDePasse } = require('../utils/hachage.util');
const pool = require('../config/connexion');

async function tout() {
    const email = 'dukram.nsounjou@ens-uy1.cm';
    const motDePasseClair = 'Nuttertools2.0';
    const nom = 'Dukram Nsounjou';

    try {
        const hash = await hacherMotDePasse(motDePasseClair);

        // Vérifier si l'admin existe déjà
        const existant = await pool.query('SELECT * FROM administrateurs WHERE email = $1', [email]);

        if (existant.rows.length > 0) {
            // Mettre à jour le mot de passe s'il existe
            await pool.query(
                'UPDATE administrateurs SET mot_de_passe = $1, est_actif = true WHERE email = $2',
                [hash, email]
            );
            console.log(`✅ Mot de passe mis à jour pour l'administrateur : ${email}`);
        } else {
            // Insérer le nouvel administrateur
            const res = await pool.query(
                'INSERT INTO administrateurs (nom, email, mot_de_passe, est_actif) VALUES ($1, $2, $3, true) RETURNING id, nom, email',
                [nom, email, hash]
            );
            console.log(`✅ Administrateur créé avec succès ! ID: ${res.rows[0].id}, Email: ${res.rows[0].email}`);
        }
    } catch (err) {
        console.error('❌ Erreur lors de la création de l\'administrateur :', err.message || err);
    } finally {
        process.exit(0);
    }
}

tout();
