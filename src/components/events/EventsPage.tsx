import { useState, memo, useMemo, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Mic2,
  BookOpen,
  Lightbulb,
  Award,
  Coffee,
  ChevronDown,
  ChevronRight,
  Anchor,
  Globe,
  Leaf,
  Shield,
  GraduationCap,
  Waves,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { useProgrammeStore, type SessionType, type ProgrammeInfo, type DayProgram } from '../../store/programmeStore';
import { getPageContent } from '../../lib/pageContent';

/* ═══════════════════════════════════════════════════ */
/*  Static icon mapping for axes                       */
/* ═══════════════════════════════════════════════════ */
const axeIcons = [Globe, Target, Leaf, Waves, Shield, GraduationCap];
const axeColors = ['blue', 'indigo', 'emerald', 'cyan', 'orange', 'purple'];

/* ─── Helpers ─── */
const typeIcons: Record<SessionType, typeof Calendar> = {
  'officiel': Calendar,
  'panel': Mic2,
  'table-ronde': Users,
  'ted-talk': Lightbulb,
  'atelier': BookOpen,
  'pause': Coffee,
  'concours': Award,
  'cloture': Anchor,
};

const typeStyles: Record<SessionType, { bg: string; text: string; border: string }> = {
  'officiel':    { bg: 'bg-slate-50',   text: 'text-slate-600',   border: 'border-slate-200' },
  'panel':       { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
  'table-ronde': { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' },
  'ted-talk':    { bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-200' },
  'atelier':     { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200' },
  'pause':       { bg: 'bg-green-50',   text: 'text-green-600',   border: 'border-green-200' },
  'concours':    { bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200' },
  'cloture':     { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200' },
};

const typeLabelKeys: Record<SessionType, string> = {
  'officiel':    'pages.events.type_officiel',
  'panel':       'pages.events.type_panel',
  'table-ronde': 'pages.events.type_table_ronde',
  'ted-talk':    'pages.events.type_ted_talk',
  'atelier':     'pages.events.type_atelier',
  'pause':       'pages.events.type_pause',
  'concours':    'pages.events.type_concours',
  'cloture':     'pages.events.type_cloture',
};

const dayColors = ['from-blue-600 to-blue-800', 'from-indigo-600 to-purple-700', 'from-emerald-600 to-teal-700', 'from-orange-600 to-red-700', 'from-pink-600 to-fuchsia-700'];

/* ─── Session Card ─── */
const SessionCard: React.FC<{
  session: { time: string; title: string; type: SessionType; speakers: string[]; description: string };
  index: number;
  typeLabel: string;
}> = ({ session, index, typeLabel }) => {
  const [open, setOpen] = useState(false);
  const style = typeStyles[session.type];
  const Icon = typeIcons[session.type];
  const hasDetails = (session.speakers && session.speakers.length > 0) || session.description;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.03 }}
      className={`relative flex gap-3 sm:gap-4 ${session.type === 'pause' ? 'opacity-60' : ''}`}
    >
      {/* timeline dot + line */}
      <div className="flex flex-col items-center pt-1">
        <div className={`w-3 h-3 rounded-full border-2 ${style.border} ${style.bg} flex-shrink-0`} />
        <div className="w-px flex-1 bg-slate-200 mt-1" />
      </div>

      {/* content */}
      <div className={`flex-1 pb-6 ${hasDetails ? 'cursor-pointer' : ''}`} onClick={() => hasDetails && setOpen(!open)}>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-xs font-mono font-bold text-slate-400 w-12 flex-shrink-0">{session.time}</span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>
            <Icon className="w-3 h-3" />
            {typeLabel}
          </span>
          {hasDetails && (
            <span className="text-slate-300">
              {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </span>
          )}
        </div>

        <h4 className={`text-sm sm:text-base font-semibold ${session.type === 'pause' ? 'text-slate-400' : 'text-slate-800'}`}>
          {session.title}
        </h4>

        <AnimatePresence>
          {open && hasDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              {session.description && (
                <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">{session.description}</p>
              )}
              {session.speakers && session.speakers.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {session.speakers.map((s, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-[11px] bg-white border border-slate-200 rounded-full px-2.5 py-0.5 text-slate-600">
                      <Users className="w-2.5 h-2.5 text-slate-400" />
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════ */
/*  Main EventsPage                                    */
/* ═══════════════════════════════════════════════════ */

export default memo(function EventsPage() {
  const { t } = useTranslation();
  const { days: storeDays, info: storeInfo } = useProgrammeStore();
  const [activeDay, setActiveDay] = useState(0);
  // Données publiées depuis Supabase (override le store local si disponibles)
  const [publishedInfo, setPublishedInfo] = useState<ProgrammeInfo | null>(null);
  const [publishedDays, setPublishedDays] = useState<DayProgram[] | null>(null);

  useEffect(() => {
    getPageContent('programme_scientifique').then(content => {
      if (content.programme_data) {
        try {
          const parsed = JSON.parse(content.programme_data);
          if (parsed?.info && parsed?.days) {
            setPublishedInfo(parsed.info);
            setPublishedDays(parsed.days);
          }
        } catch { /* utiliser les données du store */ }
      }
    }).catch(() => { /* silently fall back */ });
  }, []);

  const info = publishedInfo ?? storeInfo;
  const days = publishedDays ?? storeDays;

  // Memoize translated type labels
  const typeLabels = useMemo(() => {
    const labels: Record<SessionType, string> = {} as any;
    (Object.keys(typeLabelKeys) as SessionType[]).forEach(type => {
      labels[type] = t(typeLabelKeys[type]);
    });
    return labels;
  }, [t]);

  return (
    <div className="min-h-screen bg-[#0A0F1E]">

      {/* ── Hero dark luxury ── */}
      <div className="relative bg-[#0A0F1E] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E]/88 via-[#0A0F1E]/75 to-[#0A0F1E]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(201,168,76,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 border border-[#C9A84C]/40 bg-[#C9A84C]/10 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#E7D192] mb-6">
              <Calendar className="w-3.5 h-3.5" />
              {info.eventDates}
            </span>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-light text-white mb-4 leading-tight">
              {t('pages.events.scientific_programme')}
            </h1>

            <p className="text-base sm:text-lg text-white/50 max-w-3xl mx-auto mb-3 italic">
              {info.eventTheme}
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-white/35">
              <MapPin className="w-4 h-4" />
              <span>{info.eventLocation}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Axes Thématiques ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 mb-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {info.axes.map((axe, i) => {
            const Icon = axeIcons[i % axeIcons.length];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 text-center hover:border-[#C9A84C]/30 hover:-translate-y-0.5 transition-all"
              >
                <div className="w-9 h-9 mx-auto rounded-lg flex items-center justify-center mb-2 bg-[#C9A84C]/15 border border-[#C9A84C]/20">
                  <Icon className="w-4 h-4 text-[#C9A84C]" />
                </div>
                <h3 className="text-xs font-bold text-white leading-tight">{axe.title}</h3>
                <p className="text-[10px] text-white/35 mt-0.5">{axe.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Day Tabs ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
          {days.map((day, i) => (
            <button
              key={day.id}
              onClick={() => setActiveDay(i)}
              className={`flex-shrink-0 rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-left transition-all ${
                activeDay === i
                  ? 'bg-[#C9A84C]/20 border border-[#C9A84C]/50 text-white'
                  : 'bg-white/5 text-white/50 border border-white/10 hover:border-white/25 hover:text-white/80'
              }`}
            >
              <div className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${activeDay === i ? 'text-[#E7D192]/70' : 'text-white/30'}`}>
                {day.dayLabel}
              </div>
              <div className={`text-sm font-bold ${activeDay === i ? 'text-white' : 'text-white/60'}`}>
                {day.date.split(' ').slice(0, 2).join(' ')}
              </div>
              <div className={`text-[10px] mt-0.5 ${activeDay === i ? 'text-white/50' : 'text-white/30'} hidden sm:block`}>
                {day.theme}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Day Programme ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {days.length > 0 && days[activeDay] && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* Day header */}
              <div className="mb-8">
                <h2 className="text-xl sm:text-2xl font-display font-light text-white">{days[activeDay].date}</h2>
                <p className="text-sm text-white/35 mt-1">{days[activeDay].theme}</p>
              </div>

              {/* Timeline */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 sm:p-6 lg:p-8">
                {days[activeDay].sessions.map((session, i) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    index={i}
                    typeLabel={typeLabels[session.type]}
                  />
                ))}
              </div>

              {/* Legend */}
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {(Object.keys(typeStyles) as SessionType[]).map(key => {
                  const style = typeStyles[key];
                  const Icon = typeIcons[key];
                  return (
                    <span key={key} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-white/5 text-white/50 border border-white/10`}>
                      <Icon className="w-2.5 h-2.5" />
                      {typeLabels[key]}
                    </span>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* ── Info Banner ── */}
      <div className="bg-[#0A0A0A] border-t border-[#C9A84C]/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 text-center">
          <h2 className="font-display text-xl sm:text-2xl font-light text-white mb-2">{info.eventTitle}</h2>
          <p className="text-white/40 text-sm sm:text-base max-w-2xl mx-auto mb-1">
            {t('pages.events.strategic_reflection')}
          </p>
          <p className="text-[#E7D192]/50 text-xs">
            {info.eventDates} · {info.eventLocation}
          </p>
        </div>
      </div>
    </div>
  );
});
