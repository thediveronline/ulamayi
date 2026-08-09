// Configuration OpenRouter (API d'IA, compatible OpenAI)
// Variables d'environnement attendues dans .env :
//   OPENROUTER_API_KEY   - Cle API OpenRouter (https://openrouter.ai/keys)
//   OPENROUTER_MODEL     - Modele par defaut (ex: "openai/gpt-4o-mini")
//   OPENROUTER_BASE_URL  - (optionnel) URL de l'API, defaut OpenRouter

const BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const MODELE_DEFAUT = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

// Appelle l'API OpenRouter (format compatible OpenAI : /chat/completions)
// Retourne le texte de la reponse, ou null si l'IA n'est pas configuree / en echec.
const genererReponseIA = async ({ question, systeme = '' }) => {
    const cle = process.env.OPENROUTER_API_KEY;
    if (!cle) {
        console.warn('[OpenRouter] non configure (OPENROUTER_API_KEY manquante) - fallback mock.');
        return null;
    }

    const messages = [];
    if (systeme) {
        messages.push({ role: 'system', content: systeme });
    }
    messages.push({ role: 'user', content: question });

    try {
        const reponse = await fetch(`${BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cle}`,
                'HTTP-Referer': process.env.OPENROUTER_REFERER || 'https://ulamayi.online',
                'X-Title': process.env.OPENROUTER_TITLE || 'Ulamayi',
            },
            body: JSON.stringify({
                model: MODELE_DEFAUT,
                messages,
                temperature: 0.6,
                max_tokens: 600,
            }),
        });

        if (!reponse.ok) {
            const texte = await reponse.text();
            console.warn('[OpenRouter] erreur API :', reponse.status, texte.slice(0, 300));
            return null;
        }

        const donnees = await reponse.json();
        const contenu = donnees?.choices?.[0]?.message?.content;
        if (typeof contenu !== 'string' || !contenu.trim()) {
            console.warn('[OpenRouter] reponse vide ou inattendue.');
            return null;
        }

        return contenu.trim();
    } catch (erreur) {
        console.warn('[OpenRouter] echec appel :', erreur?.message || erreur);
        return null;
    }
};

module.exports = { genererReponseIA };
