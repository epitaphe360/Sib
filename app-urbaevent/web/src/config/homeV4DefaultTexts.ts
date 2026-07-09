import { HOME_V4_STAT_CMS_KEYS, HOME_V4_TEXT_CMS_MAP } from './homeV4TextCmsConfig';

type Lang = 'fr' | 'en' | 'ar';

/** Textes par défaut de public/sib2026-home-v4/i18n.js (source de vérité home v4). */
const HOME_V4_I18N: Record<Lang, Record<string, string>> = {
  fr: {
    'nav.about': 'À PROPOS',
    'nav.exhibit': 'EXPOSER',
    'nav.visit': 'VISITER',
    'nav.program': 'PROGRAMME',
    'nav.talks': 'SIB TALKS',
    'nav.exhibitors': 'EXPOSANTS',
    'nav.press': 'PRESSE',
    'nav.infos': 'INFOS PRATIQUES',
    'cta.reserve': 'RÉSERVER UN STAND',
    'hero.eyebrow': 'SALON INTERNATIONAL DU BÂTIMENT',
    'hero.h2': '40 ANS D\'HÉRITAGE.<br>UNE VISION TOURNÉE<br>VERS L\'AVENIR.',
    'hero.intro': 'Le plus grand rendez-vous du bâtiment, de l\'architecture et de l\'innovation constructive au Maroc.',
    'hero.date': '25 › 29 NOVEMBRE 2026',
    'hero.venue': 'PARC D\'EXPOSITION MOHAMMED VI<br><small>EL JADIDA</small>',
    'hero.cta_stand': 'RÉSERVER UN STAND →',
    'hero.cta_visitor': 'PRÉ-ENREGISTREMENT VISITEUR →',
    'numbers.title': 'SIB EN CHIFFRES',
    'heritage.kicker': 'QUATRE DÉCENNIES D\'ENGAGEMENT AUX CÔTÉS DES PROFESSIONNELS DU BÂTIMENT.',
    'heritage.title': '<span>40 ANS</span> DE CONSTRUCTION',
    'ecosystem.title': 'L\'ÉCOSYSTÈME<br>DU BÂTIMENT',
    'ecosystem.desc': 'Le SIB réunit tous les acteurs et les solutions qui façonnent le secteur du bâtiment.',
    'ecosystem.cta': 'DÉCOUVRIR TOUS<br>LES UNIVERS →',
    'legacy.title': '<span>40 ANS</span><br>AUX CÔTÉS DE CEUX QUI<br>CONSTRUISENT LE MAROC.',
    'legacy.cta': 'DÉCOUVRIR LEUR HISTOIRE →',
    'univers.title': 'LES UNIVERS DU SIB',
    'talks.subtitle': 'DÉBATS, CONFÉRENCES ET INSPIRATIONS',
    'talks.desc': 'Des experts internationaux pour décrypter les tendances, partager les innovations et imaginer ensemble la ville de demain.',
    'talks.cta': 'DÉCOUVRIR LE PROGRAMME →',
    'partners.kicker': 'INSTITUTIONS, FÉDÉRATIONS ET EXPOSANTS OFFICIELS',
    'partners.title': 'ORGANISATEURS & <span>SPONSOR OFFICIEL</span>',
    'partners.desc': 'Un salon porté par les acteurs institutionnels et les exposants du bâtiment au Maroc.',
    'partners.cta': 'VOIR TOUS LES EXPOSANTS →',
    'quick.plan': 'PLAN INTERACTIF<br>DU SALON',
    'quick.exhibit.title': 'EXPOSER AU SIB 2026',
    'quick.exhibit.desc': 'BOOSTEZ VOTRE VISIBILITÉ',
    'quick.visit.title': 'VISITER LE SALON',
    'quick.visit.desc': 'PRÉ-ENREGISTREZ-VOUS<br>DÈS MAINTENANT',
    'footer.date': '▣ 25 › 29 NOVEMBRE 2026<br>⌖ PARC D\'EXPOSITION MOHAMMED VI',
    'footer.about': 'À PROPOS',
    'footer.exhibit': 'EXPOSER',
    'footer.visit': 'VISITER',
    'footer.program': 'PROGRAMME',
    'footer.newsletter': 'NEWSLETTER',
    'footer.newsletter.desc': 'Restez informé de l\'actualité du SIB',
    'footer.email.placeholder': 'Votre email',
  },
  en: {
    'nav.about': 'ABOUT',
    'nav.exhibit': 'EXHIBIT',
    'nav.visit': 'VISIT',
    'nav.program': 'PROGRAM',
    'nav.talks': 'SIB TALKS',
    'nav.exhibitors': 'EXHIBITORS',
    'nav.press': 'PRESS',
    'nav.infos': 'PRACTICAL INFO',
    'cta.reserve': 'BOOK A STAND',
    'hero.eyebrow': 'INTERNATIONAL BUILDING SHOW',
    'hero.h2': '40 YEARS OF LEGACY.<br>A VISION FOCUSED<br>ON THE FUTURE.',
    'hero.intro': 'The largest gathering for construction, architecture and building innovation in Morocco.',
    'hero.date': '25 › 29 NOVEMBER 2026',
    'hero.venue': 'MOHAMMED VI EXHIBITION PARK<br><small>EL JADIDA</small>',
    'hero.cta_stand': 'BOOK A STAND →',
    'hero.cta_visitor': 'VISITOR PRE-REGISTRATION →',
    'numbers.title': 'SIB IN NUMBERS',
    'heritage.kicker': 'FOUR DECADES OF COMMITMENT ALONGSIDE BUILDING PROFESSIONALS.',
    'heritage.title': '<span>40 YEARS</span> OF CONSTRUCTION',
    'ecosystem.title': 'THE BUILDING<br>ECOSYSTEM',
    'ecosystem.desc': 'SIB brings together all the players and solutions shaping the construction sector.',
    'ecosystem.cta': 'DISCOVER ALL<br>UNIVERSES →',
    'legacy.title': '<span>40 YEARS</span><br>ALONGSIDE THOSE WHO<br>BUILD MOROCCO.',
    'legacy.cta': 'DISCOVER THEIR STORY →',
    'univers.title': 'SIB UNIVERSES',
    'talks.subtitle': 'DEBATES, CONFERENCES AND INSPIRATION',
    'talks.desc': 'International experts decode trends, share innovations and imagine tomorrow\'s city together.',
    'talks.cta': 'DISCOVER THE PROGRAM →',
    'partners.kicker': 'INSTITUTIONS, FEDERATIONS AND OFFICIAL EXHIBITORS',
    'partners.title': 'ORGANIZERS & <span>OFFICIAL SPONSOR</span>',
    'partners.desc': 'A show supported by institutional stakeholders and building exhibitors in Morocco.',
    'partners.cta': 'SEE ALL EXHIBITORS →',
    'quick.plan': 'INTERACTIVE<br>SHOW MAP',
    'quick.exhibit.title': 'EXHIBIT AT SIB 2026',
    'quick.exhibit.desc': 'BOOST YOUR VISIBILITY',
    'quick.visit.title': 'VISIT THE SHOW',
    'quick.visit.desc': 'PRE-REGISTER<br>NOW',
    'footer.date': '▣ 25 › 29 NOVEMBER 2026<br>⌖ MOHAMMED VI EXHIBITION PARK',
    'footer.about': 'ABOUT',
    'footer.exhibit': 'EXHIBIT',
    'footer.visit': 'VISIT',
    'footer.program': 'PROGRAM',
    'footer.newsletter': 'NEWSLETTER',
    'footer.newsletter.desc': 'Stay informed about SIB news',
    'footer.email.placeholder': 'Your email',
  },
  ar: {
    'nav.about': 'حول المعرض',
    'nav.exhibit': 'العرض',
    'nav.visit': 'الزيارة',
    'nav.program': 'البرنامج',
    'nav.talks': 'SIB TALKS',
    'nav.exhibitors': 'العارضون',
    'nav.press': 'الصحافة',
    'nav.infos': 'معلومات عملية',
    'cta.reserve': 'حجز جناح',
    'hero.eyebrow': 'الصالون الدولي للبناء',
    'hero.h2': '40 عاماً من الإرث.<br>رؤية موجهة<br>نحو المستقبل.',
    'hero.intro': 'أكبر تجمع للبناء والهندسة المعمارية والابتكار الإنشائي في المغرب.',
    'hero.date': '25 › 29 نوفمبر 2026',
    'hero.venue': 'حديقة المعارض محمد السادس<br><small>الجديدة</small>',
    'hero.cta_stand': 'حجز جناح →',
    'hero.cta_visitor': 'التسجيل المسبق للزوار →',
    'numbers.title': 'SIB بالأرقام',
    'heritage.kicker': 'أربعة عقود من الالتزام إلى جانب مهنيي البناء.',
    'heritage.title': '<span>40 عاماً</span> من البناء',
    'ecosystem.title': 'منظومة<br>البناء',
    'ecosystem.desc': 'يجمع SIB جميع الفاعلين والحلول التي تشكل قطاع البناء.',
    'ecosystem.cta': 'اكتشف جميع<br>العوالم →',
    'legacy.title': '<span>40 عاماً</span><br>إلى جانب من<br>يبنون المغرب.',
    'legacy.cta': 'اكتشف قصتهم →',
    'univers.title': 'عوالم SIB',
    'talks.subtitle': 'نقاشات ومؤتمرات وإلهام',
    'talks.desc': 'خبراء دوليون لفك رموز الاتجاهات ومشاركة الابتكارات وتخيل مدينة الغد معاً.',
    'talks.cta': 'اكتشف البرنامج →',
    'partners.kicker': 'مؤسسات واتحادات وعارضون رسميون',
    'partners.title': 'المنظمون و<span>الراعي الرسمي</span>',
    'partners.desc': 'معرض مدعوم من الفاعلين المؤسساتيين وعارضي البناء في المغرب.',
    'partners.cta': 'عرض جميع العارضين →',
    'quick.plan': 'خريطة تفاعلية<br>للمعرض',
    'quick.exhibit.title': 'العرض في SIB 2026',
    'quick.exhibit.desc': 'عزّز ظهورك',
    'quick.visit.title': 'زيارة المعرض',
    'quick.visit.desc': 'سجّل مسبقاً<br>الآن',
    'footer.date': '▣ 25 › 29 نوفمبر 2026<br>⌖ حديقة المعارض محمد السادس',
    'footer.about': 'حول',
    'footer.exhibit': 'العرض',
    'footer.visit': 'الزيارة',
    'footer.program': 'البرنامج',
    'footer.newsletter': 'النشرة',
    'footer.newsletter.desc': 'ابق على اطلاع بأخبار SIB',
    'footer.email.placeholder': 'بريدك الإلكتروني',
  },
};

