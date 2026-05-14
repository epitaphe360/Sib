import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Sparkles,
  MessageSquare,
  Users,
  Send,
  Copy,
  Calendar,
  ArrowLeft,
  RefreshCw,
  Loader2,
  CheckCircle,
  ChevronRight,
  Building2,
  Target,
  Zap,
  Star,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ROUTES } from '../../lib/routes';
import useAuthStore from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import {
  generateB2BRecommendations,
  sendB2BChatMessage,
  type B2BProfile,
  type B2BMatch,
  type ChatMessage,
} from '../../services/deepseekService';

// ─── Score badge color ─────────────────────────────────────────────────────────
function scoreBadge(score: number): string {
  if (score >= 80) return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
  if (score >= 65) return 'bg-blue-100 text-blue-700 border border-blue-200';
  return 'bg-amber-100 text-amber-700 border border-amber-200';
}

// ─── Match Card ────────────────────────────────────────────────────────────────
function MatchCard({ match, onRequestMeeting }: { match: B2BMatch; onRequestMeeting: (m: B2BMatch) => void }) {
  const [copied, setCopied] = useState(false);

  function copyIcebreaker() {
    navigator.clipboard.writeText(match.icebreaker).then(() => {
      setCopied(true);
      toast.success('Phrase copiée !');
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-5 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1B365D] to-[#2D6A4F] flex items-center justify-center text-white font-bold text-sm">
              {match.profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{match.profile.name}</h3>
              {match.profile.company && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Building2 className="h-3 w-3" />{match.profile.company}
                </p>
              )}
            </div>
          </div>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${scoreBadge(match.score)}`}>
            {match.score}%
          </span>
        </div>

        {/* Sector badge */}
        {match.profile.sector && (
          <Badge className="text-xs mb-3 bg-[#1B365D]/10 text-[#1B365D] border-0">
            {match.profile.sector}
          </Badge>
        )}

        {/* Reasons */}
        <ul className="space-y-1 mb-3">
          {match.reasons.slice(0, 3).map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
              <CheckCircle className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />
              {r}
            </li>
          ))}
        </ul>

        {/* Icebreaker */}
        {match.icebreaker && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 mb-3 border border-purple-100">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-gray-700 italic leading-relaxed flex-1">
                <Sparkles className="h-3 w-3 text-purple-500 inline mr-1" />
                {match.icebreaker}
              </p>
              <button
                onClick={copyIcebreaker}
                className="flex-shrink-0 p-1 hover:bg-white rounded transition-colors"
                title="Copier"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`${ROUTES.MESSAGES}?to=${match.profile.id}`}
            className="flex-1"
          >
            <Button
              variant="outline"
              className="w-full text-xs border-[#1B365D]/30 text-[#1B365D] hover:bg-[#1B365D]/5"
            >
              <MessageSquare className="h-3 w-3 mr-1" />Message
            </Button>
          </Link>
          <Button
            onClick={() => onRequestMeeting(match)}
            className="flex-1 bg-[#C9A84C] hover:bg-[#A88830] text-white text-xs"
          >
            <Calendar className="h-3 w-3 mr-1" />RDV
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Chat Assistant ────────────────────────────────────────────────────────────
function B2BChatAssistant({ userProfile }: { userProfile: B2BProfile }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Bonjour ${userProfile.name.split(' ')[0]} ! 👋 Je suis **Alex**, votre assistant IA B2B pour le SIB 2026. Je peux vous aider à optimiser votre stratégie de réseautage, préparer vos pitchs ou identifier les bonnes opportunités. Par où voulez-vous commencer ?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsLoading(true);
    try {
      const reply = await sendB2BChatMessage(messages, text);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      toast.error('Erreur de communication avec l\'IA. Réessayez.');
    } finally {
      setIsLoading(false);
    }
  }

  const suggestions = [
    'Comment préparer mon pitch B2B ?',
    'Quels secteurs cibler au SIB 2026 ?',
    'Comment suivre un contact après le salon ?',
  ];

  return (
    <Card className="flex flex-col h-[520px] bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#1B365D] to-[#2D4A7A] text-white">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <Brain className="h-4 w-4" />
        </div>
        <div>
          <p className="font-semibold text-sm">Alex — Assistant B2B IA</p>
          <p className="text-xs text-blue-200">Propulsé par DeepSeek</p>
        </div>
        <div className="ml-auto w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-[#1B365D] text-white rounded-br-sm'
                : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions rapides */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5 bg-gray-50">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => setInput(s)}
              className="text-xs bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full hover:border-[#1B365D] hover:text-[#1B365D] transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Posez votre question networking..."
          className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#1B365D] focus:ring-1 focus:ring-[#1B365D]"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="w-9 h-9 bg-[#1B365D] hover:bg-[#0F2034] disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </Card>
  );
}

// ─── Page principale ───────────────────────────────────────────────────────────
export default function B2BNetworkingAIPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<B2BMatch[]>([]);
  const [strategy, setStrategy] = useState('');
  const [topSectors, setTopSectors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  if (!user) {
    navigate(ROUTES.LOGIN, { replace: true });
    return null;
  }

  const userProfile: B2BProfile = {
    id: user.id,
    name: user.profile?.firstName
      ? `${user.profile.firstName} ${user.profile.lastName ?? ''}`.trim()
      : user.name,
    company: user.profile?.company,
    sector: user.profile?.businessSector ?? user.profile?.sectors?.[0],
    description: user.profile?.bio,
    interests: user.profile?.interests,
    objectives: user.profile?.objectives,
    type: user.type as B2BProfile['type'],
  };

  async function loadRecommendations() {
    setIsLoading(true);
    try {
      // Charger les exposants et partenaires depuis Supabase
      const [exhibitorsRes, partnersRes] = await Promise.all([
        supabase?.from('exhibitors').select('id, company_name, sector, description, tags').limit(40),
        supabase?.from('partners').select('id, company_name, sector, description').limit(20),
      ]);

      const candidates: B2BProfile[] = [];

      (exhibitorsRes?.data ?? []).forEach((e: Record<string, unknown>) => {
        if (e.id !== user.id) {
          candidates.push({
            id: String(e.id),
            name: String(e.company_name ?? 'Exposant'),
            company: String(e.company_name ?? ''),
            sector: String(e.sector ?? ''),
            description: String(e.description ?? ''),
            interests: Array.isArray(e.tags) ? (e.tags as string[]) : [],
            type: 'exhibitor',
          });
        }
      });

      (partnersRes?.data ?? []).forEach((p: Record<string, unknown>) => {
        if (p.id !== user.id) {
          candidates.push({
            id: String(p.id),
            name: String(p.company_name ?? 'Partenaire'),
            company: String(p.company_name ?? ''),
            sector: String(p.sector ?? ''),
            description: String(p.description ?? ''),
            type: 'partner',
          });
        }
      });

      if (candidates.length === 0) {
        toast.info('Aucun participant chargé. Vérifiez votre connexion.');
        return;
      }

      const result = await generateB2BRecommendations(userProfile, candidates);
      setMatches(result.matches);
      setStrategy(result.strategy);
      setTopSectors(result.topSectors);
      setHasLoaded(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      toast.error(`Erreur IA : ${message}`);
    } finally {
      setIsLoading(false);
    }
  }

  function handleRequestMeeting(match: B2BMatch) {
    navigate(`${ROUTES.APPOINTMENTS}?with=${match.profile.id}&name=${encodeURIComponent(match.profile.name)}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-4 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />Retour
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#1B365D] flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
                  <Brain className="h-7 w-7 text-white" />
                </div>
                Réseautage B2B IA
              </h1>
              <p className="text-gray-500 mt-1">
                Connexions intelligentes propulsées par DeepSeek AI
              </p>
            </div>

            <Button
              onClick={loadRecommendations}
              disabled={isLoading}
              className="bg-gradient-to-r from-[#1B365D] to-[#2D6A4F] hover:opacity-90 text-white px-6 py-2.5 rounded-xl shadow-md"
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyse en cours…</>
              ) : hasLoaded ? (
                <><RefreshCw className="h-4 w-4 mr-2" />Actualiser</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" />Analyser mon profil</>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Stats rapides */}
        {hasLoaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
          >
            {[
              { icon: Users, label: 'Matches trouvés', value: matches.length, color: 'text-blue-600 bg-blue-50' },
              { icon: Star, label: 'Score max', value: `${matches[0]?.score ?? 0}%`, color: 'text-amber-600 bg-amber-50' },
              { icon: Target, label: 'Secteurs clés', value: topSectors.length, color: 'text-purple-600 bg-purple-50' },
              { icon: Zap, label: 'IA active', value: 'DeepSeek', color: 'text-emerald-600 bg-emerald-50' },
            ].map((stat, i) => (
              <Card key={i} className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>
        )}

        {/* Stratégie IA */}
        <AnimatePresence>
          {strategy && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-8"
            >
              <Card className="p-5 bg-gradient-to-r from-[#1B365D]/5 to-purple-50 border border-[#1B365D]/15 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#1B365D] rounded-lg flex-shrink-0">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1B365D] mb-1 text-sm">Stratégie recommandée par l'IA</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">{strategy}</p>
                    {topSectors.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {topSectors.map((s, i) => (
                          <span key={i} className="text-xs bg-[#1B365D]/10 text-[#1B365D] px-2.5 py-1 rounded-full font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Layout principal : Matches + Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Colonne matches */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-[#1B365D]" />
                Mises en relation suggérées
              </h2>
              {matches.length > 0 && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                  {matches.length} profils
                </span>
              )}
            </div>

            {!hasLoaded && !isLoading && (
              <Card className="p-12 bg-white rounded-xl shadow-sm border border-dashed border-gray-200 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                  <Brain className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-gray-700 font-medium mb-2">Prêt à analyser votre réseau</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                  Cliquez sur "Analyser mon profil" pour obtenir des recommandations B2B personnalisées par IA.
                </p>
                <Button
                  onClick={loadRecommendations}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white mx-auto"
                >
                  <Sparkles className="h-4 w-4 mr-2" />Lancer l'analyse IA
                </Button>
              </Card>
            )}

            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="p-5 bg-white rounded-xl shadow-sm animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                        <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-100 rounded" />
                      <div className="h-2 bg-gray-100 rounded w-4/5" />
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {hasLoaded && matches.length === 0 && !isLoading && (
              <Card className="p-8 bg-white rounded-xl shadow-sm text-center">
                <p className="text-gray-400">Aucun match trouvé. Complétez votre profil pour de meilleurs résultats.</p>
                <Link to={ROUTES.PROFILE_MATCHING} className="mt-4 inline-block">
                  <Button variant="outline" className="mt-3 text-sm">
                    <ChevronRight className="h-4 w-4 mr-1" />Compléter mon profil
                  </Button>
                </Link>
              </Card>
            )}

            {hasLoaded && matches.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {matches.map(match => (
                  <MatchCard
                    key={match.profile.id}
                    match={match}
                    onRequestMeeting={handleRequestMeeting}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Colonne chat */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-[#1B365D]" />
              Assistant Networking
            </h2>
            <B2BChatAssistant userProfile={userProfile} />
          </div>
        </div>

      </div>
    </div>
  );
}
