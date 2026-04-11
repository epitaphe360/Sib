import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from '../../hooks/useTranslation';
import {
  Building2,
  Users,
  Calendar,
  Globe,
  Target,
  Lightbulb,
  MapPin,
  Handshake,
  Clock,
  User,
  Play,
  Presentation,
  Wrench,
  Network
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { PavilionMetricsService, PavilionMetrics } from '../../services/pavilionMetrics';
import { ROUTES } from '../../lib/routes';
import { supabase } from '../../lib/supabase';

interface Pavilion {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  objectives: string[];
  features: string[];
  targetAudience: string[];
  exhibitors: number;
  visitors: number;
  conferences: number;
  demoPrograms: DemoProgram[];
}

interface DemoProgram {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  speaker: string;
  company: string;
  type: 'demo' | 'presentation' | 'workshop' | 'networking';
  capacity: number;
  registered: number;
  location: string;
  tags: string[];
}

const pavilions: Pavilion[] = [
  {
    id: 'digitalization',
    name: 'Digitalisation Bâtiment',
    title: 'Automatisation et Numérisation',
    description: "Technologies numériques transformant l'écosystème bâtiment",
    icon: Building2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    objectives: ['Améliorer l\'efficacité opérationnelle', 'Réduire les temps d\'attente', 'Optimiser la gestion des ressources'],
    features: ['Solutions IoT BTP', 'Systèmes de gestion automatisée', 'Intégration des systèmes d\'information'],
    targetAudience: ['Autorités du Bâtiment', 'Opérateurs de Terminaux', 'Développeurs de Solutions'],
    exhibitors: 8,
    visitors: 450,
    conferences: 3,
    demoPrograms: [
      {
        id: 'digital-1',
        title: 'Démonstration IoT en Temps Réel',
        description: 'Présentation d\'un système IoT complet pour la surveillance et l\'optimisation des opérations BTP avec capteurs intelligents et analyse prédictive.',
        date: '2026-02-05',
        time: '10:00',
        duration: '45 min',
        speaker: 'Dr. Sarah Johnson',
        company: 'PortTech Solutions',
        type: 'demo',
        capacity: 50,
        registered: 32,
        location: 'Salle Démo A1',
        tags: ['IoT', 'Temps réel', 'Optimisation']
      },
      {
        id: 'digital-2',
        title: 'Atelier Automatisation des Processus',
        description: 'Workshop pratique sur l\'automatisation des processus logistiques BTP avec démonstration de solutions RPA et IA.',
        date: '2026-02-05',
        time: '14:30',
        duration: '90 min',
        speaker: 'Ahmed El Mansouri',
        company: 'AutoPort Systems',
        type: 'workshop',
        capacity: 25,
        registered: 18,
        location: 'Salle Atelier B2',
        tags: ['RPA', 'IA', 'Processus']
      },
      {
        id: 'digital-3',
        title: 'Présentation Système de Gestion Intégré',
        description: 'Démonstration d\'une plateforme unifiée de gestion bâtiment intégrant tous les systèmes d\'information et de contrôle.',
        date: '2026-02-06',
        time: '11:00',
        duration: '60 min',
        speaker: 'Marie Dubois',
        company: 'PortFlow Technologies',
        type: 'presentation',
        capacity: 80,
        registered: 65,
        location: 'Auditorium Principal',
        tags: ['Intégration', 'Gestion', 'Plateforme']
      }
    ]
  },
  {
    id: 'sustainability',
    name: 'Durabilité Bâtiment',
    title: 'Écologie et Énergies Renouvelables',
    description: "Initiatives environnementales pour des bâtiments durables",
    icon: Globe,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    objectives: ['Réduire l\'empreinte carbone', 'Développer les énergies renouvelables', 'Améliorer la qualité de l\'eau et de l\'air'],
    features: ['Électrification des quais', 'Solutions d\'énergie renouvelable', 'Gestion des déchets et économie circulaire'],
    targetAudience: ['Experts Environnementaux', 'Fournisseurs d\'Énergie', 'Autorités du Bâtiment'],
    exhibitors: 6,
    visitors: 380,
    conferences: 2,
    demoPrograms: [
      {
        id: 'sustain-1',
        title: 'Démonstration Électrification des Quais',
        description: 'Présentation technologique complète des solutions d\'électrification des chantiers au quai avec démonstration de bornes de recharge haute puissance.',
        date: '2026-02-06',
        time: '09:30',
        duration: '75 min',
        speaker: 'Dr. Thomas Green',
        company: 'EcoPort Energy',
        type: 'demo',
        capacity: 40,
        registered: 28,
        location: 'Zone Extérieure A',
        tags: ['Électrification', 'Énergie', 'chantiers']
      },
      {
        id: 'sustain-2',
        title: 'Workshop Économie Circulaire',
        description: 'Session interactive sur les stratégies d\'économie circulaire appliquées aux bâtiments avec études de cas et démonstrations pratiques.',
        date: '2026-02-06',
        time: '15:00',
        duration: '120 min',
        speaker: 'Isabella Rodriguez',
        company: 'Circular Bâtiments Initiative',
        type: 'workshop',
        capacity: 30,
        registered: 22,
        location: 'Salle Conférence C1',
        tags: ['Économie circulaire', 'Déchets', 'Durabilité']
      },
      {
        id: 'sustain-3',
        title: 'Présentation Solutions Hydroliennes',
        description: 'Démonstration de technologies hydroliennes BTP pour la production d\'énergie renouvelable à partir des courants marins.',
        date: '2026-02-07',
        time: '10:30',
        duration: '45 min',
        speaker: 'Pierre Dubois',
        company: 'Marine Energy Systems',
        type: 'presentation',
        capacity: 60,
        registered: 45,
        location: 'Salle Démo B1',
        tags: ['Hydrolien', 'Renouvelable', 'Énergie']
      }
    ]
  },
  {
    id: 'security',
    name: 'Sécurité et Sûreté',
    title: 'Protection et Cybersécurité',
    description: "Solutions pour la sécurité physique et numérique des bâtiments",
    icon: Users,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    objectives: ['Renforcer la cybersécurité', 'Améliorer la sûreté des opérations', 'Gérer les risques et crises'],
    features: ['Systèmes de surveillance intelligents', 'Solutions de cybersécurité construction', 'Gestion des identités et accès'],
    targetAudience: ['Responsables Sécurité', 'Experts Cybersécurité', 'Autorités Douanières'],
    exhibitors: 5,
    visitors: 320,
    conferences: 2,
    demoPrograms: [
      {
        id: 'security-1',
        title: 'Démonstration Cybersécurité Bâtiment',
        description: 'Présentation interactive des menaces cybernétiques dans le secteur de la construction et démonstration de solutions de protection avancées.',
        date: '2026-02-05',
        time: '16:00',
        duration: '60 min',
        speaker: 'Colonel Marc Dubois',
        company: 'Secureport Systems',
        type: 'demo',
        capacity: 35,
        registered: 28,
        location: 'Salle Sécurité A',
        tags: ['Cybersécurité', 'Bâtiment', 'Protection']
      },
      {
        id: 'security-2',
        title: 'Atelier Gestion des Crises',
        description: 'Simulation de crise bâtiment avec démonstration des protocoles de réponse et des outils de coordination en temps réel.',
        date: '2026-02-06',
        time: '13:30',
        duration: '90 min',
        speaker: 'Dr. Fatima Al-Zahra',
        company: 'CrisisPort Solutions',
        type: 'workshop',
        capacity: 20,
        registered: 16,
        location: 'Centre de Simulation',
        tags: ['Gestion crise', 'Simulation', 'Coordination']
      },
      {
        id: 'security-3',
        title: 'Présentation Systèmes de Surveillance IA',
        description: 'Démonstration de caméras intelligentes et de systèmes de surveillance automatisés utilisant l\'intelligence artificielle pour la détection d\'anomalies.',
        date: '2026-02-07',
        time: '14:00',
        duration: '45 min',
        speaker: 'Jean-Michel Leroy',
        company: 'AISecurity Bâtiments',
        type: 'presentation',
        capacity: 50,
        registered: 38,
        location: 'Salle Démo C2',
        tags: ['IA', 'Surveillance', 'Détection']
      }
    ]
  },
  {
    id: 'innovation',
    name: 'Innovation BTP',
    title: 'R&D et Startups',
    description: "Nouvelles technologies et modèles économiques BTP",
    icon: Calendar,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    objectives: ['Favoriser l\'innovation ouverte', 'Développer les partenariats', 'Accélérer la transformation numérique'],
    features: ['Zone de démonstration startups', 'Hackathon bâtiment', 'Présentations de projets innovants'],
    targetAudience: ['Startups', 'Incubateurs', 'Investisseurs'],
    exhibitors: 12,
    visitors: 550,
    conferences: 4,
    demoPrograms: [
      {
        id: 'innovation-1',
        title: 'Pitch Startup : Drones du Bâtiment',
        description: 'Présentation de startups innovantes développant des solutions de drones pour l\'inspection et la surveillance bâtiment automatisée.',
        date: '2026-02-05',
        time: '12:00',
        duration: '30 min',
        speaker: 'Équipe DronePort',
        company: 'DronePort Startup',
        type: 'presentation',
        capacity: 100,
        registered: 85,
        location: 'Scène Innovation',
        tags: ['Drones', 'Startup', 'Inspection']
      },
      {
        id: 'innovation-2',
        title: 'Hackathon Bâtiment - Finale',
        description: 'Présentation des projets développés pendant le hackathon de 48h sur des défis BTP réels avec démonstration des solutions gagnantes.',
        date: '2026-02-06',
        time: '16:30',
        duration: '120 min',
        speaker: 'Jury Hackathon',
        company: 'SIB Innovation Lab',
        type: 'demo',
        capacity: 150,
        registered: 142,
        location: 'Auditorium Innovation',
        tags: ['Hackathon', 'Innovation', 'Défis']
      },
      {
        id: 'innovation-3',
        title: 'Networking Startups & Investisseurs',
        description: 'Session de réseautage dédiée entre startups BTP et investisseurs avec démonstration de produits et pitchs rapides.',
        date: '2026-02-07',
        time: '11:30',
        duration: '180 min',
        speaker: 'Modérateur Innovation',
        company: 'PortInvest Network',
        type: 'networking',
        capacity: 80,
        registered: 67,
        location: 'Espace Networking Innovation',
        tags: ['Networking', 'Investissement', 'Startups']
      },
      {
        id: 'innovation-4',
        title: 'Atelier Blockchain & Supply Chain',
        description: 'Workshop pratique sur l\'application de la blockchain pour la traçabilité et l\'optimisation des chaînes logistiques BTP.',
        date: '2026-02-07',
        time: '15:30',
        duration: '90 min',
        speaker: 'Dr. Blockchain Expert',
        company: 'ChainPort Technologies',
        type: 'workshop',
        capacity: 40,
        registered: 31,
        location: 'Salle Atelier Innovation',
        tags: ['Blockchain', 'Supply Chain', 'Traçabilité']
      }
    ]
  }
];

export default function PavillonsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Handler functions for pavilion actions
  const handleVirtualTour = (pavilion: Pavilion) => {
    navigate(`${ROUTES.HALL_MAP}?pavilion=${encodeURIComponent(pavilion.id)}`);
  };
  const handleNetworking = (pavilion: Pavilion) => {
    toast.info(`Redirection networking pour ${pavilion.name}`);
    navigate(`${ROUTES.NETWORKING}?pavilion=${encodeURIComponent(pavilion.id)}`);
  };
  const handleShowProgram = (pavilion: Pavilion) => {
    toast.info(`Programme filtré pour ${pavilion.name}`);
    navigate(`${ROUTES.EVENTS}?pavilion=${encodeURIComponent(pavilion.id)}`);
  };

  const [selectedPavilion, setSelectedPavilion] = useState<string | null>(null);
  const [pavilionList, setPavilionList] = useState<Pavilion[]>(pavilions);
  const [metrics, setMetrics] = useState<PavilionMetrics>({
    totalExhibitors: 24,
    totalVisitors: 1200,
    totalConferences: 8,
    countries: 12
  });
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  // Charger les vraies métriques au montage du composant
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setIsLoadingMetrics(true);
        const realMetrics = await PavilionMetricsService.getMetrics();
        setMetrics(realMetrics);
      } catch (error) {
        console.error('Erreur lors du chargement des métriques:', error);
        // Garder les valeurs par défaut en cas d'erreur
      } finally {
        setIsLoadingMetrics(false);
      }
    };

    loadMetrics();
  }, []);

  // Charger des compteurs exposants réels par pavillon depuis Supabase
  useEffect(() => {
    const loadPavilionExhibitorCounts = async () => {
      try {
        const { data, error } = await supabase
          .from('exhibitors')
          .select('sector')
          .eq('verified', true);

        if (error || !data) return;

        const countByPavilion: Record<string, number> = {
          digitalization: 0,
          sustainability: 0,
          security: 0,
          innovation: 0,
        };

        data.forEach((row: any) => {
          const sector = String(row.sector || '').toLowerCase();
          if (sector.includes('digit') || sector.includes('bim') || sector.includes('iot') || sector.includes('smart')) {
            countByPavilion.digitalization += 1;
          } else if (sector.includes('durab') || sector.includes('green') || sector.includes('ener') || sector.includes('environ')) {
            countByPavilion.sustainability += 1;
          } else if (sector.includes('secur') || sector.includes('cyber') || sector.includes('safe')) {
            countByPavilion.security += 1;
          } else {
            countByPavilion.innovation += 1;
          }
        });

        setPavilionList(prev => prev.map(p => ({
          ...p,
          exhibitors: countByPavilion[p.id] || p.exhibitors,
        })));
      } catch (err) {
        console.warn('Impossible de charger les compteurs exposants par pavillon:', err);
      }
    };

    loadPavilionExhibitorCounts();
  }, []);

  const getDemoTypeIcon = (type: string) => {
    switch (type) {
      case 'demo': return Play;
      case 'presentation': return Presentation;
      case 'workshop': return Wrench;
      case 'networking': return Network;
      default: return Calendar;
    }
  };

  const getDemoTypeLabel = (type: string) => {
    switch (type) {
      case 'demo': return 'Démonstration';
      case 'presentation': return 'Présentation';
      case 'workshop': return 'Atelier';
      case 'networking': return 'Networking';
      default: return type;
    }
  };

  const getDemoTypeColor = (type: string) => {
    switch (type) {
      case 'demo': return 'bg-blue-100 text-blue-800';
      case 'presentation': return 'bg-green-100 text-green-800';
      case 'workshop': return 'bg-purple-100 text-purple-800';
      case 'networking': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h1 className="text-4xl font-bold mb-4">Pavillons Thématiques SIB 2026</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">Hub central pour le développement, l'innovation et la connectivité mondiale de l'écosystème bâtiment international</p>
            <div className="mt-6">
              <Link to={ROUTES.HALL_MAP}>
                <Button className="bg-white text-blue-900 hover:bg-blue-50 font-semibold">
                  Voir le plan interactif des halls
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center p-6">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {isLoadingMetrics ? (
                <div className="animate-pulse bg-gray-300 h-8 w-16 mx-auto rounded"></div>
              ) : (
                `${metrics.totalExhibitors}+`
              )}
            </div>
            <div className="text-gray-600">{t('salon.exhibitors')}</div>
          </Card>

          <Card className="text-center p-6">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {isLoadingMetrics ? (
                <div className="animate-pulse bg-gray-300 h-8 w-16 mx-auto rounded"></div>
              ) : (
                `${metrics.totalVisitors.toLocaleString()}+`
              )}
            </div>
            <div className="text-gray-600">{t('salon.visitors')}</div>
          </Card>

          <Card className="text-center p-6">
            <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {isLoadingMetrics ? (
                <div className="animate-pulse bg-gray-300 h-8 w-16 mx-auto rounded"></div>
              ) : (
                `${metrics.totalConferences}+`
              )}
            </div>
            <div className="text-gray-600">{t('salon.conferences')}</div>
          </Card>

          <Card className="text-center p-6">
            <div className="bg-orange-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
              <Globe className="h-8 w-8 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {isLoadingMetrics ? (
                <div className="animate-pulse bg-gray-300 h-8 w-16 mx-auto rounded"></div>
              ) : (
                metrics.countries
              )}
            </div>
            <div className="text-gray-600">{t('salon.countries')}</div>
          </Card>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {pavilionList.map((pavilion, index) => {
            const Icon = pavilion.icon;
            const isSelected = selectedPavilion === pavilion.id;
            return (
              <motion.div key={pavilion.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={`${isSelected ? 'lg:col-span-2 xl:col-span-3' : ''}`}>
                <Card className={`h-full transition-all duration-300 ${isSelected ? 'ring-2 ring-blue-500 shadow-xl' : ''}`}>
                  <div className="p-6" onClick={() => setSelectedPavilion(isSelected ? null : pavilion.id)} style={{ cursor: 'pointer' }}>
                    <div className="flex items-start space-x-4 mb-4">
                      <div className={`${pavilion.bgColor} p-3 rounded-lg`}><Icon className={`h-6 w-6 ${pavilion.color}`} /></div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{pavilion.name}</h3>
                        <p className="text-lg text-gray-700 font-medium mb-2">{pavilion.title}</p>
                        <p className="text-gray-600 text-sm">{pavilion.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <div className="text-center"><div className="text-2xl font-bold text-gray-900">{pavilion.exhibitors}</div><div className="text-xs text-gray-600">Exposants</div></div>
                      <div className="text-center"><div className="text-2xl font-bold text-gray-900">{pavilion.visitors.toLocaleString()}</div><div className="text-xs text-gray-600">Visiteurs</div></div>
                      <div className="text-center"><div className="text-2xl font-bold text-gray-900">{pavilion.conferences}</div><div className="text-xs text-gray-600">Conférences</div></div>
                    </div>

                    {isSelected && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="border-t border-gray-200 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center"><Target className="h-4 w-4 mr-2" />Objectifs</h4>
                            <ul className="space-y-2">{pavilion.objectives.map((o) => <li key={o} className="text-sm text-gray-600 flex items-start"><div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0" />{o}</li>)}</ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center"><Lightbulb className="h-4 w-4 mr-2" />Fonctionnalités</h4>
                            <ul className="space-y-2">{pavilion.features.map((f) => <li key={f} className="text-sm text-gray-600 flex items-start"><div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-2 flex-shrink-0" />{f}</li>)}</ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center"><Users className="h-4 w-4 mr-2" />Public Cible</h4>
                            <div className="space-y-2">{pavilion.targetAudience.map((t) => <Badge key={t} variant="info" size="sm" className="mr-2 mb-2">{t}</Badge>)}</div>
                          </div>
                        </div>

                        {/* Programmes de démonstration */}
                        <div className="border-t border-gray-200 pt-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
                            Programmes de Démonstration ({pavilion.demoPrograms.length})
                          </h4>
                          
                          <div className="space-y-4">
                            {pavilion.demoPrograms.map((program) => {
                              const DemoIcon = getDemoTypeIcon(program.type);
                              return (
                                <Card key={program.id} className="p-4 hover:shadow-md transition-shadow">
                                  <div className="flex items-start space-x-4">
                                    <div className="bg-indigo-100 p-2 rounded-lg">
                                      <DemoIcon className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    
                                    <div className="flex-1">
                                      <div className="flex items-start justify-between mb-2">
                                        <div>
                                          <h5 className="font-semibold text-gray-900 text-sm">{program.title}</h5>
                                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-600">
                                            <div className="flex items-center">
                                              <Calendar className="h-3 w-3 mr-1" />
                                              {formatDate(program.date)}
                                            </div>
                                            <div className="flex items-center">
                                              <Clock className="h-3 w-3 mr-1" />
                                              {program.time} ({program.duration})
                                            </div>
                                            <div className="flex items-center">
                                              <MapPin className="h-3 w-3 mr-1" />
                                              {program.location}
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <div className="text-right">
                                          <Badge className={`${getDemoTypeColor(program.type)} text-xs`}>
                                            {getDemoTypeLabel(program.type)}
                                          </Badge>
                                          <div className="text-xs text-gray-500 mt-1">
                                            {program.registered}/{program.capacity} inscrits
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <p className="text-sm text-gray-600 mb-3">{program.description}</p>
                                      
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                          <User className="h-4 w-4 text-gray-400" />
                                          <span className="text-sm text-gray-700">{program.speaker}</span>
                                          <span className="text-sm text-gray-500">•</span>
                                          <span className="text-sm text-gray-700">{program.company}</span>
                                        </div>
                                        
                                        <div className="flex space-x-2">
                                          {program.tags.map((tag) => (
                                            <Badge key={tag} variant="default" size="sm" className="text-xs">
                                              {tag}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              );
                            })}
                          </div>
                        </div>

                        <div className="mt-6 flex space-x-4">
                          <Button onClick={() => handleVirtualTour(pavilion)}><MapPin className="h-4 w-4 mr-2" />Visiter le Pavillon</Button>
                          <Button variant="outline" onClick={() => handleNetworking(pavilion)}><Handshake className="h-4 w-4 mr-2" />Networking</Button>
                          <Button variant="outline" onClick={() => handleShowProgram(pavilion)}><Calendar className="h-4 w-4 mr-2" />Programme Complet</Button>
// Handler functions for pavilion actions

// Place these inside the component, before the return statement:
                        </div>
                      </motion.div>
                    )}

                    {!isSelected && (
                      <div className="flex justify-between items-center">
                        <Button variant="outline" size="sm" onClick={() => setSelectedPavilion(pavilion.id)}>Découvrir</Button>
                        <div className="text-xs text-gray-500">Cliquez pour plus de détails</div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

