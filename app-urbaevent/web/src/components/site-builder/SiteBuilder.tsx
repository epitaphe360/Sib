import React, { useState, useCallback, useEffect } from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Button } from '../ui/Button';
import { SectionEditor } from './SectionEditor';
import { ImageLibrary } from './ImageLibrary';
import { SEOEditor } from './SEOEditor';
import { MobilePreview } from './MobilePreview';
import { Save, Eye, Settings, Image, Code, Smartphone } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import { toast } from 'sonner';
import type { SiteSection, MiniSite, SEOConfig } from '../../types/site-builder';

interface SiteBuilderProps {
  siteId?: string;
  templateId?: string;
  onSave?: (site: MiniSite) => void;
}

export const SiteBuilder: React.FC<SiteBuilderProps> = ({ siteId, templateId, onSave }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [sections, setSections] = useState<SiteSection[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const [showSEOEditor, setShowSEOEditor] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [siteConfig, setSiteConfig] = useState<MiniSite>({
    id: siteId || '',
    title: '',
    slug: '',
    sections: [],
    seo: {
      title: '',
      description: '',
      keywords: [],
      ogImage: '',
      googleAnalyticsId: ''
    },
    published: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const [saving, setSaving] = useState(false);
  const [resolvedExhibitorId, setResolvedExhibitorId] = useState<string | null>(null);

  // Load exhibitor ID for current user
  useEffect(() => {
    const fetchExhibitorId = async () => {
      if (!user?.id) {return;}

      const { data } = await supabase
        .from('exhibitors')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setResolvedExhibitorId(data.id);
      } else {
        // Fallback: use user ID itself if no entry in exhibitors table
        setResolvedExhibitorId(user.id);
      }
    };

    fetchExhibitorId();
  }, [user?.id]);

  // Load existing site or template
  useEffect(() => {
    if (siteId) {
      loadSite(siteId);
    } else if (templateId) {
      loadTemplate(templateId);
    }
  }, [siteId, templateId]);

  const loadSite = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('mini_sites')
        .select('id, title, slug, sections, seo, published, createdAt:created_at, updatedAt:updated_at, exhibitorId:exhibitor_id, templateId:template_id, created_at, updated_at, exhibitor_id, template_id')
        .eq('id', id)
        .maybeSingle();

      if (error) {throw error;}
      if (data) {
        setSiteConfig(data);
        setSections(data.sections || []);
      }
    } catch (error) {
      console.error('Error loading site:', error);
      toast.error(t('siteBuilder.loadError'));
    }
  };

  const loadTemplate = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('site_templates')
        .select('id, name, description, category, thumbnail, sections, premium, popularity')
        .eq('id', id)
        .maybeSingle();

      if (error) {throw error;}
      if (data) {
        setSections(data.sections || []);
        setSiteConfig(prev => ({
          ...prev,
          title: `${data.name} - Copy`,
          sections: data.sections || []
        }));
      }
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error(t('siteBuilder.templateLoadError'));
    }
  };

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections(items => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  const addSection = (type: SiteSection['type']) => {
    const newSection: SiteSection = {
      id: `section-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      order: sections.length,
      visible: true
    };
    setSections([...sections, newSection]);
    setSelectedSection(newSection.id);
  };

  const getDefaultContent = (type: SiteSection['type']): any => {
    const defaults: Record<SiteSection['type'], any> = {
      hero: {
        title: 'Bienvenue',
        subtitle: 'Votre sous-titre ici',
        backgroundImage: '',
        ctaText: 'En savoir plus',
        ctaLink: '#'
      },
      about: {
        title: 'À propos',
        description: 'Description de votre entreprise',
        image: ''
      },
      products: {
        title: 'Nos produits',
        items: []
      },
      contact: {
        title: 'Contactez-nous',
        email: '',
        phone: '',
        address: '',
        formFields: ['name', 'email', 'message']
      },
      gallery: {
        title: 'Galerie',
        images: []
      },
      testimonials: {
        title: 'Témoignages',
        items: []
      },
      video: {
        title: 'Vidéo',
        videoUrl: '',
        autoplay: false
      },
      custom: {
        html: '<div>Contenu personnalisé</div>'
      }
    };
    return defaults[type] || {};
  };

  const updateSection = (sectionId: string, content: any) => {
    setSections(sections.map(s =>
      s.id === sectionId ? { ...s, content } : s
    ));
  };

  const deleteSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId));
    if (selectedSection === sectionId) {
      setSelectedSection(null);
    }
  };

  const toggleSectionVisibility = (sectionId: string) => {
    setSections(sections.map(s =>
      s.id === sectionId ? { ...s, visible: !s.visible } : s
    ));
  };

  const saveSite = async () => {
    if (!resolvedExhibitorId && !siteId) {
      toast.error('Impossible d\'identifier l\'exposant. Veuillez vous reconnecter.');
      return;
    }

    setSaving(true);
    try {
      const siteData = {
        ...siteConfig,
        sections,
        exhibitorId: siteConfig.exhibitorId || resolvedExhibitorId,
        updatedAt: new Date().toISOString()
      };

      // Prepare data for DB (convert camelCase to snake_case if necessary)
      const dbData = {
        title: siteData.title,
        slug: siteData.slug || `site-${siteData.exhibitorId || 'unknown'}`,
        sections: siteData.sections,
        seo: siteData.seo,
        published: siteData.published,
        exhibitor_id: siteData.exhibitorId,
        template_id: siteData.templateId,
        updated_at: siteData.updatedAt
      };

      if (siteId) {
        const { error } = await supabase
          .from('mini_sites')
          .update(dbData)
          .eq('id', siteId);
        if (error) {throw error;}
      } else {
        const { data, error } = await supabase
          .from('mini_sites')
          .insert([{ ...dbData, created_at: new Date().toISOString() }])
          .select()
          .single();
        if (error) {throw error;}
        if (data) {
          setSiteConfig({
            ...siteData,
            id: data.id,
          });
        }
      }

      // Mark user as having created a mini-site
      if (user?.id) {
        await supabase
          .from('users')
          .update({ minisite_created: true })
          .eq('id', user.id);
      }

      toast.success(t('siteBuilder.saved'));
      onSave?.(siteData as MiniSite);
    } catch (error) {
      console.error('Error saving site:', error);
      toast.error(t('siteBuilder.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const publishSite = async () => {
    setSiteConfig(prev => ({ ...prev, published: true }));
    await saveSite();
    toast.success(t('siteBuilder.published'));
  };

  const handleImageSelect = (imageUrl: string) => {
    if (selectedSection) {
      const section = sections.find(s => s.id === selectedSection);
      if (section) {
        updateSection(selectedSection, {
          ...section.content,
          image: imageUrl
        });
      }
    }
    setShowImageLibrary(false);
  };

  const handleSEOUpdate = (seo: SEOConfig) => {
    setSiteConfig(prev => ({ ...prev, seo }));
    setShowSEOEditor(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={siteConfig.title}
            onChange={(e) => setSiteConfig(prev => ({ ...prev, title: e.target.value }))}
            placeholder={t('siteBuilder.siteName')}
            className="text-xl font-bold border-none outline-none"
          />
          <span className="text-sm text-gray-500">
            {siteConfig.published ? '🟢 Publié' : '🟡 Brouillon'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImageLibrary(true)}
          >
            <Image className="w-4 h-4 mr-2" />
            Images
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSEOEditor(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            SEO
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMobilePreview(true)}
          >
            <Smartphone className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={saveSite}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
          <Button
            size="sm"
            onClick={publishSite}
            disabled={saving || !siteConfig.title}
          >
            <Eye className="w-4 h-4 mr-2" />
            Publier
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Section Types */}
        <div className="w-64 bg-white border-r p-4 overflow-y-auto">
          <h3 className="font-semibold mb-4">Ajouter une section</h3>
          <div className="space-y-2">
            {(['hero', 'about', 'products', 'contact', 'gallery', 'testimonials', 'video', 'custom'] as const).map(type => (
              <button
                key={type}
                onClick={() => addSection(type)}
                className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition-colors"
              >
                {t(`siteBuilder.sections.${type}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg min-h-full">
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                {sections.length === 0 ? (
                  <div className="py-20 text-center text-gray-400">
                    <Code className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>Ajoutez des sections pour commencer</p>
                  </div>
                ) : (
                  sections.map(section => (
                    <SectionEditor
                      key={section.id}
                      section={section}
                      selected={selectedSection === section.id}
                      onSelect={() => setSelectedSection(section.id)}
                      onUpdate={(content) => updateSection(section.id, content)}
                      onDelete={() => deleteSection(section.id)}
                      onToggleVisibility={() => toggleSectionVisibility(section.id)}
                    />
                  ))
                )}
              </SortableContext>
            </DndContext>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        {selectedSection && (
          <div className="w-80 bg-white border-l p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4">Propriétés de la section</h3>
            <div className="space-y-4">
              {/* Section-specific properties */}
              <div className="text-sm text-gray-600">
                Type: {sections.find(s => s.id === selectedSection)?.type}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showImageLibrary && (
        <ImageLibrary
          onSelect={handleImageSelect}
          onClose={() => setShowImageLibrary(false)}
        />
      )}

      {showSEOEditor && (
        <SEOEditor
          config={siteConfig.seo}
          onSave={handleSEOUpdate}
          onClose={() => setShowSEOEditor(false)}
        />
      )}

      {showMobilePreview && (
        <MobilePreview
          sections={sections}
          siteConfig={siteConfig}
          onClose={() => setShowMobilePreview(false)}
        />
      )}
    </div>
  );
};
