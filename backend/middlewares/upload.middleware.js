// Middleware multer en memoire pour reception d'un fichier media (image ou PDF)
// Le fichier est ensuite uploade vers Cloudinary depuis le service
const multer = require('multer');

const TYPES_AUTORISES = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
]);

const stockageMemoire = multer.memoryStorage();

const filtreType = (req, fichier, cb) => {
    if (TYPES_AUTORISES.has(fichier.mimetype)) {
        return cb(null, true);
    }
    return cb(new Error(`Type de fichier non autorise : ${fichier.mimetype}. Formats acceptes : JPG, PNG, WEBP, GIF, PDF.`));
};

const upload = multer({
    storage: stockageMemoire,
    fileFilter: filtreType,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo max
});

// Middleware qui accepte un seul fichier sous le champ "media"
// et tolere une requete sans fichier (les autres champs restent dans req.body)
const uploadMedia = (req, res, next) => {
    upload.single('media')(req, res, (erreur) => {
        if (erreur instanceof multer.MulterError) {
            if (erreur.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'Fichier trop volumineux (max 10 Mo).' });
            }
            return res.status(400).json({ message: erreur.message });
        }
        if (erreur) {
            return res.status(400).json({ message: erreur.message });
        }
        next();
    });
};

module.exports = { uploadMedia };
