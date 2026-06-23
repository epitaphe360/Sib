/**
 * SessionCheckinPage
 * Page admin pour contrôler l'accès aux sessions du programme.
 * Scanne les QR codes des participants et vérifie leur inscription.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, XCircle, AlertCircle, QrCode, Users,
  RefreshCw, ChevronDown, UserCheck, Clock, Search
} from 'lucide-react';
import { useProgrammeStore } from '../../store/programmeStore';
import { useSessionCheckin, type CheckinResult } from '../../hooks/useSessionCheckin';
import { PageHero } from '../../components/ui/PageHero';
import { useTranslation } from '../../hooks/useTranslation';

/* ─── Styles par statut ──────────────────────────────────── */
const statusStyles: Record<string, { bg: string; border: string; icon: JSX.Element; labelKey: string; text: string }> = {
  allowed: {
    bg: 'bg-emerald-50', border: 'border-emerald-300',
    icon: <CheckCircle2 className="h-12 w-12 text-emerald-500" />,
    labelKey: 'checkin.allowed', text: 'text-emerald-700',
  },
  denied: {
    bg: 'bg-red-50', border: 'border-red-300',
    icon: <XCircle className="h-12 w-12 text-red-500" />,
    labelKey: 'checkin.denied', text: 'text-red-700',
  },
  already_checked: {
    bg: 'bg-amber-50', border: 'border-amber-300',
    icon: <AlertCircle className="h-12 w-12 text-amber-500" />,
    labelKey: 'checkin.already_checked', text: 'text-amber-700',
  },
  error: {
    bg: 'bg-gray-50', border: 'border-gray-300',
    icon: <AlertCircle className="h-12 w-12 text-gray-400" />,
    labelKey: 'checkin.error', text: 'text-gray-600',
  },
};

/* ─── Composant résultat ─────────────────────────────────── */
function ResultCard({ result, onReset }: { result: CheckinResult; onReset: () => void }) {
  const { t } = useTranslation();
  const s = statusStyles[result.status] ?? statusStyles.error;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`rounded-2xl border-2 ${s.border} ${s.bg} p-6 text-center`}
    >
      <div className="flex justify-center mb-3">{s.icon}</div>
      <h3 className={`text-lg font-bold ${s.text} mb-1`}>{t(s.labelKey)}</h3>

      {result.user && (
        <div className="mt-3 p-3 bg-white/80 rounded-xl text-left space-y-1 text-sm">
          <p className="font-semibold text-gray-900">{result.user.name}</p>
          {result.user.company && <p className="text-gray-500 text-xs">{result.user.company}</p>}
          <p className="text-gray-400 text-xs">{result.user.email}</p>
          <span className="inline-block px-2 py-0.5 bg-gray-100 rounded-full text-[10px] font-bold uppercase text-gray-500">
            {result.user.type}
          </span>
        </div>
      )}

      {result.alreadyAt && (
        <p className="mt-2 text-xs text-amber-600">
          {t('checkin.already_at', { time: new Date(result.alreadyAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) })}
        </p>
      )}

      {result.errorMessage && (
        <p className="mt-2 text-sm text-gray-500">{result.errorMessage}</p>
      )}

      <button
        onClick={onReset}
        className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        {t('checkin.next_scan')}
      </button>
    </motion.div>
  );
}

