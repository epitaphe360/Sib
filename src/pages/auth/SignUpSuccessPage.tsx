
import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTES } from '../../lib/routes';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, Lock, Clock, Download, QrCode, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

/**
 * Génère un code QR universel UrbaEvent au format #UVE-YYYY-XXXX
 */
function generateUVECode(year: number = new Date().getFullYear()): string {
  const random = Math.floor(1000 + Math.random() * 9000).toString();
  return `UVE-${year}-${random}`;
}

export default function SignUpSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(15);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const state = location.state as any;
  const accountType = state?.accountType || 'visitor';
  const email = state?.email || '';

  // Generate and memoize the UVE code for this session
  const [uveCode] = useState(() => generateUVECode());
  const qrValue = `https://urbaevent.com/badge/${uveCode}`;

  useEffect(() => {
    if (accountType !== 'visitor') return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate(ROUTES.VISITOR_DASHBOARD, {
            state: { message: t('signupSuccess.welcomeMessage'), uveCode },
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate, accountType, uveCode]);

  const isVisitor = accountType === 'visitor';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`#${uveCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const svgEl = qrRef.current?.querySelector('svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `urbaevent-badge-${uveCode}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B4F72] via-[#2E7DB8] to-[#4598D1] flex items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="overflow-hidden shadow-2xl">
          {/* Header UrbaEvent */}
          <div className="bg-gradient-to-r from-[#4598D1] to-[#2E7DB8] p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-1">
              <div className="bg-white/20 rounded-xl px-4 py-2">
                <span className="text-xl font-bold text-white tracking-widest">URBACOM</span>
              </div>
            </div>
            <p className="text-blue-100 text-sm">UrbaEvent — Plateforme digitale multi-salons</p>
          </div>

          <div className="p-8">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[#4CAF50] rounded-full animate-pulse opacity-20" />
                <CheckCircle className="h-20 w-20 text-[#4CAF50] relative" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-center text-[#333333] mb-2"
            >
              {t('signupSuccess.title')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center text-[#647483] mb-6"
            >
              {isVisitor
                ? t('signupSuccess.visitorSuccess')
                : t('signupSuccess.registrationSuccess', {
                    role:
                      accountType === 'exhibitor'
                        ? t('signupSuccess.exhibitor')
                        : t('signupSuccess.partner'),
                  })}
            </motion.p>

            {/* ===== QR CODE UNIVERSEL UVE ===== */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-gradient-to-br from-[#F9F9FF] to-[#EBF5FB] border-2 border-[#4598D1]/30 rounded-2xl p-6 mb-6 text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <QrCode className="w-5 h-5 text-[#4598D1]" />
                <h2 className="font-bold text-[#333333] text-lg">Votre QR Code UrbaEvent</h2>
              </div>
              <p className="text-[#647483] text-sm mb-4">
                Ce QR Code est votre <strong>badge d'entrée universel</strong> et votre carte de visite digitale
                pour tous les salons Urbacom.
              </p>

              {/* QR Code Display */}
              <div ref={qrRef} className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                  <QRCodeSVG
                    value={qrValue}
                    size={160}
                    level="H"
                    fgColor="#1B365D"
                    imageSettings={{
                      src: '',
                      x: undefined,
                      y: undefined,
                      height: 32,
                      width: 32,
                      excavate: false,
                    }}
                  />
                </div>
              </div>

              {/* UVE Code display */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="bg-[#4598D1] text-white px-4 py-2 rounded-full font-mono font-bold text-lg tracking-widest shadow-md">
                  #{uveCode}
                </div>
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                  title="Copier le code"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-[#4CAF50]" />
                  ) : (
                    <Copy className="w-4 h-4 text-[#647483]" />
                  )}
                </button>
              </div>

              {/* Download button */}
              <button
                onClick={handleDownloadQR}
                className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-full border-2 border-[#4598D1] text-[#4598D1] font-semibold text-sm hover:bg-[#4598D1] hover:text-white transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                Télécharger mon E-Badge
              </button>
            </motion.div>

            {/* Email confirmation */}
            {email && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6"
              >
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-[#4598D1] flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-[#333333]">{t('signupSuccess.registrationEmail')}</p>
                    <p className="text-[#647483]">{email}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Next Steps */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className={`rounded-xl p-6 text-left mb-6 border ${
                isVisitor
                  ? 'bg-[#E8F5E9] border-[#4CAF50]/30'
                  : 'bg-[#FDF3E7] border-[#EB9A44]/30'
              }`}
            >
              <h2
                className={`font-semibold mb-4 text-lg flex items-center ${
                  isVisitor ? 'text-green-900' : 'text-[#333333]'
                }`}
              >
                {isVisitor ? t('signupSuccess.accessTo') : t('signupSuccess.nextSteps')}
              </h2>
              <ul className="space-y-3">
                {isVisitor ? (
                  <>
                    {[
                      { label: t('signupSuccess.catalogLabel'), desc: t('signupSuccess.catalogFeature') },
                      { label: t('signupSuccess.programLabel'), desc: t('signupSuccess.programFeature') },
                      { label: t('signupSuccess.networkingLabel'), desc: t('signupSuccess.networkingFeature') },
                      { label: t('signupSuccess.profileLabel'), desc: t('signupSuccess.profileFeature') },
                    ].map((item, i) => (
                      <li key={i} className="flex items-start text-sm text-green-800">
                        <CheckCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-[#4CAF50]" />
                        <span>
                          <strong>{item.label}</strong> {item.desc}
                        </span>
                      </li>
                    ))}
                  </>
                ) : (
                  <>
                    <li className="flex items-start text-sm text-[#647483]">
                      <Mail className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-[#4598D1]" />
                      <span>
                        <strong>{t('signupSuccess.confirmationLabel')}</strong>{' '}
                        {t('signupSuccess.confirmationEmail')}
                      </span>
                    </li>
                    <li className="flex items-start text-sm text-[#647483]">
                      <Clock className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-[#EB9A44]" />
                      <span>
                        <strong>{t('signupSuccess.validationLabel')}</strong>{' '}
                        {t('signupSuccess.validationStep')}
                      </span>
                    </li>
                    <li className="flex items-start text-sm text-[#647483]">
                      <Lock className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-[#4598D1]" />
                      <span>
                        <strong>{t('signupSuccess.activationLabel')}</strong>{' '}
                        {t('signupSuccess.activationStep')}
                      </span>
                    </li>
                  </>
                )}
              </ul>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-3"
            >
              {isVisitor ? (
                <>
                  <Button
                    className="w-full rounded-full font-semibold py-3"
                    style={{ backgroundColor: '#4598D1' }}
                    onClick={() => navigate(ROUTES.VISITOR_DASHBOARD)}
                  >
                    {t('signupSuccess.goToDashboard')}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full rounded-full font-semibold py-3 border-2 border-[#4598D1] text-[#4598D1]"
                    onClick={() => navigate(ROUTES.SALON_SELECTION)}
                  >
                    Explorer les salons UrbaEvent
                  </Button>
                  {countdown > 0 && (
                    <p className="text-center text-sm text-[#647483]">
                      Redirection automatique dans <strong>{countdown}s</strong>…
                    </p>
                  )}
                </>
              ) : (
                <>
                  <Link to={ROUTES.LOGIN} className="block">
                    <Button
                      className="w-full rounded-full font-semibold py-3"
                      style={{ backgroundColor: '#4598D1' }}
                    >
                      {t('signupSuccess.login')}
                    </Button>
                  </Link>
                  <Link to={ROUTES.SALON_SELECTION} className="block">
                    <Button
                      variant="outline"
                      className="w-full rounded-full font-semibold py-3 border-2 border-[#4598D1] text-[#4598D1]"
                    >
                      Découvrir les salons UrbaEvent
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>

            {/* Support */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center text-sm text-[#647483] mt-6 pt-6 border-t border-gray-200"
            >
              {t('signupSuccess.questions')}{' '}
              <a href="mailto:support@urbaevent.com" className="text-[#4598D1] hover:underline font-semibold">
                {t('signupSuccess.contactSupport')}
              </a>
            </motion.p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
