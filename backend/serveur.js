// Point d'entree principal : demarre le serveur HTTP
// Toute la configuration Express est dans app.js
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('Serveur demarre sur le port ' + PORT);
    console.log('Environnement : ' + (process.env.NODE_ENV || 'development'));
});
