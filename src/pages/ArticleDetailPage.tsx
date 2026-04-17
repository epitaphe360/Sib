import { toast } from 'sonner';
import { useTranslation } from '../hooks/useTranslation';
import { useArticleTranslation } from '../hooks/useArticleTranslation';
import { getArticleTranslationKeys } from '../utils/newsTranslations';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Eye, Share2, Bookmark, MessageCircle, Tag, ExternalLink, Download, Printer as Print, Globe, TrendingUp, BookOpen, Heart, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useNewsStore, type NewsArticle } from '../store/newsStore';
import { motion } from 'framer-motion';
import ArticleAudioPlayer from '../components/news/ArticleAudioPlayer';
import { ROUTES } from '../lib/routes';

// Fonction pour construire le texte complet de l'article pour l'audio
const getFullArticleText = (article: NewsArticle): string => {
  // Strip HTML tags pour obtenir du texte pur
  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  const fullText = `
    ${stripHtml(article.title)}
    
    ${stripHtml(article.excerpt)}
    
    ${stripHtml(article.content)}
  `;

  return fullText.trim();
};

export default function ArticleDetailPage() {
  const { t, currentLanguage } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { articles, fetchNews } = useNewsStore();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [readingProgress, setReadingProgress] = useState(0);

  // Utiliser le hook de traduction d'article
  const translatedArticle = useArticleTranslation(article);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    if (id && articles.length > 0) {
      const foundArticle = articles.find(a => a.id === id);
      if (foundArticle) {
        setArticle(foundArticle);
        setLikes((foundArticle as NewsArticle & { likes_count?: number }).likes_count ?? 0);

        // Articles similaires
        const related = articles
          .filter(a => a.id !== id && (a.category === foundArticle.category ||
                      (foundArticle.tags && a.tags?.some(tag => foundArticle.tags?.includes(tag)))))
          .slice(0, 3);
        setRelatedArticles(related);

        // Scroll vers le haut pour voir le début de l'article
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
    }
  }, [id, articles]);

  // Suivi du progrès de lecture
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadingProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('common.loading_article')}
          </h3>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const formatReadTime = (minutes: number) => {
    return t('common.reading_time', { minutes });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Événement': 'bg-blue-100 text-blue-800',
      'Innovation': 'bg-purple-100 text-purple-800',
      'Partenariat': 'bg-green-100 text-green-800',
      'Durabilité': 'bg-emerald-100 text-emerald-800',
      'Formation': 'bg-orange-100 text-orange-800',
      'Commerce': 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const handleShare = (platform: string) => {
    const shareData = {
      title: article.title,
      text: article.excerpt,
      url: window.location.href
    };

    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.title)}&url=${encodeURIComponent(shareData.url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`
    };

    if (platform === 'native' && navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else if (urls[platform as keyof typeof urls]) {
      window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
    } else {
      navigator.clipboard.writeText(shareData.url)
        .then(() => toast.success(t('common.share_link_copied')))
        .catch(() => toast.error(t('common.share_link_error')));
    }
  };

  const handleBookmark = () => {
  setIsBookmarked(!isBookmarked);
  toast.success(isBookmarked ? t('common.bookmarked_remove') : t('common.bookmarked_add'));
  setIsBookmarked(!isBookmarked);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    toast(t('common.generating_pdf'));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Barre de progression de lecture */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-[101]">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Header Article */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link to={ROUTES.NEWS}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('navigation.news')}
              </Button>
            </Link>

            <div className="flex items-center space-x-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleBookmark}
                className={isBookmarked ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : ''}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>

              <Button variant="default" size="sm" onClick={handlePrint}>
                <Print className="h-4 w-4" />
              </Button>

              <Button variant="default" size="sm" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4" />
              </Button>

              <Button variant="default" size="sm" onClick={() => handleShare('native')}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Métadonnées Article */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <Badge className={getCategoryColor(article.category)} size="sm">
              {article.category}
            </Badge>

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
              <span>{article.views.toLocaleString()} {t('common.views')}</span>
            </div>

            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>{article.author}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu Principal */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Titre et Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {translatedArticle.title}
          </h1>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {translatedArticle.excerpt}
          </p>

          {/* Lecteur Audio */}
          {article.id && (
            <div className="mb-8">
              <ArticleAudioPlayer
                articleId={article.id}
                articleText={translatedArticle.content}
                articleTitle={translatedArticle.title}
                language={currentLanguage}
              />
            </div>
          )}

          {article.image && (
            <div className="relative mb-8">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-96 object-cover rounded-2xl shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
            </div>
          )}
        </motion.div>

        {/* Contenu de l'Article */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-lg max-w-none mb-12"
        >
          <div
            className="text-gray-800 leading-relaxed space-y-6
              prose-headings:text-gray-900 prose-headings:font-bold
              prose-a:text-blue-600 prose-a:hover:text-blue-700
              prose-strong:text-gray-900
              prose-ul:space-y-2 prose-li:text-gray-700
              prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:bg-blue-50 prose-blockquote:rounded-r-lg
              prose-img:rounded-xl prose-img:shadow-lg prose-img:mx-auto"
            dangerouslySetInnerHTML={{ __html: translatedArticle.content }}
          />

            {article.sourceUrl && (
              <div className="bg-blue-50 p-4 rounded-lg mt-8">
                <p className="text-sm text-blue-800 mb-2">
                  <Globe className="h-4 w-4 inline mr-1" />
                  {t('common.source')} :
                </p>
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {article.sourceUrl}
                  <ExternalLink className="h-4 w-4 inline ml-1" />
                </a>
              </div>
            )}
        </motion.div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Tag className="h-4 w-4 mr-2" />
            {t('common.tags')}
          </h4>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag: string) => (
              <Badge key={tag} variant="info" size="sm" className="cursor-pointer hover:bg-blue-200">
                #{tag}
              </Badge>
            ))}
          </div>
        </motion.div>
        )}

        {/* Actions Sociales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-between py-6 border-t border-b border-gray-200 mb-12"
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="default"
              size="sm"
              onClick={handleLike}
              className={`${isLiked ? 'bg-red-50 border-red-300 text-red-700' : ''}`}
            >
              <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current text-red-500' : ''}`} />
              {likes} {t('common.like')}
            </Button>

            <Button variant="default" size="sm" onClick={() => {
              // Ouvrir un modal de commentaires ou rediriger vers la section commentaires
              const commentsSection = document.getElementById('comments-section');
              if (commentsSection) {
                commentsSection.scrollIntoView({ behavior: 'smooth' });
              } else {
                // Si pas de section commentaires, ouvrir un modal simple
                toast.info(t('common.comments'));
              }
            }}>
              <MessageCircle className="h-4 w-4 mr-2" />
              {t('common.comment')}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 mr-3">{t('common.share')} :</span>

            <Button
              variant="default"
              size="sm"
              onClick={() => handleShare('facebook')}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              <Facebook className="h-4 w-4" />
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => handleShare('twitter')}
              className="text-sky-600 border-sky-300 hover:bg-sky-50"
            >
              <Twitter className="h-4 w-4" />
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => handleShare('linkedin')}
              className="text-blue-700 border-blue-300 hover:bg-blue-50"
            >
              <Linkedin className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Informations Auteur */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-12"
        >
          <Card className="p-6">
            <div className="flex items-start space-x-4">
              <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-gray-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-lg mb-2">
                  {article.author}
                </h4>
                <p className="text-gray-600 mb-3">
                  Expert en développement bâtiment et innovation construction. Contributeur régulier aux publications spécialisées du secteur.
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{article.author.toLowerCase().replace(' ', '.')}@sib2026.ma</span>
                  <span>LinkedIn</span>
                  <span>{t('common.published_articles', { count: 12 })}</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Articles Similaires */}
        {relatedArticles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mb-12"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {t('common.related_articles')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle, index) => (
                <motion.div
                  key={relatedArticle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                >
                  <Card hover className="h-full">
                    <img
                      src={relatedArticle.image}
                      alt={relatedArticle.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="p-4">
                      <Badge className={getCategoryColor(relatedArticle.category) + ' mb-3'} size="sm">
                        {relatedArticle.category}
                      </Badge>

                      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {relatedArticle.title}
                      </h4>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {relatedArticle.excerpt}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>{formatDate(relatedArticle.publishedAt)}</span>
                        <span>{formatReadTime(relatedArticle.readTime)}</span>
                      </div>

                      <Link to={`/news/${relatedArticle.id}`}>
                        <Button variant="default" size="sm" className="w-full">
                          <BookOpen className="h-4 w-4 mr-2" />
                          {t('common.read_more')}
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Newsletter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                {t('common.newsletter_title')}
              </h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                {t('common.newsletter_subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input type="email"
                  placeholder={t('common.newsletter_placeholder')}
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                 aria-label={t('common.newsletter_placeholder')} />
                <Button
                  variant="default"
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    toast.success('? ' + t('common.newsletter_subscribe'));
                  }}
                >
                  {t('common.newsletter_subscribe')}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </article>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="flex flex-col space-y-3">
          <Button
            variant="default"
            className="rounded-full w-12 h-12 shadow-lg"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            title={t('ui.back_to_top')}
          >
            <ArrowLeft className="h-5 w-5 rotate-90" />
          </Button>

          <Button
            variant="default"
            className="rounded-full w-12 h-12 shadow-lg bg-white"
            onClick={() => handleShare('native')}
            title={t('ui.share_article')}
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};



