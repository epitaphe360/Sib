import React from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { openWhatsApp, SUPPORT_CONFIG } from '../../config/supportConfig';

interface WhatsAppFloatingWidgetProps {
  /**
   * Position du widget
   */
  position?: 'bottom-right' | 'bottom-left';

  /**
   * Offset du bas (en pixels)
   */
  offsetBottom?: number;

  /**
   * Offset du côté (en pixels)
   */
  offsetSide?: number;

  /**
   * Message personnalisé
   */
  message?: string;

  /**
   * Numéro WhatsApp
   */
  phoneNumber?: string;

  /**
   * Afficher par défaut
   */
  defaultVisible?: boolean;
}

/**
 * Widget flottant WhatsApp
 * Affiché en bas à droite de la page pour un accès rapide
 */
export function WhatsAppFloatingWidget({
  position = 'bottom-right',
  offsetBottom = 24,
  offsetSide = 24,
  message = SUPPORT_CONFIG.whatsapp.message,
  phoneNumber = SUPPORT_CONFIG.whatsapp.number,
  defaultVisible = true,
}: WhatsAppFloatingWidgetProps) {  const { t } = useTranslation();  const [isOpen, setIsOpen] = React.useState(defaultVisible);
  const [showTooltip, setShowTooltip] = React.useState(true);

  React.useEffect(() => {
    // Masquer le tooltip après 5 secondes
    const timer = setTimeout(() => setShowTooltip(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    if (isOpen) {
      openWhatsApp(phoneNumber, message);
    } else {
      setIsOpen(true);
      setShowTooltip(true);
      const timer = setTimeout(() => setShowTooltip(false), 5000);
      return () => clearTimeout(timer);
    }
  };

  if (!isOpen) {
    return null;
  }

  const positionClasses = position === 'bottom-right' 
    ? `right-${offsetSide} bottom-${offsetBottom}` 
    : `left-${offsetSide} bottom-${offsetBottom}`;

  return (
    <div
      className={`fixed ${position === 'bottom-right' ? 'right-6' : 'left-6'} bottom-6 z-50`}
      style={{
        right: position === 'bottom-right' ? `${offsetSide}px` : 'auto',
        left: position === 'bottom-left' ? `${offsetSide}px` : 'auto',
        bottom: `${offsetBottom}px`,
      }}
    >
      {/* Tooltip */}
      {showTooltip && (
        <div className="mb-3 bg-gray-900 text-white text-sm rounded-lg px-4 py-2 shadow-lg max-w-xs animate-fade-in">
          <p className="font-medium">{t('whatsapp.need_help')}</p>
          <p className="text-gray-300">{t('whatsapp.chat_team')}</p>
        </div>
      )}

      {/* Bouton flottant */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={handleClick}
          className="group relative inline-flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          aria-label={t('whatsapp.contact_whatsapp')}
          title={t('whatsapp.contact_whatsapp')}
        >
          <MessageCircle className="h-7 w-7" />
          
          {/* Pulse animation */}
          <span className="absolute inset-0 rounded-full bg-green-500 animate-pulse opacity-75"></span>
        </button>

        {/* Bouton fermer */}
        <button
          onClick={() => setIsOpen(false)}
          className="w-10 h-10 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full flex items-center justify-center transition"
          aria-label={t('common.close')}
          title={t('common.close')}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Info supplémentaire */}
      <div className="mt-3 text-center text-xs text-gray-600">
        <p>{t('whatsapp.available_24_7')}</p>
      </div>
    </div>
  );
}
