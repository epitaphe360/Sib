/**
 * Composant Badge Imprimable
 * Badge papier format carte de visite (86mm x 54mm) ou format badge salon (105mm x 148mm)
 * Optimisé pour l'impression avec QR Code
 */

import { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { UserBadge } from '../../types';
import { getBadgeColor, getAccessLevelLabel } from '../../services/badgeService';

interface PrintableBadgeProps {
  badge: UserBadge;
  format?: 'card' | 'badge'; // card = 86x54mm, badge = 105x148mm (A6)
  showLogo?: boolean;
  eventName?: string;
  eventDates?: string;
  eventLocation?: string;
  onReady?: () => void;
}

export default function PrintableBadge({
  badge,
  format = 'badge',
  showLogo = true,
  eventName = 'SIB 2026',
  eventDates = '25 - 29 Novembre 2026',
  eventLocation = 'El Jadida, Maroc',
  onReady,
}: PrintableBadgeProps) {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const badgeRef = useRef<HTMLDivElement>(null);

  const badgeColor = getBadgeColor(badge.accessLevel || badge.userType);
  const accessLabel = getAccessLevelLabel(badge.accessLevel || badge.userType);

  // Générer QR code statique pour impression
  useEffect(() => {
    const generateQR = async () => {
      const qrData = JSON.stringify({
        code: badge.badgeCode,
        userId: badge.userId,
        type: badge.userType,
        level: badge.accessLevel,
        name: badge.fullName,
      });

      try {
        const dataURL = await QRCode.toDataURL(qrData, {
          width: format === 'card' ? 150 : 250,
          margin: 1,
          color: { dark: '#000000', light: '#FFFFFF' },
          errorCorrectionLevel: 'H',
        });
        setQrCodeDataURL(dataURL);
        onReady?.();
      } catch (err) {
        console.error('QR generation error:', err);
      }
    };

    generateQR();
  }, [badge, format]);

  const isCard = format === 'card';

  return (
    <div
      ref={badgeRef}
      id="printable-badge"
      className="printable-badge-container"
      style={{
        width: isCard ? '86mm' : '105mm',
        height: isCard ? '54mm' : '148mm',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: '#FFFFFF',
        border: '1px solid #E0E0E0',
        borderRadius: '4px',
        overflow: 'hidden',
        position: 'relative',
        pageBreakInside: 'avoid',
        boxSizing: 'border-box',
      }}
    >
      {/* Bande de couleur en haut */}
      <div
        style={{
          height: isCard ? '6mm' : '12mm',
          background: `linear-gradient(135deg, ${badgeColor}, ${badgeColor}dd)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 3mm',
        }}
      >
        {showLogo && (
          <span style={{
            color: '#FFFFFF',
            fontSize: isCard ? '7pt' : '11pt',
            fontWeight: 'bold',
            letterSpacing: '1px',
          }}>
            {eventName}
          </span>
        )}
        <span style={{
          color: '#FFFFFF',
          fontSize: isCard ? '5pt' : '8pt',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          background: 'rgba(255,255,255,0.2)',
          padding: '1px 4px',
          borderRadius: '2px',
        }}>
          {accessLabel}
        </span>
      </div>

      {/* Contenu principal */}
      <div style={{
        padding: isCard ? '2mm 3mm' : '4mm 5mm',
        display: 'flex',
        flexDirection: isCard ? 'row' : 'column',
        alignItems: isCard ? 'center' : 'center',
        gap: isCard ? '3mm' : '3mm',
        height: isCard ? 'calc(100% - 6mm)' : 'calc(100% - 12mm)',
      }}>
        {/* Photo (si disponible) - format badge seulement */}
        {!isCard && badge.avatarUrl && (
          <div style={{
            width: '25mm',
            height: '25mm',
            borderRadius: '50%',
            overflow: 'hidden',
            border: `2px solid ${badgeColor}`,
            flexShrink: 0,
          }}>
            <img
              src={badge.avatarUrl}
              alt={badge.fullName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              crossOrigin="anonymous"
            />
          </div>
        )}

        {/* Informations */}
        <div style={{
          textAlign: isCard ? 'left' : 'center',
          flex: isCard ? 1 : undefined,
          minWidth: 0,
        }}>
          {/* Nom */}
          <div style={{
            fontSize: isCard ? '9pt' : '14pt',
            fontWeight: 'bold',
            color: '#1a1a1a',
            lineHeight: 1.2,
            marginBottom: isCard ? '1mm' : '2mm',
            wordBreak: 'break-word',
          }}>
            {badge.fullName}
          </div>

          {/* Poste */}
          {badge.position && (
            <div style={{
              fontSize: isCard ? '6pt' : '9pt',
              color: '#555555',
              marginBottom: '1mm',
            }}>
              {badge.position}
            </div>
          )}

          {/* Entreprise */}
          {badge.companyName && (
            <div style={{
              fontSize: isCard ? '7pt' : '10pt',
              fontWeight: '600',
              color: badgeColor,
              marginBottom: isCard ? '0' : '2mm',
            }}>
              {badge.companyName}
            </div>
          )}

          {/* Stand */}
          {badge.standNumber && (
            <div style={{
              fontSize: isCard ? '6pt' : '9pt',
              color: '#333',
              background: '#f5f5f5',
              padding: '1px 6px',
              borderRadius: '3px',
              display: 'inline-block',
              marginTop: '1mm',
            }}>
              Stand: {badge.standNumber}
            </div>
          )}
        </div>

        {/* QR Code */}
        {qrCodeDataURL && (
          <div style={{
            flexShrink: 0,
            textAlign: 'center',
          }}>
            <img
              src={qrCodeDataURL}
              alt="QR Code"
              style={{
                width: isCard ? '14mm' : '30mm',
                height: isCard ? '14mm' : '30mm',
              }}
            />
            {!isCard && (
              <div style={{
                fontSize: '6pt',
                color: '#999',
                marginTop: '1mm',
                fontFamily: 'monospace',
              }}>
                {badge.badgeCode}
              </div>
            )}
          </div>
        )}

        {/* Footer - format badge seulement */}
        {!isCard && (
          <div style={{
            position: 'absolute',
            bottom: '3mm',
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: '6pt',
            color: '#999',
            borderTop: '1px solid #eee',
            paddingTop: '2mm',
            marginLeft: '5mm',
            marginRight: '5mm',
          }}>
            <div>{eventDates} • {eventLocation}</div>
            <div style={{ marginTop: '0.5mm' }}>
              Valide du {new Date(badge.validFrom).toLocaleDateString('fr-FR')} au {new Date(badge.validUntil).toLocaleDateString('fr-FR')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Composant pour imprimer plusieurs badges sur une page A4
 */
export function PrintableBadgeSheet({
  badges,
  format = 'badge',
}: {
  badges: UserBadge[];
  format?: 'card' | 'badge';
}) {
  const badgesPerPage = format === 'card' ? 10 : 4; // 10 cartes ou 4 badges par page A4
  const pages: UserBadge[][] = [];

  for (let i = 0; i < badges.length; i += badgesPerPage) {
    pages.push(badges.slice(i, i + badgesPerPage));
  }

  return (
    <div id="printable-badge-sheet">
      {pages.map((page, pageIdx) => (
        <div
          key={pageIdx}
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '10mm',
            display: 'flex',
            flexWrap: 'wrap',
            gap: format === 'card' ? '3mm' : '5mm',
            justifyContent: 'center',
            alignContent: 'flex-start',
            pageBreakAfter: 'always',
          }}
        >
          {page.map((badge) => (
            <PrintableBadge key={badge.id} badge={badge} format={format} />
          ))}
        </div>
      ))}
    </div>
  );
}
