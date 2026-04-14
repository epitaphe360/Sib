import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../lib/routes';

/**
 * Niveaux d'accréditation UrbaEvent
 *
 * 1 – Visiteur Standard : catalogue, plan, programme, E-Badge
 * 2 – Visiteur VIP      : + networking, zones VIP, conférences privées
 * 3 – Exposant          : + stats, Lead Scanner, RDV B2B
 * 4 – Partenaire        : + matching B2B prioritaire, annuaire, stats multi-salons
 */
export type AccreditationLevel = 1 | 2 | 3 | 4;

interface AccreditationGateProps {
  /** Niveau minimum requis pour voir le contenu */
  requiredLevel: AccreditationLevel;
  /** Contenu affiché si l'accréditation est suffisante */
  children: React.ReactNode;
  /**
   * Mode d'affichage pour le fallback :
   * - "blur"   : contenu flou avec overlay cadenas (défaut)
   * - "hidden" : contenu complètement caché
   * - "badge"  : badge inline "🔒 Niveau X requis"
   */
  mode?: 'blur' | 'hidden' | 'badge';
  /** Message personnalisé affiché dans le fallback */
  message?: string;
  /** Classe CSS supplémentaire pour le wrapper */
  className?: string;
}

/**
 * Retourne le niveau d'accréditation numérique de l'utilisateur courant.
 */
function useAccreditationLevel(): AccreditationLevel | null {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated || !user) return null;

  switch (user.type) {
    case 'partner':
      return 4;
    case 'exhibitor':
      return 3;
    case 'visitor':
      return user.visitor_level === 'vip' ? 2 : 1;
    case 'admin':
    case 'security':
      return 4; // Accès complet
    default:
      return 1;
  }
}

const LEVEL_LABELS: Record<AccreditationLevel, string> = {
  1: 'Visiteur Standard',
  2: 'Visiteur VIP',
  3: 'Exposant',
  4: 'Partenaire',
};

const LEVEL_COLORS: Record<AccreditationLevel, string> = {
  1: '#4598D1',
  2: '#FFD700',
  3: '#EB9A44',
  4: '#4CAF50',
};

/**
 * AccreditationGate
 *
 * Enveloppe un bloc de contenu et le masque/grise si l'utilisateur n'a pas
 * le niveau d'accréditation requis.
 *
 * @example
 * <AccreditationGate requiredLevel={3}>
 *   <LeadScannerWidget />
 * </AccreditationGate>
 */
export const AccreditationGate: React.FC<AccreditationGateProps> = ({
  requiredLevel,
  children,
  mode = 'blur',
  message,
  className = '',
}) => {
  const { isAuthenticated } = useAuthStore();
  const userLevel = useAccreditationLevel();

  const hasAccess =
    isAuthenticated && userLevel !== null && userLevel >= requiredLevel;

  if (hasAccess) {
    return <>{children}</>;
  }

  const levelLabel = LEVEL_LABELS[requiredLevel];
  const levelColor = LEVEL_COLORS[requiredLevel];
  const defaultMessage = isAuthenticated
    ? `Cette fonctionnalité nécessite le niveau ${requiredLevel} (${levelLabel}).`
    : 'Connectez-vous pour accéder à cette fonctionnalité.';
  const displayMessage = message ?? defaultMessage;

  // ── Mode hidden ──────────────────────────────────────────────────────────
  if (mode === 'hidden') {
    return null;
  }

  // ── Mode badge (inline chip) ─────────────────────────────────────────────
  if (mode === 'badge') {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
        style={{
          backgroundColor: `${levelColor}18`,
          color: levelColor,
          borderColor: `${levelColor}40`,
        }}
      >
        <Lock className="w-3 h-3" />
        Niveau {requiredLevel} requis
      </span>
    );
  }

  // ── Mode blur (défaut) ────────────────────────────────────────────────────
  return (
    <div className={`relative ${className}`}>
      {/* Blur the underlying content */}
      <div className="select-none pointer-events-none blur-sm opacity-40 overflow-hidden max-h-48">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[1px] rounded-xl z-10">
        <div
          className="rounded-full p-3 mb-3 shadow-md"
          style={{ backgroundColor: levelColor }}
        >
          <Lock className="w-6 h-6 text-white" />
        </div>

        <p className="text-[#333333] font-semibold text-sm text-center px-4 mb-1">
          {displayMessage}
        </p>

        <div
          className="text-xs font-bold px-2.5 py-1 rounded-full mb-4"
          style={{ backgroundColor: `${levelColor}20`, color: levelColor }}
        >
          Niveau {requiredLevel} — {levelLabel}
        </div>

        {isAuthenticated ? (
          <Link
            to={ROUTES.VISITOR_UPGRADE}
            className="px-5 py-2 rounded-full text-white text-sm font-semibold transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: levelColor }}
          >
            Mettre à niveau mon accès
          </Link>
        ) : (
          <div className="flex gap-2">
            <Link
              to={ROUTES.LOGIN}
              className="px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all duration-200 hover:bg-[#4598D1] hover:text-white hover:border-[#4598D1]"
              style={{ borderColor: '#4598D1', color: '#4598D1' }}
            >
              Se connecter
            </Link>
            <Link
              to={ROUTES.REGISTER}
              className="px-4 py-2 rounded-full text-white text-sm font-semibold transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: '#EB9A44' }}
            >
              S'inscrire
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccreditationGate;
