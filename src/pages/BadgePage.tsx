import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Printer, RefreshCw, AlertTriangle, Scan } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useTranslation } from '../hooks/useTranslation';
import {
  getUserBadge,
  generateBadgeFromUser,
} from '../services/badgeService';
import { UserBadge } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import PrintableBadgeA4 from '../components/badge/PrintableBadgeA4';

function handlePrintBadge() {
  const badgeEl = document.getElementById('printable-badge-a4');
  if (!badgeEl) {
    globalThis.print();
    return;
  }
  const printWin = window.open('', '_blank', 'width=794,height=1123');
  if (!printWin) {
    globalThis.print();
    return;
  }
  const baseUrl = window.location.origin;
  printWin.document.write(
    '<!DOCTYPE html><html><head>' +
    '<base href="' + baseUrl + '">' +
    '<style>' +
    '@page{size:A4 portrait;margin:0}' +
    'html,body{margin:0;padding:0;width:210mm;height:297mm;overflow:hidden}' +
    '</style></head><body>' +
    badgeEl.outerHTML +
    '</body></html>'
  );
  printWin.document.close();
  printWin.focus();
  setTimeout(() => {
    printWin.print();
    printWin.close();
  }, 800);
}

export default function BadgePage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [badge, setBadge] = useState<UserBadge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadBadge();
    }
  }, [user?.id]);

  async function loadBadge() {
    if (!user?.id) {return;}

    try {
      setLoading(true);
      setError(null);
      const userBadge = await getUserBadge(user.id);
      setBadge(userBadge);
    } catch (err: any) {
      console.error('Error loading badge:', err);
      setError(err.message || t('badge.error_loading'));
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateBadge() {
    if (!user?.id) {return;}

    try {
      setGenerating(true);
      setError(null);
      const newBadge = await generateBadgeFromUser(user.id);
      setBadge(newBadge);
      toast.success(t('badge.badge_generated_success'));
    } catch (err: any) {
      console.error('Error generating badge:', err);
      const errorMessage = err?.message || t('badge.error_generating');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <style>{`
        .badge-scale-wrapper {
          transform-origin: top left;
          transform: scale(0.48);
          width: 210mm;
          height: 297mm;
          position: absolute;
          top: 12px;
          left: 12px;
        }
      `}</style>

      {/* Barre d'actions */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">&#127915; {t('badge.my_access_badge')}</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {badge ? t('badge.download_print_info') : t('badge.generate_badge_info')}
          </p>
        </div>
        <div className="flex gap-3">
          {!badge ? (
            <Button
              onClick={handleGenerateBadge}
              disabled={generating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {generating ? (
                <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />{t('badge.generating')}</>
              ) : (
                <><Scan className="w-4 h-4 mr-2" />{t('badge.generate_my_badge')}</>
              )}
            </Button>
          ) : (
            <>
              <Button onClick={handlePrintBadge} variant="outline">
                <Printer className="w-4 h-4 mr-2" />
                {t('badge.print')}
              </Button>
              <Button
                onClick={handleGenerateBadge}
                disabled={generating}
                variant="ghost"
                className="text-gray-500"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
                {generating ? t('badge.regenerating') : t('badge.regenerate')}
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="no-print bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {badge && (
        <div className="badge-a4-print">
          {/* Conteneur de hauteur calculée : 297mm * 0.48 */}
          <div
            style={{
              background: '#e5e7eb',
              borderRadius: '8px',
              padding: '12px',
              height: 'calc(297mm * 0.48 + 24px)',
              position: 'relative',
            }}
          >
            <div className="badge-scale-wrapper">
              <PrintableBadgeA4 badge={badge} loadConfig={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
