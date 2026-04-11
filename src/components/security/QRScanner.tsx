import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Building2,
  Shield,
  Clock,
  MapPin,
  X
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  validateQRCode,
  ACCESS_LEVELS,
  QRCodePayload
} from '../../services/qrCodeService';

interface ScanResult {
  valid: boolean;
  payload?: QRCodePayload;
  reason?: string;
  accessLevel?: typeof ACCESS_LEVELS[keyof typeof ACCESS_LEVELS];
  timestamp: Date;
}

export default function QRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectedZone, setSelectedZone] = useState<string>('exhibition_hall');
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const resultTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Zones disponibles pour la sélection
  const zones = [
    { id: 'public', name: 'Zone Publique', icon: '🌐' },
    { id: 'exhibition_hall', name: 'Hall d\'Exposition', icon: '🏛️' },
    { id: 'vip_lounge', name: 'Salon VIP', icon: '⭐' },
    { id: 'networking_area', name: 'Zone Networking', icon: '🤝' },
    { id: 'backstage', name: 'Backstage', icon: '🎭' },
    { id: 'partner_area', name: 'Zone Partenaires', icon: '💼' },
    { id: 'exhibitor_area', name: 'Zone Exposants', icon: '🏢' },
    { id: 'technical_area', name: 'Zone Technique', icon: '🔧' }
  ];

  // Démarrer le scanner
  const startScanning = async () => {
    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        onScanSuccess,
        onScanError
      );

      setIsScanning(true);
    } catch (err) {
      console.error('Error starting scanner:', err);
      toast.error('Impossible de démarrer la caméra');
    }
  };

  // Arrêter le scanner
  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  // Callback de scan réussi
  const onScanSuccess = async (decodedText: string) => {
    // Arrêter temporairement le scanner pour traiter le résultat
    if (scannerRef.current) {
      await scannerRef.current.pause(true);
    }

    // Valider le QR code
    const result = await validateQRCode(decodedText, {
      requiredZone: selectedZone
    });

    const scanResult: ScanResult = {
      ...result,
      timestamp: new Date()
    };

    setScanResult(scanResult);
    setRecentScans(prev => [scanResult, ...prev.slice(0, 9)]);

    // Vibration feedback
    if (navigator.vibrate) {
      if (result.valid) {
        navigator.vibrate([100, 50, 100]); // Success pattern
      } else {
        navigator.vibrate([200, 100, 200]); // Error pattern
      }
    }

    // Audio feedback (optionnel)
    playFeedbackSound(result.valid);

    // Clear result après 3 secondes et reprendre le scan
    if (resultTimeoutRef.current) {
      clearTimeout(resultTimeoutRef.current);
    }
    resultTimeoutRef.current = setTimeout(() => {
      setScanResult(null);
      if (scannerRef.current && isScanning) {
        scannerRef.current.resume();
      }
    }, 3000);
  };

  // Callback d'erreur de scan
  const onScanError = (errorMessage: string) => {
    // Ignorer les erreurs normales de scan (pas de QR détecté)
    // console.warn('Scan error:', errorMessage);
  };

  // Play feedback sound
  const playFeedbackSound = (success: boolean) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = success ? 800 : 300;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
      if (resultTimeoutRef.current) {
        clearTimeout(resultTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <Card className="p-6 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Contrôle d'Accès</h1>
                <p className="text-sm text-gray-600">Scanner les badges QR</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-green-600">En ligne</span>
            </div>
          </div>

          {/* Zone Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zone de contrôle:
            </label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isScanning}
            >
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.icon} {zone.name}
                </option>
              ))}
            </select>
          </div>

          {/* Scanner Control */}
          {!isScanning ? (
            <Button
              onClick={startScanning}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
              size="lg"
            >
              <Camera className="mr-2 h-5 w-5" />
              Démarrer le Scanner
            </Button>
          ) : (
            <Button
              onClick={stopScanning}
              variant="destructive"
              className="w-full"
              size="lg"
            >
              <X className="mr-2 h-5 w-5" />
              Arrêter le Scanner
            </Button>
          )}
        </Card>

        {/* Scanner View */}
        {isScanning && (
          <Card className="p-6 bg-white/95 backdrop-blur relative overflow-hidden">
            <div className="relative">
              <div id="qr-reader" className="rounded-lg overflow-hidden"></div>

              {/* Scan overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-64 h-64 border-4 border-blue-500 rounded-lg"></div>
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-600 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-600 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-600 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-600 rounded-br-lg"></div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Scan Result */}
        <AnimatePresence>
          {scanResult && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
            >
              <Card
                className={`p-6 ${
                  scanResult.valid
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
                    : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300'
                } border-2`}
              >
                <div className="flex items-start space-x-4">
                  {scanResult.valid ? (
                    <CheckCircle className="h-12 w-12 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-12 w-12 text-red-600 flex-shrink-0" />
                  )}

                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-2 ${
                      scanResult.valid ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {scanResult.valid ? '✅ ACCÈS AUTORISÉ' : '❌ ACCÈS REFUSÉ'}
                    </h3>

                    {scanResult.payload && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-600" />
                          <span className="font-medium">{scanResult.payload.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-700">
                            {scanResult.accessLevel?.displayName}
                          </span>
                        </div>
                        {scanResult.payload.company && (
                          <div className="text-sm text-gray-600">
                            {scanResult.payload.company}
                          </div>
                        )}
                      </div>
                    )}

                    {scanResult.reason && (
                      <div className="mt-3 flex items-center space-x-2 text-red-700">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">{scanResult.reason}</span>
                      </div>
                    )}

                    <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{scanResult.timestamp.toLocaleTimeString('fr-FR')}</span>
                      <MapPin className="h-3 w-3 ml-2" />
                      <span>{selectedZone.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <Card className="p-6 bg-white/95 backdrop-blur">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Scans Récents</h3>
            <div className="space-y-2">
              {recentScans.map((scan) => (
                <div
                  key={`scan-${scan.timestamp?.getTime() || scan.code}`}
                  className={`p-3 rounded-lg flex items-center justify-between ${
                    scan.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {scan.valid ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {scan.payload?.name || 'Inconnu'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {scan.accessLevel?.displayName}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {scan.timestamp.toLocaleTimeString('fr-FR')}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
