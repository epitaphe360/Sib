import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search, Brain, Sparkles, ArrowLeft, Target,
  Building2, Globe, ExternalLink, ChevronRight,
  Zap, Info, X, RotateCcw
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  runAdvancedMatching,
  QUICK_SEARCH_SUGGESTIONS,
  type MatchingResponse,
} from '../services/advancedMatchingService';
import { useTranslation } from '../hooks/useTranslation';
// ─── Composant score ring ──────────────────────────────────────────────────────

function ScoreRing({ score }: Readonly<{ score: number }>) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  let color = '#6b7280';
  if (score >= 70) { color = '#10b981'; }
  else if (score >= 45) { color = '#f59e0b'; }

  return (
    <div className="relative w-14 h-14 flex-shrink-0 flex items-center justify-center">
      <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
        <circle cx="28" cy="28" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle
          cx="28" cy="28" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-xs font-bold" style={{ color }}>
        {score}%
      </span>
    </div>
  );
}

// ─── Carte résultat ────────────────────────────────────────────────────────────

function ResultCard({
  result,
  index,
  onViewProfile,
}: Readonly<{
  result: MatchingResponse['results'][0];
  index: number;
  onViewProfile: (id: string) => void;
}>) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="p-4 hover:shadow-md transition-shadow border border-gray-100">
        <div className="flex items-start gap-4">
          {/* Logo ou initiales */}
          <div className="w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center">
            {result.logo ? (
              <img src={result.logo} alt={result.companyName} className="w-full h-full object-contain p-1" />
            ) : (
              <span className="text-lg font-bold text-indigo-600">
                {result.companyName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Info principale */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-900 truncate">{result.companyName}</h3>
                <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {result.sector}
                  {result.standNumber && (
                    <span className="ml-2 text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-medium">
                      {t('matching.stand')} {result.standNumber}
                    </span>
                  )}
                </p>
              </div>
              <ScoreRing score={result.score} />
            </div>

            {/* Description */}
            {result.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{result.description}</p>
            )}

            {/* Raisons du match */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {result.matchReasons.map((reason) => (
                <span
                  key={reason}
                  className="inline-flex items-center text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-0.5 gap-1"
                >
                  <Target className="h-2.5 w-2.5" />
                  {reason}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => onViewProfile(result.id)}
                className="text-xs"
              >
                {t('matching.view_profile')}
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
              {result.website && (
                <a
                  href={result.website.startsWith('http') ? result.website : `https://${result.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                >
                  <Globe className="h-3 w-3" />
                  {t('matching.website')}
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Page principale ───────────────────────────────────────────────────────────

export default function AdvancedMatchingPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [response, setResponse] = useState<MatchingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = async (searchQuery?: string) => {
    const q = (searchQuery ?? query).trim();
    if (!q) {return;}

    if (searchQuery) {setQuery(searchQuery);}
    setShowSuggestions(false);
    setIsSearching(true);
    setError(null);

    try {
      const result = await runAdvancedMatching(q, 20);
      setResponse(result);
    } catch {
      setError(t('matching.error'));
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {handleSearch();}
    if (e.key === 'Escape') {setShowSuggestions(false);}
  };

  const handleReset = () => {
    setQuery('');
    setResponse(null);
    setError(null);
    inputRef.current?.focus();
  };

  const handleViewProfile = (exhibitorId: string) => {
    navigate(`/exhibitors/${exhibitorId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-indigo-50/20">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-gray-500">
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('common.back')}
          </Button>
        </div>

        {/* Titre */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-600 text-white rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Brain className="h-4 w-4" />
            {t('matching.ai_badge')}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {t('matching.adv_title')}
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            {t('matching.adv_subtitle')}
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="relative mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => query.length === 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder={t('matching.placeholder')}
                className="w-full pl-11 pr-10 py-4 rounded-xl border border-gray-200 bg-white shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
              {query && (
                <button
                  onClick={handleReset}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              onClick={() => handleSearch()}
              disabled={!query.trim() || isSearching}
              className="px-6 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-600 text-white font-semibold shadow-sm hover:opacity-90 transition-opacity"
            >
              {isSearching ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('matching.loading')}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  {t('matching.search_btn')}
                </div>
              )}
            </Button>
          </div>

          {/* Suggestions dropdown */}
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-20 overflow-hidden"
              >
                <div className="p-3 border-b border-gray-100">
                  <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {t('matching.suggestions_label')}
                  </p>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {QUICK_SEARCH_SUGGESTIONS
                    .filter(s =>
                      query.length === 0 ||
                      s.toLowerCase().includes(query.toLowerCase())
                    )
                    .slice(0, 8)
                    .map((suggestion) => (
                      <button
                        key={suggestion}
                        onMouseDown={() => handleSearch(suggestion)}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2 transition-colors"
                      >
                        <Search className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        {suggestion}
                      </button>
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tags extraits */}
        <AnimatePresence>
          {response && response.extractedTagLabels.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 flex-wrap mb-6 p-3 bg-indigo-50 rounded-xl border border-indigo-100"
            >
              <Info className="h-4 w-4 text-indigo-500 flex-shrink-0" />
              <span className="text-xs text-indigo-600 font-medium">{t('matching.ai_understood')}</span>
              {response.extractedTagLabels.map((label) => (
                <Badge key={label} variant="info" className="text-xs">
                  {label}
                </Badge>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Résultats */}
        <AnimatePresence>
          {response && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Méta résultats */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  <strong>{response.results.length}</strong> {response.results.length === 1 ? t('matching.result_singular') : t('matching.result_plural')} {t('matching.result_on')} <strong>{response.totalCandidates}</strong> {t('matching.result_analyzed')}
                  {' '}
                  <span className="text-gray-400">({response.durationMs}ms)</span>
                </p>
                <button
                  onClick={handleReset}
                  className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  {t('matching.new_search')}
                </button>
              </div>

              {/* Pas de résultats */}
              {response.results.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-700 mb-2">{t('matching.no_results_title')}</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    {t('matching.no_results_text')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {response.results.map((result, index) => (
                    <ResultCard
                      key={result.id}
                      result={result}
                      index={index}
                      onViewProfile={handleViewProfile}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* État initial (pas encore de recherche) */}
        {!response && !isSearching && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Brain className="h-10 w-10 text-indigo-500" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-2">{t('matching.how_it_works')}</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-8">
              {t('matching.how_it_works_text')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {[
                { icon: Search, title: t('matching.tip1_title'), desc: t('matching.tip1_desc') },
                { icon: Brain, title: t('matching.tip2_title'), desc: t('matching.tip2_desc') },
                { icon: Target, title: t('matching.tip3_title'), desc: t('matching.tip3_desc') },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center mb-3">
                    <Icon className="h-4 w-4 text-indigo-600" />
                  </div>
                  <p className="font-medium text-sm text-gray-800">{title}</p>
                  <p className="text-xs text-gray-500 mt-1">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loader animation */}
        {isSearching && (
          <div className="text-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-16 h-16">
                <div className="w-16 h-16 border-4 border-indigo-100 rounded-full" />
                <div className="w-16 h-16 border-4 border-t-blue-600 rounded-full animate-spin absolute inset-0" />
                <Brain className="absolute inset-0 m-auto h-6 w-6 text-indigo-600" />
              </div>
              <p className="text-sm text-gray-500">{t('matching.analyzing')}</p>
              <p className="text-xs text-gray-400">{t('matching.comparing', { count: response?.totalCandidates || '...' })}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
