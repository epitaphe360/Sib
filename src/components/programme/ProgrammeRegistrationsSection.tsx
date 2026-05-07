/**
 * ProgrammeRegistrationsSection
 * Section partagée — affiche les sessions du programme scientifique auxquelles
 * l'utilisateur connecté est inscrit. Utilisée dans les dashboards Exposant,
 * Partenaire et Visiteur.
 */
import { useEffect, useState, useCallback } from 'react';
import {
  CalendarDays, Clock, BookOpen, Trash2, Loader2,
  Download, ExternalLink,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useProgrammeStore, type SessionType } from '../../store/programmeStore';
import { useProgrammeRegistration } from '../../hooks/useProgrammeRegistration';
import { Card } from '../ui/Card';
import { ROUTES } from '../../lib/routes';
import {
  downloadSessionICS,
  getSessionGoogleCalendarLink,
  getSessionOutlookCalendarLink,
} from '../../utils/calendarExport';
import { SessionQRCode } from './SessionQRCode';

/* ─── Types ────────────────────────────────────────────────── */
type AccentColor = 'emerald' | 'amber' | 'indigo';

interface Props {
  readonly accent?: AccentColor;
}

/* ─── Styles par accent ────────────────────────────────────── */
const accentStyles: Record<AccentColor, {
  headerBg: string;
  headerBorder: string;
  iconBg: string;
  titleAccent: string;
  badgeBg: string;
  badgeText: string;
  emptyBtn: string;
  footerLink: string;
  rowHover: string;
  rowIcon: string;
  rowIconBg: string;
}> = {
  emerald: {
    headerBg: 'bg-white', headerBorder: 'border-emerald-100',
    iconBg: 'bg-emerald-600', titleAccent: 'text-emerald-600',
    badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-700',
    emptyBtn: 'bg-emerald-600 hover:bg-emerald-700',
    footerLink: 'text-emerald-600 hover:text-emerald-700',
    rowHover: 'hover:border-emerald-100 hover:bg-emerald-50/30',
    rowIcon: 'text-emerald-600', rowIconBg: 'bg-emerald-50 border-emerald-100',
  },
  amber: {
    headerBg: 'bg-white', headerBorder: 'border-[#C9A84C]/20',
    iconBg: 'bg-[#1B365D]', titleAccent: 'text-[#C9A84C]',
    badgeBg: 'bg-[#C9A84C]/15', badgeText: 'text-[#8a6d1e]',
    emptyBtn: 'bg-[#1B365D] hover:bg-[#0F2034]',
    footerLink: 'text-[#C9A84C] hover:text-[#8a6d1e]',
    rowHover: 'hover:border-[#C9A84C]/20 hover:bg-[#C9A84C]/5',
    rowIcon: 'text-[#C9A84C]', rowIconBg: 'bg-[#C9A84C]/10 border-[#C9A84C]/20',
  },
  indigo: {
    headerBg: 'bg-white', headerBorder: 'border-indigo-100',
    iconBg: 'bg-indigo-600', titleAccent: 'text-indigo-600',
    badgeBg: 'bg-indigo-100', badgeText: 'text-indigo-700',
    emptyBtn: 'bg-indigo-600 hover:bg-indigo-700',
    footerLink: 'text-indigo-600 hover:text-indigo-700',
    rowHover: 'hover:border-indigo-100 hover:bg-indigo-50/30',
    rowIcon: 'text-indigo-600', rowIconBg: 'bg-indigo-50 border-indigo-100',
  },
};

/* ─── Labels & badges par type de session ──────────────────── */
const typeLabels: Record<SessionType, string> = {
  officiel:      'Officiel',
  panel:         'Panel',
  'table-ronde': 'Table Ronde',
  'ted-talk':    'Ted Talk',
  atelier:       'Atelier',
  pause:         'Pause',
  concours:      'Concours',
  cloture:       'Clôture',
};

const typeBadge: Record<SessionType, string> = {
  officiel:      'bg-slate-100 text-slate-700',
  panel:         'bg-blue-100 text-blue-700',
  'table-ronde': 'bg-amber-100 text-amber-700',
  'ted-talk':    'bg-red-100 text-red-700',
  atelier:       'bg-purple-100 text-purple-700',
  pause:         'bg-green-100 text-green-600',
  concours:      'bg-yellow-100 text-yellow-700',
  cloture:       'bg-indigo-100 text-indigo-700',
};

