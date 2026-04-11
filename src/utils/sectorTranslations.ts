/**
 * Utility function to translate sector names
 * Maps common sector values to translation keys
 */

export const getSectorTranslationKey = (sector: string | undefined): string => {
  if (!sector) return 'sector.other';
  
  const sectorMap: Record<string, string> = {
    'Technology': 'sector.technology',
    'technology': 'sector.technology',
    'Port Industry': 'sector.port_industry',
    'port industry': 'sector.port_industry',
    'Automation': 'sector.automation',
    'automation': 'sector.automation',
    'Equipment': 'sector.equipment',
    'equipment': 'sector.equipment',
    'Operations & Management': 'sector.operations_management',
    'operations & management': 'sector.operations_management',
    'Exploitation & Gestion': 'sector.operations_management',
    'exploitation & gestion': 'sector.operations_management',
  };
  
  return sectorMap[sector] || sector; // Return original if no mapping found
};

export const translateSector = (sector: string | undefined, t: (key: string) => string): string => {
  if (!sector) return '';
  
  const key = getSectorTranslationKey(sector);
  
  // Try to translate the key, if it exists in translations
  // If not, return the original sector name
  const translated = t(key);
  
  // If translation returns the same key (meaning it doesn't exist), return original sector
  return translated === key ? sector : translated;
};
