import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Edit3,
  Trash2,
  Search,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  RotateCcw,
  Mic2,
  BookOpen,
  Coffee,
  Lightbulb,
  Award,
  Users,
  Settings,
  Eye,
  Layers,
  FileText,
  Upload,
  Loader,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTES } from '../../lib/routes';
import { toast } from 'sonner';
import { useProgrammeStore, type Session, type SessionType, type DayProgram } from '../../store/programmeStore';
import { useTranslation } from '../../hooks/useTranslation';

/* ═══════════════════════════════════════════════════ */
/*  Type Config                                        */
/* ═══════════════════════════════════════════════════ */
const typeConfig: Record<SessionType, { label: string; color: string; icon: any; bg: string }> = {
  officiel:      { label: 'Officiel',      color: 'text-blue-700',    icon: Calendar,   bg: 'bg-blue-100' },
  panel:         { label: 'Panel',         color: 'text-indigo-700',  icon: Users,      bg: 'bg-indigo-100' },
  'table-ronde': { label: 'Table Ronde',   color: 'text-violet-700',  icon: BookOpen,   bg: 'bg-violet-100' },
  'ted-talk':    { label: 'Ted Talk',      color: 'text-red-700',     icon: Mic2,       bg: 'bg-red-100' },
  atelier:       { label: 'Atelier',       color: 'text-emerald-700', icon: Lightbulb,  bg: 'bg-emerald-100' },
  pause:         { label: 'Pause',         color: 'text-amber-700',   icon: Coffee,     bg: 'bg-amber-100' },
  concours:      { label: 'Concours',      color: 'text-orange-700',  icon: Award,      bg: 'bg-orange-100' },
  cloture:       { label: 'Clôture',       color: 'text-gray-700',    icon: Calendar,   bg: 'bg-gray-100' },
};

const SESSION_TYPES: SessionType[] = ['officiel', 'panel', 'table-ronde', 'ted-talk', 'atelier', 'pause', 'concours', 'cloture'];

/* ═══════════════════════════════════════════════════ */
/*  Session Edit Modal                                 */
/* ═══════════════════════════════════════════════════ */
interface SessionFormData {
  time: string;
  title: string;
  type: SessionType;
  speakers: string;
  description: string;
}