/* ─── Session Row ───────────────────────────────────────────── */
interface SessionRowProps {
  readonly sessionId: string;
  readonly title: string;
  readonly time: string;
  readonly type: SessionType;
  readonly dayLabel: string;
  readonly dayDate: string;
  readonly description: string;
  readonly accent: AccentColor;
  readonly onRemove: () => void;
}

function SessionRow({
  sessionId, title, time, type, dayLabel, dayDate, description, accent, onRemove,
}: SessionRowProps) {
  const { isLoading, unregister } = useProgrammeRegistration(sessionId);
  const { user } = useAuthStore();
  const st = accentStyles[accent];
  const [showExport, setShowExport] = useState(false);

  const handleUnregister = async () => {
    await unregister();
    onRemove();
  };

  const googleLink = getSessionGoogleCalendarLink(title, dayDate, time, description);
  const outlookLink = getSessionOutlookCalendarLink(title, dayDate, time, description);

  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border border-gray-100 ${st.rowHover} transition-colors`}>
      <div className={`flex-shrink-0 p-2 ${st.rowIconBg} rounded-lg border`}>
        <BookOpen className={`h-4 w-4 ${st.rowIcon}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 leading-tight">{title}</p>
        <div className="flex flex-wrap items-center gap-3 mt-1.5">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <CalendarDays className="h-3 w-3" />
            {dayLabel}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            {time}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${typeBadge[type]}`}>
            {typeLabels[type]}
          </span>
        </div>

        {/* Boutons export calendrier */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          <button
            onClick={() => {
              downloadSessionICS(title, dayDate, time, description);
              toast.success('Fichier .ics téléchargé');
            }}
            className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors"
          >
            <Download className="h-2.5 w-2.5" />
            .ics
          </button>

          {googleLink && (
            <a
              href={googleLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-lg border border-blue-100 text-blue-600 hover:bg-blue-50 transition-colors"
              onClick={() => setShowExport(true)}
            >
              <ExternalLink className="h-2.5 w-2.5" />
              Google
            </a>
          )}

          {outlookLink && (
            <a
              href={outlookLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-lg border border-sky-100 text-sky-600 hover:bg-sky-50 transition-colors"
            >
              <ExternalLink className="h-2.5 w-2.5" />
              Outlook
            </a>
          )}
          {showExport && <span className="sr-only">calendrier ouvert</span>}

          {/* QR code d'accès à la session */}
          {user && (
            <SessionQRCode
              userId={user.id}
              sessionId={sessionId}
              sessionTitle={title}
              sessionTime={time}
              sessionDate={dayDate}
              accent={accent}
            />
          )}
        </div>
      </div>

      <button
        onClick={handleUnregister}
        disabled={isLoading}
        className="flex-shrink-0 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        title="Se désinscrire de cette session"
      >
        {isLoading
          ? <Loader2 className="h-4 w-4 animate-spin" />
          : <Trash2 className="h-4 w-4" />}
      </button>
    </div>
  );
}

/* ─── Session Row Wrapper (évite le nesting framer-motion > 4 niveaux) ──── */
interface SessionRowWrapperProps {
  readonly session: { id: string; title: string; time: string; type: SessionType; dayLabel: string; dayDate: string; description: string };
  readonly accent: AccentColor;
  readonly sessionId: string;
  readonly onRemoveAll: (id: string) => void;
}

function SessionRowWrapper({ session, accent, sessionId, onRemoveAll }: SessionRowWrapperProps) {
  function onRemove() { onRemoveAll(sessionId); }
  return (
    <motion.div variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}>
      <SessionRow
        sessionId={session.id}
        title={session.title}
        time={session.time}
        type={session.type}
        dayLabel={session.dayLabel}
        dayDate={session.dayDate}
        description={session.description}
        accent={accent}
        onRemove={onRemove}
      />
    </motion.div>
  );
}

/* ─── Utilitaire fetch (hors composant pour éviter le nesting) ── */
async function loadRegisteredSessionIds(userId: string): Promise<string[]> {
  if (!supabase) { return []; }
  const { data } = await supabase
    .from('programme_registrations')
    .select('session_id')
    .eq('user_id', userId)
    .eq('status', 'confirmed')
    .order('registered_at', { ascending: true });
  return (data ?? []).map((r: { session_id: string }) => r.session_id);
}

type ResolvedSession = {
  id: string; title: string; time: string; type: SessionType;
  dayLabel: string; dayDate: string; description: string;
};

type ProgrammeDay = { dayLabel: string; date: string; sessions: Array<{ id: string; title: string; time: string; type: SessionType; description: string }> };

function resolveSessionsFromIds(ids: string[], days: ProgrammeDay[]): ResolvedSession[] {
  const result: ResolvedSession[] = [];
  for (const sid of ids) {
    for (const day of days) {
      const s = day.sessions.find(x => x.id === sid);
      if (s) {
        result.push({ id: s.id, title: s.title, time: s.time, type: s.type, description: s.description, dayLabel: day.dayLabel, dayDate: day.date });
        break;
      }
    }
  }
  return result;
}

/* ─── Section principale ────────────────────────────────────── */
export function ProgrammeRegistrationsSection({ accent = 'emerald' }: Props) {
  const { user } = useAuthStore();
  const { days } = useProgrammeStore();
  const [sessionIds, setSessionIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const st = accentStyles[accent];

  const fetchRegistrations = useCallback(async () => {
    if (!user) { setIsLoading(false); return; }
    const ids = await loadRegisteredSessionIds(user.id);
    setSessionIds(ids);
    setIsLoading(false);
  }, [user]);

  useEffect(() => { fetchRegistrations(); }, [fetchRegistrations]);

  const registeredSessions = resolveSessionsFromIds(sessionIds, days as ProgrammeDay[]);

  if (!user) { return null; }

  function handleRemove(sessionId: string) {
    setSessionIds(sessionIds.filter(id => id !== sessionId));
  }

  return (
    <div className="mb-8">
      <Card className={`overflow-hidden border ${st.headerBorder} shadow-sm`}>
        {/* En-tête */}
        <div className={`${st.headerBg} border-b border-gray-100 px-6 py-5`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 ${st.iconBg} rounded-xl shadow-md`}>
              <CalendarDays className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Mes Sessions{' '}
                <span className={st.titleAccent}>du Programme</span>
              </h2>
              <p className="text-sm text-gray-500">
                Conférences et ateliers auxquels vous êtes inscrit(e)
              </p>
            </div>
            {registeredSessions.length > 0 && (
              <span className={`ml-auto px-3 py-1 ${st.badgeBg} ${st.badgeText} text-xs font-bold rounded-full`}>
                {registeredSessions.length} session{registeredSessions.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {renderContent()}
        </div>
      </Card>
    </div>
  );

  function renderContent() {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 text-gray-300 animate-spin" />
        </div>
      );
    }
    if (registeredSessions.length === 0) {
      return (
        <div className="text-center py-8">
          <CalendarDays className="h-12 w-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-500 mb-1">
            Aucune session dans votre programme
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Inscrivez-vous aux sessions dans le programme scientifique
          </p>
          <Link
            to={ROUTES.EVENTS}
            className={`inline-flex items-center gap-2 px-4 py-2 ${st.emptyBtn} text-white text-xs font-bold rounded-xl transition-colors`}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            Voir le Programme &amp; Séminaires
          </Link>
        </div>
      );
    }
    return (
      <>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
          className="space-y-3"
        >
          {registeredSessions.map(session => (
            <SessionRowWrapper
              key={session.id}
              session={session}
              accent={accent}
              sessionId={session.id}
              onRemoveAll={handleRemove}
            />
          ))}
        </motion.div>

        <div className="mt-4 pt-4 border-t border-gray-50 text-center">
          <Link
            to={ROUTES.EVENTS}
            className={`inline-flex items-center gap-1.5 text-xs ${st.footerLink} font-semibold`}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            Voir tout le programme et s&apos;inscrire à d&apos;autres sessions
          </Link>
        </div>
      </>
    );
  }
}
