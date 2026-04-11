import React from 'react';
import { motion } from 'framer-motion';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { Button } from '../../ui/Button';
import { useTranslation } from '../../../hooks/useTranslation';
import { getDisplayName } from '../../../utils/userHelpers';
import { DEFAULT_SALON_CONFIG } from '../../../config/salonInfo';
import type { User } from '../../../types';

interface ExhibitorQRModalProps {
  user: User | null;
  qrCodeRef: React.RefObject<HTMLCanvasElement>;
  isDownloadingQR: boolean;
  onDownload: () => void;
  onClose: () => void;
}

export function ExhibitorQRModal({
  user,
  qrCodeRef,
  isDownloadingQR,
  onDownload,
  onClose,
}: ExhibitorQRModalProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-SIB-primary via-SIB-secondary to-SIB-accent" />
        <div className="mt-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('exhibitor.qr_modal_title')}</h2>
          <p className="text-gray-600 mb-6">{t('exhibitor.qr_modal_subtitle')}</p>

          <div className="bg-gray-50 p-4 rounded-xl inline-block mb-6">
            <QRCode
              value={user?.id ? `SIB2026-EXHIBITOR-${user.id}` : 'INVALID-USER'}
              size={200}
              level="H"
              includeMargin
              ref={qrCodeRef as any}
            />
          </div>

          <div className="space-y-2 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg text-left">
            {[
              [t('exhibitor.qr_label_company'), user?.profile?.company || 'N/A'],
              [t('exhibitor.qr_label_contact'), getDisplayName(user)],
              [t('exhibitor.qr_label_email'), user?.email],
              [t('exhibitor.qr_label_stand'), user?.profile?.standNumber || t('exhibitor.qr_not_assigned')],
              [t('exhibitor.qr_valid_until'), `${DEFAULT_SALON_CONFIG.dates.end} 18:00`],
            ].map(([label, value]) => (
              <div key={label as string} className="flex justify-between">
                <span className="font-medium">{label}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>

          <div className="flex space-x-3 mt-6">
            <Button className="flex-1" variant="outline" onClick={onDownload} disabled={isDownloadingQR}>
              {isDownloadingQR ? t('exhibitor.qr_downloading') : t('exhibitor.qr_download')}
            </Button>
            <Button className="flex-1" variant="default" onClick={onClose}>
              {t('common.close')}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
