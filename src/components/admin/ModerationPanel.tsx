import { useState, useEffect } from 'react';
import { supabase, isSupabaseReady } from '../../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { useTranslation } from '../../hooks/useTranslation';
import {
  ArrowLeft,
  CheckCircle,
  X,
  Eye,
  Clock,
  MessageCircle,
  Shield,
  Loader,
  Flag,
  Building2
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface PendingContent {
  id: string;
  exhibitorId: string;
  exhibitorName: string;
  sectionType: string;
  sectionTitle: string;
  content: {
    title?: string;
    description?: string;
    features?: string[];
    products?: Array<{ name: string; description: string }>;
  };
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  moderatorId?: string;
  moderatorComment?: string;
  changes: string[];
  priority: 'low' | 'medium' | 'high';
}

const mockPendingContent: PendingContent[] = [];

export default function ModerationPanel() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [pendingContent, setPendingContent] = useState<PendingContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<PendingContent | null>(null);
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [moderationComment, setModerationComment] = useState('');
  const [moderatingContent, setModeratingContent] = useState<string[]>([]);
  const [approvedToday, setApprovedToday] = useState(0);
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  useEffect(() => {
    const loadPendingContent = async () => {
      if (!isSupabaseReady() || !supabase) {
        setIsLoadingContent(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('pending_partner_media')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: true });

        if (error) {throw error;}

        const items: PendingContent[] = (data || []).map((row: any) => ({
          id: row.id,
          exhibitorId: row.created_by_id || '',
          exhibitorName: row.partner_company || row.creator_name || 'Sponsor inconnu',
          sectionType: row.type || 'media',
          sectionTitle: row.title || t('moderation.default_content'),
          content: {
            title: row.title,
            description: row.description || undefined,
          },
          submittedAt: new Date(row.created_at),
          status: (row.status || 'pending') as 'pending' | 'approved' | 'rejected',
          moderatorComment: row.rejection_reason || undefined,
          changes: row.category ? [t('moderation.category_change', { cat: row.category })] : [],
          priority: (new Date().getTime() - new Date(row.created_at).getTime() > 86400000 * 2
            ? 'high'
            : new Date().getTime() - new Date(row.created_at).getTime() > 86400000
            ? 'medium'
            : 'low') as 'low' | 'medium' | 'high',
        }));

        setPendingContent(items);
      } catch (err) {
        console.error('Erreur chargement contenus en attente:', err);
      } finally {
        setIsLoadingContent(false);
      }
    };

    loadPendingContent();
  }, []);

  useEffect(() => {
    const loadApprovedToday = async () => {
      if (!isSupabaseReady() || !supabase) {return;}
      try {
        const today = new Date().toISOString().split('T')[0];
        const { count } = await supabase
          .from('exhibitor_profiles')
          .select('id', { count: 'exact', head: true })
          .eq('is_published', true)
          .gte('updated_at', today);
        setApprovedToday(count ?? 0);
      } catch (err) {
        console.error('Erreur chargement approuvés aujourd\'hui:', err);
      }
    };
    loadApprovedToday();
  }, []);

  const handleApproveContent = async (content: PendingContent) => {
    if (!isSupabaseReady() || !supabase) {return;}
    setModeratingContent(prev => [...prev, content.id]);

    try {
      const { error } = await supabase
        .from('pending_partner_media')
        .update({ status: 'approved', reviewed_by: (await supabase.auth.getUser()).data.user?.id, reviewed_at: new Date().toISOString() })
        .eq('id', content.id);

      if (error) {throw error;}

      toast.success(`✅ ${t('moderation.toast_approved', { name: content.exhibitorName, title: content.sectionTitle })}`);
      setPendingContent(prev => prev.filter(c => c.id !== content.id));
      setApprovedToday(n => n + 1);
    } catch {
      toast.error(t('moderation.err_approval'));
    } finally {
      setModeratingContent(prev => prev.filter(id => id !== content.id));
    }
  };

  const handleRejectContent = async (content: PendingContent, comment: string) => {
    if (!isSupabaseReady() || !supabase) {return;}
    setModeratingContent(prev => [...prev, content.id]);

    try {
      const { error } = await supabase
        .from('pending_partner_media')
        .update({
          status: 'rejected',
          rejection_reason: comment,
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', content.id);

      if (error) {throw error;}

      toast.error(`❌ ${t('moderation.toast_rejected', { name: content.exhibitorName, title: content.sectionTitle, comment })}`);
      setPendingContent(prev => prev.map(c =>
        c.id === content.id
          ? { ...c, status: 'rejected', moderatorComment: comment }
          : c
      ));
      setShowModerationModal(false);
      setSelectedContent(null);
      setModerationComment('');
    } catch {
      toast.error(t('moderation.err_rejection'));
    } finally {
      setModeratingContent(prev => prev.filter(id => id !== content.id));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return t('moderation.priority_high');
      case 'medium': return t('moderation.priority_medium');
      case 'low': return t('moderation.priority_low');
      default: return priority;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <Link to={ROUTES.DASHBOARD}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('admin.back_to_dashboard')}
              </Button>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-orange-600 p-3 rounded-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t('moderation.title')}
                </h1>
                <p className="text-gray-600">
                  {t('moderation.subtitle')}
                </p>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Flag className="h-5 w-5 text-orange-600" />
                <span className="text-orange-800 font-medium">{t('moderation.active')}</span>
                <Badge variant="warning" size="sm">{t('moderation.n_pending', { count: pendingContent.length })}</Badge>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Statistiques Modération */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center p-6">
            <div className="bg-yellow-100 p-3 rounded-lg w-12 h-12 mx-auto mb-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {pendingContent.filter(c => c.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">{t('moderation.pending')}</div>
          </Card>

          <Card className="text-center p-6">
            <div className="bg-red-100 p-3 rounded-lg w-12 h-12 mx-auto mb-3">
              <Flag className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {pendingContent.filter(c => c.priority === 'high').length}
            </div>
            <div className="text-sm text-gray-600">{t('moderation.priority_high')}</div>
          </Card>

          <Card className="text-center p-6">
            <div className="bg-green-100 p-3 rounded-lg w-12 h-12 mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{approvedToday}</div>
            <div className="text-sm text-gray-600">{t('moderation.approved_today')}</div>
          </Card>

          <Card className="text-center p-6">
            <div className="bg-blue-100 p-3 rounded-lg w-12 h-12 mx-auto mb-3">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">—</div>
            <div className="text-sm text-gray-600">{t('moderation.avg_time')}</div>
          </Card>
        </div>

        {/* Liste des Contenus en Attente */}
        <div className="space-y-6">
          {pendingContent.map((content, index) => (
            <motion.div
              key={content.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {content.exhibitorName}
                        </h3>
                        <p className="text-gray-600">{content.sectionTitle}</p>
                        <p className="text-sm text-gray-500">
                          {t('moderation.submitted_on', { date: formatDate(content.submittedAt) })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge
                        className={getPriorityColor(content.priority)}
                        size="sm"
                      >
                        {getPriorityLabel(content.priority)}
                      </Badge>
                      <Badge variant="warning" size="sm">
                        {content.status === 'pending' ? t('moderation.status_pending') : content.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Changements */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">{t('moderation.changes_header')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {content.changes.map((change) => (
                        <Badge key={change} variant="info" size="sm">
                          {change}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Aperçu du Contenu */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">{t('moderation.preview_header')}</h4>
                    {content.sectionType === 'about' && (
                      <div>
                        <h5 className="font-semibold text-gray-800 mb-1">{content.content.title}</h5>
                        <p className="text-sm text-gray-600 line-clamp-2">{content.content.description}</p>
                      </div>
                    )}
                    {content.sectionType === 'products' && (
                      <div>
                        <h5 className="font-semibold text-gray-800 mb-1">{content.content.title}</h5>
                        <p className="text-sm text-gray-600">{t('moderation.n_products', { count: content.content.products?.length || 0 })}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApproveContent(content)}
                      disabled={moderatingContent.includes(content.id)}
                    >
                      {moderatingContent.includes(content.id) ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          {t('moderation.approving')}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {t('moderation.approve')}
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedContent(content);
                        setShowModerationModal(true);
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      {t('moderation.reject_with_comment')}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => navigate(ROUTES.MINISITE_PREVIEW.replace(':exhibitorId', content.exhibitorId))}
                      aria-label={t('moderation.preview_aria', { name: content.exhibitorName })}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t('moderation.preview_btn')}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => navigate(ROUTES.EXHIBITOR_DETAIL.replace(':id', content.exhibitorId))}
                      aria-label={t('moderation.contact_aria', { name: content.exhibitorName })}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {t('moderation.contact_exhibitor')}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Message si aucun contenu en attente */}
        {pendingContent.length === 0 && (
          <Card className="text-center p-12">
            <div className="bg-green-100 p-6 rounded-full w-24 h-24 mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t('moderation.all_up_to_date')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('moderation.no_pending')}
            </p>
            <Link to={ROUTES.DASHBOARD}>
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('admin.back_to_dashboard')}
              </Button>
            </Link>
          </Card>
        )}
      </div>

      {/* Modal de Refus avec Commentaire */}
      {showModerationModal && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('moderation.reject_modal_title')}
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>{selectedContent.exhibitorName}</strong> - {selectedContent.sectionTitle}
              </p>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('moderation.reject_reason_label')}
              </label>
              <textarea
                value={moderationComment}
                onChange={(e) => setModerationComment(e.target.value)}
                placeholder={t('moderation.reject_reason_ph')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowModerationModal(false);
                  setSelectedContent(null);
                  setModerationComment('');
                }}
              >
                {t('moderation.cancel')}
              </Button>
              <Button
                onClick={() => handleRejectContent(selectedContent, moderationComment)}
                disabled={!moderationComment.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                <X className="h-4 w-4 mr-2" />
                {t('moderation.confirm_reject')}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
