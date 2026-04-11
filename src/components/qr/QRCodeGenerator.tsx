import React, { useState, useEffect } from 'react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  QrCode, 
  Download, 
  Calendar, 
  Users, 
  Crown, 
  Star,
  Shield,
  Clock,
  MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import { 
  generateQRCodeData, 
  formatQRCodeForDisplay, 
  getAccessibleEvents,
  getHighestAccessLevel,
  type EventAccess 
} from '../../lib/qrCodeSystem';
import { toast } from 'sonner';

interface QRCodeGeneratorProps {
  eventId?: string;
  showEvents?: boolean;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  eventId, 
  showEvents = true 
}) => {
  const { user } = useAuthStore();
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>(eventId);
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [accessibleEvents, setAccessibleEvents] = useState<EventAccess[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Get accessible events for this user
    const events = getAccessibleEvents(
      user.type, 
      user.profile?.passType || user.profile?.status || 'free'
    );
    setAccessibleEvents(events);

    // Generate QR code
    generateQRCode();
  }, [user, selectedEventId]);

  const generateQRCode = () => {
    if (!user) return;

    setIsGenerating(true);
    
    // Simulate generation delay for better UX
    setTimeout(() => {
      const qrData = generateQRCodeData(
        user.id,
        user.type,
        user.profile?.passType || user.profile?.status || 'free',
        selectedEventId
      );
      
      const qrString = formatQRCodeForDisplay(qrData);
      setQrCodeData(qrString);
      setIsGenerating(false);
    }, 500);
  };

  const downloadQRCode = () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      const eventName = selectedEventId 
        ? accessibleEvents.find(e => e.eventId === selectedEventId)?.eventName || 'événement'
        : 'accès-général';
      
      link.download = `qr-siports-${eventName.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success('QR Code téléchargé avec succès ! 📱');
    }
  };

  const getEventTypeColor = (eventType: string): string => {
    switch (eventType) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'premium': return 'bg-blue-100 text-blue-800';
      case 'vip': return 'bg-purple-100 text-purple-800';
      case 'partner': return 'bg-amber-100 text-amber-800';
      case 'gala': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'vip': return <Crown className="h-4 w-4" />;
      case 'partner': return <Star className="h-4 w-4" />;
      case 'gala': return <Shield className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  if (!user) {
    return (
      <Card className="p-6 text-center">
        <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Vous devez être connecté pour générer un QR code.</p>
      </Card>
    );
  }

  const userAccessLevel = getHighestAccessLevel(
    user.type, 
    user.profile?.passType || user.profile?.status || 'free'
  );

  return (
    <div className="space-y-6">
      {/* User Access Level */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-600" />
            Votre Niveau d'Accès
          </h3>
          <Badge variant="success" className="text-sm">
            {userAccessLevel.level}
          </Badge>
        </div>
        <p className="text-gray-600 mb-4">{userAccessLevel.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {userAccessLevel.capabilities.map((capability) => (
            <div key={capability} className="flex items-center text-sm text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
              {capability}
            </div>
          ))}
        </div>
      </Card>

      {/* Event Selection */}
      {showEvents && accessibleEvents.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-green-600" />
            Sélectionner un Événement
          </h3>
          <div className="grid grid-cols-1 gap-3 mb-4">
            <button
              onClick={() => setSelectedEventId(undefined)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                !selectedEventId 
                  ? 'bg-blue-50 border-blue-300 text-blue-900' 
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <QrCode className="h-5 w-5 mr-3 text-blue-600" />
                <div>
                  <div className="font-medium">QR Code Général</div>
                  <div className="text-sm text-gray-600">Accès à tous vos événements disponibles</div>
                </div>
              </div>
            </button>
            
            {accessibleEvents.map((event) => (
              <button
                key={event.eventId}
                onClick={() => setSelectedEventId(event.eventId)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  selectedEventId === event.eventId 
                    ? 'bg-blue-50 border-blue-300 text-blue-900' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    {getEventIcon(event.eventType)}
                    <div className="ml-3">
                      <div className="font-medium">{event.eventName}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {event.startTime.toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.location}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge 
                      variant="default" 
                      className={`text-xs ${getEventTypeColor(event.eventType)}`}
                    >
                      {event.eventType.toUpperCase()}
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1">
                      <Users className="h-3 w-3 inline mr-1" />
                      {event.currentAttendees}/{event.maxCapacity}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* QR Code Display */}
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center">
            <QrCode className="h-5 w-5 mr-2 text-blue-600" />
            {selectedEventId 
              ? `QR Code - ${accessibleEvents.find(e => e.eventId === selectedEventId)?.eventName}`
              : 'QR Code d\'Accès Général'
            }
          </h3>
          
          {isGenerating ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Génération du QR code...</span>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div className="inline-block p-4 bg-white rounded-lg shadow-lg">
                <QRCode
                  value={qrCodeData}
                  size={200}
                  level="H"
                  includeMargin={true}
                  fgColor="#1f2937"
                  bgColor="#ffffff"
                />
              </div>
              
              <div className="text-sm text-gray-600">
                {selectedEventId ? (
                  <>
                    QR code pour l'événement sélectionné
                    <br />
                    Valide jusqu'au {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}
                  </>
                ) : (
                  <>
                    QR code d'accès général
                    <br />
                    Valide pour tous vos événements autorisés
                  </>
                )}
              </div>
              
              <div className="space-y-2">
                <Button onClick={downloadQRCode} className="w-full" variant="default">
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger le QR Code
                </Button>
                
                <Button 
                  onClick={generateQRCode} 
                  variant="outline" 
                  className="w-full"
                  disabled={isGenerating}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Régénérer le QR Code
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Usage Instructions */}
      <Card className="p-6 bg-blue-50">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
          <Shield className="h-4 w-4 mr-2" />
          Instructions d'Utilisation
        </h4>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-start">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2" />
            <span>Présentez ce QR code à l'entrée des événements</span>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2" />
            <span>Le code est valide pendant 7 jours après génération</span>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2" />
            <span>Téléchargez ou prenez une capture d'écran pour l'utiliser hors ligne</span>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2" />
            <span>En cas de problème, régénérez un nouveau QR code</span>
          </div>
        </div>
      </Card>
    </div>
  );
};