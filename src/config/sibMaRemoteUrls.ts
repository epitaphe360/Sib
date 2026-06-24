/**
 * URLs CDN sib.ma — les fichiers /mockup et /sib-ma ne sont pas versionnés localement.
 */
const CDN = 'https://sib.ma/backend/uploads';

export function sibMaUpload(filename: string, variant?: 'medium' | 'large'): string {
  const base = filename.replace(/^\/sib-ma\//, '');
  if (variant === 'large') return `${CDN}/large_${base}`;
  if (variant === 'medium') return `${CDN}/medium_${base}`;
  return `${CDN}/${base}`;
}

const MOCKUP_TO_CDN: Record<string, string> = {
  '/mockup/hero-hall.jpg': sibMaUpload('ALW_4646_e80870e56f_86f40519c5.jpg'),
  '/mockup/hero-hall.webp': sibMaUpload('ALW_4646_e80870e56f_86f40519c5.jpg'),
  '/mockup/hero-hall-2k.jpg': sibMaUpload('ALW_4646_e80870e56f_86f40519c5.jpg', 'large'),
  '/mockup/hero-hall-2k.webp': sibMaUpload('ALW_4646_e80870e56f_86f40519c5.jpg', 'large'),
  '/mockup/hero-photo.jpg': sibMaUpload('ALW_4646_e80870e56f_86f40519c5.jpg'),
  '/mockup/mission-group.jpg': sibMaUpload('1_a559ea5363.png'),
  '/mockup/mission-group.webp': sibMaUpload('1_a559ea5363.png'),
  '/mockup/reserve-bg.jpg': sibMaUpload('parc_exposition_eljadida_f4a9052968.png'),
  '/mockup/reserve-bg.webp': sibMaUpload('parc_exposition_eljadida_f4a9052968.png'),
  '/mockup/reserve-photo.jpg': sibMaUpload('parc_exposition_eljadida_f4a9052968.png'),
  '/mockup/reserve-photo.webp': sibMaUpload('parc_exposition_eljadida_f4a9052968.png'),
  '/mockup/international-map.jpg': sibMaUpload('main_5bd806f6fcced8760ced_e4e03ad1e4.png'),
  '/mockup/international-map.webp': sibMaUpload('main_5bd806f6fcced8760ced_e4e03ad1e4.png'),
  '/mockup/salon-card-1.jpg': sibMaUpload('2_1e3351c897.png'),
  '/mockup/salon-card-1.webp': sibMaUpload('2_1e3351c897.png'),
  '/mockup/salon-card-2.jpg': sibMaUpload('7_7474f5a087.png'),
  '/mockup/salon-card-2.webp': sibMaUpload('7_7474f5a087.png'),
  '/mockup/salon-card-3.jpg': sibMaUpload('3_c9f5820a94.png'),
  '/mockup/salon-card-3.webp': sibMaUpload('3_c9f5820a94.png'),
  '/mockup/salon-card-4.jpg': sibMaUpload('4_9d2cb5a776.png'),
  '/mockup/salon-card-4.webp': sibMaUpload('4_9d2cb5a776.png'),
  '/mockup/salon-card-5.jpg': sibMaUpload('1_a559ea5363.png'),
  '/mockup/salon-card-5.webp': sibMaUpload('1_a559ea5363.png'),
  '/mockup/salon-card-6.jpg': sibMaUpload('5_833920f28a.png'),
  '/mockup/salon-card-6.webp': sibMaUpload('5_833920f28a.png'),
  '/mockup/portrait-1.jpg': sibMaUpload('ALW_3369_067b43b2aa_16e46cc9e8.jpg'),
  '/mockup/portrait-1.webp': sibMaUpload('ALW_3369_067b43b2aa_16e46cc9e8.jpg'),
  '/mockup/portrait-2.jpg': sibMaUpload('MUS_3588_01206249cb_110540f778.jpg'),
  '/mockup/portrait-2.webp': sibMaUpload('MUS_3588_01206249cb_110540f778.jpg'),
  '/mockup/portrait-3.jpg': sibMaUpload('ALW_3951_bde2fd255e_2bc047ae4c.jpg'),
  '/mockup/portrait-3.webp': sibMaUpload('ALW_3951_bde2fd255e_2bc047ae4c.jpg'),
  '/mockup/portrait-4.jpg': sibMaUpload('ALW_6459_33285f4622_3856730bca.jpg'),
  '/mockup/portrait-4.webp': sibMaUpload('ALW_6459_33285f4622_3856730bca.jpg'),
  '/mockup/timeline-1.jpg': sibMaUpload('MUS_3588_01206249cb_110540f778.jpg'),
  '/mockup/timeline-1.webp': sibMaUpload('MUS_3588_01206249cb_110540f778.jpg'),
  '/mockup/timeline-2.jpg': sibMaUpload('ALW_3951_bde2fd255e_2bc047ae4c.jpg'),
  '/mockup/timeline-2.webp': sibMaUpload('ALW_3951_bde2fd255e_2bc047ae4c.jpg'),
  '/mockup/timeline-3.jpg': sibMaUpload('ALW_6459_33285f4622_3856730bca.jpg'),
  '/mockup/timeline-3.webp': sibMaUpload('ALW_6459_33285f4622_3856730bca.jpg'),
  '/mockup/timeline-4.jpg': sibMaUpload('ALW_4646_e80870e56f_86f40519c5.jpg'),
  '/mockup/timeline-4.webp': sibMaUpload('ALW_4646_e80870e56f_86f40519c5.jpg'),
  '/mockup/timeline-5.jpg': sibMaUpload('parc_exposition_eljadida_f4a9052968.png'),
  '/mockup/timeline-5.webp': sibMaUpload('parc_exposition_eljadida_f4a9052968.png'),
};

/** Fichiers /sib-ma/static/* locaux invalides → CDN officiel sib.ma */
const SIB_MA_STATIC: Record<string, string> = {
  '/sib-ma/static/hero.jpg': sibMaUpload('parc_exposition_eljadida_f4a9052968.png'),
  '/sib-ma/static/home.jpg': sibMaUpload('ALW_4646_e80870e56f_86f40519c5.jpg'),
  '/sib-ma/static/banner.jpg': sibMaUpload('ALW_4646_e80870e56f_86f40519c5.jpg'),
  '/sib-ma/static/section_01.jpg': sibMaUpload('7_7474f5a087.png'),
};

/** Résout un chemin /mockup/* ou /sib-ma/* vers l’URL CDN officielle. */
export function resolveHomeImage(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path in MOCKUP_TO_CDN) return MOCKUP_TO_CDN[path];
  if (path in SIB_MA_STATIC) return SIB_MA_STATIC[path];
  if (path.startsWith('/sib-ma/')) return sibMaUpload(path);
  return path;
}

