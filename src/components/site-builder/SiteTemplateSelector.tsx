import React, { useState, useEffect } from 'react';
import { Search, X, Star, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { supabase } from '../../lib/supabase';
import type { SiteTemplate } from '../../types/site-builder';
import { toast } from 'sonner';

interface SiteTemplateSelectorProps {
  onSelect: (templateId: string) => void;
  onClose: () => void;
}

const categories = [
  { id: 'all', name: 'Tous', icon: '🎨' },
  { id: 'corporate', name: 'Corporate', icon: '🏢' },
  { id: 'ecommerce', name: 'E-commerce', icon: '🛍️' },
  { id: 'portfolio', name: 'Portfolio', icon: '🎭' },
  { id: 'event', name: 'Événement', icon: '🎪' },
  { id: 'landing', name: 'Landing Page', icon: '🚀' },
  { id: 'startup', name: 'Startup', icon: '💡' },
  { id: 'agency', name: 'Agence', icon: '✨' },
  { id: 'product', name: 'Produit', icon: '📦' },
  { id: 'blog', name: 'Blog', icon: '📝' },
  { id: 'minimal', name: 'Minimal', icon: '⚪' }
];

export const SiteTemplateSelector: React.FC<SiteTemplateSelectorProps> = ({ onSelect, onClose }) => {
  const [templates, setTemplates] = useState<SiteTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('site_templates')
        .select('id, name, description, category, thumbnail, sections, premium, popularity')
        .order('popularity', { ascending: false })
        .range(0, 49);

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Erreur lors du chargement des templates');
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelect = (templateId: string) => {
    onSelect(templateId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Choisissez un template</h2>
              <p className="text-gray-500">Démarrez avec un design professionnel</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('siteBuilder.search_template')}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="px-6 py-4 border-b overflow-x-auto">
          <div className="flex gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Search className="w-16 h-16 mb-4 opacity-20" />
              <p>Aucun template trouvé</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`group cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
                    {template.thumbnail ? (
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        {categories.find(c => c.id === template.category)?.icon || '🎨'}
                      </div>
                    )}
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                      <Button
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(template.id);
                        }}
                      >
                        Utiliser ce template
                      </Button>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-2">
                      {template.premium && (
                        <Badge className="bg-yellow-500">
                          <Star className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                      {template.popularity > 100 && (
                        <Badge className="bg-green-500">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Populaire
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {template.sections.length} sections
                      </span>
                      <span className="text-xs text-gray-500">
                        {template.popularity} utilisations
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedTemplate && (
          <div className="p-4 border-t flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Template sélectionné: <strong>{templates.find(t => t.id === selectedTemplate)?.name}</strong>
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button onClick={() => handleSelect(selectedTemplate)}>
                Créer mon site
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
