import { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useMarketingData } from '../hooks/useMarketingData';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Video, Newspaper, BarChart3 } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { MoroccanPattern } from '../components/ui/MoroccanDecor';
import MediaTab from '../components/marketing/MediaTab';
import ArticlesTab from '../components/marketing/ArticlesTab';
import ArticleEditor from '../components/marketing/ArticleEditor';
import UploadModal from '../components/marketing/UploadModal';
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">{t('actions.loading')}</p>
        </div>
      </div>
    );
  }

  // ─── Tabs config ────────────────────────────────────────────────────

  const tabs = [
    { id: 'media' as const, label: t('marketing.tabs.media_library'), icon: Video, count: data.stats.total },
    { id: 'articles' as const, label: t('marketing.tabs.articles_news'), icon: Newspaper, count: data.articles.length },
  ];

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 pt-16 pb-24 relative overflow-hidden">
        <MoroccanPattern className="opacity-10" color="white" scale={1.2} />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-transparent to-indigo-900/40" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 backdrop-blur-xl rounded-2xl border border-blue-400/30">
                  <BarChart3 className="h-8 w-8 text-blue-300" />
                </div>
                <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30 backdrop-blur-md px-4 py-1.5 text-sm font-bold">
                  {t('marketing.badge')}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                {t('marketing.title').split(' ')[0]}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 italic">
                  {t('marketing.title').split(' ').slice(1).join(' ')}
                </span>
              </h1>
              <p className="text-xl text-slate-300 max-w-2xl font-medium leading-relaxed">
                {t('marketing.subtitle')}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white border-none shadow-[0_0_20px_rgba(37,99,235,0.4)] px-8 py-6 rounded-2xl font-bold transition-all hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-3" />
                {t('marketing.btn_new_content')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20 pb-20">
        {/* Navigation tabs */}
        <div className="bg-white/70 backdrop-blur-2xl p-2 rounded-[2.5rem] shadow-2xl border border-white/50 mb-10 inline-flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-4 px-8 md:px-10 py-4 md:py-5 rounded-[2rem] font-bold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <tab.icon className={`h-5 w-5 md:h-6 md:w-6 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`} />
              <div className="text-left">
                <div className="text-xs md:text-sm leading-none opacity-80 mb-1">{t('marketing.tabs.explore')}</div>
                <div className="text-base md:text-lg leading-none">{tab.label}</div>
              </div>
              <Badge className={`ml-2 px-2 py-0.5 rounded-lg ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {tab.count}
              </Badge>
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
            ) : (
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
