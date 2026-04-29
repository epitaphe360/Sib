/**
 * Bannière de mise à jour PWA — SIB 2026
 * S'affiche quand un nouveau Service Worker est disponible.
 * L'utilisateur peut recharger l'app pour obtenir la dernière version.
 */
import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';

export function PWAUpdatePrompt() {
  const [dismissed, setDismissed] = useState(false);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Vérifier les mises à jour toutes les heures
      if (r) {
        setInterval(() => r.update(), 60 * 60 * 1000);
      }
    },
  });

  // Réinitialiser le dismiss si une nouvelle mise à jour arrive
  useEffect(() => {
    if (needRefresh) setDismissed(false);
  }, [needRefresh]);

  if (!needRefresh || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-auto z-50"
      >
        <div className="bg-gray-900 text-white rounded-xl shadow-2xl px-4 py-3 flex items-center gap-3 text-sm">
          <RefreshCw className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span className="flex-1">Nouvelle version disponible</span>
          <button
            onClick={() => updateServiceWorker(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            Recharger
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-gray-400 hover:text-white ml-1 transition-colors"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
