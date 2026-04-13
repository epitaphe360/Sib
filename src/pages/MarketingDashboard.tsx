import { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useMarketingData } from '../hooks/useMarketingData';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Video, Newspaper, BarChart3, Layout } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import MediaTab from '../components/marketing/MediaTab';
import ArticlesTab from '../components/marketing/ArticlesTab';
import ArticleEditor from '../components/marketing/ArticleEditor';
import UploadModal from '../components/marketing/UploadModal';
import ContentManagement from '../components/admin/ContentManagement';
import type { ContentTab, ArticleItem } from '../components/marketing/types';

/**
 * Page principale du Marketing Dashboard.
 * Orchestre les onglets Médiathèque / Articles et délègue la logique au hook useMarketingData.
 */
export default function MarketingDashboard() {
  const { t } = useTranslation();
  const data = useMarketingData();

  const [activeTab, setActiveTab] = useState<ContentTab>('media');
  const [showArticleEditor, setShowArticleEditor] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // ─── Loading ────────────────────────────────────────────────────────

  if (data.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-sib-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B365D] mx-auto mb-4" />
          <p className="text-slate-500">{t('actions.loading')}</p>
        </div>
      </div>
    );
  }

  // ─── Tabs config ────────────────────────────────────────────────────

  const tabs = [
    { id: 'media' as const, label: t('marketing.tabs.media_library'), icon: Video, count: data.stats.total },
    { id: 'articles' as const, label: t('marketing.tabs.articles_news'), icon: Newspaper, count: data.articles.length },
    { id: 'pages' as const, label: 'Pages Vitrine', icon: Layout, count: null },
  ];

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-sib-bg">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-[#C9A84C] via-[#E8C96A] to-[#C9A84C]" />
        <div className="bg-[#0F2034] pt-16 pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#C9A84C]/15 rounded-2xl border border-[#C9A84C]/30">
                    <BarChart3 className="h-8 w-8 text-[#C9A84C]" />
                  </div>
                  <Badge className="bg-[#C9A84C]/20 text-[#C9A84C] border-[#C9A84C]/30 px-4 py-1.5 text-sm font-bold">
                    {t('marketing.badge')}
                  </Badge>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                  {t('marketing.title').split(' ')[0]}{' '}
                  <span className="text-[#C9A84C]">
                    {t('marketing.title').split(' ').slice(1).join(' ')}
                  </span>
                </h1>
                <p className="text-lg text-slate-300 max-w-2xl font-medium leading-relaxed">
                  {t('marketing.subtitle')}
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-[#C9A84C] hover:bg-[#A88830] text-[#0F2034] font-bold px-8 py-4 rounded-xl transition-all hover:scale-105"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  {t('marketing.btn_new_content')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20 pb-20">
        {/* Navigation tabs */}
        <div className="bg-white p-1.5 rounded-2xl shadow-sib border border-sib-gray-100 mb-10 inline-flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-[#1B365D] text-white shadow-md'
                  : 'text-slate-500 hover:bg-sib-gray-50 hover:text-slate-700'
              }`}
            >
              <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-[#C9A84C]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <Badge className={`px-2 py-0.5 rounded-lg text-xs ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-sib-gray-100 text-slate-500'
                }`}>
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Contenu animé */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4, ease: 'circOut' }}
          >
            {activeTab === 'media' ? (
              <MediaTab
                stats={data.stats}
                filteredMedia={data.filteredMedia}
                filterType={data.filterType}
                filterStatus={data.filterStatus}
                onFilterTypeChange={data.setFilterType}
                onFilterStatusChange={data.setFilterStatus}
                onTogglePublish={data.toggleMediaPublish}
                onDelete={data.deleteMedia}
                onCopyShortcode={data.copyShortcode}
                onAddMedia={data.addMedia}
              />
            ) : activeTab === 'articles' ? (
              <ArticlesTab
                articles={data.articles}
                onCreateNew={() => {
                  setSelectedArticle(null);
                  setShowArticleEditor(true);
                }}
                onEdit={(article) => {
                  setSelectedArticle(article);
                  setShowArticleEditor(true);
                }}
                onTogglePublish={data.toggleArticlePublish}
                onDelete={data.deleteArticle}
                onCopyShortcode={data.copyShortcode}
              />
            ) : (
              <ContentManagement />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Modals */}
        {showArticleEditor && (
          <ArticleEditor
            article={selectedArticle}
            onSave={() => {
              data.reloadArticles();
              setShowArticleEditor(false);
              setSelectedArticle(null);
            }}
            onClose={() => {
              setShowArticleEditor(false);
              setSelectedArticle(null);
            }}
          />
        )}

        {showUploadModal && (
          <UploadModal
            onUpload={data.addMedia}
            onClose={() => setShowUploadModal(false)}
          />
        )}
      </div>
    </div>
  );
}
