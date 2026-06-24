import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Printer, RefreshCw, Scan, AlertTriangle } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useTranslation } from '../hooks/useTranslation';
import { getUserBadge, generateBadgeFromUser } from '../services/badgeService';
import { UserBadge } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import PrintableBadgeA4 from '../components/badge/PrintableBadgeA4';

export default function BadgePage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [badge, setBadge] = useState<UserBadge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      void loadBadge();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  async function loadBadge() {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const userBadge = await getUserBadge(user.id);
      setBadge(userBadge);
    } catch (err: unknown) {
      console.error('Error loading badge:', err);
      setError(err instanceof Error ? err.message : t('badge.error_loading'));
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateBadge() {
    if (!user?.id) return;

    try {
      setGenerating(true);
      setError(null);
      const newBadge = await generateBadgeFromUser(user.id);
      setBadge(newBadge);
      toast.success(t('badge.badge_generated_success'));
    } catch (err: unknown) {
      console.error('Error generating badge:', err);
      setError(err instanceof Error ? err.message : t('badge.error_generating'));
      toast.error(t('badge.error_generating'));
    } finally {
      setGenerating(false);
    }
  }

  const handlePrint = useCallback(() => {
    const el = badgeRef.current;
    if (!el) return;
    globalThis.print();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sib-navy" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <Card className="p-8">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">{t('badge.login_required')}</h2>
          <p className="text-gray-600">{t('badge.must_login_badge')}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <style>{`
        @media print {
          html, body { margin: 0 !important; padding: 0 !important; background: white !important; }
          .no-print { display: none !important; }
          .badge-print-shell { padding: 0 !important; margin: 0 !important; background: white !important; }
          .print-page {
            width: 210mm !important;
            height: 297mm !important;
            overflow: hidden !important;
            margin: 0 auto !important;
            padding: 0 !important;
            page-break-after: avoid;
            transform: none !important;
            scale: none !important;
          }
          #printable-badge-a4 {
            display: block !important;
            margin: 0 auto !important;
            width: 210mm !important;
            height: 297mm !important;
          }
          #printable-badge-a4 > div { width: 100% !important; height: 100% !important; }
        }
      `}</style>

      <div className="no-print sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-sib-navy font-display">
            {t('badge.my_access_badge')}
          </h1>
          <p className="text-sm text-gray-500">Badge A4 — format officiel SIB 2026</p>
        </div>
        {badge && (
          <div className="flex flex-wrap gap-2">
            <Button onClick={handlePrint} variant="primary" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              {t('badge.print')}
            </Button>
            <Button
              onClick={() => void handleGenerateBadge()}
              disabled={generating}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
              {generating ? t('badge.regenerating') : t('badge.regenerate')}
            </Button>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8">
        {error && (
          <div className="no-print bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        )}

        {!badge && (
          <div className="no-print text-center py-16">
            <Card className="p-8 max-w-md mx-auto">
              <Scan className="w-12 h-12 text-sib-orange mx-auto mb-4" />
              <p className="text-gray-600 mb-6">{t('badge.generate_badge_info')}</p>
              <Button
                onClick={() => void handleGenerateBadge()}
                disabled={generating}
                size="lg"
                className="bg-sib-navy hover:bg-sib-navy/90"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    {t('badge.generating')}
                  </>
                ) : (
                  <>
                    <Scan className="w-5 h-5 mr-2" />
                    {t('badge.generate_my_badge')}
                  </>
                )}
              </Button>
            </Card>
          </div>
        )}

        {badge && (
          <div ref={badgeRef} className="badge-print-shell flex justify-center py-4 overflow-x-auto">
            <div className="print-page bg-white shadow-xl rounded-lg overflow-hidden shrink-0 origin-top scale-[0.42] sm:scale-[0.52] md:scale-[0.62] lg:scale-[0.72] xl:scale-[0.82]">
              <PrintableBadgeA4 badge={badge} loadConfig />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
