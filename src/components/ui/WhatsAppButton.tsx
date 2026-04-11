import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from './Button';
import { openWhatsApp, SUPPORT_CONFIG } from '../../config/supportConfig';

interface WhatsAppButtonProps {
  /**
   * Numéro WhatsApp (par défaut: équipe commerciale)
   */
  phoneNumber?: string;

  /**
   * Message personnalisé
   */
  message?: string;

  /**
   * Texte du bouton
   */
  label?: string;

  /**
   * Variant du bouton
   */
  variant?: 'default' | 'outline' | 'secondary';

  /**
   * Taille du bouton
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Classes CSS supplémentaires
   */
  className?: string;

  /**
   * Afficher l'icône
   */
  showIcon?: boolean;

  /**
   * Callback quand on clique
   */
  onClick?: () => void;
}

/**
 * Composant bouton WhatsApp réutilisable
 * Ouvre un lien WhatsApp pour contacter l'équipe commerciale
 */
export function WhatsAppButton({
  phoneNumber = SUPPORT_CONFIG.whatsapp.number,
  message = SUPPORT_CONFIG.whatsapp.message,
  label = 'Contacter par WhatsApp',
  variant = 'default',
  size = 'md',
  className = '',
  showIcon = true,
  onClick,
}: WhatsAppButtonProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    openWhatsApp(phoneNumber, message);
  };

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      className={`${
        variant === 'default' ? 'bg-green-600 hover:bg-green-700 text-white' : ''
      } ${className}`}
    >
      {showIcon && <MessageCircle className="h-4 w-4 mr-2" />}
      {label}
    </Button>
  );
}
