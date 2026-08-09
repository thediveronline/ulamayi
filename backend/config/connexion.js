// Connexion a la base de donnees
// Supporte PostgreSQL (production/Neon.tech) et SQLite (dev local)
// Utilise SQLite si DB_TYPE=sqlite dans .env, sinon PostgreSQL

const dbType = process.env.DB_TYPE || 'postgresql';

let pool;

if (dbType === 'sqlite') {
    // Mode SQLite pour développement local
    console.log('🔧 Mode base de données: SQLite');
    pool = require('./connexion.sqlite');
} else {
    // Mode PostgreSQL (par défaut)
    console.log('🔧 Mode base de données: PostgreSQL');
    const { Pool } = require('pg');
    
    const config = process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        }
        : {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        };

    pool = new Pool(config);
}

module.exports = pool;
