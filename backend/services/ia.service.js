// Prototype du Module d'Intelligence Artificielle (Tuteur Virtuel)
const pool = require('../config/connexion');

// TODO V2 Finale : Installer un SDK officiel via npm (ex: npm install @google/genai)
// et configurer la clé API ici :
// const { GoogleGenAI } = require('@google/genai');
// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const poserQuestion = async (eleveId, question) => {
    // Étape 1 : Validation
    if (!question || question.trim().length < 5) {
        throw { status: 400, message: "Ta question est trop courte, essaie de détailler un peu plus ton problème." };
    }

    // Étape 2 : Prototype de réponse IA (Mock)
    // Dans la version finale de la V2, c'est ici qu'on appelle l'API de l'IA (ex: Gemini) 
    // en injectant un "Prompt Système" (ex: "Tu es un professeur de soutien scolaire, aide l'élève sans donner la réponse brute")
    let reponseIa = "";
    
    const motsClesMaths = ['calcul', 'équation', 'théorème', 'x'];
    const estQuestionMaths = motsClesMaths.some(mot => question.toLowerCase().includes(mot));

    if (estQuestionMaths) {
        reponseIa = "En tant que tuteur virtuel, je te conseille de revoir les priorités opératoires. N'oublie pas que la multiplication est prioritaire sur l'addition. Que trouves-tu si tu tentes d'isoler 'x' de l'autre côté du signe égal ?";
    } else {
        reponseIa = "C'est une excellente question ! Pourrais-tu me préciser de quelle matière il s'agit et me donner le contexte de ton exercice ? Ainsi, je pourrai t'aiguiller sans te donner directement la réponse.";
    }

    // On simule le temps de traitement typique d'une requête vers un LLM (1.5 secondes)
    await new Promise(resolve => setTimeout(resolve, 1500));

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
