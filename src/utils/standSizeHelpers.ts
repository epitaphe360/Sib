/**
 * Utilitaires pour gérer la taille des stands
 */

/**
 * Extrait la surface du stand en m² à partir d'une chaîne de taille
 * @param standSize Exemple: "9m²", "18m²", "36m²", "54m²+"
 * @returns Nombre entier représentant la surface (9, 18, 36, 54)
 */
export const getStandAreaFromSize = (standSize: string | undefined): number => {
  if (!standSize) return 9;
  
  const sizeStr = String(standSize).toLowerCase().trim();
  
  if (sizeStr.includes('54') || sizeStr.includes('elite')) return 54;
  if (sizeStr.includes('36') || sizeStr.includes('premium')) return 36;
  if (sizeStr.includes('18') || sizeStr.includes('standard')) return 18;
  if (sizeStr.includes('9') || sizeStr.includes('basic')) return 9;
  
  return 9; // Défaut
};

/**
 * Convertit une surface en m² en libellé de taille standardisé
 * @param area Nombre entier (9, 18, 36, 54)
 * @returns Libellé standardisé
 */
export const getSizeFromArea = (area: number): string => {
  if (area >= 54) return '54m²+';
  if (area >= 36) return '36m²';
  if (area >= 18) return '18m²';
  return '9m²';
};
