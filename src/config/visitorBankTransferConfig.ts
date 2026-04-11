/**
 * Informations bancaires pour les virements Visiteurs VIP
 * Configuration des montants pour le Pass Premium VIP
 */

export const VISITOR_BANK_TRANSFER_INFO = {
  // Informations du compte bancaire
  bankName: 'Attijariwafa bank',
  accountHolder: 'LINECO EVENTS',
  iban: 'MA64 007 780 000413200000498 25',
  bic: 'BCMAMAMC',
  swift: 'BCMAMAMC',
  domiciliation: 'CASA MY IDRISS 1ER',

  // Montant Pass VIP
  vipPass: {
    amount: 700,
    currency: 'EUR',
    displayName: 'Pass Premium VIP',
    description: 'Accès complet à SIB 2026 (15-17 avril)',
    features: [
      'Badge Premium avec photo et QR code',
      'Accès complet 3 jours',
      '10 demandes de RDV B2B actives',
      'Invitation inauguration',
      'Ateliers spécialisés',
      'Soirée gala exclusive',
      'Accès lounge privé'
    ]
  },

  // Instructions de virement (multilingue)
  instructions: {
    fr: {
      title: 'Instructions de virement bancaire - Pass VIP',
      steps: [
        'Effectuez un virement bancaire de 300€',
        'Référence obligatoire: Votre numéro de demande (fourni après inscription)',
        'Joindre le justificatif de virement (PDF, JPG ou PNG)',
        'Délai de traitement: 2-5 jours ouvrés',
        'Après validation, votre compte VIP sera activé automatiquement'
      ],
      important: [
        '⚠️ IMPORTANT: Indiquez la référence de paiement dans le libellé du virement',
        '⚠️ Le montant doit être exactement 300€',
        '⚠️ Conservez votre preuve de virement (capture d\'écran ou PDF)',
        '⚠️ Vous recevrez une confirmation par email dès validation',
        '⚠️ Vous pouvez suivre l\'état de votre demande sur votre tableau de bord'
      ],
      additionalInfo: [
        'Pour les virements internationaux, des frais bancaires peuvent s\'appliquer',
        'Les virements SEPA (Europe) sont généralement traités en 1-2 jours',
        'Les virements SWIFT internationaux peuvent prendre 3-5 jours',
        'En cas de question, contactez-nous: contact@sib2026.com'
      ]
    },
    en: {
      title: 'Bank Transfer Instructions - VIP Pass',
      steps: [
        'Make a bank transfer of €700',
        'Mandatory reference: Your request number (provided after registration)',
        'Attach transfer proof (PDF, JPG or PNG)',
        'Processing time: 2-5 business days',
        'After validation, your VIP account will be automatically activated'
      ],
      important: [
        '⚠️ IMPORTANT: Include the payment reference in the transfer description',
        '⚠️ Amount must be exactly €700',
        '⚠️ Keep your transfer proof (screenshot or PDF)',
        '⚠️ You will receive email confirmation upon validation',
        '⚠️ You can track your request status on your dashboard'
      ],
      additionalInfo: [
        'International transfers may incur bank fees',
        'SEPA transfers (Europe) are typically processed in 1-2 days',
        'SWIFT international transfers may take 3-5 days',
        'For questions, contact us: contact@sib2026.com'
      ]
    },
    ar: {
      title: 'تعليمات التحويل البنكي - بطاقة VIP',
      steps: [
        'قم بتحويل بنكي بقيمة 700 يورو',
        'المرجع إلزامي: رقم طلبك (يُقدم بعد التسجيل)',
        'قم بإرفاق إثبات التحويل (PDF أو JPG أو PNG)',
        'مدة المعالجة: 2-5 أيام عمل',
        'بعد التحقق، سيتم تفعيل حسابك VIP تلقائيًا'
      ],
      important: [
        '⚠️ هام: قم بتضمين مرجع الدفع في وصف التحويل',
        '⚠️ يجب أن يكون المبلغ 700 يورو بالضبط',
        '⚠️ احتفظ بإثبات التحويل (لقطة شاشة أو PDF)',
        '⚠️ ستتلقى تأكيدًا بالبريد الإلكتروني عند التحقق',
        '⚠️ يمكنك تتبع حالة طلبك في لوحة التحكم'
      ],
      additionalInfo: [
        'قد تنطبق رسوم مصرفية على التحويلات الدولية',
        'عادةً ما تتم معالجة تحويلات SEPA (أوروبا) في 1-2 أيام',
        'قد تستغرق تحويلات SWIFT الدولية 3-5 أيام',
        'للاستفسارات، اتصل بنا: contact@sib2026.com'
      ]
    }
  }
};

/**
 * Générer une référence de paiement unique pour visiteur
 */
export function generateVisitorPaymentReference(userId: string): string {
  const prefix = 'VIP';
  const timestamp = Date.now().toString(36).toUpperCase();
  const userIdShort = userId.substring(0, 8).toUpperCase();
  return `${prefix}-${userIdShort}-${timestamp}`;
}

/**
 * Formater un montant avec devise
 */
export function formatVisitorAmount(amount: number, currency: 'EUR' | 'USD' | 'MAD' = 'EUR'): string {
  const symbols: Record<string, string> = {
    EUR: '€',
    USD: '$',
    MAD: 'DH'
  };

  const formatter = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  return `${formatter.format(amount)} ${symbols[currency]}`;
}

/**
 * Convertir EUR en MAD (Dirham marocain)
 * Fix P1-1 : Délègue au module centralisé currencyUtils (cache API 24h).
 */
export { convertEURtoMAD, convertEURtoMADSync } from '../utils/currencyUtils';
