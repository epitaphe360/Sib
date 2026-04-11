import React, { useState } from 'react';
import { SiteBuilder } from '../../components/site-builder/SiteBuilder';
import { SiteTemplateSelector } from '../../components/site-builder/SiteTemplateSelector';
import { Layout, Plus, Eye, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { useTranslation } from '../../hooks/useTranslation';

export const CreateMiniSitePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showTemplateSelector, setShowTemplateSelector] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [startFromScratch, setStartFromScratch] = useState(false);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setShowTemplateSelector(false);
  };

  const handleStartFromScratch = () => {
    setStartFromScratch(true);
    setShowTemplateSelector(false);
  };

  const handleSiteCreated = (site: any) => {
    navigate(`/mini-sites/${site.id}`);
  };

  if (showTemplateSelector) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          {/* Back Button */}
          <Link to={ROUTES.EXHIBITOR_DASHBOARD} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au Tableau de Bord
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
              <Layout className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold mb-4">{t('minisite.page.create_title')}</h1>
            <p className="text-xl text-gray-600">
              {t('minisite.page.create_subtitle')}
            </p>
          </div>

          {/* Options */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            <button
              onClick={() => setShowTemplateSelector(true)}
              className="group bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Eye className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">{t('minisite.page.template_option')}</h3>
              <p className="text-gray-600">
                {t('minisite.page.template_desc')}
              </p>
            </button>

            <button
              onClick={handleStartFromScratch}
              className="group bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-all border-2 border-transparent hover:border-green-500"
            >
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">{t('minisite.page.scratch_option')}</h3>
              <p className="text-gray-600">
                {t('minisite.page.scratch_desc')}
              </p>
            </button>
          </div>

          {/* Template Selector Modal */}
          <SiteTemplateSelector
            onSelect={handleTemplateSelect}
            onClose={() => setShowTemplateSelector(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <SiteBuilder
      templateId={selectedTemplateId || undefined}
      onSave={handleSiteCreated}
    />
  );
};
