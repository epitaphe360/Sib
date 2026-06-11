/** Visuels SIB 40 ans — CDN sib.ma (plus de photos Google AI) */
import { FLAG_ICONS, SIB_PHOTOS_CDN, sibMaUpload } from './sibMaRemoteUrls';

export const SIB40_IMAGES = {
  hero: SIB_PHOTOS_CDN.heroHall,
  portraits: [
    sibMaUpload('ALW_3369_067b43b2aa_16e46cc9e8.jpg'),
    sibMaUpload('MUS_3588_01206249cb_110540f778.jpg'),
    sibMaUpload('ALW_3951_bde2fd255e_2bc047ae4c.jpg'),
    sibMaUpload('ALW_6459_33285f4622_3856730bca.jpg'),
  ],
  timeline: {
    y1986: sibMaUpload('MUS_3588_01206249cb_110540f778.jpg'),
    y2000: sibMaUpload('ALW_3951_bde2fd255e_2bc047ae4c.jpg'),
    y2012: sibMaUpload('ALW_6459_33285f4622_3856730bca.jpg'),
    y2022: SIB_PHOTOS_CDN.parc,
    y2026: SIB_PHOTOS_CDN.heroHall,
  },
  services: {
    exposer: SIB_PHOTOS_CDN.stand,
    visiter: SIB_PHOTOS_CDN.visitors,
    talks: SIB_PHOTOS_CDN.conferences,
    b2b: SIB_PHOTOS_CDN.b2b,
    diner: SIB_PHOTOS_CDN.inauguration,
    international: SIB_PHOTOS_CDN.international,
  },
  worldMap: SIB_PHOTOS_CDN.worldMap,
  ctaBg: SIB_PHOTOS_CDN.parc,
  flags: FLAG_ICONS,
} as const;
