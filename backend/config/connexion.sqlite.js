// Connexion à la base de données SQLite pour développement local
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Chemin vers le fichier de base de données
const dbPath = path.join(__dirname, '..', process.env.SQLITE_DB_PATH || 'database.sqlite');

// Créer une connexion SQLite
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Erreur de connexion à SQLite:', err.message);
    } else {
        console.log('✅ Connecté à la base de données SQLite:', dbPath);
    }
});

// Wrapper pour simuler l'API de pg.Pool avec des Promises
const pool = {
    query: (text, params) => {
        return new Promise((resolve, reject) => {
            // Convertir les paramètres PostgreSQL ($1, $2) en paramètres SQLite (?, ?)
            const sqliteQuery = text.replace(/\$(\d+)/g, '?');
            
            // Déterminer si c'est un SELECT ou une modification
            const isSelect = /^\s*SELECT/i.test(sqliteQuery);
            const hasReturning = /RETURNING\s+\*/i.test(sqliteQuery);
            
            // Enlever le RETURNING * pour SQLite (non supporté)
            const cleanQuery = sqliteQuery.replace(/\s+RETURNING\s+\*/i, '');
            
            if (isSelect) {
                db.all(cleanQuery, params || [], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ rows, rowCount: rows.length });
                    }
                });
            } else {
                db.run(cleanQuery, params || [], function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        const result = { 
                            rows: [], 
                            rowCount: this.changes,
                            lastID: this.lastID 
                        };
                        
                        // Si RETURNING était demandé, récupérer la ligne insérée
                        if (hasReturning && this.lastID) {
                            // Extraire le nom de la table depuis la requête INSERT
                            const tableMatch = cleanQuery.match(/INSERT\s+INTO\s+(\w+)/i);
                            if (tableMatch) {
                                const tableName = tableMatch[1];
                                db.get(`SELECT * FROM ${tableName} WHERE id = ?`, [this.lastID], (err, row) => {
                                    if (!err && row) {
                                        result.rows = [row];
                                    }
                                    resolve(result);
                                });
                                return;
                            }
                        }
                        
                        resolve(result);
                    }
                });
            }
        });
    },
    
    end: () => {
        return new Promise((resolve, reject) => {
            db.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
};

module.exports = pool;
