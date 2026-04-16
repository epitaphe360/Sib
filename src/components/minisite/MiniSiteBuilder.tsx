import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  ArrowLeft,
  Loader2,
  ExternalLink,
  Check,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { SupabaseService } from '../../services/supabaseService';
import useAuthStore from '../../store/authStore';

// ─── Types ────────────────────────────────────────────────────────────────────

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
  id: string;
  name: string;
  description: string;
  image: string;
  features: string[];
  price?: string;
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

type SectionContent =
  | HeroContent
  | AboutContent
  | ProductsContent
  | GalleryContent
  | NewsContent
  | Record<string, unknown>;

interface Section {
  id: string;
  type: 'hero' | 'about' | 'products' | 'gallery' | 'contact' | 'news';
  title: string;
  content: SectionContent;
  visible: boolean;
  order: number;
}

interface SiteSettings {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  logoUrl: string;
}

// ─── Default content ──────────────────────────────────────────────────────────

function getDefaultContent(type: Section['type']): SectionContent {
  switch (type) {
    case 'hero':
      return { title: 'Votre titre', subtitle: 'Votre sous-titre', backgroundImage: '', ctaText: 'En savoir plus', ctaLink: '#' };
    case 'about':
      return { title: 'À propos de nous', description: 'Décrivez votre entreprise...', features: [] };
    case 'products':
      return { title: 'Nos produits & services', products: [] };
    case 'gallery':
      return { title: 'Galerie', images: [] };
    case 'news':
      return { title: 'Actualités', articles: [] };
    case 'contact':
      return { title: 'Contactez-nous', address: '', phone: '', email: '', website: '' };
    default:
      return {};
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MiniSiteBuilder() {
  const { user } = useAuthStore();
  const [exhibitorId, setExhibitorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const hasLoadedRef = useRef(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    primaryColor: '#C9A84C',
    secondaryColor: '#0F2034',
    fontFamily: 'Inter',
    logoUrl: '',
  });

  // Section type definitions (no t() needed — UI labels)
  const sectionTypes = useMemo<{ type: Section['type']; title: string; icon: React.ComponentType<{ className?: string }>; description: string }[]>(() => [
    { type: 'hero', title: 'Section Hero', icon: Layout, description: "Bannière d'accueil avec CTA" },
    { type: 'about', title: 'À propos', icon: FileText, description: 'Présentation de votre entreprise' },
    { type: 'products', title: 'Produits', icon: Image, description: 'Catalogue produits/services' },
    { type: 'gallery', title: 'Galerie', icon: Image, description: 'Photos et médias' },
    { type: 'news', title: 'Actualités', icon: FileText, description: 'Articles et annonces' },
  ], []);

  // ─── Load from DB ──────────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      if (!user?.id) { setIsLoading(false); return; }
      try {
        const exhibitor = await SupabaseService.getExhibitorByUserId(user.id);
        if (!exhibitor) { setIsLoading(false); return; }
        setExhibitorId(exhibitor.id);

        // Apply real logo if available
        if (exhibitor.logo_url) {
          setSiteSettings(prev => ({ ...prev, logoUrl: exhibitor.logo_url }));
        }

        const miniSite = await SupabaseService.getMiniSite(exhibitor.id);
        if (miniSite?.sections?.length) {
          const loaded = (miniSite.sections as any[]).map((s: any, i: number): Section => ({
            id: s.id || String(i + 1),
            type: (s.type || 'about') as Section['type'],
            title: s.title || '',
            content: s.content || {},
            visible: s.visible !== false,
            order: s.order ?? i,
          }));
          setSections(loaded);
          if (miniSite.settings) {
            setSiteSettings(prev => ({ ...prev, ...(miniSite.settings as Partial<SiteSettings>) }));
          }
        } else {
          // Seed starter sections from profile (no fake company names)
          const company = user.profile?.company || '';
          const email = user.email || '';
          setSections([
            {
              id: '1',
              type: 'hero',
              title: 'Section Hero',
              content: {
                title: company || 'Votre entreprise',
                subtitle: 'Bienvenue sur notre espace SIB 2026',
                backgroundImage: '',
                ctaText: 'Découvrir',
                ctaLink: '#about',
              },
              visible: true,
              order: 0,
            },
            {
              id: '2',
              type: 'about',
              title: 'À propos',
              content: {
                title: 'À propos de nous',
                description: 'Présentez votre entreprise ici...',
                features: [],
              },
              visible: true,
              order: 1,
            },
            {
              id: '3',
              type: 'contact',
              title: 'Contact',
              content: { title: 'Contactez-nous', address: '', phone: '', email, website: '' },
              visible: true,
              order: 2,
            },
          ]);
        }
      } catch (err) {
        console.error('[MiniSiteBuilder] Load error:', err);
        toast.error('Impossible de charger le mini-site');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?.id]);

  // Track unsaved changes — skip the initial load cycle
  useEffect(() => {
    if (!hasLoadedRef.current) {
      if (!isLoading) {hasLoadedRef.current = true;}
      return;
    }
    setHasUnsavedChanges(true);
  }, [sections, siteSettings, isLoading]);

  // ─── Section actions ───────────────────────────────────────────────────────

  const addSection = useCallback((type: Section['type']) => {
    const label = sectionTypes.find(s => s.type === type)?.title || 'Nouvelle section';
    const newSection: Section = {
      id: Date.now().toString(),
      type,
      title: label,
      content: getDefaultContent(type),
      visible: true,
      order: 0,
    };
    setSections(prev => {
      const shifted = prev.map((s, i) => ({ ...s, order: i + 1 }));
      return [{ ...newSection, order: 0 }, ...shifted];
    });
    setActiveSection(newSection.id);
    toast.success(`Section "${label}" ajoutée`);
  }, [sectionTypes]);

  const removeSection = useCallback((id: string) => {
    const section = sections.find(s => s.id === id);
    if (!window.confirm(`Supprimer la section "${section?.title}" ?`)) {return;}
    setSections(prev => prev.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i })));
    if (activeSection === id) {setActiveSection(null);}
    toast.success('Section supprimée');
  }, [sections, activeSection]);

  const toggleVisibility = useCallback((id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  }, []);

  // ─── Save (real) ───────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!exhibitorId) {
      toast.error('Exposant introuvable — reconnectez-vous');
      return;
    }
    setIsSaving(true);
    try {
      await SupabaseService.updateMiniSite(exhibitorId, {
        sections: sections.map(s => ({
          id: s.id,
          type: s.type,
          title: s.title,
          content: s.content,
          visible: s.visible,
          order: s.order,
        })),
        settings: siteSettings,
        published: true,
      });
      setHasUnsavedChanges(false);
      toast.success('Mini-site sauvegardé');
    } catch (err) {
      console.error('[MiniSiteBuilder] Save error:', err);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  }, [exhibitorId, sections, siteSettings]);

  // ─── Preview (safe — uses route, no document.write) ───────────────────────

  const handlePreview = useCallback(() => {
    if (!exhibitorId) {
      toast.error('Sauvegardez d\'abord votre mini-site');
      return;
    }
    window.open(`/minisite/${exhibitorId}`, '_blank', 'noopener,noreferrer');
  }, [exhibitorId]);

  // ─── Computed ─────────────────────────────────────────────────────────────

  const sortedVisible = useMemo(
    () => [...sections].filter(s => s.visible).sort((a, b) => a.order - b.order),
    [sections]
  );

  const previewWidth = previewMode === 'mobile' ? 'w-80' : previewMode === 'tablet' ? 'w-96' : 'w-full';

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sibs.ma';

  // ─── Loading ──────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sib-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#C9A84C] mx-auto mb-4" />
          <p className="text-[#0F2034] font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-sib-bg">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Breadcrumb */}
        <div className="mb-4">
          <Link to={ROUTES.DASHBOARD}>
            <Button variant="ghost" size="sm" className="text-[#0F2034] hover:text-[#C9A84C]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tableau de bord
            </Button>
          </Link>
        </div>

        {/* Top bar */}
        <div className="bg-[#0F2034] rounded-xl px-6 py-4 flex flex-wrap items-center justify-between gap-4 mb-6 shadow-sib">
          <div>
            <h1 className="text-xl font-bold text-white">Créateur de Mini-Site</h1>
            <p className="text-sm text-white/60">Votre vitrine digitale SIB 2026</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Preview mode toggle */}
            <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
              {(['desktop', 'tablet', 'mobile'] as const).map(mode => {
                const Icon = mode === 'desktop' ? Monitor : mode === 'tablet' ? Tablet : Smartphone;
                return (
                  <button key={mode}
                    onClick={() => setPreviewMode(mode)}
                    className={`p-2 rounded-md transition-colors ${previewMode === mode ? 'bg-[#C9A84C] text-white' : 'text-white/60 hover:text-white'}`}
                    title={mode}>
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
            <Button variant="outline" size="sm" onClick={handlePreview}
              className="border-white/30 text-white hover:bg-white/10">
              <ExternalLink className="h-4 w-4 mr-2" />
              Aperçu
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}
              className={`${hasUnsavedChanges ? 'bg-[#C9A84C] hover:bg-[#A88830]' : 'bg-green-600 hover:bg-green-700'} text-white font-semibold`}>
              {isSaving
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sauvegarde...</>
                : hasUnsavedChanges
                  ? <><Save className="h-4 w-4 mr-2" />Sauvegarder</>
                  : <><Check className="h-4 w-4 mr-2" />Sauvegardé</>}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* ── Sidebar ── */}
          <div className="lg:col-span-1 space-y-4">

            {/* Settings */}
            <Card>
              <div className="p-4">
                <h3 className="font-bold text-[#0F2034] mb-4 flex items-center gap-2 text-sm">
                  <Settings className="h-4 w-4 text-[#C9A84C]" />
                  Paramètres
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Couleur principale</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={siteSettings.primaryColor}
                        onChange={e => setSiteSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                        aria-label="Couleur principale"
                        className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                      <input type="text" value={siteSettings.primaryColor}
                        onChange={e => setSiteSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                        aria-label="Code hex"
                        className="flex-1 px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Police</label>
                    <select value={siteSettings.fontFamily}
                      onChange={e => setSiteSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]">
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Montserrat">Montserrat</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            {/* Add section */}
            <Card>
              <div className="p-4">
                <h3 className="font-bold text-[#0F2034] mb-3 flex items-center gap-2 text-sm">
                  <Plus className="h-4 w-4 text-[#C9A84C]" />
                  Ajouter une section
                </h3>
                <div className="space-y-1.5">
                  {sectionTypes.map(st => (
                    <button key={st.type}
                      onClick={() => addSection(st.type)}
                      className="w-full p-2.5 text-left border border-gray-100 rounded-lg hover:border-[#C9A84C]/50 hover:bg-[#C9A84C]/5 transition-colors group">
                      <div className="flex items-center gap-2.5">
                        <st.icon className="h-4 w-4 text-gray-400 group-hover:text-[#C9A84C] flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{st.title}</p>
                          <p className="text-xs text-gray-400">{st.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Sections list */}
            <Card>
              <div className="p-4">
                <h3 className="font-bold text-[#0F2034] mb-3 text-sm">Sections ({sections.length})</h3>
                {sections.length === 0
                  ? <p className="text-xs text-gray-400 text-center py-4">Aucune section</p>
                  : (
                    <div className="space-y-1.5">
                      {[...sections].sort((a, b) => a.order - b.order).map(section => (
                        <div key={section.id}
                          className={`p-2.5 border rounded-lg cursor-pointer transition-colors ${
                            activeSection === section.id ? 'border-[#C9A84C] bg-[#C9A84C]/5' : 'border-gray-100 hover:border-gray-300'
                          }`}
                          onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-semibold truncate ${section.visible ? 'text-gray-800' : 'text-gray-400 line-through'}`}>
                              {section.title}
                            </span>
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              <button onClick={e => { e.stopPropagation(); toggleVisibility(section.id); }}
                                className={`p-1 rounded ${section.visible ? 'text-green-500' : 'text-gray-300'}`}
                                title={section.visible ? 'Masquer' : 'Afficher'}>
                                <Eye className="h-3 w-3" />
                              </button>
                              <button onClick={e => { e.stopPropagation(); removeSection(section.id); }}
                                className="p-1 rounded text-red-400 hover:text-red-600"
                                title="Supprimer">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <Badge variant="info" size="sm" className="mt-1.5 text-xs">{section.type}</Badge>
                        </div>
                      ))}
                    </div>
                  )
                }
              </div>
            </Card>
          </div>

          {/* ── Preview ── */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden">
              {/* Browser chrome */}
              <div className="bg-gray-100 border-b border-gray-200 px-4 py-2.5 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                  <div className="w-3 h-3 bg-green-400 rounded-full" />
                </div>
                <div className="flex-1 bg-white border border-gray-200 rounded-md px-3 py-1 text-xs text-gray-500 font-mono truncate">
                  {appUrl}/minisite/{exhibitorId?.slice(0, 8) || 'votre-stand'}
                </div>
              </div>

              {/* Preview content */}
              <div className="p-4 bg-gray-50 overflow-auto" style={{ minHeight: '70vh' }}>
                <div className={`${previewWidth} mx-auto transition-all duration-300`}>
                  <div className="bg-white shadow-xl rounded-lg overflow-hidden"
                    style={{ fontFamily: siteSettings.fontFamily }}>

                    {/* Site nav */}
                    <div className="flex items-center justify-between px-6 py-3"
                      style={{ backgroundColor: siteSettings.secondaryColor }}>
                      {siteSettings.logoUrl
                        ? <img src={siteSettings.logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
                        : <span className="text-white font-bold text-sm">{user?.profile?.company || 'Votre entreprise'}</span>}
                    </div>

                    {/* Sections */}
                    {sortedVisible.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Layout className="h-16 w-16 mb-4 opacity-30" />
                        <p className="text-sm font-medium mb-4">Aucune section visible</p>
                        <Button size="sm" className="bg-[#C9A84C] hover:bg-[#A88830] text-white"
                          onClick={() => addSection('hero')}>
                          <Plus className="h-4 w-4 mr-1" /> Ajouter Section Hero
                        </Button>
                      </div>
                    ) : (
                      sortedVisible.map(section => (
                        <motion.div key={section.id}
                          className={`border-2 transition-colors cursor-pointer ${
                            activeSection === section.id ? 'border-[#C9A84C]' : 'border-transparent hover:border-[#C9A84C]/30'
                          }`}
                          onClick={() => setActiveSection(section.id)}>

                          {activeSection === section.id && (
                            <div className="bg-[#C9A84C] px-3 py-1 text-xs text-white font-semibold">
                              Section active : {section.title}
                            </div>
                          )}

                          {/* Hero */}
                          {section.type === 'hero' && (() => {
                            const c = section.content as HeroContent;
                            return (
                              <div className="relative h-56 flex items-center justify-center"
                                style={{
                                  background: c.backgroundImage
                                    ? `url(${c.backgroundImage}) center/cover`
                                    : `linear-gradient(135deg, ${siteSettings.secondaryColor} 0%, ${siteSettings.primaryColor} 100%)`,
                                }}>
                                <div className="absolute inset-0 bg-black/40" />
                                <div className="relative text-center text-white px-6 w-full">
                                  <h1 className="text-2xl font-bold mb-3">{c.title}</h1>
                                  <p className="text-base text-white/90 mb-4">{c.subtitle}</p>
                                  <span className="inline-block px-5 py-2 rounded-lg font-semibold text-sm text-white"
                                    style={{ backgroundColor: siteSettings.primaryColor }}>
                                    {c.ctaText}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}

                          {/* About */}
                          {section.type === 'about' && (() => {
                            const c = section.content as AboutContent;
                            return (
                              <div className="p-8">
                                <h2 className="text-2xl font-bold text-[#0F2034] mb-4">{c.title}</h2>
                                <p className="text-gray-600 leading-relaxed mb-5">{c.description}</p>
                                {c.features.length > 0 && (
                                  <div className="grid grid-cols-2 gap-3">
                                    {c.features.map((feat, i) => {
                                      const name = typeof feat === 'string' ? feat : (feat as any)?.name || '';
                                      if (!name) {return null;}
                                      return (
                                        <div key={i} className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: siteSettings.primaryColor }} />
                                          <span className="text-sm text-gray-700">{name}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {/* Products */}
                          {section.type === 'products' && (() => {
                            const c = section.content as ProductsContent;
                            return (
                              <div className="p-8 bg-gray-50">
                                <h2 className="text-2xl font-bold text-[#0F2034] mb-5 text-center">{c.title}</h2>
                                {c.products.length === 0 ? (
                                  <p className="text-center text-gray-400 py-8 text-sm">Aucun produit — utilisez l'éditeur complet pour en ajouter</p>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {c.products.map((prod, i) => (
                                      <div key={prod.id || i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                        {prod.image && (
                                          <img src={prod.image} alt={prod.name}
                                            className="w-full h-28 object-cover rounded-lg mb-3" />
                                        )}
                                        <h3 className="font-semibold text-[#0F2034] mb-1">{prod.name}</h3>
                                        <p className="text-gray-500 text-sm">{prod.description}</p>
                                        {prod.price && (
                                          <p className="mt-2 font-bold text-sm" style={{ color: siteSettings.primaryColor }}>
                                            {prod.price}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {/* Gallery */}
                          {section.type === 'gallery' && (() => {
                            const c = section.content as GalleryContent;
                            return (
                              <div className="p-8">
                                <h2 className="text-2xl font-bold text-[#0F2034] mb-5">{c.title}</h2>
                                {c.images.length === 0 ? (
                                  <p className="text-gray-400 text-sm text-center py-8">Aucune image</p>
                                ) : (
                                  <div className="grid grid-cols-3 gap-2">
                                    {c.images.map((img, i) => (
                                      <img key={i} src={img} alt=""
                                        className="aspect-square object-cover rounded-lg" />
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {/* News */}
                          {section.type === 'news' && (() => {
                            const c = section.content as NewsContent;
                            return (
                              <div className="p-8 bg-gray-50">
                                <h2 className="text-2xl font-bold text-[#0F2034] mb-5">{c.title}</h2>
                                {(!c.articles || c.articles.length === 0) ? (
                                  <p className="text-gray-400 text-sm text-center py-8">Aucun article</p>
                                ) : (
                                  <div className="space-y-4">
                                    {c.articles.map((art, i) => (
                                      <div key={art.id || i} className="bg-white rounded-xl p-4 border border-gray-100">
                                        <h3 className="font-semibold text-[#0F2034] mb-1">{art.title}</h3>
                                        <p className="text-gray-500 text-sm">{art.excerpt}</p>
                                        <p className="text-xs text-gray-400 mt-2">
                                          {art.date ? new Date(art.date).toLocaleDateString('fr-FR') : ''}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </motion.div>
                      ))
                    )}

                    {/* Site footer */}
                    <div className="px-6 py-4 text-center text-xs text-white/60"
                      style={{ backgroundColor: siteSettings.secondaryColor }}>
                      © 2026 SIB — Salon International du Bâtiment
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Link to full editor */}
            <div className="mt-4 p-4 bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#0F2034]">Éditeur avancé disponible</p>
                <p className="text-xs text-gray-500">Modifiez les textes directement dans l'aperçu avec l'éditeur complet</p>
              </div>
              <Link to={ROUTES.MINISITE_EDITOR}>
                <Button size="sm" className="bg-[#0F2034] hover:bg-[#1B365D] text-white">
                  Éditeur complet →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
