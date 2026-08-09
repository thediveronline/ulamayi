const etablissementModele = require('../models/etablissement.modele');

const listerEtablissements = async () => {
    return await etablissementModele.trouverTous();
};

const validerEtablissement = async (id) => {
    const etablissement = await etablissementModele.trouverParId(id);
    if (!etablissement) {
        throw { status: 404, message: 'Établissement introuvable.' };
    }
    return await etablissementModele.validerEtablissement(id, true);
};

module.exports = {
    listerEtablissements,
    validerEtablissement
};
