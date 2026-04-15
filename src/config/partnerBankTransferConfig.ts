/**
 * Informations bancaires pour les virements Partenaires et Exposants
 * Configuration des montants selon le tier de sponsoring SIB 2026
 * Silver (200K MAD) / Gold (350K MAD) / Officiel (500K MAD)
 */

import { PartnerTier } from './partnerTiers';

export const PARTNER_BANK_TRANSFER_INFO = {
  // Informations du compte bancaire
  bankName: 'Attijariwafa bank',
  accountHolder: 'URBACOM',
  iban: 'MA64 007 780 000413200000498 25',
  bic: 'BCMAMAMC',
  swift: 'BCMAMAMC',
  domiciliation: 'CASA MY IDRISS 1ER',

  // Montants par tier de sponsoring — brochure SIB 2026
  amounts: {
    organizer: {
      amount: 0,
      currency: 'MAD' as const,
      tier: 'organizer' as PartnerTier,
      displayName: 'Organisateurs',
      description: 'Organisateur principal du salon',
      features: ['Gestion complète de l\'événement']
    },
    co_organizer: {
      amount: 0,
      currency: 'MAD' as const,
      tier: 'co_organizer' as PartnerTier,
      displayName: 'Co-organisateurs',
      description: 'Co-organisation du salon',
      features: ['Co-branding officiel']
    },
    official_sponsor: {
      amount: 500000,
      currency: 'MAD' as const,
      tier: 'official_sponsor' as PartnerTier,
      displayName: 'Sponsor Officiel',
      description: 'Visibilité maximale — Partenaire stratégique (500 000 MAD)',
      features: ['Logo sur tous les supports', '1 000 invitations', '4 bannières web', 'Habillage façade', 'Rubans badges', 'Catalogue 4ème couverture', 'Conférence de presse']
    },
    delegated_organizer: {
      amount: 0,
      currency: 'MAD' as const,
      tier: 'delegated_organizer' as PartnerTier,
      displayName: 'Organisateur Délégué',
      description: 'Organisateur délégué d\'une zone du salon',
      features: ['Gestion déléguée d\'une zone']
    },
    partner: {
      amount: 200000,
      currency: 'MAD' as const,
      tier: 'partner' as PartnerTier,
      displayName: 'Sponsor Silver',
      description: 'Visibilité & communication (200 000 MAD)',
      features: ['Logo sur les supports', '200 invitations', '1 bannière web', 'Salle conférence 1h', 'Publicité écrans']
    },
    press_partner: {
      amount: 0,
      currency: 'MAD' as const,
      tier: 'press_partner' as PartnerTier,
      displayName: 'Partenaire Presse',
      description: 'Partenaire presse officiel',
      features: ['Accréditation presse', 'Espace presse dédié']
    }
  },

  // Instructions de virement (multilingue)
  instructions: {
    fr: {
      title: 'Instructions de virement bancaire pour partenaires',
      steps: [
        'Effectuez le virement depuis votre compte professionnel',
        'Montant exact selon le tier choisi (voir ci-dessus)',
        'Référence obligatoire: Votre ID de demande (fourni après soumission)',
        'Joindre le justificatif de virement (PDF ou screenshot)',
        'Délai de traitement: 2-5 jours ouvrés',
        'Après validation par l\'administrateur, votre compte sera automatiquement activé avec le tier choisi'
      ],
      important: [
        '⚠️ IMPORTANT: Indiquez la référence de paiement dans le libellé du virement',
        '⚠️ Le montant doit être exact selon le tier choisi',
        '⚠️ Conservez votre preuve de virement (vous devrez l\'uploader)',
        '⚠️ Les virements sont en MAD (Dirham marocain)',
        '⚠️ Vous pouvez suivre l\'état de votre demande dans votre tableau de bord'
      ],
      additionalInfo: [
        'Pour les virements internationaux, des frais bancaires peuvent s\'appliquer',
        'Les virements SEPA (Europe) sont généralement traités en 1-2 jours',
        'Les virements SWIFT internationaux peuvent prendre 3-5 jours',
        'En cas de question, contactez notre service partenaires'
      ]
    },
    en: {
      title: 'Bank Transfer Instructions for Partners',
      steps: [
        'Make the transfer from your business account',
        'Exact amount according to chosen tier (see above)',
        'Mandatory reference: Your request ID (provided after submission)',
        'Attach transfer proof (PDF or screenshot)',
        'Processing time: 2-5 business days',
        'After admin validation, your account will be automatically activated with the chosen tier'
      ],
      important: [
        '⚠️ IMPORTANT: Include the payment reference in the transfer description',
        '⚠️ Amount must be exact according to chosen tier',
        '⚠️ Keep your transfer proof (you will need to upload it)',
        '⚠️ Transfers are in MAD (Moroccan Dirham)',
        '⚠️ You can track your request status in your dashboard'
      ],
      additionalInfo: [
        'International transfers may incur bank fees',
        'SEPA transfers (Europe) are typically processed in 1-2 days',
        'International SWIFT transfers may take 3-5 days',
        'For questions, contact our partners support service'
      ]
    },
    ar: {
      title: 'تعليمات التحويل البنكي للشركاء',
      steps: [
        'قم بإجراء التحويل من حسابك المهني',
        'المبلغ الدقيق حسب المستوى المختار (انظر أعلاه)',
        'المرجع إلزامي: معرف الطلب الخاص بك (يتم توفيره بعد التقديم)',
        'إرفاق إثبات التحويل (PDF أو لقطة شاشة)',
        'وقت المعالجة: 2-5 أيام عمل',
        'بعد التحقق من قبل المسؤول، سيتم تفعيل حسابك تلقائيًا بالمستوى المختار'
      ],
      important: [
        '⚠️ مهم: قم بتضمين مرجع الدفع في وصف التحويل',
        '⚠️ يجب أن يكون المبلغ دقيقًا حسب المستوى المختار',
        '⚠️ احتفظ بإثبات التحويل الخاص بك (ستحتاج إلى تحميله)',
        '⚠️ التحويلات بالدرهم المغربي (MAD)',
        '⚠️ يمكنك تتبع حالة طلبك في لوحة التحكم الخاصة بك'
      ],
      additionalInfo: [
        'قد تتكبد التحويلات الدولية رسوم بنكية',
        'عادة ما تتم معالجة تحويلات SEPA (أوروبا) في 1-2 أيام',
        'قد تستغرق التحويلات الدولية SWIFT من 3 إلى 5 أيام',
        'للأسئلة، اتصل بخدمة دعم الشركاء لدينا'
      ]
    }
  },

  // Contact support partenaires
  support: {
    email: 'Sib2026@urbacom.net',
    phone: '+212 6 88 50 05 00',
    whatsapp: '+212688500500',
    hours: {
      fr: 'Lundi - Vendredi: 9h00 - 18h00 (GMT+1)',
      en: 'Monday - Friday: 9:00 AM - 6:00 PM (GMT+1)',
      ar: 'الاثنين - الجمعة: 9:00 صباحًا - 6:00 مساءً (GMT+1)'
    }
  }
};

