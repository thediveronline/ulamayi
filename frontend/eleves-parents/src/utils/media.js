// Helpers pour generer des URLs de transformation Cloudinary
// On insere les transformations juste apres /upload/ dans l'URL secure_url
// Cela permet d'avoir des vignettes optimisees sans devoir telecharger l'image complete.

const insererTransformation = (url, transformation) => {
  if (!url || typeof url !== 'string') return url;
  // Cloudinary secure_url : .../<cloud>/image/upload/<transformations?>/<public_id>.<ext>
  return url.replace('/upload/', `/upload/${transformation}/`);
};

// Vignette image : remplie, qualite et format auto
export const urlVignetteImage = (url, { largeur = 480, hauteur = 320 } = {}) => {
  if (!url) return null;
  return insererTransformation(url, `c_fill,w_${largeur},h_${hauteur},q_auto,f_auto`);
};

// Vignette PDF : Cloudinary peut rendre la premiere page en JPG via pg_1 + format jpg
export const urlVignettePdf = (url, { largeur = 480, hauteur = 320 } = {}) => {
  if (!url) return null;
  return insererTransformation(url, `pg_1,c_fill,w_${largeur},h_${hauteur},q_auto,f_jpg`);
};

// Vignette unifiee selon le type de media stocke
export const urlVignette = (publication, options = {}) => {
  if (!publication?.media_url) return null;
  if (publication.media_type === 'pdf') return urlVignettePdf(publication.media_url, options);
  if (publication.media_type === 'image') return urlVignetteImage(publication.media_url, options);
  return urlVignetteImage(publication.media_url, options);
};

// Image en grande taille pour la vue detail (qualite auto, largeur max raisonnable)
export const urlAffichageImage = (url, { largeur = 1200 } = {}) => {
  if (!url) return null;
  return insererTransformation(url, `c_limit,w_${largeur},q_auto,f_auto`);
};
