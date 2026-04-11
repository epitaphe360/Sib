import { Link } from 'react-router-dom';
import { Calendar, Clock, Eye, User } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useArticleTranslation } from '../../hooks/useArticleTranslation';
import type { NewsArticle } from '../../store/newsStore';
import { motion } from 'framer-motion';

interface ArticleCardProps {
  article: NewsArticle;
  featured?: boolean;
  index: number;
  getCategoryColor: (category: string) => string;
  formatDate: (date: Date | string) => string;
  formatReadTime: (time: number) => string;
}

export default function ArticleCard({
  article,
  featured = false,
  index,
  getCategoryColor,
  formatDate,
  formatReadTime
}: ArticleCardProps) {
  const translatedArticle = useArticleTranslation(article);

  return (
    <motion.div
      key={article.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card hover className="h-full overflow-hidden">
        <div className="relative">
          <img
            src={article.image}
            alt={translatedArticle.title}
            className={`w-full ${featured ? 'h-96' : 'h-64'} object-cover`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = `https://placehold.co/${featured ? '800x400' : '600x400'}/e2e8f0/64748b?text=${encodeURIComponent(translatedArticle.title.substring(0, 20))}`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute top-4 right-4">
            <Badge className={getCategoryColor(article.category)} size="sm">
              {article.category}
            </Badge>
          </div>
        </div>

        <div className={`${featured ? 'p-8' : 'p-6'}`}>
          <div className={`flex items-center space-x-4 text-sm text-gray-500 mb-${featured ? '6' : '3'}`}>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(article.publishedAt)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{formatReadTime(article.readTime)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{article.views.toLocaleString()}</span>
            </div>
          </div>

          <Link to={`/news/${article.id}`} className="block group">
            <h3 className={`${featured ? 'text-3xl' : 'text-xl'} font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors`}>
              {translatedArticle.title}
            </h3>
          </Link>

          <p className={`text-gray-600 mb-4 ${featured ? 'line-clamp-4' : 'line-clamp-3'}`}>
            {translatedArticle.excerpt}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{article.author}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                to={`/news/${article.id}`}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
              >
                {featured ? 'Lire l\'article complet' : 'Lire plus'}
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
