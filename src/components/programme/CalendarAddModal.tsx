/**
 * CalendarAddModal
 * Modal affiché après une inscription à une session du programme.
 * Propose d'ajouter la session au calendrier personnel (Google, Outlook, .ics).
 */
import { X, Download, ExternalLink, CalendarCheck2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  downloadSessionICS,
  getSessionGoogleCalendarLink,
  getSessionOutlookCalendarLink,
} from '../../utils/calendarExport';

interface Props {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly sessionTitle: string;
  readonly sessionDate: string;
  readonly sessionTime: string;
  readonly sessionDescription: string;
}

export function CalendarAddModal({
  isOpen, onClose, sessionTitle, sessionDate, sessionTime, sessionDescription,
}: Props) {
  const googleLink  = getSessionGoogleCalendarLink(sessionTitle, sessionDate, sessionTime, sessionDescription);
  const outlookLink = getSessionOutlookCalendarLink(sessionTitle, sessionDate, sessionTime, sessionDescription);

  const handleICS = () => {
    downloadSessionICS(sessionTitle, sessionDate, sessionTime, sessionDescription);
    toast.success('Fichier .ics téléchargé — ouvrez-le pour ajouter au calendrier');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 pointer-events-auto">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-600 rounded-xl">
                    <CalendarCheck2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Inscription confirmée !</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Ajouter au calendrier ?</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Fermer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Session info */}
              <div className="mb-5 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-sm font-semibold text-indigo-900 leading-tight line-clamp-2">{sessionTitle}</p>
                <p className="text-xs text-indigo-600 mt-1">
                  {sessionDate} · {sessionTime}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {googleLink && (
                  <a
                    href={googleLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="flex items-center gap-3 w-full px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                  >
                    <img
                      src="https://www.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_20_2x.png"
                      alt="Google Calendar"
                      className="h-5 w-5 object-contain"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                    <span className="flex-1 text-sm font-medium text-gray-700 group-hover:text-blue-700">
                      Google Calendar
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-gray-400 group-hover:text-blue-500" />
                  </a>
                )}

                {outlookLink && (
                  <a
                    href={outlookLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="flex items-center gap-3 w-full px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-sky-300 hover:bg-sky-50 transition-colors group"
                  >
                    <div className="h-5 w-5 bg-[#0078D4] rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-[9px] font-bold text-white">O</span>
                    </div>
                    <span className="flex-1 text-sm font-medium text-gray-700 group-hover:text-sky-700">
                      Outlook Calendar
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-gray-400 group-hover:text-sky-500" />
                  </a>
                )}

                <button
                  onClick={handleICS}
                  className="flex items-center gap-3 w-full px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-colors group"
                >
                  <div className="h-5 w-5 bg-emerald-600 rounded flex items-center justify-center flex-shrink-0">
                    <Download className="h-3 w-3 text-white" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-gray-700 group-hover:text-emerald-700 text-left">
                    Télécharger (.ics)
                    <span className="block text-[10px] text-gray-400 font-normal">Apple Calendar, Thunderbird…</span>
                  </span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="mt-4 w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
              >
                Plus tard
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
