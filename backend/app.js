// Point d'entree de l'application Express
// ici je confgure tous les les  middlewares globaux et montage des routes
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const routesAuth = require('./routes/authentification.routes');
const routesAdmin = require('./routes/administrateur.routes');
const routesEleve = require('./routes/eleve.routes');
const routesEnseignant = require('./routes/enseignant.routes');
const routesParent = require('./routes/parent.routes');
const routesPublication = require('./routes/publication.routes');

const app = express();

// helmet pour  ajouter des en-tetes HTTP de securite pour  protection XSS
app.use(helmet());

// cors pour  permetre  front-end  d'envoyer des requetes au back-end
app.use(cors());

// pour permet a Express de lire les corps de requetes en format JSON
app.use(express.json());

// on limite  le nombre de requetes par a 100 maxs toutes les 15 minutes pour eviter les attQUES BRUTEFORCE

const limiteur = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: 'Trop de requetes. Veuillez reessayer dans 15 minutes.' },
});
app.use(limiteur);

// montage des routes sur leurs prefixes respectifs
app.use('/api/auth', routesAuth);
app.use('/api/admin', routesAdmin);
app.use('/api/eleves', routesEleve);
app.use('/api/enseignants', routesEnseignant);
app.use('/api/parents', routesParent);
app.use('/api/publications', routesPublication);

// oute de test pour verifier que le serveur fonctionne
app.get('/', (req, res) => {
    res.status(200).json({ message: 'API Ulamyi - Serveur operationnel.' });
});

module.exports = app;