export const SIB_PHOTOS_CDN = {
  heroHall: sibMaUpload('ALW_4646_e80870e56f_86f40519c5.jpg'),
  heroHall2k: sibMaUpload('ALW_4646_e80870e56f_86f40519c5.jpg', 'large'),
  parc: sibMaUpload('parc_exposition_eljadida_f4a9052968.png'),
  stand: sibMaUpload('2_1e3351c897.png'),
  visitors: sibMaUpload('7_7474f5a087.png'),
  conferences: sibMaUpload('3_c9f5820a94.png'),
  b2b: sibMaUpload('4_9d2cb5a776.png'),
  inauguration: sibMaUpload('1_a559ea5363.png'),
  international: sibMaUpload('5_833920f28a.png'),
  croac: sibMaUpload('ALW_4646_e80870e56f_86f40519c5.jpg'),
  worldMap: sibMaUpload('main_5bd806f6fcced8760ced_e4e03ad1e4.png'),
  demo: sibMaUpload('5_833920f28a.png'),
} as const;

export const FLAG_ICONS: Record<string, string> = {
  TR: 'https://flagcdn.com/w80/tr.png',
  CN: 'https://flagcdn.com/w80/cn.png',
  ES: 'https://flagcdn.com/w80/es.png',
  IT: 'https://flagcdn.com/w80/it.png',
  PT: 'https://flagcdn.com/w80/pt.png',
};
