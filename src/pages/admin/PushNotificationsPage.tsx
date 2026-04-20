import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bell, Send, Users, Star, Building2, UserCheck, Globe, Clock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { ROUTES } from '../../lib/routes';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type Audience = 'all' | 'vip' | 'exhibitors' | 'visitors' | 'agents';

interface SentNotification {
  id: string;
  title: string;
  message: string;
  audience: Audience;
  recipient_count: number;
  sent_at: string;
}

// ─── Données statiques ────────────────────────────────────────────────────────

const AUDIENCE_OPTIONS = [
  { value: 'all' as Audience,        label: 'Tous les utilisateurs',  color: '#3B82F6', description: 'Visiteurs + Exposants + VIP + Agents',   IconComp: Globe      },
  { value: 'visitors' as Audience,   label: 'Visiteurs uniquement',   color: '#10B981', description: 'Visiteurs standard inscrits',             IconComp: Users      },
  { value: 'vip' as Audience,        label: 'Pass VIP seulement',     color: '#C9A84C', description: 'Visiteurs ayant un Pass VIP actif',       IconComp: Star       },
  { value: 'exhibitors' as Audience, label: 'Exposants',              color: '#8B5CF6', description: 'Tous les exposants confirmés',            IconComp: Building2  },
  { value: 'agents' as Audience,     label: 'Agents / Staff',         color: '#EF4444', description: 'Équipe terrain et contrôle accès',        IconComp: UserCheck  },
];

const QUICK_TEMPLATES = [
  { title: '🚪 Ouverture des halls',    message: 'Les halls du SIB 2026 sont maintenant ouverts. Bienvenue !' },
  { title: '🎤 Conférence dans 15 min', message: 'Rappel : une conférence commence dans 15 minutes. Rendez-vous en salle principale.' },
  { title: '⚠️ Modification programme', message: "Le programme a été mis à jour. Consultez l'app pour voir les derniers changements." },
  { title: '🍽️ Pause déjeuner',         message: 'La pause déjeuner commence. Les stands restauration sont ouverts.' },
  { title: '🎁 Animation spéciale',     message: 'Une animation surprise vous attend au Hall B dans 30 minutes !' },
  { title: '🔔 Fermeture imminente',    message: 'Le salon ferme dans 1 heure. Merci pour votre visite au SIB 2026 !' },
];

// ─── Composant principal ──────────────────────────────────────────────────────

