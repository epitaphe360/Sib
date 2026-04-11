import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import {
  ArrowLeft,
  Star,
  Users,
  TrendingUp,
  Award,
  MessageSquare,
  Crown,
  CheckCircle,
  Heart,
  Loader2
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';

export const PartnerSatisfactionPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [realStats, setRealStats] = useState({
    verifiedPartners: 0,
    totalEvents: 0,
    totalConnections: 0,
    totalAppointments: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [partnersRes, eventsRes, connRes, aptRes] = await Promise.all([
          supabase.from('partners').select('id', { count: 'exact', head: true }).eq('verified', true),
          supabase.from('events').select('id', { count: 'exact', head: true }),
          supabase.from('connections').select('id', { count: 'exact', head: true }),
          supabase.from('appointments').select('id', { count: 'exact', head: true }),
        ]);
        setRealStats({
          verifiedPartners: partnersRes.count || 0,
          totalEvents: eventsRes.count || 0,
          totalConnections: connRes.count || 0,
          totalAppointments: aptRes.count || 0,
        });
      } catch (err) {
        console.error('Erreur chargement stats satisfaction:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const satisfactionData = {
    categories: [
      { name: 'Qualité des événements', icon: Award },
      { name: 'Support & réactivité', icon: MessageSquare },
      { name: 'ROI & visibilité', icon: TrendingUp },
      { name: 'Recommandation NPS', icon: Heart }
    ],
    testimonials: [
      {
        id: '1',
        name: 'Marie Dubois',
        company: 'Port Solutions Inc.',
        rating: 5,
        comment: 'Partenaire exceptionnel, toujours à l\'écoute et très réactif. La qualité des événements est remarquable.',
        date: '2024-01-15'
      },
      {
        id: '2',
        name: 'Pierre Martin',
        company: 'TechMarine Solutions',
        rating: 5,
        comment: 'Excellente visibilité et retours sur investissement. L\'équipe est professionnelle et les résultats dépassent nos attentes.',
        date: '2024-01-12'
      },
      {
        id: '3',
        name: 'Sophie Bernard',
        company: 'LogiFlow Systems',
        rating: 5,
        comment: 'Partenariat très bénéfique pour notre développement. La plateforme SIB offre une visibilité incomparable.',
        date: '2024-01-10'
      },
      {
        id: '4',
        name: 'Jean-François Moreau',
        company: 'Building Tech Hub',
        rating: 5,
        comment: 'Les événements sont d\'une qualité exceptionnelle et le networking est très efficace. Hautement recommandé.',
        date: '2024-01-08'
      },
      {
        id: '5',
        name: 'Claire Leroy',
        company: 'Port Innovation',
        rating: 4,
        comment: 'Très satisfait du partenariat. Quelques améliorations possibles sur la communication mais globalement excellent.',
        date: '2024-01-05'
      }
    ],
    improvements: [
      {
        category: 'Communication',
        suggestion: 'Augmenter la fréquence des newsletters partenaires',
        priority: 'high',
        status: 'planned'
      },
      {
        category: 'Analytics',
        suggestion: 'Ajouter plus de métriques détaillées dans les rapports',
        priority: 'medium',
        status: 'in_progress'
      },
      {
        category: 'Networking',
        suggestion: 'Développer les fonctionnalités de mise en relation automatique',
        priority: 'high',
        status: 'completed'
      }
    ]
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={`star-${i}`}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'planned': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'in_progress': return 'En cours';
      case 'planned': return 'Planifié';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={ROUTES.PARTNER_DASHBOARD} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </Link>

          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-green-600 p-3 rounded-lg">
              <Star className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Satisfaction Partenariat
              </h1>
              <p className="text-gray-600">
                Découvrez ce que pensent nos partenaires de leur expérience SIB
              </p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">Programme de Satisfaction Partenaires</span>
              <Badge className="bg-green-100 text-green-800" size="sm">
                Données en Temps Réel
              </Badge>
            </div>
          </div>
        </div>

        {/* Overall Satisfaction - vraies données */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6 text-center">
              <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto" /> : realStats.verifiedPartners}
              </div>
              <div className="text-gray-600 text-sm">Partenaires vérifiés</div>
            </div>
          </Card>

          <Card>
            <div className="p-6 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto" /> : realStats.totalEvents}
              </div>
              <div className="text-gray-600 text-sm">Événements organisés</div>
            </div>
          </Card>

          <Card>
            <div className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto" /> : realStats.totalConnections}
              </div>
              <div className="text-gray-600 text-sm">Connexions établies</div>
            </div>
          </Card>

          <Card>
            <div className="p-6 text-center">
              <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto" /> : realStats.totalAppointments}
              </div>
              <div className="text-gray-600 text-sm">Rendez-vous B2B</div>
            </div>
          </Card>
        </div>

        {/* Categories - enquête à venir */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Axes de Satisfaction</h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Enquête post-événement à venir</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {satisfactionData.categories.map((category) => {
                const CategoryIcon = category.icon;
                return (
                  <div key={category.name} className="text-center p-4 bg-gray-50 rounded-lg">
                    <CategoryIcon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <div className="text-lg font-semibold text-gray-400 mb-1">—</div>
                    <div className="text-sm text-gray-600">{category.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Testimonials */}
        <Card className="mb-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Témoignages Clients</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {satisfactionData.testimonials.map((testimonial) => (
                <div key={testimonial.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.company}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {renderStars(testimonial.rating)}
                      </div>
                      <span className="text-sm text-gray-500">{testimonial.date}</span>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"{testimonial.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Improvements */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Améliorations en Cours</h3>
            <div className="space-y-4">
              {satisfactionData.improvements.map((improvement) => (
                <div key={improvement.category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{improvement.category}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(improvement.priority)}`}>
                        {improvement.priority === 'high' ? 'Haute' : improvement.priority === 'medium' ? 'Moyenne' : 'Basse'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(improvement.status)}`}>
                        {getStatusLabel(improvement.status)}
                      </span>
                    </div>
                    <p className="text-gray-600">{improvement.suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PartnerSatisfactionPage;

