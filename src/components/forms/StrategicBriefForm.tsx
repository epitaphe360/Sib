import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';\nimport { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import {
  StrategicBriefSchema,
  StrategicBriefFormData,
  SECTORS,
  NEED_TYPES,
} from '../../types/forms';
import { useFormSubmit } from '../../hooks/useFormSubmit';

type FormStep = 'sector' | 'needType' | 'projectDetails' | 'contact' | 'confirmation';

interface StepConfig {
  id: FormStep;
  title: string;
  description: string;
}

const STEPS: StepConfig[] = [
  {
    id: 'sector',
    title: 'Secteur d\'activité',
    description: 'Quel est votre secteur d\'activité ?',
  },
  {
    id: 'needType',
    title: 'Type de besoin',
    description: 'Quel type de service vous intéresse ?',
  },
  {
    id: 'projectDetails',
    title: 'Détails du projet',
    description: 'Décrivez votre projet et votre budget',
  },
  {
    id: 'contact',
    title: 'Vos coordonnées',
    description: 'Comment pouvons-nous vous contacter ?',
  },
  {
    id: 'confirmation',
    title: 'Confirmation',
    description: 'Merci pour votre intérêt',
  },
];

interface StrategicBriefFormProps {
  onSuccess?: (data: StrategicBriefFormData) => void;
  onCancel?: () => void;
}

/**
 * StrategicBriefForm - Formulaire multi-étapes pour qualifier les prospects
 * 
 * Fonctionnalités :
 * - Validation progressive avec Zod
 * - Animations fluides entre les étapes
 * - Indicateurs de progression
 * - Gestion des erreurs
 */
export const StrategicBriefForm: React.FC<StrategicBriefFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<FormStep>('sector');
  const { submit, isLoading } = useFormSubmit();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    trigger,
  } = useForm<StrategicBriefFormData>({
    resolver: zodResolver(StrategicBriefSchema),
    mode: 'onChange',
  });

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);
  const currentStepConfig = STEPS[currentStepIndex];

  const handleNext = useCallback(async () => {
    const isCurrentStepValid = await trigger();
    if (!isCurrentStepValid) return;

    if (currentStepIndex < STEPS.length - 2) {
      setCurrentStep(STEPS[currentStepIndex + 1].id as FormStep);
    }
  }, [currentStepIndex, trigger]);

  const handlePrevious = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1].id as FormStep);
    }
  }, [currentStepIndex]);

  const onSubmit = async (data: StrategicBriefFormData) => {
    try {
      await submit('/api/forms/strategic-brief', data);
      setCurrentStep('confirmation');
      onSuccess?.(data);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  const stepVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={clsx(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors',
                  index <= currentStepIndex
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                )}
              >
                {index < currentStepIndex ? (
                  <CheckCircle size={24} />
                ) : (
                  index + 1
                )}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={clsx(
                    'h-1 flex-1 mx-2 transition-colors',
                    index < currentStepIndex ? 'bg-amber-600' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {/* Step: Sector */}
            {currentStep === 'sector' && (
              <div>
                <h2 className="text-2xl font-bold mb-2">{currentStepConfig.title}</h2>
                <p className="text-gray-600 mb-6">{currentStepConfig.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  {SECTORS.map((sector) => (
                    <label
                      key={sector}
                      className="relative flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-amber-600 transition-colors"
                    >
                      <input
                        type="radio"
                        {...register('sector')}
                        value={sector}
                        className="sr-only"
                      />
                      <span className="text-gray-700 font-medium capitalize">
                        {t(`sectors.${sector}`)}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.sector && (
                  <p className="text-red-600 text-sm mt-2">{errors.sector.message}</p>
                )}
              </div>
            )}

            {/* Step: Need Type */}
            {currentStep === 'needType' && (
              <div>
                <h2 className="text-2xl font-bold mb-2">{currentStepConfig.title}</h2>
                <p className="text-gray-600 mb-6">{currentStepConfig.description}</p>

                <div className="space-y-3">
                  {NEED_TYPES.map((needType) => (
                    <label
                      key={needType}
                      className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-amber-600 transition-colors"
                    >
                      <input
                        type="radio"
                        {...register('needType')}
                        value={needType}
                        className="sr-only"
                      />
                      <span className="text-gray-700 font-medium capitalize">
                        {t(`needTypes.${needType}`)}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.needType && (
                  <p className="text-red-600 text-sm mt-2">{errors.needType.message}</p>
                )}
              </div>
            )}

            {/* Step: Project Details */}
            {currentStep === 'projectDetails' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{currentStepConfig.title}</h2>
                  <p className="text-gray-600 mb-6">{currentStepConfig.description}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description du projet
                  </label>
                  <textarea
                    {...register('projectDescription')}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                    placeholder="Décrivez votre projet en détail..."
                  />
                  {errors.projectDescription && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.projectDescription.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget indicatif
                  </label>
                  <select
                    {...register('budgetRange')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                  >
                    <option value="">Sélectionner une plage</option>
                    <option value="under_50k">Moins de 50k€</option>
                    <option value="50k_100k">50k - 100k€</option>
                    <option value="100k_250k">100k - 250k€</option>
                    <option value="250k_500k">250k - 500k€</option>
                    <option value="above_500k">Plus de 500k€</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step: Contact */}
            {currentStep === 'contact' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{currentStepConfig.title}</h2>
                  <p className="text-gray-600 mb-6">{currentStepConfig.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      {...register('firstName')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                    />
                    {errors.firstName && (
                      <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      {...register('lastName')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                    />
                    {errors.lastName && (
                      <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Poste
                  </label>
                  <input
                    type="text"
                    {...register('jobTitle')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                  />
                  {errors.jobTitle && (
                    <p className="text-red-600 text-sm mt-1">{errors.jobTitle.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entreprise
                  </label>
                  <input
                    type="text"
                    {...register('company')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                  />
                  {errors.company && (
                    <p className="text-red-600 text-sm mt-1">{errors.company.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      {...register('phone')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                    />
                    {errors.phone && (
                      <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    {...register('acceptTerms')}
                    className="mt-1"
                  />
                  <span className="text-sm text-gray-700">
                    J'accepte les conditions d'utilisation et la politique de confidentialité
                  </span>
                </label>
                {errors.acceptTerms && (
                  <p className="text-red-600 text-sm">{errors.acceptTerms.message}</p>
                )}
              </div>
            )}

            {/* Step: Confirmation */}
            {currentStep === 'confirmation' && (
              <div className="text-center py-8">
                <CheckCircle size={64} className="mx-auto text-green-600 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Merci !</h2>
                <p className="text-gray-600 mb-6">
                  Votre brief stratégique a été reçu avec succès. Notre équipe vous contactera
                  très prochainement.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        {currentStep !== 'confirmation' && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                currentStepIndex === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <ChevronLeft size={20} />
              Précédent
            </button>

            <div className="text-sm text-gray-600">
              Étape {currentStepIndex + 1} sur {STEPS.length - 1}
            </div>

            {currentStepIndex === STEPS.length - 2 ? (
              <button
                type="submit"
                disabled={!isValid || isLoading}
                className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Envoi...' : 'Soumettre'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
              >
                Suivant
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        )}

        {currentStep === 'confirmation' && (
          <div className="flex justify-center mt-8">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Fermer
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
