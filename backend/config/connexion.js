// Connexion a la base de donnees PostgreSQL
// On utilise un "pool" de connexions pour supporter plusieurs utilisateurs en meme temps
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    // ombre max de connexions simultanees dans le pool
    max: 20,
    // on ferme une connexion inactive apres 30 secondes
    idleTimeoutMillis: 30000,
    // on abandonne si on ne peut pas obtenir une connexion en 2 secondes
    connectionTimeoutMillis: 2000,
});

module.exports = pool;
