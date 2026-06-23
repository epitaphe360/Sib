import { motion } from 'framer-motion';
import { Plus, Edit, Eye, EyeOff, Trash2, Tag, Image } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { ArticleItem } from './types';

interface ArticlesTabProps {
  articles: ArticleItem[];
  onCreateNew: () => void;
  onEdit: (article: ArticleItem) => void;
  onTogglePublish: (article: ArticleItem) => void;
  onDelete: (article: ArticleItem) => void;
  onCopyShortcode: (shortcode: string) => void;
}

/**
 * Onglet Articles & News – affiche stats, info shortcodes et la liste des articles.
 */
export default function ArticlesTab({
  articles,
  onCreateNew,
  onEdit,
  onTogglePublish,
  onDelete,
  onCopyShortcode,
}: ArticlesTabProps) {
  const { t } = useTranslation();

  const publishedCount = articles.filter((a) => a.published).length;
  const draftCount = articles.filter((a) => !a.published).length;

  return (
    <>
      {/* Header + bouton création */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('marketing.articles.title')}</h2>
          <p className="text-sm text-gray-600 mt-1">{t('marketing.articles.subtitle')}</p>
        </div>
        <Button
          onClick={onCreateNew}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('marketing.articles.create_new')}
        </Button>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-2xl font-bold">{articles.length}</div>
          <div className="text-sm text-gray-600">{t('marketing.filters.all')}</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{publishedCount}</div>
          <div className="text-sm text-gray-600">{t('marketing.articles.published_count')}</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-orange-600">{draftCount}</div>
          <div className="text-sm text-gray-600">{t('marketing.articles.drafts_count')}</div>
        </Card>
      </div>

      {/* Info shortcodes */}
      <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <Tag className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-900">{t('marketing.articles.shortcodes_info')}</h3>
            <p className="text-sm text-blue-700 mt-1">{t('marketing.articles.shortcodes_desc')}</p>
            <p className="text-xs text-blue-600 mt-2">
              {t('marketing.articles.example')}{' '}
              <code className="bg-blue-100 px-2 py-1 rounded">[article id=&quot;abc-123&quot;]</code>
            </p>
          </div>
        </div>
      </Card>

      {/* Liste des articles */}
      <div className="space-y-4">
        {articles.map((article) => (
          <ArticleRow
            key={article.id}
            article={article}
            onEdit={onEdit}
            onTogglePublish={onTogglePublish}
            onDelete={onDelete}
            onCopyShortcode={onCopyShortcode}
          />
        ))}

        {articles.length === 0 && (
          <Card className="p-12 text-center">
            <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('marketing.articles.no_articles')}</p>
          </Card>
        )}
      </div>
    </>
  );
}

// ─── Sous-composant : ligne d'article ────────────────────────────────

interface ArticleRowProps {
  article: ArticleItem;
  onEdit: (article: ArticleItem) => void;
  onTogglePublish: (article: ArticleItem) => void;
  onDelete: (article: ArticleItem) => void;
  onCopyShortcode: (shortcode: string) => void;
}

function ArticleRow({ article, onEdit, onTogglePublish, onDelete, onCopyShortcode }: ArticleRowProps) {
  const { t } = useTranslation();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          {/* Image */}
          {article.image_url && (
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full sm:w-32 h-32 object-cover rounded-lg flex-shrink-0"
            />
          )}

          {/* Contenu */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2 gap-2">
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-gray-900 truncate">{article.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{article.excerpt}</p>
              </div>
              <Badge variant={article.published ? 'success' : 'outline'} className="flex-shrink-0">
                {article.published
                  ? `✅ ${t('marketing.articles.published_badge')}`
                  : `📝 ${t('marketing.articles.draft_badge')}`}
              </Badge>
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {article.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Shortcode */}
            <div className="bg-gray-50 rounded p-3 mb-3">
              <div className="flex items-center justify-between gap-2">
                <code className="text-sm text-gray-700 font-mono truncate">{article.shortcode}</code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCopyShortcode(article.shortcode)}
                  className="flex-shrink-0"
                >
                  📋 {t('actions.copy')}
                </Button>
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
              <span>👤 {article.author}</span>
              {article.category && <span>📁 {article.category}</span>}
              <span>📅 {new Date(article.created_at).toLocaleDateString('fr-FR')}</span>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(article)}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Edit className="h-4 w-4 mr-1" />
                {t('marketing.articles.edit')}
              </Button>
              <Button
                size="sm"
                variant={article.published ? 'outline' : 'default'}
                onClick={() => onTogglePublish(article)}
              >
                {article.published ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" />
                    {t('marketing.articles.unpublish')}
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    {t('marketing.articles.publish')}
                  </>
                )}
              </Button>
              <Button size="sm" variant="outline" onClick={() => onDelete(article)}>
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
