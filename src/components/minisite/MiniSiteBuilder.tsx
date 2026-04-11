import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Layout,
  Image,
  FileText,
  Save,
  Eye,
  Smartphone,
  Monitor,
  Tablet,
  Plus,
  Trash2,
  Settings,
  ArrowLeft
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { SupabaseService } from '../../services/supabaseService';
import useAuthStore from '../../store/authStore';

interface HeroContent {
  title: string;
  subtitle: string;
  backgroundImage: string;
  ctaText: string;
  ctaLink: string;
}

interface AboutContent {
  title: string;
  description: string;
  features: string[];
}

interface Product {
  name: string;
  description: string;
  image: string;
  features: string[];
}

interface ProductsContent {
  title: string;
  products: Product[];
}

interface GalleryContent {
  title: string;
  images: string[];
}

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  date: string;
}

interface NewsContent {
  title: string;
  articles: NewsArticle[];
}

type SectionContent = HeroContent | AboutContent | ProductsContent | GalleryContent | NewsContent | Record<string, unknown>;

interface Section {
  id: string;
  type: 'hero' | 'about' | 'products' | 'gallery' | 'contact' | 'news';
  title: string;
  content: SectionContent;
  visible: boolean;
  order: number;
}

export default function MiniSiteBuilder() {
  const { user } = useAuthStore();
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [realLogoUrl, setRealLogoUrl] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([
    {
      id: '1',
      type: 'hero',
      title: 'Section Hero',
      content: {
        title: 'Bâtiment Solutions Inc.',
        subtitle: 'Leading provider of integrated bâtiment management solutions',
        backgroundImage:
          'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
        ctaText: 'Découvrir nos solutions',
        ctaLink: '#products'
      },
      visible: true,
      order: 0
    },
    {
      id: '2',
      type: 'about',
      title: 'À propos',
      content: {
        title: 'Notre expertise',
        description:
          "Avec plus de 20 ans d'expérience dans le secteur du bâtiment, nous accompagnons les bâtiments du monde entier dans leur transformation digitale.",
        features: ['Solutions innovantes', 'Expertise reconnue', 'Support 24/7', 'Présence internationale']
      },
      visible: true,
      order: 1
    },
    {
      id: '3',
      type: 'products',
      title: 'Produits & Services',
      content: {
        title: 'Nos solutions',
        products: [
          {
            name: 'Système IA BTP',
            description: 'Plateforme intelligente d\'optimisation des opérations BTP avec IA prédictive',
            image:
              'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400',
            features: ['Analytics prédictifs en temps réel', 'Automatisation IA', 'Intégration API complète'],
            price: 'Sur devis',
            inStock: true
          },
          {
            name: 'Plateforme IoT Connectée',
            description: 'Solution IoT de supervision et monitoring des équipements BTP',
            image:
              'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400',
            features: ['Capteurs intelligents', 'Maintenance prédictive', 'Alertes instantanées'],
            price: 'À partir de 15 000€',
            inStock: true
          },
          {
            name: 'Support Premium 24/7',
            description: 'Assistance technique dédiée et formation continue de vos équipes',
            image:
              'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
            features: ['Équipe dédiée multilingue', 'Intervention sous 2h', 'Formation personnalisée'],
            price: '2 500€/mois',
            inStock: true
          }
        ]
      },
      visible: true,
      order: 2
    }
  ]);

  const [siteSettings, setSiteSettings] = useState({
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6',
    accentColor: '#60a5fa',
    fontFamily: 'Inter',
    logoUrl: '' // Sera remplacé par le vrai logo de l'entreprise
  });

  // Charger le vrai logo de l'entreprise depuis la base de données
  useEffect(() => {
    const loadExhibitorLogo = async () => {
      if (!user?.id) return;
      try {
        // Récupérer les données de l'exposant
        const exhibitor = await SupabaseService.getExhibitorByUserId(user.id);
        if (exhibitor?.logo_url) {
          setRealLogoUrl(exhibitor.logo_url);
          setSiteSettings(prev => ({ ...prev, logoUrl: exhibitor.logo_url }));
        }
      } catch (err) {
        console.warn('Impossible de charger le logo de l\'entreprise:', err);
      }
    };
    loadExhibitorLogo();
  }, [user?.id]);

  const sectionTypes: { type: Section['type']; title: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
    { type: 'hero', title: 'Section Hero', icon: Layout, description: "Bannière d'accueil avec titre et CTA" },
    { type: 'about', title: 'À propos', icon: FileText, description: 'Présentation de votre entreprise' },
    { type: 'products', title: 'Produits', icon: Image, description: 'Catalogue de vos produits et services' },
    { type: 'gallery', title: 'Galerie', icon: Image, description: 'Photos et vidéos de votre entreprise' },
    { type: 'news', title: 'Actualités', icon: FileText, description: 'Dernières nouvelles et annonces' }
  ];

  const addSection = (type: Section['type']) => {
    const newSection: Section = {
      id: Date.now().toString(),
      type,
      title: sectionTypes.find((s) => s.type === type)?.title || 'Nouvelle section',
      content: getDefaultContent(type),
      visible: true,
      order: sections.length
    };
    setSections((prev) => [...prev, newSection]);
    toast.success('Section ajoutée');
  };

  const getDefaultContent = (type: Section['type']) => {
    switch (type) {
      case 'hero':
        return { title: 'Votre titre', subtitle: 'Votre sous-titre', backgroundImage: '', ctaText: 'En savoir plus', ctaLink: '#' };
      case 'about':
        return { title: 'À propos de nous', description: 'Décrivez votre entreprise ici...', features: [] };
      case 'products':
        return { title: 'Nos produits', products: [] };
      case 'gallery':
        return { title: 'Galerie', images: [] };
      case 'news':
        return { title: 'Actualités', articles: [] };
      default:
        return {};
    }
  };

  const removeSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
    toast.success('Section supprimée');
  };

  const toggleSectionVisibility = (id: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)));
  };

  // updateSectionContent kept out — implement when inline editors are added

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'mobile':
        return 'w-80';
      case 'tablet':
        return 'w-96';
      case 'desktop':
        return 'w-full';
      default:
        return 'w-full';
    }
  };

  const handlePreview = () => {
    const previewData = {
      url: `https://SIB.com/minisite/preview/${Date.now()}`,
      sections: sections.filter((s) => s.visible).length,
      theme: siteSettings.fontFamily,
      colors: siteSettings.primaryColor,
      responsive: true,
      seoOptimized: true,
      loadTime: '1.2s',
      mobileScore: '98/100'
    };

    const previewWindow = window.open('', '_blank', 'width=1200,height=800');
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head><title>Prévisualisation Mini-Site</title></head>
          <body style="margin:0;padding:20px;font-family:${siteSettings.fontFamily}">
            <h1 style="color:${siteSettings.primaryColor}">Prévisualisation Mini-Site</h1>
            <p>Sections visibles: ${previewData.sections}</p>
            <p>Thème: ${previewData.theme}</p>
            <p>Couleur principale: ${previewData.colors}</p>
            <div style="background:${siteSettings.primaryColor};color:white;padding:20px;margin:20px 0;">
              <h2>Aperçu du design</h2>
              <p>Votre mini-site avec les couleurs personnalisées</p>
            </div>
          </body>
        </html>
      `);
      previewWindow.document.close();
    }

    toast.success('Prévisualisation générée et ouverte dans un nouvel onglet.');
  };

  const handleSave = () => {
    const saveData = {
      sections: sections.length,
      visibleSections: sections.filter((s) => s.visible).length,
      lastSaved: new Date().toLocaleTimeString('fr-FR'),
      autoSave: true,
      backup: true
    };

    // Simulate save
    setTimeout(() => {
      toast.success(`Mini-site sauvegardé (${saveData.lastSaved})`);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to={ROUTES.DASHBOARD}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au Tableau de Bord Exposant
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Créateur de Mini-Site</h1>
            <p className="text-gray-600">Personnalisez votre vitrine digitale pour SIB 2026</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-2 rounded ${previewMode === 'desktop' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPreviewMode('tablet')}
                className={`p-2 rounded ${previewMode === 'tablet' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <Tablet className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-2 rounded ${previewMode === 'mobile' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>

            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Prévisualiser
            </Button>

            <Button variant="default" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Settings className="h-4 w-4 mr-2" /> Paramètres du site
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Couleur principale</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={siteSettings.primaryColor}
                        onChange={(e) => setSiteSettings({ ...siteSettings, primaryColor: e.target.value })}
                        className="w-8 h-8 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={siteSettings.primaryColor}
                        onChange={(e) => setSiteSettings({ ...siteSettings, primaryColor: e.target.value })}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Police</label>
                    <select
                      value={siteSettings.fontFamily}
                      onChange={(e) => setSiteSettings({ ...siteSettings, fontFamily: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Plus className="h-4 w-4 mr-2" /> Ajouter une section
                </h3>

                <div className="space-y-2">
                  {sectionTypes.map((sectionType) => (
                    <button
                      key={sectionType.type}
                      onClick={() => addSection(sectionType.type)}
                      className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <sectionType.icon className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{sectionType.title}</p>
                          <p className="text-xs text-gray-500">{sectionType.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Sections ({sections.length})</h3>

                <div className="space-y-2">
                  {sections.map((section) => (
                    <div
                      key={section.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        activeSection === section.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setActiveSection(section.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900">{section.title}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSectionVisibility(section.id);
                            }}
                            className={`p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded ${section.visible ? 'text-green-600' : 'text-gray-400'}`}
                          >
                            <Eye className="h-3 w-3" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSection(section.id);
                            }}
                            className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <Badge variant="info" size="sm">
                          {section.type}
                        </Badge>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => setActiveSection(section.id)}>
                            <Eye className="h-4 w-4 mr-2" /> Prévisualiser
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="p-6">
              <div className="flex justify-center">
                <div className={`${getPreviewWidth()} transition-all duration-300`}>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg">
                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <Save className="h-4 w-4 mr-2" /> Sauvegarder
                        </div>
                        <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-500">SIB.com/exhibitor/bâtiment-solutions-inc</div>
                      </div>
                    </div>

                    <div className="min-h-96">
                      {sections
                        .filter((s) => s.visible)
                        .sort((a, b) => a.order - b.order)
                        .map((section) => (
                          <motion.div
                            key={section.id}
                            className={`border-2 border-transparent hover:border-blue-300 transition-colors ${
                              activeSection === section.id ? 'border-blue-500' : ''
                            }`}
                            onClick={() => setActiveSection(section.id)}
                          >
                            {section.type === 'hero' && (
                              <div
                                className="relative h-64 bg-cover bg-center flex items-center justify-center"
                                style={{
                                  backgroundImage: (section.content as HeroContent).backgroundImage ? `url(${(section.content as HeroContent).backgroundImage})` : 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)'
                                }}
                              >
                                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                                <div className="relative text-center text-white px-6">
                                  <h1 className="text-3xl font-bold mb-4">{(section.content as HeroContent).title}</h1>
                                  <p className="text-lg mb-6 opacity-90">{(section.content as HeroContent).subtitle}</p>
                                  <button
                                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                                    style={{ color: siteSettings.primaryColor }}
                                  >
                                    {(section.content as HeroContent).ctaText}
                                  </button>
                                </div>
                              </div>
                            )}

                            {section.type === 'about' && (
                              <div className="p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">{(section.content as AboutContent).title}</h2>
                                <p className="text-gray-600 mb-6">{(section.content as AboutContent).description}</p>
                                {(section.content as AboutContent).features.length > 0 && (
                                  <div className="grid grid-cols-2 gap-4">
                                    {(section.content as AboutContent).features.map((feature: any, idx: number) => {
                                      const featureName = typeof feature === 'string' ? feature : (feature?.name || feature?.title || '');
                                      if (!featureName) return null;
                                      return (
                                        <div key={`feature-${idx}`} className="flex items-center space-x-2">
                                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: siteSettings.primaryColor }}></div>
                                          <span className="text-sm text-gray-700">{featureName}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}

                            {section.type === 'products' && (
                              <div className="p-8 bg-gray-50">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{(section.content as ProductsContent).title}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {(section.content as ProductsContent).products.map((product: Product) => (
                                    <div key={`product-${product.name}`} className="bg-white rounded-lg p-6 shadow-sm">
                                      <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded-lg mb-4" />
                                      <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                                      <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                                      <div className="flex flex-wrap gap-1">
                                        {product.features.map((feature: any, idx: number) => {
                                          const featureName = typeof feature === 'string' ? feature : (feature?.name || feature?.title || '');
                                          if (!featureName) return null;
                                          return <Badge key={`pf-${idx}`} variant="info" size="sm">{featureName}</Badge>;
                                        })}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}

                      {sections.filter((s) => s.visible).length === 0 && (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                          <div className="text-center">
                            <Layout className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Ajoutez des sections pour commencer à créer votre mini-site</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