/**
 * Générer la référence de paiement pour un partenaire
 * Format: SIB-PARTNER-{USER_ID_SHORT}-{TIER}-{TIMESTAMP}
 */
export function generatePartnerPaymentReference(
  userId: string,
  requestId: string,
  tier: PartnerTier
): string {
  const userShort = userId.substring(0, 8).toUpperCase();
  const requestShort = requestId.substring(0, 8).toUpperCase();
  const tierCode = tier.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  return `SIB-PARTNER-${userShort}-${tierCode}-${requestShort}-${timestamp}`;
}

/**
 * Valider le format d'une référence de paiement partenaire
 */
export function validatePartnerPaymentReference(reference: string): boolean {
  const pattern = /^SIB-PARTNER-[A-F0-9]{8}-(ORG|CO_|OFF|DEL|PAR|PRE)-[A-F0-9]{8}-\d{6}$/;
  return pattern.test(reference);
}

/**
 * Obtenir les informations de montant pour un tier donné
 */
export function getPartnerTierAmount(tier: PartnerTier) {
  return PARTNER_BANK_TRANSFER_INFO.amounts[tier];
}

/**
 * Calculer le montant d'upgrade entre deux tiers
 */
export function calculateUpgradeAmount(
  currentTier: PartnerTier,
  targetTier: PartnerTier
): number {
  const currentAmount = PARTNER_BANK_TRANSFER_INFO.amounts[currentTier].amount;
  const targetAmount = PARTNER_BANK_TRANSFER_INFO.amounts[targetTier].amount;
  return Math.max(0, targetAmount - currentAmount);
}

/**
 * Convertir USD en autres devises (approximatif)
 */
export function convertPartnerAmount(
  amountMAD: number,
  targetCurrency: 'EUR' | 'MAD' | 'USD'
): number {
  const rates = {
    EUR: 0.091, // 1 MAD ≈ 0.091 EUR
    USD: 0.099, // 1 MAD ≈ 0.099 USD
    MAD: 1.00
  };
  return Math.round(amountMAD * rates[targetCurrency] * 100) / 100;
}

/**
 * Formater un montant avec sa devise
 */
export function formatPartnerAmount(
  amountMAD: number,
  currency: 'USD' | 'EUR' | 'MAD' = 'MAD'
): string {
  const amount = convertPartnerAmount(amountMAD, currency);

  switch (currency) {
    case 'EUR':
      return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`;
    case 'MAD':
      return `${amount.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD`;
    case 'USD':
    default:
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }
}
