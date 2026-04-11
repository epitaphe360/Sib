import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Building, User, Mail, Phone, Globe, FileText } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from './Button';
import { Card } from './Card';

interface FormData {
  companyName?: string;
  sector?: string;
  country?: string;
  website?: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  email?: string;
  phone?: string;
  companyDescription?: string;
  partnershipType?: string;
}

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: FormData;
  isLoading?: boolean;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  data,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  
  if (!isOpen) return null;

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value?: string }) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-3 py-2">
        <Icon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-sm text-gray-900 mt-0.5 break-words">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-3xl"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="preview-modal-title"
              >
                <Card className="relative">
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{t('form.verify_information')}</h2>
                        <p className="text-sm text-gray-600">{t('form.ensure_correct_before_submit')}</p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={isLoading}
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-6">
                      {/* Section Organisation */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Building className="h-5 w-5 text-primary-600" />
                          {t('form.organization_information')}
                        </h3>
                        <div className="space-y-1 bg-gray-50 rounded-lg p-4">
                          <InfoRow icon={Building} label={t('form.organization_name')} value={data.companyName} />
                          <InfoRow icon={FileText} label={t('form.activity_sector')} value={data.sector} />
                          <InfoRow icon={Globe} label={t('form.country')} value={data.country} />
                          <InfoRow icon={Globe} label={t('form.website')} value={data.website} />
                          <InfoRow icon={FileText} label={t('form.partnership_type')} value={data.partnershipType} />
                        </div>
                      </div>

                      {/* Section Contact */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <User className="h-5 w-5 text-primary-600" />
                          {t('form.contact_information')}
                        </h3>
                        <div className="space-y-1 bg-gray-50 rounded-lg p-4">
                          <InfoRow icon={User} label={t('form.full_name')} value={`${data.firstName || ''} ${data.lastName || ''}`} />
                          <InfoRow icon={FileText} label={t('form.position')} value={data.position} />
                          <InfoRow icon={Mail} label={t('form.email')} value={data.email} />
                          <InfoRow icon={Phone} label={t('form.phone')} value={data.phone} />
                        </div>
                      </div>

                      {/* Section Description */}
                      {data.companyDescription && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary-600" />
                            {t('form.description')}
                          </h3>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.companyDescription}</p>
                          </div>
                        </div>
                      )}

                      {/* Alerte de vérification */}
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-900">{t('common.warning')}</p>
                          <p className="text-sm text-amber-700 mt-1">
                            {t('form.request_review_warning')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      disabled={isLoading}
                    >
                      {t('form.edit_information')}
                    </Button>
                    <Button
                      onClick={() => {
                        console.log('🔴 PreviewModal: Bouton "Confirmer et envoyer" cliqué!');
                        onConfirm();
                      }}
                      disabled={isLoading}
                      className="min-w-[200px]"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          {t('form.sending')}
                        </span>
                      ) : (
                        t('form.confirm_and_send')
                      )}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