function SessionModal({
  initial,
  onSave,
  onCancel,
  isNew,
}: {
  initial?: Session;
  onSave: (data: Omit<Session, 'id'>) => void;
  onCancel: () => void;
  isNew?: boolean;
}) {
  const [form, setForm] = useState<SessionFormData>({
    time: initial?.time || '09h00',
    title: initial?.title || '',
    type: initial?.type || 'panel',
    speakers: initial?.speakers?.join(', ') || '',
    description: initial?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Le titre est requis');
      return;
    }
    onSave({
      time: form.time,
      title: form.title.trim(),
      type: form.type,
      speakers: form.speakers ? form.speakers.split(',').map(s => s.trim()).filter(Boolean) : [],
      description: form.description.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {isNew ? 'Ajouter une session' : 'Modifier la session'}
            </h3>
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Horaire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horaire</label>
              <input
                type="text"
                value={form.time}
                onChange={e => setForm({ ...form, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="09h00"
              />
            </div>

            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Titre de la session"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <div className="grid grid-cols-4 gap-2">
                {SESSION_TYPES.map(t => {
                  const cfg = typeConfig[t];
                  const isActive = form.type === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, type: t })}
                      className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all text-xs ${
                        isActive
                          ? `border-blue-500 ${cfg.bg} ${cfg.color}`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <cfg.icon className="w-4 h-4 mb-1" />
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Intervenants */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intervenants <span className="text-gray-400 font-normal">(séparés par des virgules)</span>
              </label>
              <textarea
                value={form.speakers}
                onChange={e => setForm({ ...form, speakers: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="Nom 1, Nom 2, Nom 3"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Description de la session…"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
                Annuler
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                {isNew ? 'Ajouter' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════ */
/*  Day Edit Modal                                     */
/* ═══════════════════════════════════════════════════ */
function DayModal({
  initial,
  onSave,
  onCancel,
  isNew,
}: {
  initial?: { date: string; dayLabel: string; theme: string };
  onSave: (data: { date: string; dayLabel: string; theme: string }) => void;
  onCancel: () => void;
  isNew?: boolean;
}) {
  const [form, setForm] = useState({
    date: initial?.date || '',
    dayLabel: initial?.dayLabel || '',
    theme: initial?.theme || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date.trim() || !form.dayLabel.trim()) {
      toast.error('La date et le label sont requis');
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {isNew ? 'Ajouter une journée' : 'Modifier la journée'}
            </h3>
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label *</label>
              <input
                type="text"
                value={form.dayLabel}
                onChange={e => setForm({ ...form, dayLabel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Jour 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="text"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mercredi 25 novembre 2026"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thème</label>
              <input
                type="text"
                value={form.theme}
                onChange={e => setForm({ ...form, theme: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ouverture & Intégration Bâtiment"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
                Annuler
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                {isNew ? 'Ajouter' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════ */
/*  Info & Axes Edit Panel                             */
/* ═══════════════════════════════════════════════════ */
function InfoPanel() {
  const { info, updateInfo, updateAxe, addAxe, removeAxe } = useProgrammeStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(info);

  const handleSave = () => {
    updateInfo({
      eventTitle: form.eventTitle,
      eventTheme: form.eventTheme,
      eventDates: form.eventDates,
      eventLocation: form.eventLocation,
      eventDescription: form.eventDescription,
    });
    setEditing(false);
    toast.success('Informations mises à jour');
  };

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Informations Générales
        </h2>
        {!editing ? (
          <Button variant="outline" size="sm" onClick={() => { setForm(info); setEditing(true); }}>
            <Edit3 className="w-4 h-4 mr-1" /> Modifier
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
              <X className="w-4 h-4 mr-1" /> Annuler
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave}>
              <Save className="w-4 h-4 mr-1" /> Sauvegarder
            </Button>
          </div>
        )}
      </div>

      {!editing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><span className="font-medium text-gray-500">Titre :</span> <span className="text-gray-900">{info.eventTitle}</span></div>
          <div><span className="font-medium text-gray-500">Thème :</span> <span className="text-gray-900">{info.eventTheme}</span></div>
          <div><span className="font-medium text-gray-500">Dates :</span> <span className="text-gray-900">{info.eventDates}</span></div>
          <div><span className="font-medium text-gray-500">Lieu :</span> <span className="text-gray-900">{info.eventLocation}</span></div>
          <div className="md:col-span-2"><span className="font-medium text-gray-500">Description :</span> <span className="text-gray-900">{info.eventDescription}</span></div>
        </div>
      ) : (
        <div className="space-y-3">
          {[
            { key: 'eventTitle', label: 'Titre', placeholder: 'SIB — 1ère Édition' },
            { key: 'eventTheme', label: 'Thème', placeholder: 'Les bâtiments au cœur…' },
            { key: 'eventDates', label: 'Dates', placeholder: '25 au 29 novembre 2026' },
            { key: 'eventLocation', label: 'Lieu', placeholder: 'Parc des Expositions…' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
              <input
                type="text"
                value={(form as any)[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={f.placeholder}
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <textarea
              value={form.eventDescription}
              onChange={e => setForm({ ...form, eventDescription: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>
        </div>
      )}

      {/* Axes thématiques */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            Axes Thématiques ({info.axes.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addAxe({ title: 'Nouvel axe', description: 'Description' })}
          >
            <Plus className="w-3 h-3 mr-1" /> Axe
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {info.axes.map((axe, i) => (
            <div key={i} className="group relative bg-gray-50 rounded-lg p-3 border border-gray-200">
              <input
                type="text"
                value={axe.title}
                onChange={e => updateAxe(i, { ...axe, title: e.target.value })}
                className="w-full text-sm font-semibold text-gray-900 bg-transparent border-none focus:ring-0 p-0"
              />
              <input
                type="text"
                value={axe.description}
                onChange={e => updateAxe(i, { ...axe, description: e.target.value })}
                className="w-full text-xs text-gray-500 bg-transparent border-none focus:ring-0 p-0 mt-1"
              />
              <button
                onClick={() => removeAxe(i)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-red-500 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════ */
/*  Session Row (in Day Accordion)                     */
/* ═══════════════════════════════════════════════════ */
function SessionRow({
  session,
  dayId,
  index,
  total,
}: {
  session: Session;
  dayId: string;
  index: number;
  total: number;
}) {
  const { removeSession, moveSession, updateSession } = useProgrammeStore();
  const [editModal, setEditModal] = useState(false);
  const cfg = typeConfig[session.type];
  const Icon = cfg.icon;

  return (
    <>
      <div className="group flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
        {/* Reorder */}
        <div className="flex flex-col gap-0.5 text-gray-300">
          <button
            onClick={() => moveSession(dayId, session.id, 'up')}
            disabled={index === 0}
            className="p-0.5 hover:text-gray-600 disabled:opacity-30"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <button
            onClick={() => moveSession(dayId, session.id, 'down')}
            disabled={index === total - 1}
            className="p-0.5 hover:text-gray-600 disabled:opacity-30"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* Time */}
        <div className="flex items-center gap-1.5 w-16 shrink-0">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-sm font-mono font-medium text-gray-700">{session.time}</span>
        </div>

        {/* Type badge */}
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color} w-28 shrink-0 justify-center`}>
          <Icon className="w-3 h-3" />
          {cfg.label}
        </span>

        {/* Title & speakers */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{session.title}</p>
          {session.speakers.length > 0 && (
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {session.speakers.join(' • ')}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => setEditModal(true)}
            className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
            title="Modifier"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Supprimer "${session.title}" ?`)) {
                removeSession(dayId, session.id);
                toast.success('Session supprimée');
              }
            }}
            className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {editModal && (
        <SessionModal
          initial={session}
          onSave={(data) => {
            updateSession(dayId, session.id, data);
            setEditModal(false);
            toast.success('Session mise à jour');
          }}
          onCancel={() => setEditModal(false)}
        />
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════ */
/*  Day Accordion                                      */
/* ═══════════════════════════════════════════════════ */
function DayAccordion({ day }: { day: DayProgram }) {
  const [open, setOpen] = useState(true);
  const [addingSession, setAddingSession] = useState(false);
  const [editDay, setEditDay] = useState(false);
  const { addSession, removeDay, updateDay } = useProgrammeStore();

  const sessionCounts = day.sessions.reduce((acc, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="mb-4 overflow-hidden">
      {/* Day Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-md">
            {day.dayLabel.replace('Jour ', 'J')}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{day.dayLabel} — {day.theme}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              {day.date}
              <span className="mx-1">•</span>
              {day.sessions.length} sessions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mini type badges */}
          <div className="hidden md:flex gap-1 flex-wrap">
            {Object.entries(sessionCounts).map(([type, count]) => {
              const cfg = typeConfig[type as SessionType];
              return (
                <span key={type} className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${cfg.bg} ${cfg.color}`}>
                  {count} {cfg.label}
                </span>
              );
            })}
          </div>

          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setEditDay(true)}
              className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600"
              title="Modifier la journée"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Supprimer "${day.dayLabel}" et toutes ses sessions ?`)) {
                  removeDay(day.id);
                  toast.success('Journée supprimée');
                }
              }}
              className="p-1.5 hover:bg-red-100 rounded-lg text-red-500"
              title="Supprimer la journée"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Sessions */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 border-t border-gray-100">
              <div className="mt-3 space-y-1">
                {day.sessions.map((session, index) => (
                  <SessionRow
                    key={session.id}
                    session={session}
                    dayId={day.id}
                    index={index}
                    total={day.sessions.length}
                  />
                ))}
              </div>

              {/* Add session button */}
              <button
                onClick={() => setAddingSession(true)}
                className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:text-blue-600 hover:border-blue-400 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Ajouter une session
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      {addingSession && (
        <SessionModal
          isNew
          onSave={(data) => {
            addSession(day.id, data);
            setAddingSession(false);
            toast.success('Session ajoutée');
          }}
          onCancel={() => setAddingSession(false)}
        />
      )}

      {editDay && (
        <DayModal
          initial={{ date: day.date, dayLabel: day.dayLabel, theme: day.theme }}
          onSave={(data) => {
            updateDay(day.id, data);
            setEditDay(false);
            toast.success('Journée mise à jour');
          }}
          onCancel={() => setEditDay(false)}
        />
      )}
    </Card>
  );
}

/* ═══════════════════════════════════════════════════ */
/*  Main Page                                          */
/* ═══════════════════════════════════════════════════ */
export default function EventManagementPage() {
  const { t } = useTranslation();
  const { days, info, addDay, resetToDefault, syncToSupabase, loadFromSupabase } = useProgrammeStore();
  const [addingDay, setAddingDay] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'programme' | 'info'>('programme');
  const [isSyncing, setIsSyncing] = useState(false);

  // Charger depuis Supabase au premier rendu (pour avoir la dernière version publiée)
  useEffect(() => {
    loadFromSupabase().catch(() => {/* silently keep local state */});
  }, []);

  const handlePublish = async () => {
    setIsSyncing(true);
    try {
      await syncToSupabase();
      toast.success('Programme publié — visible par tous les visiteurs');
    } catch {
      toast.error('Erreur lors de la publication. Vérifiez votre connexion.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Stats
  const totalSessions = days.reduce((n, d) => n + d.sessions.length, 0);
  const totalSpeakers = new Set(days.flatMap(d => d.sessions.flatMap(s => s.speakers)).filter(Boolean)).size;
  const typeCounts = days.reduce((acc, d) => {
    d.sessions.forEach(s => { acc[s.type] = (acc[s.type] || 0) + 1; });
    return acc;
  }, {} as Record<string, number>);

  // Filtered view
  const filteredDays = days.map(d => ({
    ...d,
    sessions: d.sessions.filter(s => {
      const matchSearch = !searchTerm ||
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.speakers.some(sp => sp.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchType = filterType === 'all' || s.type === filterType;
      return matchSearch && matchType;
    })
  })).filter(d => d.sessions.length > 0 || (!searchTerm && filterType === 'all'));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={ROUTES.ADMIN_DASHBOARD} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back_to_dashboard')}
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Calendar className="w-8 h-8 text-blue-600" />
                Programme Scientifique
              </h1>
              <p className="mt-1 text-gray-600">
                Gérez le programme complet du salon SIB 2026
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link to={ROUTES.EVENTS}>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Voir la page
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (window.confirm('Réinitialiser tout le programme aux valeurs par défaut ?')) {
                    resetToDefault();
                    toast.success('Programme réinitialisé');
                  }
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60"
                onClick={handlePublish}
                disabled={isSyncing}
              >
                {isSyncing
                  ? <Loader className="w-4 h-4 mr-2 animate-spin" />
                  : <Upload className="w-4 h-4 mr-2" />
                }
                {isSyncing ? 'Publication…' : 'Publier les modifications'}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Journées</p>
                <p className="text-2xl font-bold text-gray-900">{days.length}</p>
              </div>
              <div className="bg-blue-100 p-2.5 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Sessions</p>
                <p className="text-2xl font-bold text-indigo-600">{totalSessions}</p>
              </div>
              <div className="bg-indigo-100 p-2.5 rounded-lg">
                <FileText className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Intervenants</p>
                <p className="text-2xl font-bold text-emerald-600">{totalSpeakers}</p>
              </div>
              <div className="bg-emerald-100 p-2.5 rounded-lg">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Types</p>
                <p className="text-2xl font-bold text-purple-600">{Object.keys(typeCounts).length}</p>
              </div>
              <div className="bg-purple-100 p-2.5 rounded-lg">
                <Layers className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Type breakdown */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
              const cfg = typeConfig[type as SessionType];
              const Icon = cfg.icon;
              return (
                <span key={type} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${cfg.bg} ${cfg.color}`}>
                  <Icon className="w-4 h-4" />
                  {count} {cfg.label}{count > 1 ? 's' : ''}
                </span>
              );
            })}
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { key: 'programme' as const, label: 'Programme', icon: Calendar },
            { key: 'info' as const, label: 'Infos & Axes', icon: Settings },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'info' ? (
          <InfoPanel />
        ) : (
          <>
            {/* Search & Filter */}
            <Card className="p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une session ou un intervenant…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="all">Tous les types</option>
                  {SESSION_TYPES.map(t => (
                    <option key={t} value={t}>{typeConfig[t].label}</option>
                  ))}
                </select>
              </div>
            </Card>

            {/* Days */}
            {filteredDays.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun résultat</h3>
                <p className="text-gray-500">Aucune session ne correspond à vos critères.</p>
              </Card>
            ) : (
              filteredDays.map(day => (
                <DayAccordion key={day.id} day={day} />
              ))
            )}

            {/* Add Day */}
            <button
              onClick={() => setAddingDay(true)}
              className="w-full mt-2 flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:text-blue-600 hover:border-blue-400 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Ajouter une journée
            </button>
          </>
        )}

        {/* Add Day Modal */}
        {addingDay && (
          <DayModal
            isNew
            onSave={(data) => {
              addDay({ ...data, sessions: [] });
              setAddingDay(false);
              toast.success('Journée ajoutée');
            }}
            onCancel={() => setAddingDay(false)}
          />
        )}
      </div>
    </div>
  );
}
