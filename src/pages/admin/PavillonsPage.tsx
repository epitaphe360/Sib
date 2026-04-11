import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import {
  Building2,
  Calendar,
  Search,
  Filter,
  Users,
  Clock,
  MoreVertical,
  Edit,
  Eye,
  Plus,
  AlertTriangle,
  Presentation,
  Lightbulb,
  Settings,
  RefreshCw,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { motion } from 'framer-motion';
import { useFilterSearch } from '../../hooks/useFilterSearch';
import { toast } from 'sonner';

// Define Pavilion type locally since the table doesn't exist in Supabase schema
interface Pavilion {
  id: string;
  name: string;
  subtitle?: string;
  shortDescription?: string;
  theme: string;
  description: string;
  objectives?: string[];
  features?: string[];
  targetAudience?: string[];
  exhibitors?: number;
  visitors?: number;
  conferences?: number;
  created_at: string;
  updated_at?: string;
  demoPrograms?: DemoProgram[];
  totalPrograms?: number;
  totalCapacity?: number;
  totalRegistered?: number;
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
  type: string;
  capacity: number;
  registered: number;
  location: string;
  tags: string[];
}

export default function PavillonsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [pavilions, setPavilions] = useState<Pavilion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPavilion, setEditingPavilion] = useState<Pavilion | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const fetchPavilions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Static pavilions data - the pavilions table doesn't exist in the database yet
        // This provides sample data for the UI until the table is created
        const staticPavilions: Pavilion[] = [
          {
            id: '1',
            name: 'Digitalisation Bâtiment',
            subtitle: 'Automatisation et Numérisation',
            shortDescription: "Technologies numériques transformant l'écosystème bâtiment",
            theme: 'digitalization',
            description: 'Découvrez les dernières innovations en matière de transformation numérique pour les ports.',
            objectives: ['Améliorer l\'efficacité opérationnelle', 'Réduire les temps d\'attente', 'Optimiser la gestion des ressources'],
            features: ['Solutions IoT BTP', 'Systèmes de gestion automatisée', 'Intégration des systèmes d\'information'],
            targetAudience: ['Autorités du Bâtiment', 'Opérateurs de Terminaux', 'Développeurs de Solutions'],
            exhibitors: 8,
            visitors: 450,
            conferences: 3,
            created_at: new Date().toISOString(),
            demoPrograms: [],
            totalPrograms: 3,
            totalCapacity: 155,
            totalRegistered: 115,
          },
          {
            id: '2',
            name: 'Développement Durable Bâtiment',
            subtitle: 'Solutions Écologiques et Durables',
            shortDescription: 'Innovations vertes pour une industrie du bâtiment responsable',
            theme: 'sustainability',
            description: 'Solutions écologiques et durables pour l\'industrie du bâtiment.',
            objectives: ['Réduire l\'empreinte carbone', 'Promouvoir les énergies renouvelables', 'Optimiser la gestion des déchets'],
            features: ['Énergies renouvelables', 'Systèmes de recyclage', 'Monitoring environnemental'],
            targetAudience: ['Gestionnaires de Ports', 'Experts Environnementaux', 'Régulateurs'],
            exhibitors: 6,
            visitors: 320,
            conferences: 2,
            created_at: new Date().toISOString(),
            demoPrograms: [],
            totalPrograms: 2,
            totalCapacity: 120,
            totalRegistered: 88,
          },
          {
            id: '3',
            name: 'Sécurité Chantier',
            subtitle: 'Surveillance et Contrôle Avancés',
            shortDescription: 'Technologies de sécurité avancées pour les infrastructures BTP',
            theme: 'security',
            description: 'Technologies de sécurité avancées pour les ports et terminaux.',
            objectives: ['Renforcer la sécurité des infrastructures', 'Prévenir les incidents', 'Améliorer la surveillance'],
            features: ['Vidéosurveillance intelligente', 'Contrôle d\'accès biométrique', 'Systèmes d\'alerte précoce'],
            targetAudience: ['Responsables Sécurité', 'Autorités du Bâtiment', 'Forces de l\'Ordre'],
            exhibitors: 5,
            visitors: 280,
            conferences: 2,
            created_at: new Date().toISOString(),
            demoPrograms: [],
            totalPrograms: 2,
            totalCapacity: 100,
            totalRegistered: 72,
          },
          {
            id: '4',
            name: 'Innovation & R&D',
            subtitle: 'Technologies Émergentes',
            shortDescription: 'Les technologies de demain pour les ports d\'aujourd\'hui',
            theme: 'innovation',
            description: 'Les technologies de demain pour les ports d\'aujourd\'hui.',
            objectives: ['Promouvoir la R&D bâtiment', 'Encourager les startups', 'Accélérer l\'innovation'],
            features: ['Intelligence Artificielle', 'Blockchain bâtiment', 'Robotique et automatisation'],
            targetAudience: ['Chercheurs', 'Startups Tech', 'Investisseurs'],
            exhibitors: 10,
            visitors: 520,
            conferences: 4,
            created_at: new Date().toISOString(),
            demoPrograms: [],
            totalPrograms: 4,
            totalCapacity: 200,
            totalRegistered: 160,
          },
        ];
        setPavilions(staticPavilions);
      } catch (err) {
        console.error('Error fetching pavilions:', err);
        setError('Failed to load pavilions. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPavilions();
  }, []);

  const { searchTerm, setSearchTerm, selectedFilter: selectedTheme, setSelectedFilter: setSelectedTheme, filteredData: finalFilteredPavilions } =
    useFilterSearch<Pavilion>({
      data: pavilions,
      searchKeys: ['name', 'description'],
      filterKey: 'theme',
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const getThemeLabel = (theme: string) => {
    switch (theme) {
      case 'digitalization': return 'Digitalisation';
      case 'sustainability': return 'Développement Durable';
      case 'security': return 'Sécurité';
      case 'innovation': return 'Innovation';
      default: return theme.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getThemeColor = (theme: string) => {
    switch (theme) {
      case 'digitalization': return 'bg-blue-100 text-blue-800';
      case 'sustainability': return 'bg-green-100 text-green-800';
      case 'security': return 'bg-red-100 text-red-800';
      case 'innovation': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDemoTypeIcon = (type: string) => {
    switch (type) {
      case 'presentation': return Presentation;
      case 'workshop': return Lightbulb;
      case 'demo': return Settings;
      case 'roundtable': return Users;
      default: return Presentation;
    }
  };

  const handlePavilionAction = (pavilionId: string, action: string) => {
    const pavilion = pavilions.find(p => p.id === pavilionId);
    
    switch (action) {
      case 'view':
        // Navigation vers la page publique de visualisation
        window.open(`/pavilions#${pavilionId}`, '_blank');
        break;
      
      case 'edit':
        if (pavilion) {
          setEditingPavilion(pavilion);
          setShowEditModal(true);
        }
        break;
      
      case 'delete':
        setShowDeleteConfirm(pavilionId);
        break;
      
      case 'add-demo':
        // Navigation vers la page d'ajout de démo
        navigate(`${ROUTES.ADMIN_PAVILION_ADD_DEMO.replace(':pavilionId', pavilionId)}`);
        break;
      
      default:
        console.log(`Action ${action} for pavilion ${pavilionId}`);
    }
  };

  const handleDemoAction = (demoId: string, action: string) => {
    switch (action) {
      case 'view':
        toast.info('Fonctionnalité de visualisation de démo à venir');
        break;
      
      case 'edit':
        toast.info('Fonctionnalité d\'édition de démo à venir');
        break;
      
      case 'delete':
        if (confirm('Êtes-vous sûr de vouloir supprimer ce programme de démonstration ?')) {
          toast.success('Programme de démonstration supprimé');
          // Implémenter la suppression réelle ici
        }
        break;
      
      default:
        console.log(`Action ${action} for demo ${demoId}`);
    }
  };

  const handleDeletePavilion = (pavilionId: string) => {
    // Implémentation de la suppression
    setPavilions(prev => prev.filter(p => p.id !== pavilionId));
    setShowDeleteConfirm(null);
    toast.success('Pavillon supprimé avec succès');
  };

  const handleSaveEdit = (updatedPavilion: Pavilion) => {
    setPavilions(prev => 
      prev.map(p => p.id === updatedPavilion.id ? updatedPavilion : p)
    );
    setShowEditModal(false);
    setEditingPavilion(null);
    toast.success('Pavillon modifié avec succès');
  };

  const themeOptions = [
    { value: 'digitalization', label: 'Digitalisation' },
    { value: 'sustainability', label: 'Développement Durable' },
    { value: 'security', label: 'Sécurité' },
    { value: 'innovation', label: 'Innovation' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Chargement des pavillons...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to={ROUTES.ADMIN_DASHBOARD} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au Tableau de Bord
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('admin.pavilions_management_title')}</h1>
              <p className="text-gray-600 mt-2">
                {t('admin.pavilions_management_desc')}
              </p>
            </div>
            <Link to={ROUTES.ADMIN_CREATE_PAVILION}>
              <Button variant="default">
                <Plus className="h-4 w-4 mr-2" />
                {t('admin.create_pavilion')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('admin.total_pavilions')}</p>
                  <p className="text-3xl font-bold text-gray-900">{pavilions.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Programmes</p>
                  <p className="text-3xl font-bold text-green-600">
                    {pavilions.reduce((sum, p) => sum + (p.totalPrograms || 0), 0)}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Participants Totaux</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {pavilions.reduce((sum, p) => sum + (p.totalRegistered || 0), 0).toLocaleString()}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taux d'occupation</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {pavilions.reduce((sum, p) => sum + (p.totalCapacity || 0), 0) > 0
                      ? Math.round((pavilions.reduce((sum, p) => sum + (p.totalRegistered || 0), 0) /
                                   pavilions.reduce((sum, p) => sum + (p.totalCapacity || 0), 0)) * 100)
                      : 0}%
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les thèmes</option>
                {themeOptions.map(theme => (
                  <option key={theme.value} value={theme.value}>{theme.label}</option>
                ))}
              </select>

              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtrer
              </Button>
            </div>
          </div>
        </Card>

        {/* Pavilions Grid */}
        <div className="space-y-6">
          {finalFilteredPavilions.map((pavilion, index) => (
            <motion.div
              key={pavilion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {pavilion.name}
                        </h3>
                        <Badge className={getThemeColor(pavilion.theme)}>
                          {getThemeLabel(pavilion.theme)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {pavilion.description}
                      </p>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Créé le {formatDate(pavilion.created_at)}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  {pavilion.demoPrograms && pavilion.demoPrograms.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Programmes de Démonstration</h4>
                      <div className="space-y-4">
                        {pavilion.demoPrograms.map((program, programIndex) => {
                          const DemoIcon = getDemoTypeIcon(program.type);
                          return (
                            <div key={program.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                              <div className="p-2 rounded-md bg-white shadow-sm">
                                <DemoIcon className="h-5 w-5 text-blue-500" />
                              </div>
                              <div className="flex-1">
                                <h5 className="text-md font-medium text-gray-900">{program.title}</h5>
                                <p className="text-sm text-gray-700 line-clamp-1">{program.description}</p>
                                <div className="flex items-center text-xs text-gray-500 mt-1 space-x-3">
                                  <span><Calendar className="inline-block h-3 w-3 mr-1" />{formatDate(program.date)}</span>
                                  <span><Clock className="inline-block h-3 w-3 mr-1" />{program.time} ({program.duration})</span>
                                  <span><Users className="inline-block h-3 w-3 mr-1" />{program.registered}/{program.capacity}</span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDemoAction(program.id, 'view')}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2 mt-6">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handlePavilionAction(pavilion.id, 'view')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePavilionAction(pavilion.id, 'edit')}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Éditer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePavilionAction(pavilion.id, 'add-demo')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter Démo
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handlePavilionAction(pavilion.id, 'delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {finalFilteredPavilions.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun pavillon trouvé
            </h3>
            <p className="text-gray-600">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-bold text-gray-900">Confirmer la suppression</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer ce pavillon ? Cette action est irréversible.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Annuler
              </Button>
              <Button
                variant="default"
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={() => handleDeletePavilion(showDeleteConfirm)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {showEditModal && editingPavilion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Éditer le pavillon</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPavilion(null);
                }}
              >
                ✕
              </Button>
            </div>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Informations principales */}
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Informations principales</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du pavillon
                </label>
                <input
                  type="text"
                  value={editingPavilion.name}
                  onChange={(e) => setEditingPavilion({ ...editingPavilion, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sous-titre
                </label>
                <input
                  type="text"
                  value={editingPavilion.subtitle || ''}
                  onChange={(e) => setEditingPavilion({ ...editingPavilion, subtitle: e.target.value })}
                  placeholder="Ex : Automatisation et Numérisation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description courte
                </label>
                <input
                  type="text"
                  value={editingPavilion.shortDescription || ''}
                  onChange={(e) => setEditingPavilion({ ...editingPavilion, shortDescription: e.target.value })}
                  placeholder="Une phrase synthétique visible sous le sous-titre"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thème
                </label>
                <select
                  value={editingPavilion.theme}
                  onChange={(e) => setEditingPavilion({ ...editingPavilion, theme: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {themeOptions.map(theme => (
                    <option key={theme.value} value={theme.value}>{theme.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description complète
                </label>
                <textarea
                  value={editingPavilion.description}
                  onChange={(e) => setEditingPavilion({ ...editingPavilion, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Statistiques */}
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">Statistiques</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exposants</label>
                  <input
                    type="number"
                    min={0}
                    value={editingPavilion.exhibitors ?? 0}
                    onChange={(e) => setEditingPavilion({ ...editingPavilion, exhibitors: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visiteurs</label>
                  <input
                    type="number"
                    min={0}
                    value={editingPavilion.visitors ?? 0}
                    onChange={(e) => setEditingPavilion({ ...editingPavilion, visitors: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conférences</label>
                  <input
                    type="number"
                    min={0}
                    value={editingPavilion.conferences ?? 0}
                    onChange={(e) => setEditingPavilion({ ...editingPavilion, conferences: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Objectifs */}
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">Contenu détaillé</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Objectifs <span className="text-gray-400 font-normal">(un par ligne)</span>
                </label>
                <textarea
                  value={(editingPavilion.objectives || []).join('\n')}
                  onChange={(e) => setEditingPavilion({ ...editingPavilion, objectives: e.target.value.split('\n').filter(s => s.trim()) })}
                  rows={3}
                  placeholder="Améliorer l'efficacité opérationnelle\nRéduire les temps d'attente"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fonctionnalités <span className="text-gray-400 font-normal">(une par ligne)</span>
                </label>
                <textarea
                  value={(editingPavilion.features || []).join('\n')}
                  onChange={(e) => setEditingPavilion({ ...editingPavilion, features: e.target.value.split('\n').filter(s => s.trim()) })}
                  rows={3}
                  placeholder="Solutions IoT BTP\nSystèmes de gestion automatisée"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Public cible <span className="text-gray-400 font-normal">(un par ligne)</span>
                </label>
                <textarea
                  value={(editingPavilion.targetAudience || []).join('\n')}
                  onChange={(e) => setEditingPavilion({ ...editingPavilion, targetAudience: e.target.value.split('\n').filter(s => s.trim()) })}
                  rows={3}
                  placeholder="Autorités du Bâtiment\nOpérateurs de Terminaux"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPavilion(null);
                }}
              >
                Annuler
              </Button>
              <Button
                variant="default"
                className="flex-1"
                onClick={() => handleSaveEdit(editingPavilion)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
