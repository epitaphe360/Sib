/**
 * Photos officielles SIB — résolues directement vers le CDN sib.ma.
 * Les fichiers /mockup et /sib-ma ne sont PAS versionnés localement ;
 * on pointe donc vers les URLs CDN pour éviter les 404 (hero, portraits…).
 * Utilisés en priorité sur Unsplash pour toutes les pages /accueil/*.
 */
import { sibMaUpload } from './sibMaRemoteUrls';

export const SIB_PHOTOS = {
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
} as const;
