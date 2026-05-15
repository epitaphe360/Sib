import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Download, Printer, RefreshCw, AlertTriangle, ArrowLeft } from 'lucide-react';
import PrintableBadgeA4 from '../components/badge/PrintableBadgeA4';
import useAuthStore from '../store/authStore';
import { useTranslation } from '../hooks/useTranslation';
import {
  getUserBadge,
  generateBadgeFromUser,
  renewBadge,
} from '../services/badgeService';
import { UserBadge } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { getPostLoginRedirectUrl } from '../hooks/useAuthRedirect';

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
      // Auto-renouvellement si le badge est expiré ou expire dans moins de 30 jours
      if (userBadge) {
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        if (userBadge.validUntil < thirtyDaysFromNow) {
          const renewed = await renewBadge(userBadge.id, 365);
          setBadge(renewed);
          return;
        }
      }
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

  async function handleDownloadBadge() {
    const el = document.getElementById('printable-badge-a4');
    if (!el || !badge) {return;}

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `badge-${badge.badgeCode}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success(t('badge.badge_downloaded'));
        }
      });
    } catch (err) {
      console.error('Error downloading badge:', err);
      toast.error(t('badge.download_error'));
    }
  }

  function handlePrintBadge() {
    window.print();
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
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .badge-container, .badge-container * {
              visibility: visible;
            }
            .badge-container {
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
              box-shadow: none !important;
              border: 1px solid #ccc !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      <div className="no-print mb-8 text-center">
        <Link
          to={getPostLoginRedirectUrl(user?.type)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back_to_dashboard')}
        </Link>
        <h1 className="text-3xl font-bold mb-2">🎫 {t('badge.my_access_badge')}</h1>
        <p className="text-gray-600">
          {badge
            ? t('badge.download_print_info')
            : t('badge.generate_badge_info')}
        </p>
      </div>

      {error && (
        <div className="no-print bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {!badge && (
        <div className="no-print text-center mb-8">
          <Button
            onClick={handleGenerateBadge}
            disabled={generating}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all"
          >
            {generating ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                {t('badge.generating')}
              </>
            ) : (
              <>
                <Scan className="w-5 h-5 mr-2" />
                ✨ {t('badge.generate_my_badge')}
              </>
            )}
          </Button>
        </div>
      )}

      {badge && (
        <>
          {/* Actions */}
          <div className="no-print flex flex-wrap justify-center gap-4 mb-8">
            <Button
              onClick={handleDownloadBadge}
              variant="outline"
              className="border-green-600 text-green-700 hover:bg-green-50"
            >
              <Download className="w-4 h-4 mr-2" />
              {t('badge.download_png')}
            </Button>
            <Button
              onClick={handlePrintBadge}
              variant="outline"
              className="border-gray-600 text-gray-700 hover:bg-gray-50"
            >
              <Printer className="w-4 h-4 mr-2" />
              {t('badge.print')}
            </Button>
            <Button
              onClick={handleGenerateBadge}
              disabled={generating}
              variant="ghost"
              className="text-yellow-600 hover:bg-yellow-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
              {generating ? t('badge.regenerating') : t('badge.regenerate')}
            </Button>
          </div>

          {/* Badge Display A4 */}
          <div className="flex justify-center mb-8">
            <PrintableBadgeA4 badge={badge} />
          </div>

          {/* Instructions & Stats Grid */}
          <div className="no-print grid md:grid-cols-2 gap-6">
            {/* Instructions */}
            <Card className="p-6 bg-blue-50 border-blue-100">
              <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                <Scan className="w-5 h-5" />
                {t('badge.usage_instructions')}
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
                <li><span className="font-semibold">{t('badge.instruction_1')}</span> {t('badge.instruction_1_desc')}</li>
                <li><span className="font-semibold">{t('badge.instruction_2')}</span> {t('badge.instruction_2_desc')}</li>
                <li><span className="font-semibold">{t('badge.instruction_3')}</span> {t('badge.instruction_3_desc')}</li>
                <li><span className="font-semibold">{t('badge.instruction_4')}</span> {t('badge.instruction_4_desc')}</li>
              </ol>

              {(String(badge.accessLevel) === 'admin' || String(badge.accessLevel) === 'vip' || String(badge.accessLevel) === 'premium') && (
                <div className="mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-yellow-800 text-sm">
                  <strong className="block mb-1 flex items-center gap-1">
                    <span className="text-lg">👑</span> {t('badge.vip_advantages')}
                  </strong>
                  <ul className="list-disc list-inside pl-1 space-y-1 text-xs">
                    <li>{t('badge.vip_advantage_1')}</li>
                    <li>{t('badge.vip_advantage_2')}</li>
                    <li>{t('badge.vip_advantage_3')}</li>
                  </ul>
                </div>
              )}
            </Card>

            {/* Stats */}
            <Card className="p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4">📊 {t('badge.statistics')}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">{t('badge.scans_done')}</div>
                  <div className="text-2xl font-bold text-gray-900">{badge.scanCount}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">{t('badge.status')}</div>
                  <div className={`text-sm font-bold flex items-center gap-1 ${badge.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                    {badge.status === 'active' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {badge.status === 'active' ? t('badge.active') : badge.status}
                  </div>
                </div>
                {badge.lastScannedAt && (
                  <div className="col-span-2 bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">{t('badge.last_scan')}</div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(badge.lastScannedAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}


