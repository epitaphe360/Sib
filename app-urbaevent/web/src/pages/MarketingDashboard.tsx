import { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useMarketingData } from '../hooks/useMarketingData';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Video, Newspaper, BarChart3, Sparkles } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import MediaTab from '../components/marketing/MediaTab';
import ArticlesTab from '../components/marketing/ArticlesTab';
import ArticleEditor from '../components/marketing/ArticleEditor';
import UploadModal from '../components/marketing/UploadModal';
import type { ContentTab, ArticleItem } from '../components/marketing/types';

export default function MarketingDashboard() {
  const { t } = useTranslation();
  const data = useMarketingData();

  const [activeTab, setActiveTab] = useState<ContentTab>('media');
  const [showArticleEditor, setShowArticleEditor] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  if (data.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-neutral-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-neutral-200 dark:border-neutral-800 border-t-primary-600 mx-auto mb-4" />
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('actions.loading')}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'media' as const, label: t('marketing.tabs.media_library'), icon: Video, count: data.stats.total },
    { id: 'articles' as const, label: t('marketing.tabs.articles_news'), icon: Newspaper, count: data.articles.length },
  ];

  const titleWords = t('marketing.title').split(' ');

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="relative bg-primary-900 pt-16 pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-accent-500/15 blur-[120px]" />
          <div className="absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-primary-500/20 blur-[120px]" />
        </div>

        <div className="max-w-container mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
                <Sparkles className="h-3.5 w-3.5 text-accent-500" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90">
                  {t('marketing.badge')}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05]">
                {titleWords[0]}{' '}
                <span className="sib-text-gradient bg-gradient-to-r from-accent-500 to-accent-300">
                  {titleWords.slice(1).join(' ')}
                </span>
              </h1>
              <p className="text-base lg:text-lg text-white/75 max-w-2xl leading-relaxed">
                {t('marketing.subtitle')}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="accent" size="lg" onClick={() => setShowUploadModal(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                {t('marketing.btn_new_content')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-container mx-auto px-6 lg:px-8 -mt-12 relative z-20 pb-20">
        {/* Navigation tabs */}
        <div className="bg-white dark:bg-neutral-900 p-1.5 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800 mb-10 inline-flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-3 h-12 px-5 rounded-xl font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                <span className="text-sm tracking-tight">{tab.label}</span>
                <Badge
                  variant={isActive ? 'default' : 'secondary'}
                  size="sm"
                  className={isActive ? '!bg-white/20 !text-white !border-0' : ''}
                >
                  {tab.count}
                </Badge>
              </button>
            );
          })}
          <div className="hidden md:inline-flex items-center gap-2 px-4 text-neutral-400 dark:text-neutral-500">
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider font-semibold">
              {t('marketing.tabs.explore')}
            </span>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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
          <UploadModal onUpload={data.addMedia} onClose={() => setShowUploadModal(false)} />
        )}
      </div>
    </div>
  );
}
