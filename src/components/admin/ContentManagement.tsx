import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import {
  Settings,
  FileText,
  Users,
  Building2,
  Calendar,
  BarChart3,
  Globe,
  Shield,
  Edit,
  Save,
  Eye,
  ArrowLeft,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { motion } from 'framer-motion';

interface ContentSection {
  id: string;
  title: string;
  description: string;
  icon_name: string; // Store icon name as string
  color: string;
  bg_color: string;
  last_modified: string;
  status: 'published' | 'draft' | 'archived';
  content_data: any; // JSONB field for actual content
}

// Map icon names to Lucide React components
const iconMap: { [key: string]: any } = {
  Globe: Globe,
  Building2: Building2,
  Users: Users,
  Calendar: Calendar,
  FileText: FileText,
  Shield: Shield,
  BarChart3: BarChart3,
};

export default function ContentManagement() {
  const [contentSections, setContentSections] = useState<ContentSection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentContentData, setCurrentContentData] = useState<any>({});

  useEffect(() => {
    fetchContentSections();
  }, []);

  const fetchContentSections = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Static content sections - these represent the different pages/sections that can be managed
      const staticSections: ContentSection[] = [
        {
          id: 'home',
          title: 'Page d\'Accueil',
          description: 'Contenu principal de la page d\'accueil SIB',
          icon_name: 'Globe',
          color: 'text-blue-600',
          bg_color: 'bg-blue-100',
          last_modified: new Date().toISOString(),
          status: 'published',
          content_data: {}
        },
        {
          id: 'pavilions',
          title: 'Pavillons Thématiques',
          description: 'Gestion des pavillons et de leurs contenus',
          icon_name: 'Building2',
          color: 'text-green-600',
          bg_color: 'bg-green-100',
          last_modified: new Date().toISOString(),
          status: 'published',
          content_data: {}
        },
        {
          id: 'exhibitors',
          title: 'Exposants',
          description: 'Présentation et informations des exposants',
          icon_name: 'Users',
          color: 'text-purple-600',
          bg_color: 'bg-purple-100',
          last_modified: new Date().toISOString(),
          status: 'published',
          content_data: {}
        },
        {
          id: 'events',
          title: 'Événements',
          description: 'Programmation et agenda des événements',
          icon_name: 'Calendar',
          color: 'text-orange-600',
          bg_color: 'bg-orange-100',
          last_modified: new Date().toISOString(),
          status: 'published',
          content_data: {}
        },
        {
          id: 'news',
          title: 'Actualités',
          description: 'Articles et communiqués de presse',
          icon_name: 'FileText',
          color: 'text-indigo-600',
          bg_color: 'bg-indigo-100',
          last_modified: new Date().toISOString(),
          status: 'published',
          content_data: {}
        },
        {
          id: 'partners',
          title: 'Partenaires',
          description: 'Informations sur les partenaires SIB',
          icon_name: 'Shield',
          color: 'text-red-600',
          bg_color: 'bg-red-100',
          last_modified: new Date().toISOString(),
          status: 'published',
          content_data: {}
        },
        {
          id: 'metrics',
          title: 'Métriques',
          description: 'Statistiques et indicateurs de performance',
          icon_name: 'BarChart3',
          color: 'text-cyan-600',
          bg_color: 'bg-cyan-100',
          last_modified: new Date().toISOString(),
          status: 'published',
          content_data: {}
        }
      ];
      setContentSections(staticSections);
      if (selectedSectionId) {
        const current = staticSections.find((s: ContentSection) => s.id === selectedSectionId);
        setCurrentContentData(current?.content_data || {});
      }
    } catch (err) {
      console.error('Error fetching content sections:', err);
      setError('Failed to load content sections. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setIsEditing(false);
    const section = contentSections.find(s => s.id === sectionId);
    setCurrentContentData(section?.content_data || {});
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedSectionId) return;

    setIsLoading(true);
    setError(null);
    try {
      // Update local state - in a full implementation, this would save to a backend
      const updatedSections = contentSections.map(section =>
        section.id === selectedSectionId
          ? { ...section, content_data: currentContentData, last_modified: new Date().toISOString() }
          : section
      );
      setContentSections(updatedSections);
      setIsEditing(false);
      // Note: For persistent storage, implement backend API endpoint or use SupabaseService with proper authentication
      console.log('Content saved locally. Implement backend persistence for production.');
    } catch (err) {
      console.error('Error saving content:', err);
      setError('Failed to save content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    // Implement actual preview logic, e.g., open in new tab or modal
  };

  const handleContentChange = (key: string, value: any) => {
    setCurrentContentData(prev => ({ ...prev, [key]: value }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="success">Publié</Badge>;
      case 'draft':
        return <Badge variant="warning">Brouillon</Badge>;
      case 'archived':
        return <Badge variant="info">Archivé</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const selectedSectionData = contentSections.find(section => section.id === selectedSectionId);

  if (isLoading && contentSections.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Chargement du contenu...</h3>
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
          <Button onClick={fetchContentSections} className="mt-4">
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link to={ROUTES.ADMIN_DASHBOARD}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion du Contenu</h1>
              <p className="text-gray-600 mt-2">
                Administration centralisée de tous les contenus de l'application SIB
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des sections */}
          <div className="lg:col-span-1">
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-gray-600" />
                  Sections Modifiables
                </h2>

                <div className="space-y-3">
                  {contentSections.map((section) => {
                    const IconComponent = iconMap[section.icon_name] || Settings;
                    const isSelected = selectedSectionId === section.id;

                    return (
                      <motion.div
                        key={section.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <button
                          onClick={() => handleSectionSelect(section.id)}
                          className={`w-full p-4 rounded-lg border text-left transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${section.bg_color}`}>
                              <IconComponent className={`h-4 w-4 ${section.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 text-sm">
                                {section.title}
                              </h3>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {section.description}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500">
                                  Modifié: {new Date(section.last_modified).toLocaleDateString('fr-FR')}
                                </span>
                                {getStatusBadge(section.status)}
                              </div>
                            </div>
                          </div>
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>

          {/* Éditeur de contenu */}
          <div className="lg:col-span-2">
            {selectedSectionData ? (
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${selectedSectionData.bg_color}`}>
                        {selectedSectionData.icon_name && iconMap[selectedSectionData.icon_name] ? React.createElement(iconMap[selectedSectionData.icon_name], { className: `h-5 w-5 ${selectedSectionData.color}` }) : <Settings className={`h-5 w-5 ${selectedSectionData.color}`} />}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {selectedSectionData.title}
                        </h2>
                        <p className="text-sm text-gray-600">
                          {selectedSectionData.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={handlePreview}>
                        <Eye className="h-4 w-4 mr-2" />
                        Prévisualiser
                      </Button>
                      {!isEditing ? (
                        <Button variant="default" size="sm" onClick={handleEdit}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </Button>
                      ) : (
                        <Button variant="default" size="sm" onClick={handleSave} disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Sauvegarde...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Sauvegarder
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Zone d'édition */}
                  <div className="space-y-6">
                    {selectedSectionId === 'home' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Titre Principal
                          </label>
                          <input
                            type="text"
                            disabled={!isEditing}
                            value={currentContentData.mainTitle || ''}
                            onChange={(e) => handleContentChange('mainTitle', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            rows={4}
                            disabled={!isEditing}
                            value={currentContentData.descriptionText || ''}
                            onChange={(e) => handleContentChange('descriptionText', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Statistiques Clés (séparées par des virgules)
                          </label>
                          <input
                            type="text"
                            disabled={!isEditing}
                            value={currentContentData.keyStats ? currentContentData.keyStats.join(', ') : ''}
                            onChange={(e) => handleContentChange('keyStats', e.target.value.split(',').map((s: string) => s.trim()))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                      </div>
                    )}

                    {selectedSectionId === 'pavilions' && (
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-800">
                            <strong>Info:</strong> La gestion des pavillons se fait via la page dédiée
                            "Gestion des Pavillons" dans le menu principal.
                          </p>
                          <Link to={ROUTES.ADMIN_PAVILIONS}>
                            <Button variant="outline" size="sm" className="mt-2">
                              <Building2 className="h-4 w-4 mr-2" />
                              Aller à la Gestion des Pavillons
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}

                    {selectedSectionId === 'events' && (
                      <div className="space-y-4">
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <p className="text-sm text-orange-800">
                            <strong>Info:</strong> La gestion des événements se fait via la page dédiée
                            "Gestion des Événements" dans le menu principal.
                          </p>
                          <Link to={ROUTES.ADMIN_EVENTS}>
                            <Button variant="outline" size="sm" className="mt-2">
                              <Calendar className="h-4 w-4 mr-2" />
                              Aller à la Gestion des Événements
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}

                    {selectedSectionId === 'news' && (
                      <div className="space-y-4">
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                          <p className="text-sm text-indigo-800">
                            <strong>Info:</strong> La gestion des actualités se fait via le système
                            de création d'articles dans le menu principal.
                          </p>
                          <Link to={ROUTES.ADMIN_CREATE_NEWS}>
                            <Button variant="outline" size="sm" className="mt-2">
                              <FileText className="h-4 w-4 mr-2" />
                              Créer un Article
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Sections génériques */}
                    {(selectedSectionId === 'exhibitors' || selectedSectionId === 'partners' || selectedSectionId === 'metrics') && (
                      <div className="space-y-4">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <p className="text-sm text-gray-700">
                            Cette section est gérée automatiquement par le système.
                            Les modifications se font via les interfaces dédiées dans le menu principal.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ) : (
              <Card>
                <div className="p-12 text-center">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sélectionnez une Section
                  </h3>
                  <p className="text-gray-600">
                    Choisissez une section dans la liste à gauche pour commencer l'édition du contenu
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

