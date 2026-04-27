// Service d'envoi d'emails applicatifs (OTP, notifications futures...)
// On centralise les templates ici pour qu'ils restent coherents et faciles a faire evoluer.
const { envoyerEmail } = require('../config/mailgun');

const APP_NOM = 'Ulamayi';

const gabaritOTPHtml = ({ code, minutes }) => `<!doctype html>
<html lang="fr">
<body style="margin:0;padding:0;background:#f5f7fb;font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#0f172a;">
  <div style="max-width:520px;margin:32px auto;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
    <div style="padding:24px 28px;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;">
      <h1 style="margin:0;font-size:22px;letter-spacing:-0.02em;">${APP_NOM}</h1>
      <p style="margin:4px 0 0;opacity:0.9;font-size:14px;">Vérification de ton adresse email</p>
    </div>
    <div style="padding:28px;">
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6;">Bonjour,</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
        Voici ton code de vérification à usage unique pour activer ton compte ${APP_NOM}&nbsp;:
      </p>
      <div style="margin:18px 0;padding:18px;border:1px dashed #cbd5e1;border-radius:12px;text-align:center;background:#f0f3fa;">
        <div style="font-size:32px;font-weight:800;letter-spacing:0.4em;color:#1d4ed8;">${code}</div>
      </div>
      <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#475569;">
        Ce code est valable pendant <strong>${minutes} minutes</strong>. Saisis-le sur la page de vérification pour activer ton compte.
      </p>
      <p style="margin:0;font-size:13px;line-height:1.6;color:#94a3b8;">
        Si tu n'es pas à l'origine de cette demande, tu peux ignorer ce message.
      </p>
    </div>
    <div style="padding:16px 28px;background:#f0f3fa;color:#94a3b8;font-size:12px;">
      © ${new Date().getFullYear()} ${APP_NOM} · Plateforme éducative
    </div>
  </div>
</body>
</html>`;

const gabaritOTPTexte = ({ code, minutes }) =>
    `Bonjour,\n\nVoici ton code de verification ${APP_NOM} : ${code}\n` +
    `Ce code est valable pendant ${minutes} minutes.\n\n` +
    `Si tu n'es pas a l'origine de cette demande, tu peux ignorer ce message.\n`;

// Envoie le code OTP par email. En dev, si Mailgun n'est pas configure ou si l'envoi
// echoue, on logue le code dans la console pour ne pas bloquer le developpement.
const envoyerCodeOTP = async ({ email, code, minutes = 10 }) => {
    try {
        const resultat = await envoyerEmail({
            to: email,
            subject: `Ton code de verification ${APP_NOM} : ${code}`,
            text: gabaritOTPTexte({ code, minutes }),
            html: gabaritOTPHtml({ code, minutes }),
        });
        if (resultat) {
            console.log(`[OTP] Email envoye a ${email}`);
        } else {
            // Mailgun non configure : fallback console pour le dev
            console.log(`[OTP] (dev) Code pour ${email} : ${code}`);
        }
        return resultat;
    } catch (erreur) {
        console.warn(`[OTP] echec envoi email a ${email}, fallback console :`, erreur?.message || erreur);
        console.log(`[OTP] (fallback) Code pour ${email} : ${code}`);
        return null;
    }
};

module.exports = { envoyerCodeOTP };
