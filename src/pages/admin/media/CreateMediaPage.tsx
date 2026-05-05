import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Video, Mic, Film, Radio, Star, MessageCircle, Save, X,
  Plus, Tag, Clock, Image, Link2, User, Briefcase, Building2, Trash2,
  Eye, FileText,
} from 'lucide-react';
import { ROUTES } from '../../../lib/routes';
import { mediaService } from '../../../services/mediaService';
import { toast } from 'sonner';
import type { MediaType } from '../../../types/media';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Speaker {
  name: string;
  title: string;
  company: string;
  photo_url: string;
}

// ─── Config types ─────────────────────────────────────────────────────────────
const MEDIA_TYPES = [
  { value: 'webinar',        label: 'Webinaire',              icon: Video,          bg: 'bg-blue-50',   border: 'border-blue-500',   text: 'text-blue-700',   icon_color: 'text-blue-500'   },
  { value: 'podcast',        label: 'Podcast SIB Talks',      icon: Mic,            bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-700', icon_color: 'text-purple-500' },
  { value: 'capsule_inside', label: 'Capsule Inside SIB',     icon: Film,           bg: 'bg-green-50',  border: 'border-green-500',  text: 'text-green-700',  icon_color: 'text-green-500'  },
  { value: 'live_studio',    label: 'Live Studio',            icon: Radio,          bg: 'bg-red-50',    border: 'border-red-500',    text: 'text-red-700',    icon_color: 'text-red-500'    },
  { value: 'best_moments',   label: 'Best Moments',           icon: Star,           bg: 'bg-amber-50',  border: 'border-amber-500',  text: 'text-amber-700',  icon_color: 'text-amber-500'  },
  { value: 'testimonial',    label: 'Témoignage',             icon: MessageCircle,  bg: 'bg-pink-50',   border: 'border-pink-500',   text: 'text-pink-700',   icon_color: 'text-pink-500'   },
] as const;

const CATEGORIES_BY_TYPE: Record<string, string[]> = {
  testimonial: ['Exposant', 'Sponsor', 'Visiteur Professionnel', 'Institutionnel / Officiel', 'Presse'],
  default: [
    'Bâtiment & Construction', 'Innovation BTP', 'Matériaux & Produits',
    'Architecture & Design', 'Énergie & Durabilité', 'Réglementation',
    'Financement Immobilier', 'Technologies BTP',
  ],
};

function durationToSeconds(h: string, m: string, s: string) {
  return (Number.parseInt(h) || 0) * 3600 + (Number.parseInt(m) || 0) * 60 + (Number.parseInt(s) || 0);
}

function getYoutubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/\s]{11})/);
  return m ? m[1] : null;
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-[#0F2034]/3 border-b border-gray-100 flex items-center gap-3">
        <span className="text-[#C9A84C]">{icon}</span>
        <h3 className="font-bold text-[#0F2034] text-sm uppercase tracking-wide">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export const CreateMediaPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Form fields
  const [type, setType] = useState<MediaType>('webinar');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [durH, setDurH] = useState('0');
  const [durM, setDurM] = useState('0');
  const [durS, setDurS] = useState('0');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [publishedAt, setPublishedAt] = useState('');

  // Tags
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Speakers
  const [speakers, setSpeakers] = useState<Speaker[]>([]);

  const categories = CATEGORIES_BY_TYPE[type] ?? CATEGORIES_BY_TYPE.default;
  const hasVideo = ['webinar', 'capsule_inside', 'live_studio', 'best_moments', 'testimonial'].includes(type);
  const hasPodcast = type === 'podcast';
  const ytId = hasVideo ? getYoutubeId(videoUrl) : null;

  // Tags handlers
  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };
  const removeTag = (t: string) => setTags(prev => prev.filter(x => x !== t));

  // Speaker handlers
  const addSpeaker = () => setSpeakers(prev => [...prev, { name: '', title: '', company: '', photo_url: '' }]);
  const updateSpeaker = (i: number, field: keyof Speaker, val: string) =>
    setSpeakers(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  const removeSpeaker = (i: number) => setSpeakers(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Le titre est obligatoire'); return; }
    setLoading(true);
    try {
      const validSpeakers = speakers.filter(s => s.name.trim());
      await mediaService.createMedia({
        type,
        title: title.trim(),
        description,
        thumbnail_url: thumbnailUrl || undefined,
        video_url: videoUrl || undefined,
        audio_url: audioUrl || undefined,
        duration: durationToSeconds(durH, durM, durS) || undefined,
        category: category || undefined,
        tags,
        speakers: validSpeakers,
        status,
        ...(publishedAt ? { published_at: new Date(publishedAt).toISOString() } : {}),
      } as any);
      toast.success('✅ Média créé avec succès !');
      navigate(ROUTES.ADMIN_MEDIA_MANAGE);
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la création du média');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <Link to={ROUTES.ADMIN_MEDIA_MANAGE} className="inline-flex items-center text-[#1B365D] hover:text-[#C9A84C] mb-4 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Retour à la médiathèque
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#0F2034] rounded-xl">
              <Video className="w-7 h-7 text-[#C9A84C]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0F2034]">Créer un nouveau média</h1>
              <p className="text-gray-500 text-sm mt-0.5">Webinaire, podcast, capsule vidéo, témoignage…</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Type ── */}
          <Section title="Type de média" icon={<Film className="w-4 h-4" />}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {MEDIA_TYPES.map(mt => {
                const Icon = mt.icon;
                const sel = type === mt.value;
                return (
                  <button
                    key={mt.value}
                    type="button"
                    onClick={() => { setType(mt.value as MediaType); setCategory(''); }}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${sel ? `${mt.bg} ${mt.border}` : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${sel ? mt.icon_color : 'text-gray-400'}`} />
                    <div className={`text-xs font-semibold leading-tight ${sel ? mt.text : 'text-gray-600'}`}>{mt.label}</div>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* ── Infos générales ── */}
          <Section title="Informations générales" icon={<FileText className="w-4 h-4" />}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Titre <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex : Construction durable au Maroc - Webinaire SIB 2026"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Décrivez le contenu de ce média…"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {type === 'testimonial' ? 'Profil du témoin' : 'Catégorie'}
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm bg-white"
                  >
                    <option value="">Sélectionner…</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Statut de publication</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: 'draft',     label: 'Brouillon', cls: 'border-gray-400 bg-gray-50 text-gray-700' },
                      { value: 'published', label: 'Publié',    cls: 'border-green-500 bg-green-50 text-green-700' },
                      { value: 'archived',  label: 'Archivé',   cls: 'border-slate-400 bg-slate-50 text-slate-600' },
                    ] as const).map(s => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setStatus(s.value)}
                        className={`py-2 px-1 rounded-lg border-2 text-xs font-semibold transition-colors ${status === s.value ? s.cls : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {status === 'published' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Date de publication</label>
                  <input
                    type="datetime-local"
                    value={publishedAt}
                    onChange={e => setPublishedAt(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
                  />
                </div>
              )}
            </div>
          </Section>

          {/* ── Médias & URLs ── */}
          <Section title="Médias & URLs" icon={<Link2 className="w-4 h-4" />}>
            <div className="space-y-4">
              {/* Thumbnail */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  <Image className="w-3.5 h-3.5 inline mr-1" />URL de la miniature (thumbnail)
                </label>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={e => setThumbnailUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
                />
                {thumbnailUrl && (
                  <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    <img
                      src={thumbnailUrl}
                      alt="Aperçu"
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <span className="absolute top-1 right-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Aperçu
                    </span>
                  </div>
                )}
              </div>

              {/* Video URL */}
              {hasVideo && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    <Video className="w-3.5 h-3.5 inline mr-1" />URL Vidéo (YouTube, Vimeo, direct…)
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
                  />
                  {ytId && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Aperçu YouTube"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Audio URL */}
              {hasPodcast && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    <Mic className="w-3.5 h-3.5 inline mr-1" />URL Audio (Spotify, SoundCloud, MP3…)
                  </label>
                  <input
                    type="url"
                    value={audioUrl}
                    onChange={e => setAudioUrl(e.target.value)}
                    placeholder="https://soundcloud.com/..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
                  />
                </div>
              )}

              {/* Duration */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  <Clock className="w-3.5 h-3.5 inline mr-1" />Durée
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { val: durH, set: setDurH, label: 'h', max: 23 },
                    { val: durM, set: setDurM, label: 'min', max: 59 },
                    { val: durS, set: setDurS, label: 'sec', max: 59 },
                  ].map(({ val, set, label, max }) => (
                    <div key={label} className="flex items-center gap-1">
                      <input
                        type="number"
                        value={val}
                        onChange={e => set(e.target.value)}
                        min={0}
                        max={max}
                        className="w-16 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 text-sm text-center"
                      />
                      <span className="text-xs text-gray-500 font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* ── Tags ── */}
          <Section title="Tags" icon={<Tag className="w-4 h-4" />}>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Ex: BTP, Innovation, Maroc…"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-[#0F2034] hover:bg-[#1B365D] text-[#C9A84C] rounded-lg text-sm font-semibold transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Ajouter
              </button>
            </div>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1.5 bg-[#0F2034]/8 text-[#0F2034] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#0F2034]/15">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">Aucun tag ajouté. Appuyez sur Entrée ou cliquez "Ajouter".</p>
            )}
          </Section>

          {/* ── Intervenants ── */}
          <Section title="Intervenants / Speakers" icon={<User className="w-4 h-4" />}>
            <div className="space-y-4">
              {speakers.map((sp, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-200 relative">
                  <button
                    type="button"
                    onClick={() => removeSpeaker(i)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="font-semibold text-xs text-[#0F2034] mb-3">Intervenant {i + 1}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        value={sp.name}
                        onChange={e => updateSpeaker(i, 'name', e.target.value)}
                        placeholder="Nom complet *"
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        value={sp.title}
                        onChange={e => updateSpeaker(i, 'title', e.target.value)}
                        placeholder="Titre / Fonction"
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        value={sp.company}
                        onChange={e => updateSpeaker(i, 'company', e.target.value)}
                        placeholder="Entreprise / Organisation"
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                    <div className="relative">
                      <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="url"
                        value={sp.photo_url}
                        onChange={e => updateSpeaker(i, 'photo_url', e.target.value)}
                        placeholder="URL photo (optionnel)"
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                  </div>
                  {sp.photo_url && (
                    <div className="mt-2 flex items-center gap-2">
                      <img src={sp.photo_url} alt={sp.name} className="w-8 h-8 rounded-full object-cover border border-gray-200" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <span className="text-xs text-gray-400">Aperçu photo</span>
                    </div>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addSpeaker}
                className="w-full py-3 border-2 border-dashed border-gray-300 hover:border-[#C9A84C] hover:bg-yellow-50/50 rounded-xl text-sm font-medium text-gray-500 hover:text-[#0F2034] transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Ajouter un intervenant
              </button>
            </div>
          </Section>

          {/* ── Actions ── */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#0F2034] hover:bg-[#1B365D] text-white rounded-xl font-semibold transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Création…</>
              ) : (
                <><Save className="w-4 h-4" /> Créer le média</>
              )}
            </button>
            <Link to={ROUTES.ADMIN_MEDIA_MANAGE} className="flex-1">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors"
              >
                <X className="w-4 h-4" /> Annuler
              </button>
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateMediaPage;