/**
 * Informations bancaires pour les virements Partenaires et Exposants
 * Configuration des montants selon le tier (Museum, Silver, Gold, Platinum)
 *
 * ✅ FIX P0-3: Import des montants depuis Single Source of Truth
 */

import { PartnerTier } from './partnerTiers';
import { PARTNER_BILLING } from './partnerBilling';

export const PARTNER_BANK_TRANSFER_INFO = {
  // Informations du compte bancaire
  bankName: 'Attijariwafa bank',
  accountHolder: 'URBACOM',
  iban: 'MA64 007 780 000413200000498 25',
  bic: 'BCMAMAMC',
  swift: 'BCMAMAMC',
  domiciliation: 'CASA MY IDRISS 1ER',

  // ✅ Montants par tier - Import depuis SSOT
  amounts: {
    museum: {
      amount: PARTNER_BILLING.museum.amount,
      currency: PARTNER_BILLING.museum.currency,
      tier: 'museum' as PartnerTier,
      displayName: PARTNER_BILLING.museum.displayName,
      description: PARTNER_BILLING.museum.description,
      features: PARTNER_BILLING.museum.features
    },
    silver: {
      amount: PARTNER_BILLING.silver.amount,
      currency: PARTNER_BILLING.silver.currency,
      tier: 'silver' as PartnerTier,
      displayName: PARTNER_BILLING.silver.displayName,
      description: PARTNER_BILLING.silver.description,
      features: PARTNER_BILLING.silver.features
    },
    gold: {
      amount: PARTNER_BILLING.gold.amount,
      currency: PARTNER_BILLING.gold.currency,
      tier: 'gold' as PartnerTier,
      displayName: PARTNER_BILLING.gold.displayName,
      description: PARTNER_BILLING.gold.description,
      features: PARTNER_BILLING.gold.features
    },
    platinum: {
      amount: PARTNER_BILLING.platinum.amount,
      currency: PARTNER_BILLING.platinum.currency,
      tier: 'platinum' as PartnerTier,
      displayName: PARTNER_BILLING.platinum.displayName,
      description: PARTNER_BILLING.platinum.description,
      features: PARTNER_BILLING.platinum.features
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
        '⚠️ Les virements sont en USD - vérifiez le taux de change avec votre banque',
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
        '⚠️ Transfers are in USD - check exchange rate with your bank',
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
        '⚠️ التحويلات بالدولار الأمريكي - تحقق من سعر الصرف مع البنك الخاص بك',
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
    email: 'partners@sib.com',
    phone: '+33 7 66 50 45 80',
    whatsapp: '+33 7 66 50 45 80',
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
  const pattern = /^SIB-PARTNER-[A-F0-9]{8}-(MUS|SIL|GOL|PLA)-[A-F0-9]{8}-\d{6}$/;
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
  amountUSD: number,
  targetCurrency: 'EUR' | 'MAD' | 'USD'
): number {
  const rates = {
    EUR: 0.92,  // 1 USD = 0.92 EUR
    MAD: 10.15, // 1 USD = 10.15 MAD
    USD: 1.00
  };
  return Math.round(amountUSD * rates[targetCurrency] * 100) / 100;
}

/**
 * Formater un montant avec sa devise
 */
export function formatPartnerAmount(
  amountUSD: number,
  currency: 'USD' | 'EUR' | 'MAD' = 'USD'
): string {
  const amount = convertPartnerAmount(amountUSD, currency);

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