export default function PushNotificationsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState<Audience>('all');
  const [isSending, setIsSending] = useState(false);
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [history, setHistory] = useState<SentNotification[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    fetchHistory();
    fetchRecipientCount('all');
  }, []);

  useEffect(() => {
    fetchRecipientCount(audience);
  }, [audience]);

  // ── Compter les appareils cibles ──────────────────────────────────────────

  const fetchRecipientCount = async (aud: Audience) => {
    if (!supabase) return;
    setRecipientCount(null);
    try {
      const { count } = await supabase
        .from('push_subscriptions')
        .select('id', { count: 'exact', head: true });
      setRecipientCount(count ?? 0);
    } catch {
      setRecipientCount(0);
    }
  };

  // ── Historique ────────────────────────────────────────────────────────────

  const fetchHistory = async () => {
    if (!supabase) return;
    setIsLoadingHistory(true);
    try {
      const { data } = await supabase
        .from('push_notification_logs')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(20);
      setHistory(data ?? []);
    } catch {
      // Table peut ne pas encore exister
    }
    setIsLoadingHistory(false);
  };

  // ── Envoi ─────────────────────────────────────────────────────────────────

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Titre et message obligatoires');
      return;
    }
    if (!supabase) { toast.error('Supabase non configuré'); return; }

    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke('broadcast-push-notification', {
        body: {
          title: title.trim(),
          message: message.trim(),
          audience,
          sentAt: new Date().toISOString(),
        },
      });
      if (error) throw error;

      // Log dans la table historique (best-effort)
      await supabase.from('push_notification_logs').insert({
        title: title.trim(),
        message: message.trim(),
        audience,
        recipient_count: recipientCount ?? 0,
        sent_at: new Date().toISOString(),
      });

      toast.success(`Notification envoyée à ${recipientCount ?? '?'} appareil(s)`);
      setTitle('');
      setMessage('');
      fetchHistory();
    } catch (err: any) {
      toast.error(`Erreur d'envoi : ${err?.message ?? err}`);
    }
    setIsSending(false);
  };

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #111118 100%)' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={ROUTES.ADMIN_DASHBOARD}>
            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-1" /> Tableau de bord
            </Button>
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)' }}>
              <Bell className="h-5 w-5" style={{ color: '#C9A84C' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Notifications Push</h1>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Envoyez des alertes en temps réel aux utilisateurs de l'app mobile SIB 2026
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Formulaire ────────────────────────────────────────────────── */}
          <motion.div
            className="lg:col-span-2 rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold text-white mb-5">Composer la notification</h2>

            {/* Titre */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Titre <span className="text-red-400">*</span>
                <span className="ml-2 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{title.length}/60</span>
              </label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value.slice(0, 60))}
                placeholder="Ex : 🎤 Conférence dans 15 minutes"
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            {/* Message */}
            <div className="mb-5">
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Message <span className="text-red-400">*</span>
                <span className="ml-2 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{message.length}/200</span>
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value.slice(0, 200))}
                placeholder="Contenu affiché sur le téléphone..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            {/* Audience */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Destinataires
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AUDIENCE_OPTIONS.map(({ value, label, color, description, IconComp }) => (
                  <button
                    key={value}
                    onClick={() => setAudience(value)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all"
                    style={{
                      background: audience === value ? `${color}15` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${audience === value ? color + '50' : 'rgba(255,255,255,0.07)'}`,
                    }}
                  >
                    <span style={{ color }}><IconComp className="h-4 w-4" /></span>
                    <div>
                      <div className="text-sm font-medium text-white">{label}</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{description}</div>
                    </div>
                    {audience === value && (
                      <CheckCircle className="h-4 w-4 ml-auto flex-shrink-0" style={{ color }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Bouton envoi */}
            <div className="flex items-center justify-between">
              <div className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {recipientCount !== null
                  ? <span>~<strong className="text-white">{recipientCount}</strong> appareil(s) ciblé(s)</span>
                  : <span>Calcul en cours...</span>
                }
              </div>
              <Button
                onClick={handleSend}
                disabled={isSending || !title.trim() || !message.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: '#C9A84C', color: '#000' }}
              >
                {isSending ? (
                  <><span className="animate-spin border-2 border-black/30 border-t-black rounded-full w-4 h-4" /> Envoi...</>
                ) : (
                  <><Send className="h-4 w-4" /> Envoyer</>
                )}
              </Button>
            </div>
          </motion.div>

          {/* ── Aperçu + Templates ────────────────────────────────────────── */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            {/* Aperçu mobile */}
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>Aperçu</h3>
              <div className="rounded-2xl p-4" style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#C9A84C' }}>
                    <Bell className="h-4 w-4 text-black" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>SIB 2026</span>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>maintenant</span>
                    </div>
                    <p className="text-xs font-medium text-white mt-0.5 truncate">{title || 'Titre de la notification'}</p>
                    <p className="text-xs mt-0.5 leading-relaxed line-clamp-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {message || 'Contenu du message...'}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs mt-2 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>Apparence sur iPhone</p>
            </div>

            {/* Templates rapides */}
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>Templates rapides</h3>
              <div className="space-y-1.5">
                {QUICK_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    onClick={() => { setTitle(tpl.title); setMessage(tpl.message); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs transition-colors hover:bg-white/5"
                    style={{ color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    {tpl.title}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Historique ────────────────────────────────────────────────────── */}
        <motion.div
          className="mt-6 rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4" style={{ color: '#C9A84C' }} />
            Historique des envois
          </h2>

          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <span className="animate-spin border-2 border-white/20 border-t-white/60 rounded-full w-6 h-6" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucune notification envoyée pour le moment</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {history.map((notif, i) => {
                  const aud = AUDIENCE_OPTIONS.find(a => a.value === notif.audience);
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-start gap-4 px-4 py-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-white">{notif.title}</span>
                          {aud && (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${aud.color}20`, color: aud.color }}>
                              {aud.label}
                            </span>
                          )}
                        </div>
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{notif.message}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                            {new Date(notif.sent_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                            {notif.recipient_count} destinataire(s)
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