const STAT_DEFAULTS: Record<(typeof HOME_V4_STAT_CMS_KEYS)[number], string> = {
  home_stats_exhibitors: '500+',
  home_stats_visitors: '200 000+',
  home_stats_countries: '50+',
  home_stats_conferences: '40',
};

const I18N_KEY_BY_CMS_KEY = Object.fromEntries(
  Object.entries(HOME_V4_TEXT_CMS_MAP).map(([cmsKey, i18nKey]) => [cmsKey, i18nKey]),
) as Record<string, string>;

export function getHomeV4DefaultText(cmsKey: string, lang: Lang): string {
  if ((HOME_V4_STAT_CMS_KEYS as readonly string[]).includes(cmsKey)) {
    return STAT_DEFAULTS[cmsKey as keyof typeof STAT_DEFAULTS] ?? '';
  }
  const i18nKey = I18N_KEY_BY_CMS_KEY[cmsKey];
  if (!i18nKey) return '';
  return HOME_V4_I18N[lang][i18nKey] ?? '';
}

export function resolveHomeV4EditorText(
  cmsKey: string,
  lang: Lang,
  saved: string | null | undefined,
): string {
  const trimmed = saved?.trim();
  if (trimmed) return trimmed;
  return getHomeV4DefaultText(cmsKey, lang);
}

export function isHomeV4TextCustomized(saved: string | null | undefined): boolean {
  return Boolean(saved?.trim());
}

function textareaRows(text: string): number {
  const lines = text.split('\n').length;
  const wrapped = Math.ceil(text.length / 72);
  return Math.min(14, Math.max(3, Math.max(lines, wrapped)));
}

export function homeV4TextareaRows(text: string): number {
  return textareaRows(text);
}
