// Module d'Intelligence Artificielle (Tuteur Virtuel)
// Utilise OpenRouter (API d'IA compatible OpenAI) pour generer les reponses.
// Si OpenRouter n'est pas configure (pas de cle API), on retombe sur un mock local.
const pool = require('../config/connexion');
const { genererReponseIA } = require('../config/openrouter');

// Prompt systeme : on guide l'IA pour qu'elle se comporte comme un tuteur pedagogique
const PROMPT_SYSTEME = `Tu es un professeur de soutien scolaire sur la plateforme Ulamayi.
Aide l'élève à comprendre et à progresser, sans jamais lui donner directement la réponse brute.
Guide-le par des questions, des indices et des explications pédagogiques adaptées à son niveau.
Réponds en français, de manière claire, bienveillante et structurée (courts paragraphes ou listes si utile).`;

const genererReponseMock = (question) => {
    const motsClesMaths = ['calcul', 'équation', 'théorème', 'x', 'addition', 'multiplication', 'algèbre', 'géométrie'];
    const estQuestionMaths = motsClesMaths.some((mot) => question.toLowerCase().includes(mot));

    if (estQuestionMaths) {
        return "En tant que tuteur virtuel, je te conseille de revoir les priorités opératoires. N'oublie pas que la multiplication est prioritaire sur l'addition. Que trouves-tu si tu tentes d'isoler 'x' de l'autre côté du signe égal ?";
    }

    return "C'est une excellente question ! Pourrais-tu me préciser de quelle matière il s'agit et me donner le contexte de ton exercice ? Ainsi, je pourrai t'aiguiller sans te donner directement la réponse.";
};

const poserQuestion = async (eleveId, question) => {
    // Étape 1 : Validation
    if (!question || question.trim().length < 5) {
        throw { status: 400, message: "Ta question est trop courte, essaie de détailler un peu plus ton problème." };
    }

    // Étape 2 : Génération de la réponse via OpenRouter (fallback mock si non configuré)
    let reponseIa = await genererReponseIA({ question, systeme: PROMPT_SYSTEME });
    if (!reponseIa) {
        reponseIa = genererReponseMock(question);
    }
    // Étape 3 : Sauvegarde de l'historique dans la base de données
    const resultat = await pool.query(
        'INSERT INTO historique_ia (eleve_id, question, reponse) VALUES ($1, $2, $3) RETURNING *',
        [eleveId, question, reponseIa]
    );

    return resultat.rows[0];
};

const historiqueEleve = async (eleveId) => {
    // Récupère les 20 derniers échanges de l'élève avec l'IA
    const resultat = await pool.query(
        'SELECT * FROM historique_ia WHERE eleve_id = $1 ORDER BY cree_le DESC LIMIT 20',
        [eleveId]
    );
    return resultat.rows;
};

module.exports = {
    poserQuestion,
    historiqueEleve
};
