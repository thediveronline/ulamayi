// Connexion a la base de donnees PostgreSQL
// On utilise un "pool" de connexions pour supporter plusieurs utilisateurs en meme temps
// Priorite : DATABASE_URL (ex: Neon.tech) > variables separees (dev local)
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

const pool = new Pool(config);

module.exports = pool;
