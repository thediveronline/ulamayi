
const formData = require('form-data');
const Mailgun = require('mailgun.js');

let clientMailgun = null;

const obtenirClient = () => {
    if (clientMailgun) return clientMailgun;

    const cle = process.env.MAILGUN_API_KEY;
    if (!cle) return null;

    const mailgun = new Mailgun(formData);
    const url = (process.env.MAILGUN_REGION || '').toLowerCase() === 'eu'
        ? 'https://api.eu.mailgun.net'
        : 'https://api.mailgun.net';

    clientMailgun = mailgun.client({ username: 'api', key: cle, url });
    return clientMailgun;
};

// Envoie un email via Mailgun
// Si Mailgun n'est pas configure (cle/domaine manquants), on log et on retourne null
// pour ne pas casser le flux de l'application en dev.
const envoyerEmail = async ({ to, subject, text, html }) => {
    const client = obtenirClient();
    const domaine = process.env.MAILGUN_DOMAIN;
    const expediteur = process.env.MAILGUN_FROM;

    if (!client || !domaine || !expediteur) {
        console.warn('[Mailgun] non configure (MAILGUN_API_KEY / MAILGUN_DOMAIN / MAILGUN_FROM) - email ignore.');
        return null;
    }

    const message = { from: expediteur, to, subject, text };
    if (html) message.html = html;

    try {
        const resultat = await client.messages.create(domaine, message);
        return resultat;
    } catch (erreur) {
        console.warn('[Mailgun] envoi impossible :', erreur?.message || erreur);
        throw erreur;
    }
};

module.exports = { envoyerEmail };
