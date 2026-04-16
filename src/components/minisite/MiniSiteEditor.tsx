import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { SupabaseService } from '../../services/supabaseService';
import useAuthStore from '../../store/authStore';
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
  Edit3,
  Upload,
  Globe,
  Mail,
  Phone,
  MapPin,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTES } from '../../lib/routes';
import { useTranslation } from '../../hooks/useTranslation';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SectionContent {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
  description?: string;
  features?: string[];
  products?: Array<{
    id: string;
    name: string;
    description: string;
    image: string;
    features: string[];
    price: string;
  }>;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: string;
  notificationEmail?: string;
  images?: string[];
  articles?: Array<{
    title: string;
    content: string;
    date: string;
    image?: string;
  }>;
  [key: string]: unknown;
}

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

// ─── Default content per type ─────────────────────────────────────────────────

function getDefaultContent(type: Section['type']): SectionContent {
  switch (type) {
    case 'hero':
      return { title: 'Votre titre', subtitle: 'Votre sous-titre', ctaText: 'En savoir plus', ctaLink: '#' };
    case 'about':
      return { title: 'À propos de nous', description: 'Décrivez votre entreprise ici...', features: ['Fonctionnalité 1', 'Fonctionnalité 2'] };
    case 'products':
      return { title: 'Nos produits', products: [] };
    case 'gallery':
      return { title: 'Galerie', images: [] };
    case 'news':
      return { title: 'Actualités', articles: [] };
    case 'contact':
      return { title: 'Contactez-nous', address: '', phone: '', email: '', website: '', hours: '' };
    default:
      return {};
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MiniSiteEditor() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [exhibitorId, setExhibitorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const hasLoadedRef = useRef(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [sections, setSections] = useState<Section[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    primaryColor: '#C9A84C',
    secondaryColor: '#0F2034',
    fontFamily: 'Inter',
    logoUrl: '',
  });
  const logoInputRef = useRef<HTMLInputElement>(null);

  // ─── Section type definitions ──────────────────────────────────────────────
  const sectionTypes = React.useMemo(() => [
    { type: 'hero', title: 'Section Hero', icon: Layout, description: "Bannière d'accueil avec titre et CTA" },
    { type: 'about', title: 'À propos', icon: FileText, description: 'Présentation de votre entreprise' },
    { type: 'products', title: 'Produits', icon: Image, description: 'Catalogue de produits/services' },
    { type: 'gallery', title: 'Galerie', icon: Image, description: 'Photos et médias' },
    { type: 'news', title: 'Actualités', icon: FileText, description: 'Actualités et annonces' },
    { type: 'contact', title: 'Contact', icon: Mail, description: 'Informations de contact' },
  ], []);

  // ─── Load mini-site from DB ────────────────────────────────────────────────
  useEffect(() => {
    const loadMiniSite = async () => {
      if (!user?.id) { setIsLoading(false); return; }
      try {
        const exhibitor = await SupabaseService.getExhibitorByUserId(user.id);
        if (!exhibitor) { setIsLoading(false); return; }
        setExhibitorId(exhibitor.id);

        const miniSite = await SupabaseService.getMiniSite(exhibitor.id);
        if (miniSite?.sections?.length) {
          const loaded = (miniSite.sections as any[]).map((s, i) => ({
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
          // No mini-site yet — seed hero + contact from profile
          const company = user.profile?.company || '';
          const email = user.email || '';
          const phone = (user.profile as any)?.phone || '';
          setSections([
            {
              id: '1',
              type: 'hero',
              title: 'Section Hero',
              content: {
                title: company || 'Votre entreprise',
                subtitle: 'Bienvenue sur notre mini-site SIB 2026',
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
              content: {
                title: 'Contactez-nous',
                address: '',
                phone,
                email,
                website: '',
                hours: '',
              },
              visible: true,
              order: 2,
            },
          ]);
        }
      } catch (err) {
        console.error('Erreur chargement mini-site:', err);
        toast.error('Impossible de charger le mini-site');
      } finally {
        setIsLoading(false);
      }
    };
    loadMiniSite();
  }, [user?.id]);

  // Track unsaved changes — skip the initial data-load cycle
  useEffect(() => {
    if (!hasLoadedRef.current) {
      if (!isLoading) {hasLoadedRef.current = true;}
      return;
    }
    setHasUnsavedChanges(true);
  }, [sections, siteSettings, isLoading]);

  // ─── Handlers: sections ────────────────────────────────────────────────────

  const addSection = useCallback((type: Section['type']) => {
    const newSection: Section = {
      id: Date.now().toString(),
      type,
      title: sectionTypes.find(s => s.type === type)?.title || 'Nouvelle section',
      content: getDefaultContent(type),
      visible: true,
      order: 0,
    };
    setSections(prev => {
      const reordered = prev.map((s, i) => ({ ...s, order: i + 1 }));
      return [{ ...newSection, order: 0 }, ...reordered];
    });
    setActiveSection(newSection.id);
    toast.success(`Section "${newSection.title}" ajoutée`);
  }, [sectionTypes]);

  const removeSection = useCallback((id: string) => {
    const section = sections.find(s => s.id === id);
    if (!window.confirm(`Supprimer la section "${section?.title}" ?`)) {return;}
    setSections(prev => prev.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i })));
    if (activeSection === id) {setActiveSection(null);}
    toast.success(`Section supprimée`);
  }, [sections, activeSection]);

  const toggleVisibility = useCallback((id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  }, []);

  const moveSection = useCallback((id: string, direction: 'up' | 'down') => {
    setSections(prev => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex(s => s.id === id);
      if (idx === -1) {return prev;}
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) {return prev;}
      const newSorted = [...sorted];
      [newSorted[idx], newSorted[swapIdx]] = [newSorted[swapIdx], newSorted[idx]];
      return newSorted.map((s, i) => ({ ...s, order: i }));
    });
  }, []);

  const updateSectionContent = useCallback((sectionId: string, field: string, value: unknown) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, content: { ...s.content, [field]: value } } : s
    ));
  }, []);

  const updateProductField = useCallback((sectionId: string, productIndex: number, field: string, value: unknown) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId || s.type !== 'products' || !s.content.products) {return s;}
      return {
        ...s,
        content: {
          ...s.content,
          products: s.content.products.map((p, i) => i === productIndex ? { ...p, [field]: value } : p),
        },
      };
    }));
  }, []);

  const addProduct = useCallback((sectionId: string) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId || s.type !== 'products') {return s;}
      return {
        ...s,
        content: {
          ...s.content,
          products: [...(s.content.products ?? []), {
            id: Date.now().toString(),
            name: 'Nouveau produit',
            description: 'Description du produit',
            image: '',
            features: [],
            price: 'Sur devis',
          }],
        },
      };
    }));
    toast.success('Produit ajouté');
  }, []);

  const removeProduct = useCallback((sectionId: string, productIndex: number) => {
    if (!window.confirm('Supprimer ce produit ?')) {return;}
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId || s.type !== 'products' || !s.content.products) {return s;}
      return { ...s, content: { ...s.content, products: s.content.products.filter((_, i) => i !== productIndex) } };
    }));
    toast.success('Produit supprimé');
  }, []);

  // ─── Handlers: editing ─────────────────────────────────────────────────────

  const startEditing = useCallback((fieldKey: string, currentValue: string) => {
    setEditingField(fieldKey);
    setEditingValue(currentValue);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingField(null);
    setEditingValue('');
  }, []);

  // ─── Save ─────────────────────────────────────────────────────────────────

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
      console.error('Erreur sauvegarde:', err);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  }, [exhibitorId, sections, siteSettings]);

  // ─── Preview ──────────────────────────────────────────────────────────────

  const handlePreview = useCallback(() => {
    if (!exhibitorId) { toast.error('Sauvegardez d\'abord votre mini-site'); return; }
    window.open(`/minisite/${exhibitorId}`, '_blank');
  }, [exhibitorId]);

  // ─── Logo upload ──────────────────────────────────────────────────────────

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {return;}
    if (file.size > 2 * 1024 * 1024) { toast.error('Logo trop lourd (max 2 Mo)'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      setSiteSettings(prev => ({ ...prev, logoUrl: ev.target?.result as string }));
      toast.success('Logo mis à jour');
    };
    reader.readAsDataURL(file);
  }, []);

  // ─── Inline editable text ─────────────────────────────────────────────────

  const EditableText: React.FC<{
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    multiline?: boolean;
    className?: string;
    fieldKey: string;
  }> = ({ value, onChange, placeholder, multiline = false, className = '', fieldKey }) => {
    const isEditing = editingField === fieldKey;

    if (isEditing) {
      return (
        <div className="relative">
          {multiline ? (
            <textarea
              value={editingValue}
              onChange={e => setEditingValue(e.target.value)}
              placeholder={placeholder}
              className={`w-full px-3 py-2 border-2 border-[#C9A84C] rounded-lg focus:outline-none bg-white ${className}`}
              rows={3}
              autoFocus
            />
          ) : (
            <input
              type="text"
              value={editingValue}
              onChange={e => setEditingValue(e.target.value)}
              placeholder={placeholder}
              aria-label={placeholder || 'Modifier'}
              className={`w-full px-3 py-2 border-2 border-[#C9A84C] rounded-lg focus:outline-none bg-white ${className}`}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  onChange(editingValue);
                  setEditingField(null);
                  setEditingValue('');
                } else if (e.key === 'Escape') {
                  cancelEdit();
                }
              }}
            />
          )}
          <div className="flex space-x-2 mt-2">
            <Button variant="default" size="sm"
              onClick={() => { onChange(editingValue); setEditingField(null); setEditingValue(''); }}
              className="bg-[#C9A84C] hover:bg-[#A88830] text-white"
            >
              <Check className="h-3 w-3 mr-1" /> Sauver
            </Button>
            <Button variant="outline" size="sm" onClick={cancelEdit}>
              <X className="h-3 w-3 mr-1" /> Annuler
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => startEditing(fieldKey, value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startEditing(fieldKey, value); } }}
        className={`cursor-pointer hover:bg-yellow-50 hover:outline hover:outline-2 hover:outline-[#C9A84C]/50 rounded-lg p-1 transition-all group relative ${className}`}
        title="Cliquer pour modifier"
        aria-label="Modifier ce champ"
      >
        {value || <span className="text-gray-400 italic">{placeholder || 'Cliquer pour modifier'}</span>}
        <Edit3 className="h-3 w-3 text-[#C9A84C] absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  };

  // ─── Computed ─────────────────────────────────────────────────────────────

  const sortedSections = useMemo(
    () => [...sections].sort((a, b) => a.order - b.order),
    [sections]
  );
  const visibleSections = useMemo(
    () => sortedSections.filter(s => s.visible),
    [sortedSections]
  );

  const previewWidth = previewMode === 'mobile' ? 'max-w-sm' : previewMode === 'tablet' ? 'max-w-xl' : 'w-full';

  // ─── Loading ──────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sib-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#C9A84C] mx-auto mb-4" />
          <p className="text-[#0F2034] font-medium">Chargement de votre mini-site...</p>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-sib-bg">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── Breadcrumb ── */}
        <div className="mb-4">
          <Link to={ROUTES.DASHBOARD}>
            <Button variant="ghost" size="sm" className="text-[#0F2034] hover:text-[#C9A84C]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tableau de bord
            </Button>
          </Link>
        </div>

        {/* ── Top bar ── */}
        <div className="bg-[#0F2034] rounded-xl px-6 py-4 flex flex-wrap items-center justify-between gap-4 mb-6 shadow-sib">
          <div>
            <h1 className="text-xl font-bold text-white">Éditeur de Mini-Site</h1>
            <p className="text-sm text-white/60">Personnalisez votre page exposant SIB 2026</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Preview toggle */}
            <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
              {(['desktop', 'tablet', 'mobile'] as const).map(mode => {
                const Icon = mode === 'desktop' ? Monitor : mode === 'tablet' ? Tablet : Smartphone;
                return (
                  <button key={mode}
                    onClick={() => setPreviewMode(mode)}
                    className={`p-2 rounded-md transition-colors ${previewMode === mode ? 'bg-[#C9A84C] text-white' : 'text-white/60 hover:text-white'}`}
                    title={mode}
                  >
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

        {/* ── No exhibitor warning ── */}
        {!exhibitorId && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">Profil exposant introuvable. Certaines fonctionnalités sont limitées.</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

          {/* ── Sidebar ── */}
          <div className="xl:col-span-1 space-y-4">

            {/* Site settings */}
            <Card>
              <div className="p-4">
                <h3 className="font-bold text-[#0F2034] mb-4 flex items-center gap-2 text-sm">
                  <Settings className="h-4 w-4 text-[#C9A84C]" />
                  Paramètres du site
                </h3>
                <div className="space-y-4">
                  {/* Primary color */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Couleur principale
                    </label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={siteSettings.primaryColor}
                        onChange={e => setSiteSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                        aria-label="Couleur principale"
                        className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                      />
                      <input type="text" value={siteSettings.primaryColor}
                        onChange={e => setSiteSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                        aria-label="Code hex couleur principale"
                        className="flex-1 px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  {/* Font */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Police
                    </label>
                    <select value={siteSettings.fontFamily}
                      onChange={e => setSiteSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Montserrat">Montserrat</option>
                    </select>
                  </div>

                  {/* Logo */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Logo
                    </label>
                    {siteSettings.logoUrl && (
                      <div className="mb-2 relative group">
                        <img src={siteSettings.logoUrl} alt="Logo" className="h-12 w-auto max-w-full rounded border border-gray-200 object-contain" />
                        <button
                          onClick={() => setSiteSettings(prev => ({ ...prev, logoUrl: '' }))}
                          className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Supprimer le logo"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    <Button variant="outline" size="sm" className="w-full text-xs"
                      onClick={() => logoInputRef.current?.click()}>
                      <Upload className="h-3 w-3 mr-1" />
                      {siteSettings.logoUrl ? 'Changer' : 'Uploader'} le logo
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Add sections */}
            <Card>
              <div className="p-4">
                <h3 className="font-bold text-[#0F2034] mb-3 flex items-center gap-2 text-sm">
                  <Plus className="h-4 w-4 text-[#C9A84C]" />
                  Ajouter une section
                </h3>
                <div className="space-y-1.5">
                  {sectionTypes.map(st => (
                    <button key={st.type}
                      onClick={() => addSection(st.type as Section['type'])}
                      className="w-full p-2.5 text-left border border-gray-100 rounded-lg hover:border-[#C9A84C]/50 hover:bg-[#C9A84C]/5 transition-colors group"
                    >
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
                <h3 className="font-bold text-[#0F2034] mb-3 text-sm">
                  Sections ({sections.length})
                </h3>
                {sections.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">Aucune section</p>
                ) : (
                  <div className="space-y-1.5">
                    {sortedSections.map((section, idx) => (
                      <div key={section.id}
                        className={`p-2.5 border rounded-lg cursor-pointer transition-colors ${
                          activeSection === section.id
                            ? 'border-[#C9A84C] bg-[#C9A84C]/5'
                            : 'border-gray-100 hover:border-gray-300'
                        }`}
                        onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`text-xs font-semibold truncate ${section.visible ? 'text-gray-800' : 'text-gray-400 line-through'}`}>
                              {section.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            <button onClick={e => { e.stopPropagation(); moveSection(section.id, 'up'); }}
                              disabled={idx === 0}
                              className="p-1 rounded text-gray-400 hover:text-[#C9A84C] disabled:opacity-30"
                              title="Monter">
                              <ChevronUp className="h-3 w-3" />
                            </button>
                            <button onClick={e => { e.stopPropagation(); moveSection(section.id, 'down'); }}
                              disabled={idx === sortedSections.length - 1}
                              className="p-1 rounded text-gray-400 hover:text-[#C9A84C] disabled:opacity-30"
                              title="Descendre">
                              <ChevronDown className="h-3 w-3" />
                            </button>
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
                )}
              </div>
            </Card>
          </div>

          {/* ── Preview + Editor ── */}
          <div className="xl:col-span-3">
            <Card className="overflow-hidden">
              {/* Browser chrome */}
              <div className="bg-gray-100 border-b border-gray-200 px-4 py-2.5 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                  <div className="w-3 h-3 bg-green-400 rounded-full" />
                </div>
                <div className="flex-1 bg-white border border-gray-200 rounded-md px-3 py-1 text-xs text-gray-500 font-mono truncate">
                  sibs.ma/exposant/{exhibitorId?.slice(0, 8) || 'votre-stand'}
                </div>
                <button onClick={handlePreview}
                  className="p-1.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Ouvrir dans un nouvel onglet">
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Preview */}
              <div className="p-4 bg-gray-50 overflow-auto" style={{ minHeight: '70vh' }}>
                <div className={`${previewWidth} mx-auto transition-all duration-300`}>
                  <div className="bg-white shadow-xl rounded-lg overflow-hidden"
                    style={{ fontFamily: siteSettings.fontFamily }}>

                    {/* Site navbar */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100"
                      style={{ backgroundColor: siteSettings.secondaryColor }}>
                      {siteSettings.logoUrl
                        ? <img src={siteSettings.logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
                        : <span className="text-white font-bold text-sm">
                            {user?.profile?.company || 'Votre entreprise'}
                          </span>}
                    </div>

                    {/* Sections */}
                    {visibleSections.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                        <Layout className="h-16 w-16 mb-4 opacity-30" />
                        <p className="text-sm font-medium mb-4">Aucune section visible</p>
                        <Button variant="default" size="sm"
                          className="bg-[#C9A84C] hover:bg-[#A88830] text-white"
                          onClick={() => addSection('hero')}>
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter Section Hero
                        </Button>
                      </div>
                    ) : (
                      <AnimatePresence>
                        {visibleSections.map(section => (
                          <motion.div key={section.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveSection(section.id)}
                            className={`border-2 transition-colors cursor-pointer ${
                              activeSection === section.id
                                ? 'border-[#C9A84C]'
                                : 'border-transparent hover:border-[#C9A84C]/30'
                            }`}
                          >
                            {/* Active section label */}
                            {activeSection === section.id && (
                              <div className="bg-[#C9A84C] px-3 py-1 text-xs text-white font-semibold">
                                ✏️ Section active : {section.title}
                              </div>
                            )}

                            {/* ── Hero ── */}
                            {section.type === 'hero' && (
                              <div className="relative h-56 flex items-center justify-center"
                                style={{
                                  background: section.content.backgroundImage
                                    ? `url(${section.content.backgroundImage}) center/cover`
                                    : `linear-gradient(135deg, ${siteSettings.secondaryColor} 0%, ${siteSettings.primaryColor} 100%)`,
                                }}>
                                <div className="absolute inset-0 bg-black/40" />
                                <div className="relative text-center text-white px-6 w-full">
                                  <EditableText
                                    value={section.content.title ?? ''}
                                    onChange={v => updateSectionContent(section.id, 'title', v)}
                                    placeholder="Titre principal"
                                    className="text-2xl font-bold text-white mb-3"
                                    fieldKey={`${section.id}-title`}
                                  />
                                  <EditableText
                                    value={section.content.subtitle ?? ''}
                                    onChange={v => updateSectionContent(section.id, 'subtitle', v)}
                                    placeholder="Sous-titre"
                                    multiline
                                    className="text-base text-white/90 mb-4"
                                    fieldKey={`${section.id}-subtitle`}
                                  />
                                  <div className="inline-block px-5 py-2 rounded-lg font-semibold text-sm cursor-pointer"
                                    style={{ backgroundColor: siteSettings.primaryColor, color: '#fff' }}>
                                    <EditableText
                                      value={section.content.ctaText ?? ''}
                                      onChange={v => updateSectionContent(section.id, 'ctaText', v)}
                                      placeholder="Texte du bouton"
                                      className="text-white font-semibold"
                                      fieldKey={`${section.id}-cta`}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* ── About ── */}
                            {section.type === 'about' && (
                              <div className="p-8">
                                <EditableText
                                  value={section.content.title ?? ''}
                                  onChange={v => updateSectionContent(section.id, 'title', v)}
                                  placeholder="Titre"
                                  className="text-2xl font-bold text-[#0F2034] mb-4"
                                  fieldKey={`${section.id}-title`}
                                />
                                <EditableText
                                  value={section.content.description ?? ''}
                                  onChange={v => updateSectionContent(section.id, 'description', v)}
                                  placeholder="Description de votre entreprise"
                                  multiline
                                  className="text-gray-600 leading-relaxed mb-5"
                                  fieldKey={`${section.id}-desc`}
                                />
                                {(section.content.features ?? []).map((feat, fi) => (
                                  <div key={fi} className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: siteSettings.primaryColor }} />
                                    <EditableText
                                      value={feat}
                                      onChange={v => {
                                        const f = [...(section.content.features ?? [])];
                                        f[fi] = v;
                                        updateSectionContent(section.id, 'features', f);
                                      }}
                                      placeholder="Fonctionnalité"
                                      className="text-sm text-gray-700"
                                      fieldKey={`${section.id}-feat-${fi}`}
                                    />
                                    <button
                                      onClick={e => {
                                        e.stopPropagation();
                                        const f = (section.content.features ?? []).filter((_, i) => i !== fi);
                                        updateSectionContent(section.id, 'features', f);
                                      }}
                                      className="text-red-400 hover:text-red-600 flex-shrink-0"
                                      title="Supprimer"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                                <Button variant="outline" size="sm" className="mt-3 text-xs"
                                  onClick={e => {
                                    e.stopPropagation();
                                    updateSectionContent(section.id, 'features', [...(section.content.features ?? []), 'Nouvelle fonctionnalité']);
                                  }}>
                                  <Plus className="h-3 w-3 mr-1" /> Ajouter fonctionnalité
                                </Button>
                              </div>
                            )}

                            {/* ── Products ── */}
                            {section.type === 'products' && (
                              <div className="p-8 bg-gray-50">
                                <div className="flex items-center justify-between mb-5">
                                  <EditableText
                                    value={section.content.title ?? ''}
                                    onChange={v => updateSectionContent(section.id, 'title', v)}
                                    placeholder="Titre section produits"
                                    className="text-2xl font-bold text-[#0F2034]"
                                    fieldKey={`${section.id}-title`}
                                  />
                                  <Button size="sm" onClick={e => { e.stopPropagation(); addProduct(section.id); }}
                                    className="bg-[#C9A84C] hover:bg-[#A88830] text-white text-xs">
                                    <Plus className="h-3 w-3 mr-1" /> Produit
                                  </Button>
                                </div>
                                {(!section.content.products || section.content.products.length === 0) ? (
                                  <div className="text-center py-10 text-gray-400">
                                    <Image className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">Aucun produit — cliquez "Produit" pour en ajouter</p>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {section.content.products.map((prod, pi) => (
                                      <div key={prod.id || pi} className="bg-white rounded-xl p-4 shadow-sm relative group border border-gray-100">
                                        <button onClick={e => { e.stopPropagation(); removeProduct(section.id, pi); }}
                                          className="absolute top-2 right-2 p-1 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                          title="Supprimer">
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                        {prod.image && (
                                          <img src={prod.image} alt={prod.name}
                                            className="w-full h-28 object-cover rounded-lg mb-3" />
                                        )}
                                        <EditableText value={prod.name}
                                          onChange={v => updateProductField(section.id, pi, 'name', v)}
                                          placeholder="Nom du produit"
                                          className="font-semibold text-[#0F2034] mb-1"
                                          fieldKey={`${section.id}-prod-${pi}-name`}
                                        />
                                        <EditableText value={prod.description}
                                          onChange={v => updateProductField(section.id, pi, 'description', v)}
                                          placeholder="Description"
                                          multiline
                                          className="text-gray-500 text-sm mb-3"
                                          fieldKey={`${section.id}-prod-${pi}-desc`}
                                        />
                                        <div className="flex items-center justify-between">
                                          <EditableText value={prod.price}
                                            onChange={v => updateProductField(section.id, pi, 'price', v)}
                                            placeholder="Prix"
                                            className="font-bold text-sm"
                                            fieldKey={`${section.id}-prod-${pi}-price`}
                                          />
                                          <label className="cursor-pointer">
                                            <input type="file" accept="image/*" className="hidden"
                                              onChange={e => {
                                                const file = e.target.files?.[0];
                                                if (!file) {return;}
                                                const r = new FileReader();
                                                r.onload = ev => updateProductField(section.id, pi, 'image', ev.target?.result as string);
                                                r.readAsDataURL(file);
                                              }}
                                            />
                                            <span className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#C9A84C] border border-gray-200 hover:border-[#C9A84C]/50 px-2 py-1 rounded-lg">
                                              <Upload className="h-3 w-3" /> Image
                                            </span>
                                          </label>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* ── Gallery ── */}
                            {section.type === 'gallery' && (
                              <div className="p-8">
                                <EditableText
                                  value={section.content.title ?? ''}
                                  onChange={v => updateSectionContent(section.id, 'title', v)}
                                  placeholder="Titre galerie"
                                  className="text-2xl font-bold text-[#0F2034] mb-5"
                                  fieldKey={`${section.id}-title`}
                                />
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                                  {(section.content.images ?? []).map((img, ii) => (
                                    <div key={ii} className="relative group aspect-square rounded-lg overflow-hidden">
                                      <img src={img} alt="" className="w-full h-full object-cover" />
                                      <button
                                        onClick={e => {
                                          e.stopPropagation();
                                          const imgs = (section.content.images ?? []).filter((_, i) => i !== ii);
                                          updateSectionContent(section.id, 'images', imgs);
                                        }}
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100"
                                        title="Supprimer">
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                <label className="cursor-pointer">
                                  <input type="file" accept="image/*" multiple className="hidden"
                                    onChange={e => {
                                      const files = Array.from(e.target.files ?? []);
                                      const existing = section.content.images ?? [];
                                      let count = 0;
                                      files.forEach(file => {
                                        const r = new FileReader();
                                        r.onload = ev => {
                                          const newImgs = [...existing, ev.target?.result as string];
                                          updateSectionContent(section.id, 'images', newImgs);
                                          count++;
                                          if (count === files.length) {toast.success(`${files.length} image(s) ajoutée(s)`);}
                                        };
                                        r.readAsDataURL(file);
                                      });
                                    }}
                                  />
                                  <span className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-[#C9A84C]/50 rounded-xl text-sm text-[#C9A84C] hover:bg-[#C9A84C]/5 transition-colors cursor-pointer">
                                    <Upload className="h-4 w-4" />
                                    Ajouter des photos
                                  </span>
                                </label>
                              </div>
                            )}

                            {/* ── News ── */}
                            {section.type === 'news' && (
                              <div className="p-8 bg-gray-50">
                                <div className="flex items-center justify-between mb-5">
                                  <EditableText
                                    value={section.content.title ?? ''}
                                    onChange={v => updateSectionContent(section.id, 'title', v)}
                                    placeholder="Titre actualités"
                                    className="text-2xl font-bold text-[#0F2034]"
                                    fieldKey={`${section.id}-title`}
                                  />
                                  <Button size="sm" className="bg-[#C9A84C] hover:bg-[#A88830] text-white text-xs"
                                    onClick={e => {
                                      e.stopPropagation();
                                      const arts = section.content.articles ?? [];
                                      updateSectionContent(section.id, 'articles', [...arts, {
                                        title: 'Nouvelle actualité',
                                        content: 'Contenu...',
                                        date: new Date().toISOString().split('T')[0],
                                      }]);
                                      toast.success('Article ajouté');
                                    }}>
                                    <Plus className="h-3 w-3 mr-1" /> Article
                                  </Button>
                                </div>
                                {(!section.content.articles || section.content.articles.length === 0) ? (
                                  <div className="text-center py-10 text-gray-400">
                                    <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">Aucun article</p>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {section.content.articles.map((art, ai) => (
                                      <div key={ai} className="bg-white rounded-xl p-4 shadow-sm relative group border border-gray-100">
                                        <button
                                          onClick={e => {
                                            e.stopPropagation();
                                            const arts = (section.content.articles ?? []).filter((_, i) => i !== ai);
                                            updateSectionContent(section.id, 'articles', arts);
                                          }}
                                          className="absolute top-2 right-2 p-1 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100"
                                          title="Supprimer">
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                        <EditableText value={art.title}
                                          onChange={v => {
                                            const arts = [...(section.content.articles ?? [])];
                                            arts[ai] = { ...arts[ai], title: v };
                                            updateSectionContent(section.id, 'articles', arts);
                                          }}
                                          placeholder="Titre de l'article"
                                          className="font-semibold text-[#0F2034] mb-2"
                                          fieldKey={`${section.id}-art-${ai}-title`}
                                        />
                                        <EditableText value={art.content}
                                          onChange={v => {
                                            const arts = [...(section.content.articles ?? [])];
                                            arts[ai] = { ...arts[ai], content: v };
                                            updateSectionContent(section.id, 'articles', arts);
                                          }}
                                          placeholder="Contenu"
                                          multiline
                                          className="text-gray-500 text-sm mb-3"
                                          fieldKey={`${section.id}-art-${ai}-content`}
                                        />
                                        <span className="text-xs text-gray-400">
                                          {new Date(art.date).toLocaleDateString('fr-FR')}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* ── Contact ── */}
                            {section.type === 'contact' && (
                              <div className="p-8">
                                <EditableText
                                  value={section.content.title ?? ''}
                                  onChange={v => updateSectionContent(section.id, 'title', v)}
                                  placeholder="Titre contact"
                                  className="text-2xl font-bold text-[#0F2034] mb-6"
                                  fieldKey={`${section.id}-title`}
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                  <div className="space-y-4">
                                    {[
                                      { Icon: MapPin, field: 'address', placeholder: 'Adresse' },
                                      { Icon: Phone, field: 'phone', placeholder: 'Téléphone' },
                                      { Icon: Mail, field: 'email', placeholder: 'Email' },
                                      { Icon: Globe, field: 'website', placeholder: 'Site web' },
                                    ].map(({ Icon, field, placeholder }) => (
                                      <div key={field} className="flex items-start gap-3">
                                        <Icon className="h-5 w-5 flex-shrink-0 mt-1" style={{ color: siteSettings.primaryColor }} />
                                        <EditableText
                                          value={(section.content[field] as string) ?? ''}
                                          onChange={v => updateSectionContent(section.id, field, v)}
                                          placeholder={placeholder}
                                          className="text-gray-700 text-sm flex-1"
                                          fieldKey={`${section.id}-${field}`}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <h4 className="font-semibold text-gray-700 mb-3 text-sm">Formulaire de contact</h4>
                                    <div className="space-y-2">
                                      {['Nom', 'Email', 'Message'].map(f => (
                                        <div key={f} className="h-8 bg-white rounded border border-gray-200 px-3 flex items-center">
                                          <span className="text-xs text-gray-400">{f}</span>
                                        </div>
                                      ))}
                                      <div className="pt-1">
                                        <div className="h-8 rounded flex items-center justify-center text-xs font-semibold text-white"
                                          style={{ backgroundColor: siteSettings.primaryColor }}>
                                          Envoyer
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email de notification</label>
                                      <input type="email"
                                        value={section.content.notificationEmail ?? section.content.email ?? ''}
                                        onChange={e => updateSectionContent(section.id, 'notificationEmail', e.target.value)}
                                        placeholder="notifications@entreprise.com"
                                        aria-label="Email de notification"
                                        className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                                        onClick={e => e.stopPropagation()}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}

                    {/* Site footer */}
                    <div className="px-6 py-4 text-center text-xs text-white/60 border-t"
                      style={{ backgroundColor: siteSettings.secondaryColor }}>
                      © 2026 SIB — Salon International du Bâtiment
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Help card */}
            <Card className="mt-4 bg-[#0F2034]/5 border-[#0F2034]/10">
              <div className="p-4">
                <h3 className="text-sm font-bold text-[#0F2034] mb-3">💡 Comment utiliser l'éditeur</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600">
                  <div>
                    <p className="font-semibold text-[#0F2034] mb-1">✏️ Modifier le texte</p>
                    <p>Cliquez sur n'importe quel texte dans l'aperçu pour le modifier en ligne</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#0F2034] mb-1">📐 Gérer les sections</p>
                    <p>Utilisez ↑↓ pour réordonner, l'œil pour masquer, la corbeille pour supprimer</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#0F2034] mb-1">💾 Sauvegarder</p>
                    <p>Le bouton devient or quand il y a des changements non sauvegardés</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
