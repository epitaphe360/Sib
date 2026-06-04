import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Building2, Briefcase, ArrowRight } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../lib/routes';
import { useTranslation } from '../../../hooks/useTranslation';

interface ProfileOption {
  id: 'visitor' | 'exhibitor' | 'partner';
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
  cta: string;
  route: string;
  color: string;
}

/**
 * P9 — Multi Profile Section
 * Section permettant aux utilisateurs de choisir leur parcours (Visiteur, Exposant, Partenaire)
 */
export const P9MultiProfileSection: React.FC = () => {
  const { t } = useTranslation();
  const [selectedProfile, setSelectedProfile] = useState<'visitor' | 'exhibitor' | 'partner' | null>(null);

  const profiles: ProfileOption[] = [
    {
      id: 'visitor',
      icon: <Users className="h-8 w-8" />,
      title: 'Visiteur Professionnel',
      description: 'Découvrez les innovations, rencontrez les acteurs du secteur et développez votre réseau',
      benefits: [
        'Accès à tous les pavillons et zones du salon',
        'Programme de conférences et ateliers',
        'Matchmaking B2B avec exposants',
        'Accès à l\'espace innovation',
      ],
      cta: 'Devenir visiteur',
      route: ROUTES.VISITOR_SUBSCRIPTION,
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'exhibitor',
      icon: <Building2 className="h-8 w-8" />,
      title: 'Exposant',
      description: 'Présentez vos solutions à 200 000+ visiteurs et développez votre visibilité',
      benefits: [
        'Stand dans le pavillon de votre choix',
        'Visibilité auprès de 200 000+ visiteurs',
        'Rencontres B2B qualifiées',
        'Services premium (conciergerie, etc.)',
      ],
      cta: 'Devenir exposant',
      route: ROUTES.EXHIBITOR_SUBSCRIPTION,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      id: 'partner',
      icon: <Briefcase className="h-8 w-8" />,
      title: 'Partenaire Stratégique',
      description: 'Associez votre marque à l\'événement majeur du bâtiment et amplifiez votre impact',
      benefits: [
        'Visibilité de marque premium',
        'Activations et sponsorings personnalisés',
        'Accès VIP aux événements',
        'Rapports d\'impact et ROI',
      ],
      cta: 'Devenir partenaire',
      route: ROUTES.PARTNERSHIP,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-neutral-50 dark:bg-neutral-900/50">
      <div className="max-w-container mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Choisissez votre parcours
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Que vous soyez visiteur, exposant ou partenaire, le SIB 2026 a une solution adaptée à vos objectifs
          </p>
        </motion.div>

        {/* Profile Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {profiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedProfile(selectedProfile === profile.id ? null : profile.id)}
              className={`relative rounded-2xl p-8 cursor-pointer transition-all duration-300 ${
                selectedProfile === profile.id
                  ? 'ring-2 ring-offset-2 ring-offset-neutral-50 dark:ring-offset-neutral-900 ring-primary-500 scale-105'
                  : 'hover:shadow-lg'
              } bg-white dark:bg-neutral-800 shadow-sm`}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${profile.color} opacity-0 group-hover:opacity-5 transition-opacity`} />

              {/* Icon */}
              <div className={`inline-flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br ${profile.color} text-white mb-6`}>
                {profile.icon}
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                {profile.title}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
                {profile.description}
              </p>

              {/* Benefits (shown on hover or selection) */}
              <AnimatePresence>
                {selectedProfile === profile.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 mb-6 pt-6 border-t border-neutral-200 dark:border-neutral-700"
                  >
                    {profile.benefits.map((benefit, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <div className={`h-5 w-5 rounded-full bg-gradient-to-br ${profile.color} flex items-center justify-center shrink-0 mt-0.5`}>
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">{benefit}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA */}
              <Link to={profile.route} className="block">
                <Button
                  variant={selectedProfile === profile.id ? 'primary' : 'secondary'}
                  size="sm"
                  className="w-full group"
                >
                  {profile.cta}
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-neutral-800 rounded-xl p-8 text-center"
        >
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Vous hésitez ? Contactez notre équipe pour une consultation personnalisée.
          </p>
          <Link to={ROUTES.CONTACT}>
            <Button variant="ghost">
              Nous contacter
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default P9MultiProfileSection;
