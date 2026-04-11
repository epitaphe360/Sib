import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import {
  Shield,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Card } from '../ui/Card';
import useAuthStore from '../../store/authStore';
import { useTranslation } from '../../hooks/useTranslation';
import {
  generateSecureQRCode,
  ACCESS_LEVELS,
  QRCodePayload
} from '../../services/qrCodeService';

const QR_ROTATION_INTERVAL = 30 * 1000; // 30 secondes

export default function DigitalBadge() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [payload, setPayload] = useState<QRCodePayload | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [isRotating, setIsRotating] = useState(false);
  const [error, setError] = useState<string>('');

  // Générer un nouveau QR code
  const generateQR = async () => {
    if (!user) return;

    try {
      setIsRotating(true);
      setError('');

      const { qrData, payload: newPayload, expiresAt: newExpiry } =
        await generateSecureQRCode(user.id);

      // Générer l'image QR code
      const dataURL = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      });

      setQrCodeDataURL(dataURL);
      setPayload(newPayload);
      setExpiresAt(newExpiry);
    } catch (err: any) {
      console.error('Error generating QR code:', err);
      setError(t('badge.error_generating'));
    } finally {
      setTimeout(() => setIsRotating(false), 500);
    }
  };

  // Générer le QR initial
  useEffect(() => {
    if (user) {
      generateQR();
    }
  }, [user]);

  // Rotation automatique du QR code
  useEffect(() => {
    const interval = setInterval(() => {
      generateQR();
    }, QR_ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [user]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (expiresAt) {
        const remaining = Math.max(
          0,
          Math.floor((expiresAt.getTime() - Date.now()) / 1000)
        );
        setSecondsRemaining(remaining);

        // Régénérer automatiquement si expiré
        if (remaining === 0) {
          generateQR();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!user || !payload) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('badge.loading_badge')}</p>
        </div>
      </div>
    );
  }

  // Obtenir les informations de niveau d'accès
  let accessKey = `${payload.userType}_${payload.level}` as keyof typeof ACCESS_LEVELS;
  
  // Correction pour les types qui n'ont pas de préfixe composé dans ACCESS_LEVELS
  if (['admin', 'security', 'exhibitor'].includes(payload.userType)) {
    accessKey = payload.userType as keyof typeof ACCESS_LEVELS;
  }

  const accessLevel = ACCESS_LEVELS[accessKey] || {
    color: '#CCCCCC',
    displayName: t('badge.unknown_level'),
    zones: [],
    events: []
  };
  const isExpiring = secondsRemaining <= 10;
  const progressPercent = (secondsRemaining / 60) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Badge Card */}
        <Card
          className="relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${accessLevel.color}15, ${accessLevel.color}05)`,
            borderColor: accessLevel.color,
            borderWidth: 2
          }}
        >
          {/* Decorative Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>

          {/* Header */}
          <div className="relative p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6" style={{ color: accessLevel.color }} />
                <h2 className="text-xl font-bold text-gray-900">{t('badge.access_badge')}</h2>
              </div>
              <div
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: `${accessLevel.color}20`,
                  color: accessLevel.color
                }}
              >
                {accessLevel.displayName}
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-4">
              {payload.photo ? (
                <img
                  src={payload.photo}
                  alt={payload.name}
                  className="w-16 h-16 rounded-full object-cover border-2"
                  style={{ borderColor: accessLevel.color }}
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: accessLevel.color }}
                >
                  {payload.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-bold text-gray-900">{payload.name}</h3>
                {payload.name !== payload.email && (
                  <p className="text-sm text-gray-600">{payload.email}</p>
                )}
                {payload.company && (
                  <p className="text-xs text-gray-500 mt-1">{payload.company}</p>
                )}
                {payload.badgeNumber && (
                  <p className="text-xs font-mono text-gray-400 mt-1">
                    #{payload.badgeNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="relative p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={qrCodeDataURL}
                initial={{ opacity: 0, rotate: -5, scale: 0.95 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 5, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-4 rounded-2xl shadow-2xl mx-auto"
                style={{
                  width: 'fit-content',
                  boxShadow: `0 20px 60px ${accessLevel.color}40`
                }}
              >
                {/* QR Code */}
                {qrCodeDataURL && (
                  <img
                    src={qrCodeDataURL}
                    alt="QR Code Badge"
                    className="w-64 h-64 mx-auto"
                  />
                )}

                {/* Rotating indicator */}
                {isRotating && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <RefreshCw className="h-12 w-12 animate-spin" style={{ color: accessLevel.color }} />
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Timer and Status */}
            <div className="mt-6 space-y-3">
              {/* Progress Bar */}
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ backgroundColor: isExpiring ? '#EF4444' : accessLevel.color }}
                  initial={{ width: '100%' }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Timer Display */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock
                    className={`h-4 w-4 ${isExpiring ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}
                  />
                  <span className={`text-sm font-mono ${isExpiring ? 'text-red-500 font-bold' : 'text-gray-600'}`}>
                    {Math.floor(secondsRemaining / 60)}:
                    {(secondsRemaining % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <RefreshCw className="h-3 w-3" />
                  <span>{t('badge.automatic_rotation')}</span>
                </div>
              </div>

              {/* Security Indicator */}
              <div className="flex items-center justify-center space-x-2 text-xs text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">{t('badge.secure_qr_jwt')}</span>
              </div>
            </div>
          </div>

          {/* Access Zones */}
          <div className="relative p-6 border-t border-gray-200 bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Sparkles className="h-4 w-4 mr-2" style={{ color: accessLevel.color }} />
              {t('badge.authorized_zones')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {payload.zones.map((zone) => (
                <span
                  key={zone}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-white border"
                  style={{ borderColor: accessLevel.color, color: accessLevel.color }}
                >
                  {zone === 'all' ? `🌟 ${t('badge.total_access')}` : zone.replace(/_/g, ' ').toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border-t border-red-200">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Manual Refresh Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={generateQR}
              disabled={isRotating}
              className="w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
              style={{
                backgroundColor: isRotating ? '#E5E7EB' : accessLevel.color,
                color: isRotating ? '#9CA3AF' : '#FFFFFF'
              }}
            >
              <RefreshCw className={`h-4 w-4 ${isRotating ? 'animate-spin' : ''}`} />
              <span>{t('badge.regenerate_qr')}</span>
            </button>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="mt-4 p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">{t('badge.max_security')}</p>
              <p className="text-blue-700">
                {t('badge.security_info')}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
