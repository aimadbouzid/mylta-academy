/**
 * Optimise une image sélectionnée par l'utilisateur (redimensionnement et compression WebP)
 * @param {File} file - Fichier image original
 * @param {number} maxWidth - Largeur maximale souhaitée (défaut: 1200px)
 * @returns {Promise<File>} Fichier compressé
 */
export const optimizeImage = (file, maxWidth = 1200) => {
  return new Promise((resolve, reject) => {
    if (!file.type.match(/image.*/)) {
      return reject(new Error('Le fichier n\'est pas une image.'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Redimensionner si trop grand
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir en WebP avec 80% de qualité
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Erreur de compression de l\'image.'));
            const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(optimizedFile);
          },
          'image/webp',
          0.8
        );
      };
      img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier.'));
    reader.readAsDataURL(file);
  });
};
