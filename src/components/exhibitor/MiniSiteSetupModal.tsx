import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, FileText, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';

interface MiniSiteSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const MiniSiteSetupModal: React.FC<MiniSiteSetupModalProps> = ({
  isOpen,
  onClose,
  userId
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Handle manual mini-site creation
  const handleManualCreate = async () => {
    setIsLoading(true);

    try {
      // Mark minisite as created (will be filled manually)
      await supabase
        .from('users')
        .update({ minisite_created: true })
        .eq('id', userId);

      localStorage.setItem(`sibs_minisite_skipped_${userId}`, 'true');

      toast.success('Vous allez être redirigé vers l\'éditeur de mini-site');
      onClose();

      // Redirect to mini-site wizard
      navigate(ROUTES.MINISITE_CREATION);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle skip (remind later)
  const handleSkip = async () => {
    try {
      // ✅ CORRECTION: Marquer minisite_created = true pour ne plus afficher la popup
      // L'utilisateur pourra toujours créer son mini-site depuis le dashboard
      await supabase
        .from('users')
        .update({ minisite_created: true })
        .eq('id', userId);

      localStorage.setItem(`sibs_minisite_skipped_${userId}`, 'true');

      toast.success('Vous pourrez créer votre mini-site plus tard depuis votre tableau de bord');
      onClose();
    } catch (error) {
      console.error('Error marking minisite as skipped:', error);
      // Fermer quand même la popup même si l'update échoue
      localStorage.setItem(`sibs_minisite_skipped_${userId}`, 'true');
      onClose();
    }
  };

  if (!isOpen) {return null;}

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-t-2xl relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>

                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-white/20 p-3 rounded-full">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      🎉 Bienvenue sur SIB 2026 !
                    </h2>
                    <p className="text-blue-100">
                      Votre compte exposant a été activé avec succès
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Créez votre Mini-Site Exposant
                      </h3>
                      <p className="text-gray-600">
                        Complétez votre profil pour mettre en valeur votre entreprise auprès des visiteurs du salon.
                      </p>
                    </div>

                    {/* Option 2: Manual */}
                    <div
                      className="border-2 border-blue-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50"
                      onClick={() => handleManualCreate()}
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-600 p-3 rounded-full">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-900 mb-2">
                            Commencer la création
                          </h4>
                          <p className="text-gray-600 mb-3">
                            Remplissez votre mini-site étape par étape avec notre éditeur guidé.
                            Vous avez le contrôle total sur chaque élément.
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">10-15 minutes</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Option 3: Skip for now */}
                    <div className="text-center pt-4 border-t">
                      <button
                        onClick={handleSkip}
                        className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                      >
                        Je créerai mon mini-site plus tard
                      </button>
                    </div>
                  </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
