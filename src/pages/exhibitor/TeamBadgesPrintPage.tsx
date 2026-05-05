/**
 * TeamBadgesPrintPage — Impression A4 des badges collaborateurs SIB 2026
 *
 * Ouverte dans un nouvel onglet par ExhibitorTeamPage.
 * Recharge la config badge depuis Supabase (badge_config_v1) et rend
 * un PrintableBadgeA4 par collaborateur actif, avec impression auto.
 *
 * URL : /print/badges-equipe?owner_id=<uid>
 */

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Printer } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import PrintableBadgeA4 from '../../components/badge/PrintableBadgeA4';
import type { UserBadge, StandCollaborator } from '../../types';

// ─── Types internes ───────────────────────────────────────────────────────────

interface CollaboratorWithMeta extends StandCollaborator {
  _companyName: string;
  _standNumber: string;
}

// ─── Helper : construire un UserBadge depuis un collaborateur ─────────────────

function buildUserBadge(c: CollaboratorWithMeta): UserBadge {
  const now = new Date();
  return {
    id: c.id,
    userId: c.auth_user_id || c.id,
    badgeCode: `COLLAB-${c.id.slice(0, 8).toUpperCase()}`,
    userType: 'exhibitor',
    fullName: `${c.first_name} ${c.last_name}`.trim(),
    companyName: c._companyName || undefined,
    position: c.position || undefined,
    email: c.email,
    phone: c.phone || undefined,
    standNumber: c._standNumber || undefined,
    accessLevel: 'exhibitor',
    validFrom: now,
    validUntil: new Date('2026-12-31'),
    status: 'active',
    scanCount: 0,
    createdAt: new Date(c.created_at),
    updatedAt: new Date(c.created_at),
  };
}

// ─── Composant ───────────────────────────────────────────────────────────────

export default function TeamBadgesPrintPage() {
  const [searchParams] = useSearchParams();
  const ownerId = searchParams.get('owner_id');

  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [companyLabel, setCompanyLabel] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readyCount, setReadyCount] = useState(0);
  const printTriggered = useRef(false);

  // Vider le titre pour qu'il n'apparaisse pas dans les entêtes d'impression
  useEffect(() => {
    const prevTitle = document.title;
    document.title = ' ';
    return () => { document.title = prevTitle; };
  }, []);
  useEffect(() => {
    if (
      !printTriggered.current &&
      badges.length > 0 &&
      readyCount >= badges.length
    ) {
      printTriggered.current = true;
      // Petit délai pour laisser le navigateur finir le rendu des images
      setTimeout(() => globalThis.print(), 600);
    }
  }, [readyCount, badges.length]);

  // Chargement des données
  useEffect(() => {
    if (!ownerId || !supabase) {
      setError('Paramètre owner_id manquant ou client Supabase non initialisé.');
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        // 1. Récupérer les collaborateurs actifs
        const { data: collabs, error: collabErr } = await (supabase as any)
          .from('stand_collaborators')
          .select('*')
          .eq('owner_id', ownerId)
          .eq('status', 'active')
          .order('created_at', { ascending: true });

        if (collabErr) { throw collabErr; }
        if (!collabs || collabs.length === 0) {
          setError('Aucun collaborateur actif trouvé pour cet exposant.');
          setIsLoading(false);
          return;
        }

        // 2. Récupérer le nom de l'entreprise + numéro de stand
        const firstCollab = collabs[0] as StandCollaborator;
        let companyName = '';
        let standNumber = '';

        if (firstCollab.exhibitor_id) {
          const { data: exh } = await (supabase as any)
            .from('exhibitors')
            .select('company_name, stand_number')
            .eq('id', firstCollab.exhibitor_id)
            .maybeSingle();
          companyName = exh?.company_name || '';
          standNumber = exh?.stand_number || '';
        } else if (firstCollab.partner_id) {
          const { data: prt } = await (supabase as any)
            .from('partners')
            .select('organization_name')
            .eq('id', firstCollab.partner_id)
            .maybeSingle();
          companyName = prt?.organization_name || '';
        }

        setCompanyLabel(companyName);

        const enriched: CollaboratorWithMeta[] = (collabs as StandCollaborator[]).map(c => ({
          ...c,
          _companyName: companyName,
          _standNumber: standNumber,
        }));

        setBadges(enriched.map(buildUserBadge));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(`Erreur lors du chargement : ${msg}`);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [ownerId]);

  // ─── Rendu ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-gray-600 text-sm">Chargement des badges…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white p-8 text-center">
        <p className="text-red-600 font-semibold">{error}</p>
        <button onClick={() => window.close()} className="text-sm text-gray-500 underline">Fermer</button>
      </div>
    );
  }

  return (
    <>
      {/* Barre d'actions (masquée à l'impression) */}
      <div
        className="no-print fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm"
      >
        <div>
          <span className="font-bold text-gray-900">{companyLabel || 'Badges collaborateurs'}</span>
          <span className="ml-2 text-sm text-gray-500">
            {badges.length} badge{badges.length > 1 ? 's' : ''} — SIB 2026
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => globalThis.print()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            <Printer className="h-4 w-4" /> Imprimer
          </button>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium transition"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Contenu imprimable — un badge A4 par page */}
      <div className="print-container" style={{ paddingTop: '56px', background: '#f3f4f6' }}>
        {badges.map((badge) => (
          <BadgePageWrapper
            key={badge.id}
            badge={badge}
            onReady={() => setReadyCount(n => n + 1)}
          />
        ))}
      </div>

      {/* Styles d'impression */}
      <style>{`
        @media print {
          html, body { margin: 0 !important; padding: 0 !important; background: white !important; }
          .no-print { display: none !important; }
          .print-container { padding: 0 !important; margin: 0 !important; background: white !important; }
          .print-page {
            width: 210mm !important;
            height: 297mm !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            page-break-after: always;
            break-after: page;
          }
          .print-page:last-child { page-break-after: avoid; break-after: avoid; }
          #printable-badge-a4 { display: block !important; margin: 0 !important; width: 210mm !important; height: 297mm !important; }
          #printable-badge-a4 > div { width: 100% !important; height: 100% !important; }
        }
      `}</style>
    </>
  );
}

// ─── Wrapper par badge — signale quand il est prêt ───────────────────────────

interface BadgePageWrapperProps {
  badge: UserBadge;
  onReady: () => void;
}

function BadgePageWrapper({ badge, onReady }: Readonly<BadgePageWrapperProps>) {
  const calledRef = useRef(false);

  // PrintableBadgeA4 génère ses QR codes dans des useEffect.
  // On attend 1,5 s (suffisant pour 3 QR codes) avant de signaler "prêt".
  useEffect(() => {
    const t = setTimeout(() => {
      if (!calledRef.current) {
        calledRef.current = true;
        onReady();
      }
    }, 1500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="print-page bg-white"
      style={{ width: '210mm', height: '297mm', overflow: 'hidden' }}
    >
      <PrintableBadgeA4 badge={badge} loadConfig />
    </div>
  );
}
