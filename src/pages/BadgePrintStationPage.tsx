/**
 * Page Station d'Impression de Badges - Service Clientèle
 * 
 * Cette page est utilisée par le personnel du stand "Service Clientèle"
 * pour scanner les QR codes des participants et imprimer leurs badges papier.
 *
 * Fonctionnalités :
 * - Scanner QR code via caméra
 * - Recherche manuelle par email/nom
 * - Aperçu du badge avant impression
 * - Impression directe vers imprimante
 * - Historique des impressions
 * - Statistiques en temps réel
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import QRCode from 'qrcode';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';
import { useTranslation } from '../hooks/useTranslation';
import {
  Camera,
  CameraOff,
  Search,
  Printer,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  LogOut,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  History,
  BarChart3,
  QrCode,
  CreditCard,
  Badge,
  X,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  lookupBadgeByQRData,
  lookupBadgeByEmail,
  lookupBadgeByName,
  recordPrint,
  getPrintHistory,
  getPrintStats,
  BadgeLookupResult,
  PrintRecord,
} from '../services/badgePrintService';
import { generateBadgeFromUser } from '../services/badgeService';
import { getBadgeColor, getAccessLevelLabel } from '../services/badgeService';
import PrintableBadge from '../components/badge/PrintableBadge';

type Tab = 'scanner' | 'search' | 'history' | 'stats';
type BadgeFormat = 'card' | 'badge';

export default function BadgePrintStationPage() {
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isServiceMode = user?.type === 'security' || user?.email === 'service-clientele@sibs.com';

  const handleLogout = async () => {
    await stopScanning();
    await logout();
    navigate('/login');
  };

  // --- State ---
  const [activeTab, setActiveTab] = useState<Tab>('scanner');
  const [isScanning, setIsScanning] = useState(false);
  const [lookupResult, setLookupResult] = useState<BadgeLookupResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'email' | 'name'>('email');
  const [searchResults, setSearchResults] = useState<BadgeLookupResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [badgeFormat, setBadgeFormat] = useState<BadgeFormat>('badge');
  const [printHistory, setPrintHistory] = useState<PrintRecord[]>([]);
  const [stats, setStats] = useState(getPrintStats());
  const [stationId] = useState(() => `STATION-${Math.random().toString(36).slice(2, 6).toUpperCase()}`);

  const scannerRef = useRef<Html5Qrcode | null>(null);

  // --- Refresh stats/history ---
  const refreshData = useCallback(() => {
    setPrintHistory(getPrintHistory().slice(0, 50));
    setStats(getPrintStats());
  }, []);

  useEffect(() => {
    refreshData();
  }, []);

  // --- QR Scanner ---
  const startScanning = async () => {
    try {
      const html5QrCode = new Html5Qrcode('badge-print-qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 280, height: 280 } },
        onScanSuccess,
        () => {} // Ignorer les erreurs de scan partiel
      );

      setIsScanning(true);
      toast.success(t('badge.print.camera_activated'));
    } catch (err) {
      console.error(t('badge.print.error_camera'), err);
      toast.error('Impossible d\'activer la caméra. Vérifiez les permissions.');
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // Ignore
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const onScanSuccess = async (decodedText: string) => {
    // Pause le scanner pendant le traitement
    await stopScanning();

    toast.loading('Recherche du badge...', { id: 'scan-lookup' });

    const result = await lookupBadgeByQRData(decodedText);
    setLookupResult(result);

    if (result.found && result.badge) {
      toast.success(`Badge trouvé : ${result.badge.fullName}`, { id: 'scan-lookup' });
    } else {
      toast.error(result.error || 'Badge non trouvé', { id: 'scan-lookup' });
    }
  };

  // --- Recherche manuelle ---
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    setLookupResult(null);

    try {
      if (searchType === 'email') {
        const result = await lookupBadgeByEmail(searchQuery);
        if (result.found) {
          setLookupResult(result);
          setSearchResults([result]);
          toast.success(`Badge trouvé : ${result.badge?.fullName}`);
        } else {
          setSearchResults([result]);
          toast.error(result.error || 'Aucun résultat');
        }
      } else {
        const results = await lookupBadgeByName(searchQuery);
        setSearchResults(results);
        if (results.length === 1 && results[0].found) {
          setLookupResult(results[0]);
        }
        toast.info(`${results.filter(r => r.found).length} résultat(s) trouvé(s)`);
      }
    } catch (err) {
      toast.error('Erreur de recherche');
    } finally {
      setIsSearching(false);
    }
  };

  // --- Générer badge pour un user sans badge ---
  const handleGenerateBadge = async (userId: string) => {
    setIsGenerating(true);
    try {
      const badge = await generateBadgeFromUser(userId);
      const result = await lookupBadgeByQRData(JSON.stringify({ code: badge.badgeCode }));
      setLookupResult(result);
      toast.success(t('badge.print.generated'));
    } catch (err) {
      toast.error('Erreur lors de la génération du badge');
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Impression ---
  const handlePrint = async () => {
    if (!lookupResult?.badge) return;

    setIsPrinting(true);

    try {
      const badge = lookupResult.badge;
      const badgeColor = getBadgeColor(badge.accessLevel || badge.userType);
      const accessLabel = getAccessLevelLabel(badge.accessLevel || badge.userType);

      // Générer le QR code
      const qrData = JSON.stringify({
        code: badge.badgeCode,
        userId: badge.userId,
        type: badge.userType,
        level: badge.accessLevel,
        name: badge.fullName,
      });

      const qrDataURL = await QRCode.toDataURL(qrData, {
        width: badgeFormat === 'card' ? 150 : 250,
        margin: 1,
        errorCorrectionLevel: 'H',
      });

      const isCard = badgeFormat === 'card';

      // Construire le HTML d'impression
      const printHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Badge - ${badge.fullName}</title>
  <style>
    @page {
      size: ${isCard ? '86mm 54mm' : '105mm 148mm'};
      margin: 0;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .badge {
      width: ${isCard ? '86mm' : '105mm'};
      height: ${isCard ? '54mm' : '148mm'};
      background: #FFFFFF;
      position: relative;
      overflow: hidden;
      page-break-inside: avoid;
    }
    .badge-header {
      height: ${isCard ? '6mm' : '12mm'};
      background: linear-gradient(135deg, ${badgeColor}, ${badgeColor}dd);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 3mm;
      color: white;
    }
    .event-name {
      font-size: ${isCard ? '7pt' : '11pt'};
      font-weight: bold;
      letter-spacing: 1px;
    }
    .access-label {
      font-size: ${isCard ? '5pt' : '8pt'};
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: rgba(255,255,255,0.2);
      padding: 1px 4px;
      border-radius: 2px;
    }
    .badge-body {
      padding: ${isCard ? '2mm 3mm' : '4mm 5mm'};
      display: flex;
      flex-direction: ${isCard ? 'row' : 'column'};
      align-items: center;
      gap: ${isCard ? '3mm' : '3mm'};
      height: calc(100% - ${isCard ? '6mm' : '12mm'});
    }
    .avatar {
      width: 25mm;
      height: 25mm;
      border-radius: 50%;
      overflow: hidden;
      border: 2px solid ${badgeColor};
      flex-shrink: 0;
    }
    .avatar img { width: 100%; height: 100%; object-fit: cover; }
    .info {
      text-align: ${isCard ? 'left' : 'center'};
      ${isCard ? 'flex: 1; min-width: 0;' : ''}
    }
    .name {
      font-size: ${isCard ? '9pt' : '14pt'};
      font-weight: bold;
      color: #1a1a1a;
      line-height: 1.2;
      margin-bottom: ${isCard ? '1mm' : '2mm'};
      word-break: break-word;
    }
    .position {
      font-size: ${isCard ? '6pt' : '9pt'};
      color: #555;
      margin-bottom: 1mm;
    }
    .company {
      font-size: ${isCard ? '7pt' : '10pt'};
      font-weight: 600;
      color: ${badgeColor};
      margin-bottom: ${isCard ? '0' : '2mm'};
    }
    .stand {
      font-size: ${isCard ? '6pt' : '9pt'};
      color: #333;
      background: #f5f5f5;
      padding: 1px 6px;
      border-radius: 3px;
      display: inline-block;
      margin-top: 1mm;
    }
    .qr-section { flex-shrink: 0; text-align: center; }
    .qr-code {
      width: ${isCard ? '14mm' : '30mm'};
      height: ${isCard ? '14mm' : '30mm'};
    }
    .badge-code {
      font-size: 6pt;
      color: #999;
      margin-top: 1mm;
      font-family: monospace;
    }
    .footer {
      position: absolute;
      bottom: 3mm;
      left: 5mm;
      right: 5mm;
      text-align: center;
      font-size: 6pt;
      color: #999;
      border-top: 1px solid #eee;
      padding-top: 2mm;
    }
  </style>
</head>
<body>
  <div class="badge">
    <div class="badge-header">
      <span class="event-name">SIB 2026</span>
      <span class="access-label">${accessLabel}</span>
    </div>
    <div class="badge-body">
      ${!isCard && badge.avatarUrl ? `
        <div class="avatar">
          <img src="${badge.avatarUrl}" alt="${badge.fullName}" crossorigin="anonymous" />
        </div>
      ` : ''}
      <div class="info">
        <div class="name">${badge.fullName}</div>
        ${badge.position ? `<div class="position">${badge.position}</div>` : ''}
        ${badge.companyName ? `<div class="company">${badge.companyName}</div>` : ''}
        ${badge.standNumber ? `<div class="stand">Stand: ${badge.standNumber}</div>` : ''}
      </div>
      <div class="qr-section">
        <img class="qr-code" src="${qrDataURL}" alt="QR Code" />
        ${!isCard ? `<div class="badge-code">${badge.badgeCode}</div>` : ''}
      </div>
      ${!isCard ? `
        <div class="footer">
          <div>1 - 3 Avril 2026 • El Jadida, Maroc</div>
          <div style="margin-top: 0.5mm">
            Valide du ${new Date(badge.validFrom).toLocaleDateString('fr-FR')} au ${new Date(badge.validUntil).toLocaleDateString('fr-FR')}
          </div>
        </div>
      ` : ''}
    </div>
  </div>
</body>
</html>`;

      // Ouvrir une fenêtre d'impression
      const printWindow = window.open('', '_blank', 'width=600,height=800');
      if (!printWindow) {
        toast.error('Veuillez autoriser les popups pour l\'impression');
        setIsPrinting(false);
        return;
      }

      printWindow.document.write(printHTML);
      printWindow.document.close();

      // Attendre le chargement puis imprimer
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();

          // Enregistrer l'impression
          recordPrint({
            badgeId: badge.id,
            badgeCode: badge.badgeCode,
            fullName: badge.fullName,
            userType: badge.userType,
            printedAt: new Date(),
            printedBy: 'Service Clientèle',
            stationId,
            status: 'success',
            copies: 1,
          });

          refreshData();
          toast.success(t('badge.print.sent'));
          setIsPrinting(false);
        }, 500);
      };
    } catch (err) {
      console.error(t('badge.print.error_printing'), err);
      toast.error('Erreur lors de l\'impression');

      if (lookupResult?.badge) {
        recordPrint({
          badgeId: lookupResult.badge.id,
          badgeCode: lookupResult.badge.badgeCode,
          fullName: lookupResult.badge.fullName,
          userType: lookupResult.badge.userType,
          printedAt: new Date(),
          printedBy: 'Service Clientèle',
          stationId,
          status: 'error',
          copies: 0,
        });
        refreshData();
      }

      setIsPrinting(false);
    }
  };

  // --- Reset ---
  const handleReset = () => {
    setLookupResult(null);
    setSearchResults([]);
    setSearchQuery('');
  };

  // --- Cleanup ---
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  // --- UI ---
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'scanner', label: 'Scanner QR', icon: <QrCode className="w-5 h-5" /> },
    { id: 'search', label: 'Recherche', icon: <Search className="w-5 h-5" /> },
    { id: 'history', label: 'Historique', icon: <History className="w-5 h-5" /> },
    { id: 'stats', label: 'Statistiques', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Printer className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Station d'Impression de Badges
              </h1>
              <p className="text-sm text-gray-500">
                {isServiceMode && user?.name
                  ? `Opérateur: ${user.name} — `
                  : 'Service Clientèle — '}
                SIB 2026 • Station: {stationId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Logout button for service mode */}
            {isServiceMode && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-medium text-sm"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            )}

            {/* Format selector */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setBadgeFormat('badge')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  badgeFormat === 'badge'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Badge className="w-4 h-4 inline mr-1" />
                Badge A6
              </button>
              <button
                onClick={() => setBadgeFormat('card')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  badgeFormat === 'card'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <CreditCard className="w-4 h-4 inline mr-1" />
                Carte
              </button>
            </div>

            {/* Quick stats */}
            <div className="hidden md:flex items-center gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-green-600">{stats.todayPrinted}</div>
                <div className="text-gray-400 text-xs">Aujourd'hui</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-600">{stats.totalPrinted}</div>
                <div className="text-gray-400 text-xs">Total</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 mt-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id !== 'scanner') stopScanning();
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left panel — Scanner / Search */}
          <div>
            <AnimatePresence mode="wait">
              {/* SCANNER TAB */}
              {activeTab === 'scanner' && (
                <motion.div
                  key="scanner"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className="overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                      <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Camera className="w-5 h-5 text-blue-600" />
                        Scanner de QR Code
                      </h2>
                      <Button
                        onClick={isScanning ? stopScanning : startScanning}
                        variant={isScanning ? 'destructive' : 'default'}
                        size="sm"
                      >
                        {isScanning ? (
                          <>
                            <CameraOff className="w-4 h-4 mr-1" />
                            Arrêter
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4 mr-1" />
                            Démarrer
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="relative bg-black" style={{ minHeight: '320px' }}>
                      <div id="badge-print-qr-reader" className="w-full" />
                      {!isScanning && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gray-900">
                          <QrCode className="w-16 h-16 mb-4 opacity-30" />
                          <p className="text-gray-400 text-sm">
                            Cliquez sur "Démarrer" pour activer la caméra
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            Présentez le badge numérique du participant
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-gray-50 text-center text-xs text-gray-500">
                      💡 Conseil: Assurez-vous que le QR code est bien éclairé et net
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* SEARCH TAB */}
              {activeTab === 'search' && (
                <motion.div
                  key="search"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card>
                    <div className="p-4 border-b border-gray-100">
                      <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Search className="w-5 h-5 text-blue-600" />
                        Recherche Manuelle
                      </h2>
                    </div>
                    <div className="p-4 space-y-4">
                      {/* Type de recherche */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSearchType('email')}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                            searchType === 'email'
                              ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                              : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                          }`}
                        >
                          <Mail className="w-4 h-4 inline mr-1" />
                          Par Email
                        </button>
                        <button
                          onClick={() => setSearchType('name')}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                            searchType === 'name'
                              ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                              : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                          }`}
                        >
                          <User className="w-4 h-4 inline mr-1" />
                          Par Nom
                        </button>
                      </div>

                      {/* Search input */}
                      <div className="flex gap-2">
                        <input
                          type={searchType === 'email' ? 'email' : 'text'}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                          placeholder={
                            searchType === 'email'
                              ? 'exemple@email.com'
                              : 'Nom du participant...'
                          }
                          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                        <Button
                          onClick={handleSearch}
                          disabled={isSearching || !searchQuery.trim()}
                        >
                          {isSearching ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Search className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      {/* Résultats de recherche */}
                      {searchResults.length > 0 && (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {searchResults.map((result, idx) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                lookupResult === result
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                              }`}
                              onClick={() => {
                                if (result.found && result.badge) {
                                  setLookupResult(result);
                                }
                              }}
                            >
                              {result.found && result.badge ? (
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                    style={{ backgroundColor: getBadgeColor(result.badge.accessLevel || result.badge.userType) }}
                                  >
                                    {result.badge.fullName.charAt(0)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 truncate">
                                      {result.badge.fullName}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {result.badge.companyName} • {getAccessLevelLabel(result.badge.accessLevel || result.badge.userType)}
                                    </div>
                                  </div>
                                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-sm text-red-600">
                                  <XCircle className="w-4 h-4" />
                                  {result.error}
                                  {result.user?.id && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleGenerateBadge(result.user!.id);
                                      }}
                                      disabled={isGenerating}
                                      className="ml-auto"
                                    >
                                      {isGenerating ? (
                                        <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                                      ) : (
                                        <Badge className="w-3 h-3 mr-1" />
                                      )}
                                      Générer badge
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* HISTORY TAB */}
              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card>
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                      <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                        <History className="w-5 h-5 text-blue-600" />
                        Historique d'Impression
                      </h2>
                      <Button variant="ghost" size="sm" onClick={refreshData}>
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                      {printHistory.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                          <History className="w-12 h-12 mx-auto mb-2 opacity-30" />
                          <p>Aucune impression pour le moment</p>
                        </div>
                      ) : (
                        printHistory.map((record) => (
                          <div key={record.id} className="p-3 flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              record.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {record.status === 'success' ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {record.fullName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {record.badgeCode} • {record.userType}
                              </div>
                            </div>
                            <div className="text-xs text-gray-400 text-right">
                              {new Date(record.printedAt).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* STATS TAB */}
              {activeTab === 'stats' && (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card>
                    <div className="p-4 border-b border-gray-100">
                      <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        Statistiques du Jour
                      </h2>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-green-700">{stats.todayPrinted}</div>
                        <div className="text-sm text-green-600 mt-1">Imprimés aujourd'hui</div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-blue-700">{stats.totalPrinted}</div>
                        <div className="text-sm text-blue-600 mt-1">Total imprimé</div>
                      </div>
                      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-red-700">{stats.errorCount}</div>
                        <div className="text-sm text-red-600 mt-1">Erreurs</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-purple-700">
                          {Object.keys(stats.byType).length}
                        </div>
                        <div className="text-sm text-purple-600 mt-1">Types de badge</div>
                      </div>
                    </div>

                    {/* Répartition par type */}
                    {Object.keys(stats.byType).length > 0 && (
                      <div className="px-4 pb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">
                          Répartition par type
                        </h3>
                        <div className="space-y-2">
                          {Object.entries(stats.byType).map(([type, count]) => (
                            <div key={type} className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: getBadgeColor(type) }}
                              />
                              <span className="text-sm text-gray-600 flex-1">
                                {getAccessLevelLabel(type)}
                              </span>
                              <span className="text-sm font-semibold">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right panel — Badge Preview & Print */}
          <div className="space-y-4">
            {/* Badge Preview Card */}
            <Card>
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Badge className="w-5 h-5 text-blue-600" />
                  Aperçu du Badge
                </h2>
                {lookupResult?.badge && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={handleReset}>
                      <X className="w-4 h-4 mr-1" />
                      Effacer
                    </Button>
                  </div>
                )}
              </div>

              <div className="p-6">
                {lookupResult?.found && lookupResult.badge ? (
                  <div className="space-y-4">
                    {/* Badge visuel en aperçu */}
                    <div className="flex justify-center">
                      <div className="transform scale-90 origin-top">
                        <PrintableBadge
                          badge={lookupResult.badge}
                          format={badgeFormat}
                        />
                      </div>
                    </div>

                    {/* Informations détaillées */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{lookupResult.badge.fullName}</span>
                        <span
                          className="ml-auto px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: getBadgeColor(lookupResult.badge.accessLevel || lookupResult.badge.userType) }}
                        >
                          {getAccessLevelLabel(lookupResult.badge.accessLevel || lookupResult.badge.userType)}
                        </span>
                      </div>

                      {lookupResult.badge.email && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {lookupResult.badge.email}
                        </div>
                      )}

                      {lookupResult.badge.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {lookupResult.badge.phone}
                        </div>
                      )}

                      {lookupResult.badge.companyName && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          {lookupResult.badge.companyName}
                        </div>
                      )}

                      {lookupResult.badge.standNumber && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          Stand: {lookupResult.badge.standNumber}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-gray-600">
                        <QrCode className="w-4 h-4 text-gray-400" />
                        Code: {lookupResult.badge.badgeCode}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handlePrint}
                        disabled={isPrinting}
                      >
                        {isPrinting ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Impression...
                          </>
                        ) : (
                          <>
                            <Printer className="w-4 h-4 mr-2" />
                            Imprimer le Badge
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          // Re-scan
                          handleReset();
                          if (activeTab === 'scanner') startScanning();
                        }}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Nouveau
                      </Button>
                    </div>
                  </div>
                ) : lookupResult && !lookupResult.found ? (
                  <div className="text-center py-8 space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 flex items-center justify-center">
                      <AlertTriangle className="w-8 h-8 text-amber-500" />
                    </div>
                    <p className="text-gray-600 font-medium">Badge non trouvé</p>
                    <p className="text-sm text-gray-400">{lookupResult.error}</p>
                    {lookupResult.user?.id && (
                      <Button
                        onClick={() => handleGenerateBadge(lookupResult.user!.id)}
                        disabled={isGenerating}
                        className="mt-2"
                      >
                        {isGenerating ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Badge className="w-4 h-4 mr-2" />
                        )}
                        Générer le Badge
                      </Button>
                    )}
                    <Button variant="ghost" onClick={handleReset} className="block mx-auto">
                      Recommencer
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <QrCode className="w-10 h-10 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">
                      En attente de scan...
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Scannez un QR code ou recherchez un participant
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Instructions rapides */}
            <Card>
              <div className="p-4">
                <h3 className="font-semibold text-gray-700 text-sm mb-3">
                  📋 Guide Rapide
                </h3>
                <ol className="text-xs text-gray-500 space-y-1.5 list-decimal list-inside">
                  <li>
                    <strong>Scanner</strong> le QR code du badge numérique du participant
                  </li>
                  <li>
                    <strong>Vérifier</strong> les informations affichées (nom, type, entreprise)
                  </li>
                  <li>
                    Choisir le <strong>format</strong> (Badge A6 ou Carte de visite)
                  </li>
                  <li>
                    Cliquer sur <strong>"Imprimer le Badge"</strong> pour envoyer à l'imprimante
                  </li>
                  <li>
                    Si le badge n'existe pas, utiliser le bouton <strong>"Générer le Badge"</strong>
                  </li>
                </ol>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
