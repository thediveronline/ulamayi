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
const routesEngagement = require('./routes/engagement.routes');
const routesEpreuve = require('./routes/epreuve.routes');
const routesIa = require('./routes/ia.routes');
const routesClasse = require('./routes/classe.routes');
const routesEtablissement = require('./routes/etablissement.routes');

const app = express();

// Important : indispensable derrière un reverse proxy (Nginx) pour lire correctement les IP réelles des utilisateurs
app.set('trust proxy', 1);

// helmet pour ajouter des en-têtes HTTP de sécurité pour protection XSS
app.use(helmet());

// cors pour permettre au front-end d'envoyer des requêtes au back-end
app.use(cors());

// pour permettre à Express de lire les corps de requêtes en format JSON
app.use(express.json());

// Limiteur de tentatives uniquement sur l'authentification (connexion/inscription) pour contrer le brute-force
const authLimiteur = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // 30 tentatives par IP toutes les 15 minutes (suffisant pour la connexion, n'impacte pas le reste)
    message: { message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Applique le limiteur uniquement aux routes d'authentification
app.use('/api/auth', authLimiteur, routesAuth);
app.use('/api/admin', routesAdmin);
app.use('/api/eleves', routesEleve);
app.use('/api/enseignants', routesEnseignant);
app.use('/api/parents', routesParent);
app.use('/api/publications', routesPublication);
app.use('/api/engagement', routesEngagement);
app.use('/api/epreuves', routesEpreuve);
app.use('/api/ia', routesIa);
app.use('/api/classes', routesClasse);
app.use('/api/etablissements', routesEtablissement);

// oute de test pour verifier que le serveur fonctionne
app.get('/', (req, res) => {
    res.status(200).json({ message: 'API Ulamyi - Serveur operationnel.' });
});

module.exports = app;
