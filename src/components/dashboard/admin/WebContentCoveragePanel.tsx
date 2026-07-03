import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, CheckCircle2, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '../../ui/Button';
import { computeWebContentCoverage, type WebContentCoverage } from '../../../services/webContentCoverageService';

function barColor(percent: number): string {
  if (percent >= 100) return 'bg-emerald-500';
  if (percent >= 70) return 'bg-primary-500';
  if (percent >= 40) return 'bg-warning-500';
  return 'bg-danger-500';
}

export function WebContentCoveragePanel() {
  const [coverage, setCoverage] = useState<WebContentCoverage | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCoverage(await computeWebContentCoverage());
    } catch {
      setCoverage(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const overall = coverage?.overallPercent ?? 0;
  const complete = overall >= 100;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Couverture CMS — Site web & APK</h2>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl">
            Vue d’ensemble du contenu éditable depuis l’admin. Objectif : 100 % sur chaque section avant livraison.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="ml-2">Actualiser</span>
        </Button>
      </div>

      {loading && !coverage ? (
        <div className="flex items-center gap-2 text-sm text-neutral-500 py-8 justify-center">
          <Loader2 className="h-5 w-5 animate-spin" /> Calcul de la couverture…
        </div>
      ) : coverage ? (
        <>
          <div className={`rounded-xl p-5 mb-6 border ${complete ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800' : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50'}`}>
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                {complete ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-warning-600" />
                )}
                <span className="font-semibold text-neutral-900 dark:text-white">
                  Couverture globale : {overall} %
                </span>
              </div>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {complete ? 'Prêt pour livraison' : 'Sections incomplètes — compléter ci-dessous'}
              </span>
            </div>
            <div className="h-3 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
              <div className={`h-full transition-all ${barColor(overall)}`} style={{ width: `${Math.min(overall, 100)}%` }} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {coverage.sections.map((section) => (
              <div
                key={section.id}
                className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{section.label}</h3>
                  <span className={`text-sm font-bold ${section.percent >= 100 ? 'text-emerald-600' : 'text-neutral-700 dark:text-neutral-300'}`}>
                    {section.percent} %
                  </span>
                </div>
                <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 mb-2 overflow-hidden">
                  <div className={`h-full ${barColor(section.percent)}`} style={{ width: `${Math.min(section.percent, 100)}%` }} />
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{section.details}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-danger-600 py-4">Impossible de charger la couverture CMS.</p>
      )}
    </motion.section>
  );
}
