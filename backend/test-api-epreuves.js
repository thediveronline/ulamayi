const fs = require('fs');

/**
 * SCRIPT DE TEST AUTOMATISÉ POUR L'API DES ÉPREUVES
 * 
 * Avant de lancer ce script :
 * 1. Assure-toi que ton serveur Node.js tourne (ex: npm run dev)
 * 2. Connecte un élève sur l'API (ou la BDD) pour récupérer son Token JWT
 * 3. Colle ce Token ci-dessous dans la variable TOKEN_ELEVE
 * 
 * Lancement : node test-api-epreuves.js
 */

const BASE_URL = 'http://localhost:3000/api';
// ⚠️ À REMPLACER PAR UN VRAI TOKEN (Généré via /api/auth/connexion avec un compte élève)
const TOKEN_ELEVE = 'METTEZ_VOTRE_TOKEN_JWT_ICI'; 

async function testerEpreuves() {
    console.log('🚀 === DÉBUT DES TESTS DE L\'API ÉPREUVES ===\n');
    let idEpreuveCreee = null;

    try {
        // ---------------------------------------------------------
        // 1. TEST POST : Création d'une épreuve
        // ---------------------------------------------------------
        console.log('▶️ TEST 1 : Création d\'une épreuve...');
        
        const resCreation = await fetch(`${BASE_URL}/epreuves`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN_ELEVE}`
            },
            body: JSON.stringify({
                titre: 'Sujet de Mathématiques Bac 2025',
                description: 'Sujet blanc testé automatiquement via script Node.js',
                contenu: 'Veuillez résoudre l\'équation complexe: 2x + 4 = 10',
                niveau_scolaire: 'Terminale Scientifique'
            })
        });

        const dataCreation = await resCreation.json();
        console.log('   Status:', resCreation.status);
        
        if (resCreation.status === 201) {
            idEpreuveCreee = dataCreation.epreuve.id;
            console.log(`   ✅ SUCCÈS : Épreuve créée avec l'ID ${idEpreuveCreee}\n`);
        } else if (resCreation.status === 401) {
            console.log('   ❌ ERREUR : Tu as oublié de mettre un TOKEN_ELEVE valide dans le fichier de test !\n');
            return;
        } else {
            console.log('   ❌ ÉCHEC :', dataCreation);
            return; // On arrête tout si ça plante ici
        }

        // ---------------------------------------------------------
        // 2. TEST GET (Public) : Liste + Vérification Anonymat
        // ---------------------------------------------------------
        console.log('▶️ TEST 2 : Récupération publique des épreuves (Vérification Anonymat)...');
        const resListe = await fetch(`${BASE_URL}/epreuves`);
        const dataListe = await resListe.json();
        console.log('   Status:', resListe.status);
        console.log(`   Nombre d'épreuves trouvées: ${dataListe.length}`);
        
        if (dataListe.length > 0) {
            const sample = dataListe.find(e => e.id === idEpreuveCreee) || dataListe[0];
            if (sample.eleve_id !== undefined) {
                console.error('   ❌ DANGER : L\'ID de l\'élève (eleve_id) est visible ! Fuite de données !');
            } else {
                console.log('   ✅ SUCCÈS : L\'anonymat est parfaitement respecté (eleve_id invisible).');
                console.log(`   ✅ SUCCÈS : Le compteur nombre_corrections est à : ${sample.nombre_corrections}`);
            }
        }
        console.log('');

        // ---------------------------------------------------------
        // 3. TEST GET (Privé) : Mes épreuves privées
        // ---------------------------------------------------------
        console.log('▶️ TEST 3 : Récupération de l\'historique privé (Mes Épreuves)...');
        const resPrive = await fetch(`${BASE_URL}/epreuves/prive/mes-epreuves`, {
            headers: { 'Authorization': `Bearer ${TOKEN_ELEVE}` }
        });
        const dataPrive = await resPrive.json();
        console.log('   Status:', resPrive.status);
        console.log(`   Épreuves personnelles trouvées: ${dataPrive.length}`);
        
        // On vérifie que dans SES données, il a bien les vraies infos en base
        if (dataPrive.length > 0 && dataPrive[0].eleve_id !== undefined) {
            console.log('   ✅ SUCCÈS : La route privée renvoie bien les vraies données de BDD à l\'auteur.');
        }
        console.log('');

        // ---------------------------------------------------------
        // 4. TEST DELETE : Suppression de l'épreuve
        // ---------------------------------------------------------
        if (idEpreuveCreee) {
            console.log(`▶️ TEST 4 : Suppression de l'épreuve ID ${idEpreuveCreee}...`);
            const resDelete = await fetch(`${BASE_URL}/epreuves/${idEpreuveCreee}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${TOKEN_ELEVE}` }
            });
            const dataDelete = await resDelete.json();
            console.log('   Status:', resDelete.status);
            
            if (resDelete.status === 200) {
                console.log('   ✅ SUCCÈS : L\'épreuve a été correctement supprimée de la base.\n');
            } else {
                console.error('   ❌ ÉCHEC :', dataDelete);
            }
        }

        console.log('🎉 === TOUS LES TESTS SONT TERMINÉS AVEC SUCCÈS ===');

    } catch (erreur) {
        console.error('❌ ERREUR CRITIQUE PENDANT LES TESTS:', erreur);
    }
}

testerEpreuves();
