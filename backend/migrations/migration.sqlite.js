// Script de migration SQLite - Adapté depuis la version PostgreSQL
// SQLite différences: SERIAL -> INTEGER PRIMARY KEY AUTOINCREMENT, TIMESTAMP -> TEXT, etc.

require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', process.env.SQLITE_DB_PATH || 'database.sqlite');

const creerTables = () => {
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('❌ Erreur de connexion:', err.message);
            process.exit(1);
        }
        console.log('✅ Connecté à SQLite:', dbPath);
    });

    // SQLite: les transactions manuelles avec serialize
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // Administrateurs
        db.run(`
            CREATE TABLE IF NOT EXISTS administrateurs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nom TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                mot_de_passe TEXT NOT NULL,
                photo_profil TEXT,
                est_actif INTEGER DEFAULT 1,
                cree_le TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Eleves
        db.run(`
            CREATE TABLE IF NOT EXISTS eleves (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nom TEXT NOT NULL,
                prenom TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                mot_de_passe TEXT NOT NULL,
                niveau_scolaire TEXT NOT NULL,
                photo_profil TEXT,
                est_verifie INTEGER DEFAULT 0,
                cree_le TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Enseignants
        db.run(`
            CREATE TABLE IF NOT EXISTS enseignants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nom TEXT NOT NULL,
                prenom TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                mot_de_passe TEXT NOT NULL,
                matiere TEXT,
                titre TEXT,
                numero_telephone TEXT,
                photo_profil TEXT,
                note_moyenne REAL DEFAULT 0.00,
                nombre_avis INTEGER DEFAULT 0,
                est_verifie INTEGER DEFAULT 0,
                cree_le TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Parents
        db.run(`
            CREATE TABLE IF NOT EXISTS parents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nom TEXT NOT NULL,
                prenom TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                mot_de_passe TEXT NOT NULL,
                photo_profil TEXT,
                est_verifie INTEGER DEFAULT 0,
                cree_le TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Parents_Eleves (relation many-to-many)
        db.run(`
            CREATE TABLE IF NOT EXISTS parents_eleves (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                parent_id INTEGER,
                eleve_id INTEGER,
                FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
                FOREIGN KEY (eleve_id) REFERENCES eleves(id) ON DELETE CASCADE,
                UNIQUE(parent_id, eleve_id)
            )
        `);

        // Publications
        db.run(`
            CREATE TABLE IF NOT EXISTS publications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titre TEXT NOT NULL,
                description TEXT,
                contenu TEXT NOT NULL,
                media_url TEXT,
                media_type TEXT,
                media_public_id TEXT,
                niveau_scolaire TEXT NOT NULL,
                prix REAL DEFAULT 0,
                enseignant_id INTEGER,
                nombre_telechargements INTEGER DEFAULT 0,
                cree_le TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (enseignant_id) REFERENCES enseignants(id) ON DELETE SET NULL
            )
        `);

        // Favoris
        db.run(`
            CREATE TABLE IF NOT EXISTS favoris (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                utilisateur_id INTEGER NOT NULL,
                role_utilisateur TEXT NOT NULL,
                publication_id INTEGER,
                cree_le TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE,
                UNIQUE(utilisateur_id, role_utilisateur, publication_id)
            )
        `);

        // Commentaires
        db.run(`
            CREATE TABLE IF NOT EXISTS commentaires (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                utilisateur_id INTEGER NOT NULL,
                role_utilisateur TEXT NOT NULL,
                publication_id INTEGER,
                contenu TEXT NOT NULL,
                cree_le TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE
            )
        `);

        // Notes Publications
        db.run(`
            CREATE TABLE IF NOT EXISTS notes_publications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                utilisateur_id INTEGER NOT NULL,
                role_utilisateur TEXT NOT NULL,
                publication_id INTEGER,
                note INTEGER CHECK (note >= 1 AND note <= 5),
                cree_le TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE,
                UNIQUE(utilisateur_id, role_utilisateur, publication_id)
            )
        `);

        // OTPs
        db.run(`
            CREATE TABLE IF NOT EXISTS otps (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                code TEXT NOT NULL,
                expire_le TEXT NOT NULL,
                cree_le TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Epreuves
        db.run(`
            CREATE TABLE IF NOT EXISTS epreuves (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                eleve_id INTEGER,
                titre TEXT NOT NULL,
                description TEXT,
                contenu TEXT NOT NULL,
                media_url TEXT,
                media_type TEXT,
                media_public_id TEXT,
                niveau_scolaire TEXT NOT NULL,
                nombre_telechargements INTEGER DEFAULT 0,
                cree_le TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (eleve_id) REFERENCES eleves(id) ON DELETE CASCADE
            )
        `);

        // Corrections
        db.run(`
            CREATE TABLE IF NOT EXISTS corrections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                enseignant_id INTEGER,
                epreuve_id INTEGER,
                titre TEXT NOT NULL,
                description TEXT,
                contenu TEXT NOT NULL,
                media_url TEXT,
                media_type TEXT,
                media_public_id TEXT,
                prix REAL DEFAULT 0,
                nombre_telechargements INTEGER DEFAULT 0,
                cree_le TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (enseignant_id) REFERENCES enseignants(id) ON DELETE SET NULL,
                FOREIGN KEY (epreuve_id) REFERENCES epreuves(id) ON DELETE CASCADE
            )
        `);

        // Abonnements
        db.run(`
            CREATE TABLE IF NOT EXISTS abonnements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                eleve_id INTEGER,
                correction_id INTEGER,
                cree_le TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (eleve_id) REFERENCES eleves(id) ON DELETE CASCADE,
                FOREIGN KEY (correction_id) REFERENCES corrections(id) ON DELETE CASCADE,
                UNIQUE(eleve_id, correction_id)
            )
        `);

        // Etablissements
        db.run(`
            CREATE TABLE IF NOT EXISTS etablissements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nom TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                mot_de_passe TEXT NOT NULL,
                adresse TEXT,
                telephone TEXT,
                photo_profil TEXT,
                est_verifie INTEGER DEFAULT 0,
                cree_le TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Classes
        db.run(`
            CREATE TABLE IF NOT EXISTS classes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nom TEXT NOT NULL,
                niveau_scolaire TEXT NOT NULL,
                enseignant_id INTEGER,
                cree_le TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (enseignant_id) REFERENCES enseignants(id) ON DELETE CASCADE
            )
        `);

        // Eleves_Classes
        db.run(`
            CREATE TABLE IF NOT EXISTS eleves_classes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                eleve_id INTEGER,
                classe_id INTEGER,
                rejoint_le TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (eleve_id) REFERENCES eleves(id) ON DELETE CASCADE,
                FOREIGN KEY (classe_id) REFERENCES classes(id) ON DELETE CASCADE,
                UNIQUE(eleve_id, classe_id)
            )
        `);

        // Historique IA
        db.run(`
            CREATE TABLE IF NOT EXISTS historique_ia (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                eleve_id INTEGER,
                question TEXT NOT NULL,
                reponse TEXT NOT NULL,
                cree_le TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (eleve_id) REFERENCES eleves(id) ON DELETE CASCADE
            )
        `, (err) => {
            if (err) {
                console.error('❌ Erreur lors de la création des tables:', err.message);
                db.run('ROLLBACK');
                db.close();
                process.exit(1);
            } else {
                db.run('COMMIT', (err) => {
                    if (err) {
                        console.error('❌ Erreur lors du commit:', err.message);
                    } else {
                        console.log('✅ Migration réussie : toutes les tables SQLite ont été créées.');
                    }
                    db.close();
                    process.exit(0);
                });
            }
        });
    });
};

creerTables();
