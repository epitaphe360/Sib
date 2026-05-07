/**
 * SessionQRCode
 * Affiche un QR code d'accès à une session pour un inscrit.
 * Le QR contient { type, userId, sessionId } — scanné par le staff
 * sur SessionCheckinPage pour valider l'entrée.
 */
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, QrCode, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  readonly userId: string;
  readonly sessionId: string;
  readonly sessionTitle: string;
  readonly sessionTime: string;
  readonly sessionDate: string;
  readonly accent?: 'emerald' | 'amber' | 'indigo';
}

export function SessionQRCode({ userId, sessionId, sessionTitle, sessionTime, sessionDate, accent = 'indigo' }: Props) {
  const [open, setOpen] = useState(false);

  const qrData = JSON.stringify({
    type: 'session_access',
    userId,
    sessionId,
    v: 1,
  });

  const accentColor = {
    emerald: { btn: 'text-emerald-600 hover:bg-emerald-50 border-emerald-100', icon: 'text-emerald-600', header: 'bg-emerald-600' },
    amber:   { btn: 'text-amber-600 hover:bg-amber-50 border-amber-100', icon: 'text-amber-600', header: 'bg-[#1B365D]' },
    indigo:  { btn: 'text-indigo-600 hover:bg-indigo-50 border-indigo-100', icon: 'text-indigo-600', header: 'bg-indigo-600' },
  }[accent];

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-lg border ${accentColor.btn} transition-colors`}
        title="Voir mon QR code d'accès"
      >
        <QrCode className="h-2.5 w-2.5" />
        QR accès
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs pointer-events-auto overflow-hidden">
                {/* Header */}
                <div className={`${accentColor.header} px-5 py-4 flex items-center justify-between`}>
                  <div className="flex items-center gap-2.5">
                    <Shield className="h-5 w-5 text-white" />
                    <div>
                      <p className="text-white font-bold text-sm">QR d'accès session</p>
                      <p className="text-white/70 text-[10px]">Présentez à l'entrée</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    aria-label="Fermer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 text-center">
                  {/* Session info */}
                  <div className="mb-5 p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm font-bold text-gray-800 leading-tight line-clamp-2">{sessionTitle}</p>
                    <p className="text-xs text-gray-500 mt-1">{sessionDate} · {sessionTime}</p>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center p-4 bg-white rounded-xl border-2 border-gray-100 inline-block mx-auto">
                    <QRCodeSVG
                      value={qrData}
                      size={180}
                      level="M"
                      includeMargin={false}
                    />
                  </div>

                  <p className="mt-3 text-[10px] text-gray-400">
                    Présentez ce QR code au staff à l'entrée de la salle
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
