import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import {
  Crown,
  Check,
  X,
  ArrowRight,
  TrendingUp,
  Users,
  Calendar,
  FileText,
  Mail,
  BarChart,
  Award,
  Zap
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import {
  PARTNER_TIERS,
  PartnerTier,
  getPartnerTierConfig,
  calculateUpgradePrice,
  PARTNER_TIER_ORDER
} from '../config/partnerTiers';

export default function PartnerUpgradePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [selectedTier, setSelectedTier] = useState<PartnerTier | null>(null);

  const currentTier = (user?.partner_tier || user?.profile?.partner_tier || 'partner') as PartnerTier;
  const currentConfig = getPartnerTierConfig(currentTier);

  const handleUpgrade = (targetTier: PartnerTier) => {
    setSelectedTier(targetTier);
    // Navigate to payment page with tier information
    navigate(`/partner/payment-selection?tier=${targetTier}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Crown className="h-5 w-5" />
              <span className="font-medium">Niveau actuel: {currentConfig.displayName}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Développez votre visibilité
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Choisissez le niveau partenaire qui correspond à vos ambitions et
              maximisez votre présence au SIB 2026
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tier Comparison */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PARTNER_TIER_ORDER.map((tierId, index) => {
            const tier = PARTNER_TIERS[tierId];
            const isCurrentTier = tierId === currentTier;
            const canUpgrade = tier.price > currentConfig.price;
            const upgradePrice = calculateUpgradePrice(currentTier, tierId);

            return (
              <motion.div
                key={tierId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`relative h-full ${
                    isCurrentTier
                      ? 'ring-2 ring-blue-500 shadow-lg'
                      : canUpgrade
                      ? 'hover:shadow-xl transition-shadow'
                      : 'opacity-75'
                  }`}
                >
                  {isCurrentTier && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Niveau actuel
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Tier Header */}
                    <div className="text-center mb-6">
                      <div className="text-4xl mb-2">{tier.icon}</div>
                      <h3 className="text-2xl font-bold mb-2">{tier.displayName}</h3>
                      <div className="text-3xl font-bold mb-1" style={{ color: tier.color }}>
                        ${tier.price.toLocaleString()}
                      </div>
                      {canUpgrade && upgradePrice > 0 && (
                        <div className="text-sm text-green-600 font-medium">
                          Upgrade: ${upgradePrice.toLocaleString()}
                        </div>
                      )}
                    </div>

                    {/* Key Quotas */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          Rendez-vous B2B
                        </span>
                        <span className="font-semibold">
                          {tier.quotas.appointments === -1 ? '∞' : tier.quotas.appointments}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          Membres équipe
                        </span>
                        <span className="font-semibold">{tier.quotas.teamMembers}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-gray-600">
                          <FileText className="h-4 w-4 mr-2" />
                          Fichiers média
                        </span>
                        <span className="font-semibold">{tier.quotas.mediaUploads}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-gray-600">
                          <Award className="h-4 w-4 mr-2" />
                          Stands
                        </span>
                        <span className="font-semibold">{tier.quotas.standsAllowed}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-gray-600">
                          <BarChart className="h-4 w-4 mr-2" />
                          Analytics
                        </span>
                        <span className="font-semibold">
                          {tier.quotas.analyticsAccess ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                        </span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="mt-auto">
                      {isCurrentTier ? (
                        <Button variant="outline" className="w-full" disabled>
                          Niveau actuel
                        </Button>
                      ) : canUpgrade ? (
                        <Button
                          variant="default"
                          className="w-full"
                          onClick={() => handleUpgrade(tierId)}
                        >
                          <span>Upgrader</span>
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full" disabled>
                          Non disponible
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Detailed Features */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Fonctionnalités détaillées par niveau
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {PARTNER_TIER_ORDER.map((tierId) => {
              const tier = PARTNER_TIERS[tierId];

              return (
                <Card key={tierId} className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl mb-2">{tier.icon}</div>
                    <h3 className="text-xl font-bold">{tier.displayName}</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-2 flex items-center">
                        <Check className="h-4 w-4 text-green-600 mr-2" />
                        Fonctionnalités incluses
                      </h4>
                      <ul className="space-y-2">
                        {tier.features.map((feature) => (
                          <li key={feature} className="text-sm text-gray-600 flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-2 flex items-center">
                        <Zap className="h-4 w-4 text-yellow-600 mr-2" />
                        Avantages exclusifs
                      </h4>
                      <ul className="space-y-2">
                        {tier.exclusivePerks.map((perk) => (
                          <li key={perk} className="text-sm text-gray-600 flex items-start">
                            <span className="text-yellow-600 mr-2">★</span>
                            <span>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* ROI Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white"
        >
          <div className="text-center max-w-3xl mx-auto">
            <TrendingUp className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">
              Maximisez votre retour sur investissement
            </h2>
            <p className="text-lg text-blue-100 mb-6">
              En moyenne, nos sponsors Gold et Officiel génèrent 5x leur investissement
              en nouveaux contrats et opportunités business grâce au SIB 2026.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
              <div>
                <div className="text-4xl font-bold">200 000+</div>
                <div className="text-blue-200 text-sm">Visiteurs qualifiés</div>
              </div>
              <div>
                <div className="text-4xl font-bold">300+</div>
                <div className="text-blue-200 text-sm">Rendez-vous B2B</div>
              </div>
              <div>
                <div className="text-4xl font-bold">5x</div>
                <div className="text-blue-200 text-sm">ROI moyen</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Testimonials */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Ce que disent nos partenaires
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                tier: 'Sponsor Officiel',
                company: 'TechCorp International',
                quote: "Le sponsoring officiel nous a permis d'obtenir une visibilité exceptionnelle. 87 rendez-vous qualifiés en 5 jours!",
                author: 'Jean Dupont, CEO'
              },
              {
                tier: 'Sponsor Gold',
                company: 'Innovation Solutions',
                quote: "Le ROI a été immédiat. Nous avons signé 3 contrats majeurs dès la première semaine après le salon.",
                author: 'Marie Martin, Directrice'
              },
              {
                tier: 'Sponsor Silver',
                company: 'StartUp Tech',
                quote: "Le sponsoring Silver est parfait pour une première participation. Les analytics nous ont beaucoup aidés.",
                author: 'Ahmed Benali, Fondateur'
              }
            ].map((testimonial) => (
              <Card key={testimonial.company} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-900">
                    {testimonial.company}
                  </span>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {testimonial.tier}
                  </span>
                </div>
                <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
                <p className="text-sm text-gray-500">● {testimonial.author}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Questions fréquentes
          </h2>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "Puis-je changer de niveau pendant l'événement?",
                a: "Oui, vous pouvez upgrader votre niveau à tout moment. Le prix sera ajusté au prorata."
              },
              {
                q: "Les quotas sont-ils partagés entre les membres de l'équipe?",
                a: "Oui, les quotas sont globaux pour votre organisation et partagés entre tous les membres."
              },
              {
                q: "Que se passe-t-il si j'atteins mes quotas?",
                a: "Vous recevrez une notification et pourrez soit upgrader votre niveau, soit attendre le renouvellement."
              },
              {
                q: "Les analytics sont-elles en temps réel?",
                a: "Pour Silver et Gold, les analytics sont mises à jour toutes les heures. Le Sponsor Officiel bénéficie d'analytics en temps réel avec IA."
              }
            ].map((faq) => (
              <Card key={faq.q} className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <h2 className="text-3xl font-bold mb-4">
            Prêt à passer au niveau supérieur?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Rejoignez les leaders de l'industrie et maximisez votre présence au SIB 2026
          </p>
          <Button
            variant="default"
            size="lg"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <Crown className="h-5 w-5 mr-2" />
            Choisir mon niveau
          </Button>
        </motion.div>
      </div>
    </div>
  );
}


