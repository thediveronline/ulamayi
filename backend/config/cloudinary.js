// Configuration du SDK Cloudinary v2
// Les variables d'environnement attendues dans .env :
//   CLOUDINARY_CLOUD_NAME
//   CLOUDINARY_API_KEY
//   CLOUDINARY_API_SECRET
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

// Upload d'un buffer (memoire) vers Cloudinary
// On utilise upload_stream pour ne pas avoir a ecrire le fichier sur le disque
const uploaderBuffer = (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const flux = cloudinary.uploader.upload_stream(
            { resource_type: 'auto', folder: 'ulamayi/publications', ...options },
            (erreur, resultat) => {
                if (erreur) return reject(erreur);
                resolve(resultat);
            }
        );
        flux.end(buffer);
    });
};

const supprimerMedia = async (publicId, resourceType = 'image') => {
    if (!publicId) return null;
    try {
        return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (erreur) {
        console.warn('[Cloudinary] suppression impossible :', erreur.message);
        return null;
    }
};

module.exports = { cloudinary, uploaderBuffer, supprimerMedia };
