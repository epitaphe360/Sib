/**
 * DynamicBadge — Modal d'affichage du badge A4 complet
 * Utilise PrintableBadgeA4 qui charge la config depuis /admin/badge-config (Supabase)
 */
import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Printer } from 'lucide-react';
import type { User, UserBadge } from '../../types';
import PrintableBadgeA4 from './PrintableBadgeA4';

const ROLE_BG: Record<string, string> = {
  exhibitor:     '#1B365D',
  partner:       '#2C1654',
  visitor_vip:   '#1a472a',
  visitor:       '#1e3a5f',
  admin:         '#0F2034',
  media_partner: '#7b1d1d',
  press_partner: '#7b1d1d',
  security:      '#374151',
  staff:         '#0F2034',
};

interface DynamicBadgeProps {
  user: User | null;
  onClose: () => void;
  overrideRole?: string;
  overrideCompany?: string;
}

function buildUserBadge(user: User, overrideRole?: string, overrideCompany?: string): UserBadge {
  const roleKey = overrideRole ?? user.type ?? 'visitor';
  const validTypes = ['visitor', 'exhibitor', 'partner', 'admin'] as const;
  const userType = validTypes.includes(roleKey as typeof validTypes[number])
    ? (roleKey as UserBadge['userType'])
    : 'visitor';

  const accessLevelMap: Record<string, UserBadge['accessLevel']> = {
    exhibitor: 'exhibitor', partner: 'partner', admin: 'admin',
    visitor_vip: 'vip', visitor: 'standard',
  };

  const firstName = user.profile?.firstName ?? user.name?.split(' ')[0] ?? '';
  const lastName  = user.profile?.lastName  ?? user.name?.split(' ').slice(1).join(' ') ?? '';

  return {
    id: user.id,
    userId: user.id,
    badgeCode: `SIB2026-${user.id.slice(0, 8).toUpperCase()}`,
    userType,
    fullName: [firstName, lastName].filter(Boolean).join(' ') || user.name || 'Participant',
    companyName: overrideCompany ?? user.profile?.company ?? '',
    email: user.email ?? '',
    avatarUrl: user.profile?.photoUrl ?? user.profile?.avatar,
    standNumber: (user.profile as Record<string, unknown> | undefined)?.standNumber as string | undefined,
    accessLevel: accessLevelMap[roleKey] ?? 'standard',
    validFrom: new Date('2026-11-25'),
    validUntil: new Date('2026-11-29'),
    status: 'active',
    scanCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function DynamicBadge({ user, onClose, overrideRole, overrideCompany }: Readonly<DynamicBadgeProps>) {
  const badgeRef = useRef<HTMLDivElement>(null);

  const roleKey = overrideRole ?? user?.type ?? 'visitor';
  const bgColor = ROLE_BG[roleKey] ?? '#1e3a5f';

  const handlePrint = useCallback(() => {
    const el = badgeRef.current;
    if (!el) { return; }
    const html = [
      '<!DOCTYPE html><html><head>',
      '<meta charset="utf-8">',
      `<base href="${window.location.origin}/">`,
      '<title>Badge SIB 2026</title>',
      '<style>* { margin: 0; padding: 0; box-sizing: border-box; }',
      'body { font-family: Segoe UI, sans-serif; background: white; }',
      '@page { size: A4; margin: 10mm; }',
      '@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }',
      '</style></head><body>',
      el.innerHTML,
      '</body></html>',
    ].join('');
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (!w) { URL.revokeObjectURL(url); return; }
    w.onload = () => { w.print(); URL.revokeObjectURL(url); };
  }, []);

  if (!user) { return null; }

  const badge = buildUserBadge(user, overrideRole, overrideCompany);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) { onClose(); } }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full overflow-hidden"
        style={{ maxWidth: 860 }}
      >
        {/* Barre titre */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Mon Badge SIB 2026</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition" aria-label="Fermer">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Badge A4 complet — programme + logos + config de /admin/badge-config */}
        <div ref={badgeRef} className="overflow-auto max-h-[75vh]">
          <PrintableBadgeA4 badge={badge} loadConfig />
        </div>

        {/* Boutons */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 py-2.5 rounded-xl font-semibold text-sm transition"
          >
            <Printer className="h-4 w-4" />
            Imprimer
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition text-white"
            style={{ background: bgColor }}
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