/* ─── Page principale ────────────────────────────────────── */
export default function SessionCheckinPage() {
  const { t } = useTranslation();
  const { days } = useProgrammeStore();
  const { status, lastResult, attendees, isLoadingAttendees, verifyAndCheckin, loadAttendees, reset } = useSessionCheckin();
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [scannerReady, setScannerReady] = useState(false);
  const [showAttendees, setShowAttendees] = useState(false);
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerDivId = 'qr-scanner-session';

  // Flat list of all sessions
  const allSessions = days.flatMap(day =>
    day.sessions
      .filter(s => s.type !== 'pause')
      .map(s => ({ ...s, dayLabel: day.dayLabel, date: day.date }))
  );

  const startScanner = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => null);
      scannerRef.current = null;
    }
    const scanner = new Html5QrcodeScanner(
      scannerDivId,
      { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 },
      false
    );
    scanner.render(
      async (decodedText) => {
        scanner.pause(true);
        await verifyAndCheckin(decodedText);
      },
      () => { /* ignore errors */ }
    );
    scannerRef.current = scanner;
    setScannerReady(true);
  }, [verifyAndCheckin]);

  useEffect(() => {
    if (selectedSession && status === 'idle') {
      startScanner();
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => null);
        scannerRef.current = null;
        setScannerReady(false);
      }
    };
  }, [selectedSession, status, startScanner]);

  useEffect(() => {
    if (selectedSession) {
      loadAttendees(selectedSession);
    }
  }, [selectedSession, loadAttendees, status]);

  const handleReset = () => {
    reset();
    setTimeout(startScanner, 200);
  };

  const filteredAttendees = attendees.filter(a =>
    !attendeeSearch ||
    a.name.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
    a.email.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
    (a.company ?? '').toLowerCase().includes(attendeeSearch.toLowerCase())
  );

  const checkedCount = attendees.filter(a => a.checkedIn).length;

  const selectedSessionInfo = allSessions.find(s => s.id === selectedSession);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero
        badge={{ label: t('checkin.access_control'), variant: 'admin' }}
        title={t('checkin.page_title')}
        subtitle={t('checkin.page_subtitle')}
        py="py-12 md:py-16"
        noWave
      />

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* Session selector */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <QrCode className="h-5 w-5 text-indigo-600" />
            {t('checkin.select_session')}
          </h2>
          <div className="relative">
            <select
              value={selectedSession}
              onChange={(e) => {
                setSelectedSession(e.target.value);
                reset();
                setScannerReady(false);
              }}
              className="w-full px-4 py-3 pr-10 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">{t('checkin.choose_session')}</option>
              {days.map(day => (
                <optgroup key={day.dayLabel} label={`${day.dayLabel} — ${day.date}`}>
                  {day.sessions.filter(s => s.type !== 'pause').map(s => (
                    <option key={s.id} value={s.id}>
                      {s.time} · {s.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {selectedSessionInfo && (
            <div className="mt-3 flex items-center gap-3 p-3 bg-indigo-50 rounded-xl">
              <div className="flex-1">
                <p className="text-sm font-semibold text-indigo-900">{selectedSessionInfo.title}</p>
                <p className="text-xs text-indigo-600">{selectedSessionInfo.dayLabel} · {selectedSessionInfo.time}</p>
              </div>
              <div className="text-right text-sm">
                <span className="font-bold text-indigo-700">{checkedCount}</span>
                <span className="text-indigo-400">/{attendees.length}</span>
                <p className="text-[10px] text-indigo-400">{t('checkin.present')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Scanner */}
        {selectedSession && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <QrCode className="h-5 w-5 text-indigo-600" />
              {t('checkin.scan_qr')}
            </h2>

            <AnimatePresence mode="wait">
              {(status === 'idle' || status === 'loading') ? (
                <motion.div key="scanner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div
                    id={scannerDivId}
                    className="rounded-xl overflow-hidden"
                  />
                  {status === 'loading' && (
                    <div className="flex items-center justify-center gap-2 mt-4 text-indigo-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600" />
                      <span className="text-sm font-medium">{t('checkin.verifying')}</span>
                    </div>
                  )}
                  {!scannerReady && status === 'idle' && (
                    <p className="text-center text-sm text-gray-400 mt-4">{t('checkin.starting_scanner')}</p>
                  )}
                </motion.div>
              ) : (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {lastResult && <ResultCard result={lastResult} onReset={handleReset} />}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Liste des inscrits */}
        {selectedSession && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <button
              onClick={() => setShowAttendees(v => !v)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-indigo-600" />
                <div className="text-left">
                  <p className="text-base font-bold text-gray-800">{t('checkin.attendees_list')}</p>
                  <p className="text-xs text-gray-500">
                    {isLoadingAttendees ? t('checkin.loading') : t('checkin.attendees_count', { total: attendees.length, present: checkedCount })}
                  </p>
                </div>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showAttendees ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showAttendees && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-2 border-t border-gray-100">
                    {/* Recherche */}
                    <div className="relative mt-4 mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder={t('checkin.search_ph')}
                        value={attendeeSearch}
                        onChange={(e) => setAttendeeSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Table */}
                    <div className="divide-y divide-gray-50">
                      {isLoadingAttendees ? (
                        <div className="py-8 text-center text-sm text-gray-400">{t('checkin.loading')}</div>
                      ) : filteredAttendees.length === 0 ? (
                        <div className="py-8 text-center text-sm text-gray-400">{t('checkin.no_attendees')}</div>
                      ) : filteredAttendees.map(a => (
                        <div key={a.userId} className="flex items-center gap-4 py-3">
                          <div className="flex-shrink-0">
                            {a.checkedIn ? (
                              <div className="p-1.5 bg-emerald-100 rounded-full">
                                <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                              </div>
                            ) : (
                              <div className="p-1.5 bg-gray-100 rounded-full">
                                <Users className="h-3.5 w-3.5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{a.name}</p>
                            {a.company && <p className="text-xs text-gray-400 truncate">{a.company}</p>}
                          </div>
                          <div className="text-right flex-shrink-0">
                            {a.checkedIn ? (
                              <div>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{t('checkin.badge_present')}</span>
                                {a.checkedInAt && (
                                  <p className="text-[9px] text-gray-400 mt-0.5 flex items-center gap-0.5 justify-end">
                                    <Clock className="h-2.5 w-2.5" />
                                    {new Date(a.checkedInAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{t('checkin.badge_absent')}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
