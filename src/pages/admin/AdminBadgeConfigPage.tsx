/**
 * AdminBadgeConfigPage – Personnalisation du badge A4 bifold SIB 2026
 * Permet à l'admin de configurer couleurs, programme, textes et logos du badge
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Save, RefreshCw, Loader2, Plus, Trash2, ChevronDown, ChevronUp,
  Palette, FileText, Image as ImageIcon, Eye, EyeOff, Info,
  Calendar, Clock, Tag, Type, Layout, ArrowLeft, Upload, X, Layers
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import PrintableBadgeA4 from '../../components/badge/PrintableBadgeA4';
import type { UserBadge } from '../../types';
import { ROUTES } from '../../lib/routes';
import { useTranslation } from '../../hooks/useTranslation';

// ─── Types ───────────────────────────────────────────────────────────────────

interface BadgeSession {
  time: string;
  title: string;
  type: 'session' | 'panel' | 'ceremony' | 'lunch' | 'visit' | 'opening' | 'break' | 'networking' | 'demo';
}

interface BadgeDayProgram {
  id: string;
  date: string;
  label: string;      // ex: "Mardi 25 Novembre"
  sessions: BadgeSession[];
  open: boolean;      // UI only
}

interface FeaturedSponsor {
  id: string;
  name: string;
  logo_url: string;
  role: string; // ex: "Sous l'égide de", "Organisateur", "Partenaire Officiel"…
  order: number;
}

type FaceContent = 'partenaires' | 'programme' | 'infos_pratiques' | 'app_promo' | 'image_pleine' | 'carte_de_visite' | 'identite_participant';

interface BadgeConfig {
  // Identité
  event_name: string;
  event_edition: string;
  event_dates_display: string;
  event_location: string;
  event_location_detail: string;
  // Badge validité
  badge_validity_text_fr: string;
  badge_validity_text_en: string;
  // Couleurs
  primary_color: string;
  secondary_color: string;
  header_bg: string;
  text_dark: string;
  accent_color: string;
  // Logos
  logo_main_url: string;
  logo_ministry_url: string;
  logo_sponsor_1_url: string;
  logo_sponsor_1_label: string;
  logo_sponsor_2_url: string;
  logo_sponsor_2_label: string;
  logo_sponsor_3_url: string;
  logo_sponsor_3_label: string;
  // Programme
  show_program_on_badge: string; // 'true'|'false'
  program_compact_mode: string;  // 'false'|'small'|'mini'
  program_days: BadgeDayProgram[];
  // Face 4 – Partenaires
  partners_section_title: string;
  show_app_promo: string; // 'true'|'false'
  app_promo_title: string;
  app_promo_subtitle: string;
  // App Stores QR
  app_store_url: string;
  google_play_url: string;
  app_promo_image_url: string;
  // Face 4 – Logos étendus
  logo_organizer_url: string;
  logo_organizer_label: string;
  logo_delegate_url: string;
  logo_delegate_label: string;
  logo_badging_url: string;
  logo_badging_label: string;
  logo_media_url: string;
  logo_media_label: string;
  logo_digital_url: string;
  logo_digital_label: string;
  logo_aegis_url: string;
  logo_aegis_label: string;
  // Choix de contenu par face
  face1_content: FaceContent;
  face2_content: FaceContent;
  face3_content: FaceContent;
  face4_content: FaceContent;
  // Sponsors sélectionnés pour la face partenaires
  featured_sponsors: FeaturedSponsor[];
  partners_rows_config: number[]; // logos par ligne, ex: [2, 3, 4]
  partners_logo_height: number;   // hauteur logos en mm (6-25)
  // Infos pratiques (Face 1)
  dates_label: string;
  opening_hours: string;
  location_address: string;
  location_qr_url: string;
  how_to_get_there: string;
  contact_phone: string;
  contact_email: string;
  contact_website: string;
}

const DEFAULT_DAYS: BadgeDayProgram[] = [
  {
    id: 'd1', date: '2026-11-25', label: 'Mardi 25 Novembre 2026', open: false,
    sessions: [
      { time: '10:00 – 12:30', title: 'Ouverture officielle & Allocutions institutionnelles', type: 'opening' },
      { time: '12:30 – 14:00', title: 'Déjeuner de réseautage', type: 'lunch' },
      { time: '14:00 – 15:30', title: 'Panel Ministériel : Financement & PPP', type: 'panel' },
      { time: '15:30 – 17:30', title: 'Visite des stands exposants', type: 'visit' },
    ]
  },
  {
    id: 'd2', date: '2026-11-26', label: 'Mercredi 26 Novembre 2026', open: false,
    sessions: [
      { time: '09:00 – 10:30', title: 'Bâtiments durables & Résilience climatique', type: 'session' },
      { time: '10:30 – 11:00', title: 'Pause-café', type: 'break' },
      { time: '11:00 – 12:30', title: 'Transition énergétique & Réglementation', type: 'session' },
      { time: '12:30 – 14:00', title: 'Déjeuner de réseautage', type: 'lunch' },
      { time: '14:00 – 15:30', title: 'Bâtiments du futur : Digital & Cybersécurité', type: 'session' },
    ]
  },
  {
    id: 'd3', date: '2026-11-27', label: 'Jeudi 27 Novembre 2026', open: false,
    sessions: [
      { time: '09:00 – 10:30', title: 'Matériaux innovants & Industrialisation BTP', type: 'session' },
      { time: '10:30 – 11:00', title: 'Pause-café', type: 'break' },
      { time: '11:00 – 12:30', title: 'Smart Cities & Développement Urbain', type: 'session' },
      { time: '12:30 – 14:00', title: 'Déjeuner de réseautage', type: 'lunch' },
      { time: '14:00 – 15:30', title: 'Forum B2B Africain', type: 'networking' },
    ]
  },
  {
    id: 'd4', date: '2026-11-28', label: 'Vendredi 28 Novembre 2026', open: false,
    sessions: [
      { time: '09:00 – 10:30', title: 'Inclusion & Formation dans la Construction', type: 'session' },
      { time: '10:30 – 11:00', title: 'Pause-café', type: 'break' },
      { time: '11:00 – 12:30', title: 'Leadership Féminin & Transformation BTP', type: 'session' },
      { time: '12:30 – 14:00', title: 'Déjeuner de réseautage', type: 'lunch' },
      { time: '14:00 – 17:30', title: 'Espace Démonstrations & Networking', type: 'demo' },
    ]
  },
  {
    id: 'd5', date: '2026-11-29', label: 'Samedi 29 Novembre 2026', open: false,
    sessions: [
      { time: '09:00 – 11:00', title: 'Session de clôture & Remise de prix', type: 'ceremony' },
      { time: '11:00 – 12:30', title: 'Conférence de presse', type: 'session' },
      { time: '12:30 – 15:00', title: 'Déjeuner de gala', type: 'lunch' },
      { time: '15:00 – 18:00', title: 'Visite Parc Mohammed VI', type: 'visit' },
    ]
  },
];

const DEFAULT_CONFIG: BadgeConfig = {
  event_name: 'SIB 2026',
  event_edition: '1ère édition',
  event_dates_display: '25 – 29 Novembre 2026',
  event_location: 'El Jadida, Maroc',
  event_location_detail: 'Parc d\'Exposition Mohammed VI',
  badge_validity_text_fr: 'CECI EST VOTRE BADGE D\'ACCÈS VALABLE POUR LES 5 JOURS DU SALON',
  badge_validity_text_en: 'THIS DOCUMENT IS YOUR ENTRY BADGE VALID FOR THE 5 DAYS OF THE EXHIBITION',
  primary_color: '#1e3a5f',
  secondary_color: '#C9A84C',
  header_bg: '#1e3a5f',
  text_dark: '#111827',
  accent_color: '#3ECF8E',
  logo_main_url: '/logo-sib2026.png',
  logo_ministry_url: '/logo-ministere.png',
  logo_sponsor_1_url: '',
  logo_sponsor_1_label: 'Partenaire Officiel',
  logo_sponsor_2_url: '',
  logo_sponsor_2_label: 'Co-Organisateur',
  logo_sponsor_3_url: '',
  logo_sponsor_3_label: 'Partenaire Médias',
  show_program_on_badge: 'true',
  program_compact_mode: 'false',
  program_days: DEFAULT_DAYS,
  partners_section_title: 'Sous le Haut Patronage de Sa Majesté le Roi',
  show_app_promo: 'true',
  app_promo_title: "Développez votre réseau Professionnel avec URBA event",
  app_promo_subtitle: 'Networking · Rendez-vous · Programme · Annuaire',
  app_store_url: 'https://apps.apple.com',
  google_play_url: 'https://play.google.com/store',
  app_promo_image_url: '',
  logo_organizer_url: '',
  logo_organizer_label: 'Organisateur',
  logo_delegate_url: '',
  logo_delegate_label: 'Organisateur délégué',
  logo_badging_url: '',
  logo_badging_label: 'Partenaire Badging',
  logo_media_url: '',
  logo_media_label: 'Partenaire Médias',
  logo_digital_url: '',
  logo_digital_label: 'Partenaire Digital',
  logo_aegis_url: '',
  logo_aegis_label: "Sous l'égide de",
  face1_content: 'infos_pratiques',
  face2_content: 'carte_de_visite',
  face3_content: 'identite_participant',
  face4_content: 'partenaires',
  featured_sponsors: [],
  partners_rows_config: [3, 3],
  partners_logo_height: 13,
  dates_label: 'du 25 au 29 Novembre 2026',
  opening_hours: 'de 9h30 à 18h30 · Mer–Sam / de 9h à 17h30 · Dim',
  location_address: 'El Jadida – Parc d\'Exposition Mohammed VI',
  location_qr_url: '',
  how_to_get_there: 'Accessible depuis l\'autoroute A5 Casablanca–El Jadida',
  contact_phone: '+212 5 22 86 41 41',
  contact_email: 'contact@sib2026.ma',
  contact_website: 'www.sib2026.ma',
};

const SESSION_TYPE_OPTIONS: { value: BadgeSession['type']; label: string; color: string }[] = [
  { value: 'opening',    label: 'Ouverture',      color: '#7c3aed' },
  { value: 'panel',      label: 'Panel',          color: '#1e3a5f' },
  { value: 'session',    label: 'Conférence',     color: '#0369a1' },
  { value: 'networking', label: 'Networking',     color: '#059669' },
  { value: 'demo',       label: 'Démonstration',  color: '#d97706' },
  { value: 'lunch',      label: 'Déjeuner',       color: '#16a34a' },
  { value: 'break',      label: 'Pause',          color: '#9ca3af' },
  { value: 'visit',      label: 'Visite',         color: '#c2410c' },
  { value: 'ceremony',   label: 'Cérémonie',      color: '#C9A84C' },
];

const DB_KEY = 'badge_config_v1';

const PREVIEW_BADGE: UserBadge = {
  id: 'admin-preview', userId: 'admin-preview',
  badgeCode: 'SIB2026-PREVIEW',
  userType: 'visitor',
  fullName: 'Prénom NOM',
  companyName: 'Société / Organisation',
  email: 'participant@example.com',
  avatarUrl: undefined,
  standNumber: undefined,
  accessLevel: 'standard',
  validFrom: new Date('2026-11-25'),
  validUntil: new Date('2026-11-29'),
  status: 'active',
  scanCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const EXHIBITOR_PREVIEW_BADGE: UserBadge = {
  id: 'admin-preview-exhibitor', userId: 'admin-preview-exhibitor',
  badgeCode: 'SIB2026-EXPO-01',
  userType: 'exhibitor',
  fullName: 'Prénom NOM',
  companyName: 'Société Exposante',
  email: 'exposant@example.com',
  avatarUrl: undefined,
  standNumber: 'B-12',
  companyLogoUrl: undefined,
  accessLevel: 'exhibitor',
  validFrom: new Date('2026-11-25'),
  validUntil: new Date('2026-11-29'),
  status: 'active',
  scanCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ─── Sous-composants ──────────────────────────────────────────────────────────

function SectionCard({ title, icon: Icon, children, defaultOpen = true }: Readonly<{
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}>) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4 text-indigo-500" />
          <span className="font-semibold text-sm text-gray-800">{title}</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>
      {open && <div className="px-5 pb-5 pt-1 space-y-4 border-t border-gray-100">{children}</div>}
    </div>
  );
}

function Field({ label, hint, children }: Readonly<{ label: string; hint?: string; children: React.ReactNode }>) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-600">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 italic">{hint}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }: Readonly<{
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}>) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg px-3 py-2 text-sm text-gray-800 bg-white border border-gray-200 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300 placeholder-gray-300"
    />
  );
}

// ─── Composant upload image depuis PC ───────────────────────────────────────
function ImageUploadField({
  label, hint, value, onChange, bucket = 'media', folder = 'badge-assets'
}: Readonly<{
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
}>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      toast.error('Format non supporté (PNG, JPEG, WEBP, SVG uniquement)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image trop grande (max 5 Mo)');
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() ?? 'png';
      const path = `${folder ? folder + '/' : ''}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success('Image uploadée ✓');
    } catch (e: unknown) {
      toast.error(`Erreur upload : ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-600">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://... ou /images/..."
          className="flex-1 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white border border-gray-200 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300 placeholder-gray-300"
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
          style={{ background: '#eef2ff', color: '#6366f1', border: '1px solid #c7d2fe' }}
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {uploading ? 'Upload...' : 'Depuis le PC'}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
            title="Effacer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
      />
      {value && (
        <img
          src={value}
          alt="aperçu"
          className="mt-2 max-h-20 rounded-lg object-cover border border-gray-200"
        />
      )}
      {hint && <p className="text-xs text-gray-400 italic">{hint}</p>}
    </div>
  );
}

// ─── Composant aperçu QR code ─────────────────────────────────────────────────
function QRPreview({ url, label }: Readonly<{ url: string; label: string }>) {
  if (!url) return null;
  return (
    <div className="flex items-center gap-3 mt-2 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
      <div className="p-1.5 bg-white rounded-lg shadow-sm">
        <QRCodeSVG value={url} size={64} level="M" />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-700">{label}</p>
        <p className="text-[10px] text-gray-400 break-all mt-0.5" style={{ maxWidth: 200 }}>{url}</p>
      </div>
    </div>
  );
}

// ─── Composant Sélecteur de sponsors ─────────────────────────────────────────

interface DbPartner {
  id: string;
  company_name: string | null;
  logo_url: string | null;
  partnership_level: string | null;
  verified: boolean | null;
}

const ROLE_OPTIONS = [
  "Sous l'égide de",
  'Organisateur',
  'Organisateur délégué',
  'Co-Organisateur',
  'Partenaire Officiel',
  'Partenaire Officiel',
  'Partenaire Médias',
  'Partenaire Badging',
  'Partenaire Digital',
  'Partenaire Logistique',
  'Presse',
];

const SUBSCRIPTION_LABEL: Record<string, string> = {
  organisateur: 'Organisateur',
  co_organisateur: 'Co-Organisateur',
  sponsor_officiel: 'Partenaire Officiel',
  official_sponsor: 'Partenaire Officiel',
  org_delegue: 'Org. Délégué',
  nos_partenaires: 'Nos Partenaires',
  presse: 'Presse',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
  platinum: 'Platinum',
};

function SponsorPicker({ selected, onChange }: Readonly<{
  selected: FeaturedSponsor[];
  onChange: (sponsors: FeaturedSponsor[]) => void;
}>) {
  const [partners, setPartners] = useState<DbPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState<string | null>(null); // id du sponsor en cours d'upload
  const [showManual, setShowManual] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualLogo, setManualLogo] = useState('');
  const [manualRole, setManualRole] = useState('Partenaire Officiel');
  const [manualUploading, setManualUploading] = useState(false);
  const manualLogoRef = useRef<HTMLInputElement>(null);
  const logoInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('partners')
        .select('id, company_name, logo_url, partnership_level, verified')
        .not('company_name', 'is', null)
        .order('company_name');
      setPartners((data ?? []) as DbPartner[]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = partners.filter(p =>
    (p.company_name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  function isSelected(id: string) { return selected.some(s => s.id === id); }

  function toggle(p: DbPartner) {
    if (isSelected(p.id)) {
      onChange(selected.filter(s => s.id !== p.id));
    } else {
      onChange([...selected, {
        id: p.id,
        name: p.company_name ?? '',
        logo_url: p.logo_url ?? '',
        role: 'Partenaire Officiel',
        order: selected.length,
      }]);
    }
  }

  function updateRole(id: string, role: string) {
    onChange(selected.map(s => s.id === id ? { ...s, role } : s));
  }

  function updateLogo(id: string, logo_url: string) {
    onChange(selected.map(s => s.id === id ? { ...s, logo_url } : s));
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    const next = [...selected];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next.map((s, i) => ({ ...s, order: i })));
  }

  function moveDown(idx: number) {
    if (idx === selected.length - 1) return;
    const next = [...selected];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onChange(next.map((s, i) => ({ ...s, order: i })));
  }

  async function uploadLogoFor(id: string, file: File) {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowed.includes(file.type)) { toast.error('Format non supporté'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image trop grande (max 5 Mo)'); return; }
    setUploading(id);
    try {
      const ext = file.name.split('.').pop() ?? 'png';
      const path = `badge-assets/logos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('media').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('media').getPublicUrl(path);
      updateLogo(id, data.publicUrl);
      toast.success('Logo uploadé ✓');
    } catch (e: unknown) {
      toast.error(`Erreur upload : ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setUploading(null);
    }
  }

  async function uploadManualLogo(file: File) {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowed.includes(file.type)) { toast.error('Format non supporté'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image trop grande (max 5 Mo)'); return; }
    setManualUploading(true);
    try {
      const ext = file.name.split('.').pop() ?? 'png';
      const path = `badge-assets/logos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('media').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('media').getPublicUrl(path);
      setManualLogo(data.publicUrl);
      toast.success('Logo uploadé ✓');
    } catch (e: unknown) {
      toast.error(`Erreur upload : ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setManualUploading(false);
    }
  }

  function addManual() {
    if (!manualName.trim()) { toast.error('Nom du partenaire requis'); return; }
    const id = `custom-${Date.now()}`;
    onChange([...selected, { id, name: manualName.trim(), logo_url: manualLogo, role: manualRole, order: selected.length }]);
    setManualName(''); setManualLogo(''); setManualRole('Partenaire Officiel'); setShowManual(false);
    toast.success('Partenaire ajouté ✓');
  }

  return (
    <div className="space-y-3">
      {/* Sponsors sélectionnés */}
      {selected.length > 0 && (
        <div className="rounded-xl overflow-hidden border border-indigo-200">
          <div className="px-3 py-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider bg-indigo-50">
            {selected.length} sponsor{selected.length > 1 ? 's' : ''} sélectionné{selected.length > 1 ? 's' : ''} — ordre d'affichage
          </div>
          <div className="divide-y divide-gray-100">
            {selected.map((s, idx) => (
              <div key={s.id} className="flex items-center gap-2 px-3 py-2.5">
                <div className="flex flex-col gap-0.5">
                  <button type="button" onClick={() => moveUp(idx)} disabled={idx === 0} className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors" title="Monter">
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button type="button" onClick={() => moveDown(idx)} disabled={idx === selected.length - 1} className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors" title="Descendre">
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
                {/* Logo + bouton upload */}
                <div className="relative group shrink-0">
                  {s.logo_url
                    ? <img src={s.logo_url} alt={s.name} className="h-10 w-16 object-contain rounded bg-white p-0.5 border border-gray-100" />
                    : <div className="h-10 w-16 rounded bg-gray-100 flex items-center justify-center text-[9px] text-gray-400 border border-dashed border-gray-200">logo</div>}
                  <button
                    type="button"
                    onClick={() => logoInputRefs.current[s.id]?.click()}
                    className="absolute inset-0 flex items-center justify-center rounded bg-black/0 group-hover:bg-black/30 transition-colors"
                    title="Changer le logo"
                  >
                    {uploading === s.id
                      ? <Loader2 className="h-4 w-4 text-white animate-spin opacity-0 group-hover:opacity-100" />
                      : <Upload className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={el => { logoInputRefs.current[s.id] = el; }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogoFor(s.id, f); e.target.value = ''; }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{s.name}</p>
                  <select
                    value={s.role}
                    onChange={e => updateRole(s.id, e.target.value)}
                    className="mt-0.5 w-full rounded px-1.5 py-0.5 text-[10px] text-gray-700 bg-white border border-gray-200 focus:outline-none"
                  >
                    {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {/* URL logo manuelle */}
                  <input
                    type="text"
                    value={s.logo_url}
                    onChange={e => updateLogo(s.id, e.target.value)}
                    placeholder="URL logo…"
                    className="mt-1 w-full rounded px-1.5 py-0.5 text-[10px] text-gray-500 bg-white border border-gray-100 focus:outline-none focus:border-indigo-300 placeholder-gray-300"
                  />
                </div>
                <button type="button" onClick={() => toggle(partners.find(p => p.id === s.id) ?? { id: s.id, company_name: s.name, logo_url: s.logo_url, partnership_level: null, verified: null })} className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors shrink-0" title="Retirer">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ajout manuel d'un partenaire */}
      <div className="rounded-xl border border-dashed border-gray-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowManual(v => !v)}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
        >
          <Plus className="h-3.5 w-3.5 text-indigo-500" />
          <span className="text-xs font-semibold text-indigo-600">Ajouter un partenaire manuellement</span>
          <span className="ml-auto text-xs text-gray-400">{showManual ? '▲' : '▼'}</span>
        </button>
        {showManual && (
          <div className="px-3 pb-3 pt-1 space-y-2.5 border-t border-dashed border-gray-200 bg-gray-50">
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-1">Nom du partenaire *</label>
              <input
                type="text"
                value={manualName}
                onChange={e => setManualName(e.target.value)}
                placeholder="Ex: Ministère de l'Habitat"
                className="w-full rounded-lg px-2.5 py-1.5 text-xs text-gray-800 bg-white border border-gray-200 focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-1">Logo</label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={manualLogo}
                  onChange={e => setManualLogo(e.target.value)}
                  placeholder="URL ou uploadez depuis le PC"
                  className="flex-1 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 bg-white border border-gray-200 focus:outline-none focus:border-indigo-400 placeholder-gray-300"
                />
                <button
                  type="button"
                  disabled={manualUploading}
                  onClick={() => manualLogoRef.current?.click()}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                  style={{ background: '#eef2ff', color: '#6366f1', border: '1px solid #c7d2fe' }}
                >
                  {manualUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                  {manualUploading ? '...' : 'PC'}
                </button>
                <input
                  ref={manualLogoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadManualLogo(f); e.target.value = ''; }}
                />
              </div>
              {manualLogo && <img src={manualLogo} alt="aperçu" className="mt-1.5 h-10 object-contain rounded border border-gray-100 bg-white" />}
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-1">Rôle</label>
              <select
                value={manualRole}
                onChange={e => setManualRole(e.target.value)}
                className="w-full rounded-lg px-2.5 py-1.5 text-xs text-gray-700 bg-white border border-gray-200 focus:outline-none focus:border-indigo-400"
              >
                {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <button
              type="button"
              onClick={addManual}
              className="w-full py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              Ajouter au badge
            </button>
          </div>
        )}
      </div>

      {/* Recherche et liste des partenaires */}
      <div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un partenaire…"
          className="w-full rounded-lg px-3 py-2 text-sm text-gray-800 bg-white border border-gray-200 focus:outline-none focus:border-indigo-400 mb-2"
        />
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            <span className="text-xs text-gray-400 ml-2">Chargement des partenaires…</span>
          </div>
        ) : (
          <div className="max-h-52 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100">
            {filtered.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">Aucun partenaire trouvé</p>
            )}
            {filtered.map(p => {
              const active = isSelected(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggle(p)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                  style={{ background: active ? '#eef2ff' : undefined }}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${active ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300 bg-transparent'}`}>
                    {active && <span className="text-[10px] font-bold text-white">✓</span>}
                  </div>
                  {p.logo_url
                    ? <img src={p.logo_url} alt={p.company_name ?? ''} className="h-7 w-12 object-contain rounded bg-white p-0.5 shrink-0 border border-gray-100" />
                    : <div className="h-7 w-12 rounded bg-gray-100 flex items-center justify-center text-[8px] text-gray-400 shrink-0">logo</div>}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{p.company_name}</p>
                    <p className="text-[10px] text-gray-400">{SUBSCRIPTION_LABEL[p.partnership_level ?? ''] ?? p.partnership_level ?? 'Partenaire'}{p.verified ? ' · ✓ Vérifié' : ''}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ColorInput({ label, value, onChange }: Readonly<{ label: string; value: string; onChange: (v: string) => void }>) {  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-9 h-9 rounded-lg cursor-pointer border border-gray-200 bg-white"
        title={label}
      />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white border border-gray-200 focus:outline-none focus:border-indigo-400 font-mono"
        placeholder="#000000"
      />
      <span className="text-xs text-gray-500 whitespace-nowrap">{label}</span>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = { badging: 'Badging', digital: 'Digital', media: 'Médias' };

// ── Helpers purs (hors composant) ────────────────────────────────────────────
function patchToggleDay(days: BadgeDayProgram[], id: string): BadgeDayProgram[] {
  return days.map(d => d.id === id ? { ...d, open: !d.open } : d);
}
function patchUpdateDay(days: BadgeDayProgram[], id: string, field: keyof Omit<BadgeDayProgram, 'sessions' | 'open' | 'id'>, value: string): BadgeDayProgram[] {
  return days.map(d => d.id === id ? { ...d, [field]: value } : d);
}
function patchUpdateSession(days: BadgeDayProgram[], dayId: string, sIdx: number, field: keyof BadgeSession, value: string): BadgeDayProgram[] {
  return days.map(d =>
    d.id === dayId ? { ...d, sessions: d.sessions.map((s, i) => i === sIdx ? { ...s, [field]: value } : s) } : d
  );
}
function patchAddSession(days: BadgeDayProgram[], dayId: string): BadgeDayProgram[] {
  return days.map(d =>
    d.id === dayId ? { ...d, sessions: [...d.sessions, { time: '09:00 – 10:30', title: 'Nouvelle session', type: 'session' as const }] } : d
  );
}
function patchRemoveSession(days: BadgeDayProgram[], dayId: string, sIdx: number): BadgeDayProgram[] {
  return days.map(d => d.id === dayId ? { ...d, sessions: d.sessions.filter((_, i) => i !== sIdx) } : d);
}

// ── Composant aperçu mini-badge (toutes les faces ou A4 complet) ──
function DynamicFacePreview({ contentType, config, badge = PREVIEW_BADGE }: Readonly<{ contentType: FaceContent; config: BadgeConfig; badge?: UserBadge }>) {
  if (contentType === 'identite_participant') return <Face3Preview config={config} badge={badge} />;
  if (contentType === 'partenaires') return <Face4Preview config={config} />;
  if (contentType === 'carte_de_visite') return <Face2Preview config={{ ...config, face2_content: 'carte_de_visite' }} />;
  if (contentType === 'programme') return <Face2Preview config={{ ...config, face2_content: 'programme' }} />;
  if (contentType === 'infos_pratiques') {
    return (
      <>
        <div style={{ background: '#111', color: '#fff', padding: '6px 10px', fontSize: 9, fontWeight: 'bold', lineHeight: 1.4, textAlign: 'center' }}>
          <div>{config.badge_validity_text_fr}</div>
          <div style={{ opacity: 0.65, marginTop: 2, fontSize: 8 }}>{config.badge_validity_text_en}</div>
        </div>
        <div style={{ padding: '8px 10px', fontSize: 8.5, color: '#374151', borderBottom: '1px solid #e5e7eb', fontStyle: 'italic' }}>
          Ce badge vous donne accès au salon pendant les 5 jours de l'évènement.
        </div>
        <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 5 }}>
          {[{ icon: '📅', t: 'DATES DU SALON', v: config.dates_label }, { icon: '🕐', t: "HORAIRES D'OUVERTURE", v: config.opening_hours }, { icon: '📍', t: 'LIEU', v: config.location_address || config.event_location_detail || config.event_location }].map(row => row.v ? (
            <div key={row.t} style={{ display: 'flex', gap: 4 }}>
              <span>{row.icon}</span>
              <div><div style={{ fontWeight: 800, fontSize: 8 }}>{row.t}</div><div style={{ fontSize: 8, color: '#374151' }}>{row.v}</div></div>
            </div>
          ) : null)}
          {config.contact_phone && (
            <div style={{ display: 'flex', gap: 4 }}><span>📞</span><div><div style={{ fontWeight: 800, fontSize: 8 }}>CONTACT</div><div style={{ fontSize: 8 }}>{[config.contact_phone, config.contact_email, config.contact_website].filter(Boolean).join(' · ')}</div></div></div>
          )}
        </div>
      </>
    );
  }
  if (contentType === 'image_pleine') {
    return (
      <div style={{ position: 'relative', width: '100%', minHeight: 200, overflow: 'hidden' }}>
        {config.app_promo_image_url
          ? <img src={config.app_promo_image_url} alt="illustration" style={{ width: '100%', height: '100%', minHeight: 200, objectFit: 'cover', display: 'block' }} />
          : <div style={{ minHeight: 200, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#9ca3af' }}>Image pleine page</div>}
      </div>
    );
  }
  // app_promo (default)
  if (config.app_promo_image_url) {
    return (
      <div style={{ position: 'relative', width: '100%', minHeight: 200, overflow: 'hidden' }}>
        <img src={config.app_promo_image_url} alt="URBAEVENT Mobile App" style={{ width: '100%', height: '100%', minHeight: 200, objectFit: 'cover', display: 'block' }} />
      </div>
    );
  }
  return (
    <>
      <div style={{ background: config.header_bg, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {config.logo_main_url
          ? <img src={config.logo_main_url} alt="logo" style={{ height: 24, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          : <span style={{ color: config.secondary_color, fontWeight: 'bold', fontSize: 11 }}>{config.event_name}</span>}
        <span style={{ color: config.secondary_color, fontWeight: 'bold', fontSize: 10 }}>{config.event_edition}</span>
      </div>
      <div style={{ padding: '16px 12px', textAlign: 'center', background: `linear-gradient(160deg, ${config.primary_color} 0%, #0a1f3a 100%)` }}>
        <div style={{ color: config.secondary_color, fontWeight: 900, fontSize: 15, lineHeight: 1.3, marginBottom: 6 }}>URBA<span style={{ color: '#fff' }}>EVENT</span></div>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 10, marginBottom: 4, lineHeight: 1.4 }}>{config.app_promo_title}</div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 8.5 }}>{config.app_promo_subtitle}</div>
      </div>
      <div style={{ background: config.primary_color, color: '#fff', padding: '5px 10px', textAlign: 'center', fontSize: 8.5 }}>
        <div style={{ fontWeight: 'bold' }}>{config.event_dates_display} · {config.event_location}</div>
      </div>
    </>
  );
}

function BadgePreviewContent({ config, previewAll, previewFace, badge = PREVIEW_BADGE }: Readonly<{
  config: BadgeConfig;
  previewAll: boolean;
  previewFace: 1 | 2 | 3 | 4;
  badge?: UserBadge;
}>) {
  if (previewAll) {
    return (
      <>
        <div style={{ overflowY: 'auto', maxHeight: 900 }}>
          <div style={{ zoom: 0.78 }}>
            <PrintableBadgeA4 badge={badge} config={config as Parameters<typeof PrintableBadgeA4>[0]['config']} loadConfig={false} />
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
          <Info className="h-3 w-3" />
          Aperçu A4 complet — 4 faces — bifold recto-verso
        </p>
      </>
    );
  }
  const faceKey = `face${previewFace}_content` as keyof BadgeConfig;
  const activeContent = config[faceKey] as FaceContent;
  return (
    <>
      <div style={{ width: '100%', maxWidth: 660, margin: '0 auto', fontFamily: 'Arial, sans-serif', background: '#fff', border: '1px solid #e0e0e0', borderRadius: 6, overflow: 'hidden', fontSize: 11 }}>
        <DynamicFacePreview contentType={activeContent} config={config} badge={badge} />
      </div>
      <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
        <Info className="h-3 w-3" />
        Aperçu simplifié — impression finale en A4 haute résolution
      </p>
    </>
  );
}

function Face2Preview({ config }: Readonly<{ config: BadgeConfig }>) {
  if (config.face2_content === 'carte_de_visite') {
    return (
      <>
        <div style={{ background: config.header_bg, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {config.logo_main_url
            ? <img src={config.logo_main_url} alt="logo" style={{ height: 28, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            : <span style={{ color: config.secondary_color, fontWeight: 'bold', fontSize: 12 }}>{config.event_name}</span>}
          <span style={{ color: config.secondary_color, fontWeight: 'bold', fontSize: 10 }}>{config.event_name} · {config.event_edition}</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', textAlign: 'center', minHeight: 160 }}>
          <div style={{ border: `2px solid ${config.primary_color}`, borderRadius: 6, padding: '16px 20px', textAlign: 'center', width: '90%' }}>
            <div style={{ fontWeight: 800, fontSize: 11, color: config.primary_color, lineHeight: 1.5, marginBottom: 6 }}>
              Insérez votre carte de visite<br />dans le porte-badge
            </div>
            <div style={{ fontWeight: 500, fontSize: 9.5, color: '#374151', fontStyle: 'italic' }}>
              Insert your business card<br />in the badge holder
            </div>
          </div>
        </div>
        <div style={{ background: config.primary_color, color: '#fff', padding: '5px 10px', textAlign: 'center', fontSize: 8.5 }}>
          <div style={{ fontWeight: 'bold' }}>{config.event_dates_display} · {config.event_location}</div>
        </div>
      </>
    );
  }
  return (
    <>
      <div style={{ background: config.header_bg, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {config.logo_main_url
          ? <img src={config.logo_main_url} alt="logo" style={{ height: 28, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          : <span style={{ color: config.secondary_color, fontWeight: 'bold', fontSize: 12 }}>{config.event_name}</span>}
        <span style={{ color: config.secondary_color, fontWeight: 'bold', fontSize: 12 }}>{config.event_name} · {config.event_edition}</span>
      </div>
      <div style={{ background: config.primary_color, color: '#fff', padding: '6px 10px', fontSize: 9, fontWeight: 'bold', lineHeight: 1.4 }}>
        <div>{config.badge_validity_text_fr}</div>
        <div style={{ opacity: 0.75, marginTop: 2 }}>{config.badge_validity_text_en}</div>
      </div>
      {config.show_program_on_badge === 'true' && (
        <div style={{ padding: '8px 10px' }}>
          <div style={{ fontWeight: 'bold', color: config.primary_color, fontSize: 12, marginBottom: 6, fontStyle: 'italic' }}>Programme {config.event_name}</div>
          {config.program_days.map((day) => (
            <div key={day.id} style={{ marginBottom: 8 }}>
              <div style={{ background: config.secondary_color, color: '#fff', padding: '2px 6px', borderRadius: 3, fontWeight: 'bold', fontSize: 9, marginBottom: 3 }}>{day.label}</div>
              {day.sessions.slice(0, 4).map((s, i) => (
                <div key={`${day.id}-p${i}`} style={{ fontSize: 8.5, color: '#333', paddingLeft: 6, marginBottom: 1.5, display: 'flex', gap: 4 }}>
                  <span style={{ color: config.primary_color, fontWeight: 600, whiteSpace: 'nowrap' }}>{`· ${s.time}`}</span>
                  <span style={{ color: config.text_dark }}>{s.title.length > 50 ? `${s.title.slice(0, 50)}...` : s.title}</span>
                </div>
              ))}
              {day.sessions.length > 4 && (
                <div style={{ fontSize: 7.5, color: '#999', paddingLeft: 6 }}>{`+${day.sessions.length - 4} autres sessions`}</div>
              )}
            </div>
          ))}
        </div>
      )}
      <div style={{ background: config.primary_color, color: '#fff', padding: '5px 10px', textAlign: 'center', fontSize: 9 }}>
        <div style={{ fontWeight: 'bold' }}>{config.event_dates_display} · {config.event_location}</div>
        <div style={{ opacity: 0.7 }}>{config.event_location_detail}</div>
      </div>
    </>
  );
}

function Face3Preview({ config, badge = PREVIEW_BADGE }: Readonly<{ config: BadgeConfig; badge?: UserBadge }>) {
  const isExhibitor = badge.userType === 'exhibitor';
  const accessColor = isExhibitor ? '#16a34a' : config.primary_color;
  const accessLabel = isExhibitor ? 'EXPOSANT' : 'VISITEUR';
  const qrData = JSON.stringify({ code: badge.badgeCode, userId: badge.userId, type: badge.userType });
  return (
    <>
      <div style={{ background: config.header_bg, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {config.logo_main_url
          ? <img src={config.logo_main_url} alt="logo" style={{ height: 28, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          : <span style={{ color: config.secondary_color, fontWeight: 'bold', fontSize: 12 }}>{config.event_name}</span>}
        <span style={{ color: config.secondary_color, fontWeight: 700, fontSize: 11 }}>{config.event_name}</span>
      </div>
      <div style={{ background: config.primary_color, color: '#fff', padding: '6px 10px', fontSize: 9, fontWeight: 'bold', lineHeight: 1.4 }}>
        <div>{config.badge_validity_text_fr}</div>
        <div style={{ opacity: 0.75, marginTop: 2, fontSize: 8 }}>{config.badge_validity_text_en}</div>
      </div>
      <div style={{ padding: '16px 12px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#e5e7eb', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#9ca3af' }}>👤</div>
        <div style={{ fontWeight: 'bold', fontSize: 14, color: config.text_dark, marginBottom: 2 }}>{badge.fullName}</div>
        <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 4 }}>{badge.companyName ?? ''}</div>
        <div style={{ display: 'inline-block', background: accessColor, color: '#fff', borderRadius: 12, padding: '2px 10px', fontSize: 9, fontWeight: 'bold', marginBottom: 10 }}>
          {accessLabel}
        </div>
        {/* Logo société pour exposants */}
        {isExhibitor && (
          <div style={{ margin: '0 auto 10px', padding: '6px 10px', background: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: 8, maxWidth: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 40 }}>
            {badge.companyLogoUrl
              ? <img src={badge.companyLogoUrl} alt="logo société" style={{ maxHeight: 40, maxWidth: 100, objectFit: 'contain' }} />
              : <>
                  <span style={{ fontSize: 16 }}>🏢</span>
                  <span style={{ fontSize: 8, color: '#9ca3af', marginTop: 2 }}>Logo Exposant</span>
                </>
            }
          </div>
        )}
        <br />
        {/* QR Code réel */}
        <div style={{ display: 'inline-block', background: '#fff', border: `1px solid ${config.secondary_color}`, borderRadius: 4, padding: 4, marginTop: isExhibitor ? 0 : 4 }}>
          <QRCodeSVG value={qrData} size={60} level="M" />
        </div>
        <div style={{ fontSize: 8, color: '#9ca3af', marginTop: 4, fontFamily: 'monospace' }}>{badge.badgeCode}</div>
        {badge.standNumber && (
          <div style={{ fontSize: 8, color: accessColor, fontWeight: 'bold', marginTop: 2 }}>Stand {badge.standNumber}</div>
        )}
      </div>
      <div style={{ background: config.primary_color, color: '#fff', padding: '5px 10px', textAlign: 'center', fontSize: 9 }}>
        <div style={{ fontWeight: 'bold' }}>{config.event_dates_display} · {config.event_location}</div>
        <div style={{ opacity: 0.7 }}>{config.event_location_detail}</div>
      </div>
    </>
  );
}

function Face4Preview({ config }: Readonly<{ config: BadgeConfig }>) {
  const sponsors = (config.featured_sponsors ?? []).slice().sort((a, b) => a.order - b.order);
  const hasSponsors = sponsors.length > 0;
  const logoH = config.partners_logo_height ?? 13;
  const logoHpx = Math.round(logoH * 3.78 * 0.52);
  const rowsConfig = config.partners_rows_config ?? [3, 3];

  type LogoItem = { key: string; url: string; label: string; sub?: string };
  const allLogos: LogoItem[] = hasSponsors
    ? sponsors.map(sp => ({ key: sp.id, url: sp.logo_url, label: sp.name, sub: sp.role }))
    : [
        { key: 'aegis', url: config.logo_aegis_url, label: config.logo_aegis_label || "Sous l'égide de" },
        { key: 'organizer', url: config.logo_organizer_url, label: config.logo_organizer_label },
        { key: 'delegate', url: config.logo_delegate_url, label: config.logo_delegate_label },
        { key: 'sponsor_1', url: config.logo_sponsor_1_url, label: config.logo_sponsor_1_label },
        { key: 'sponsor_2', url: config.logo_sponsor_2_url, label: config.logo_sponsor_2_label },
        { key: 'sponsor_3', url: config.logo_sponsor_3_url, label: config.logo_sponsor_3_label },
        { key: 'badging', url: config.logo_badging_url, label: config.logo_badging_label },
        { key: 'digital', url: config.logo_digital_url, label: config.logo_digital_label },
        { key: 'media', url: config.logo_media_url, label: config.logo_media_label },
      ];

  const logoRows: LogoItem[][] = [];
  let off = 0;
  rowsConfig.forEach(cnt => {
    if (off < allLogos.length) { logoRows.push(allLogos.slice(off, off + cnt)); off += cnt; }
  });

  return (
    <>
      <div style={{ background: config.header_bg, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {config.logo_main_url
          ? <img src={config.logo_main_url} alt="logo" style={{ height: 28, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          : <span style={{ color: config.secondary_color, fontWeight: 'bold', fontSize: 12 }}>{config.event_name}</span>}
        <span style={{ color: config.secondary_color, fontWeight: 700, fontSize: 11 }}>{config.event_edition}</span>
      </div>
      <div style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
        {logoRows.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 4, justifyContent: 'center', alignItems: 'center' }}>
            {row.map(item => (
              <div key={item.key} style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                {item.url
                  ? <img src={item.url} alt={item.label} style={{ maxHeight: logoHpx, maxWidth: 70, objectFit: 'contain' }} />
                  : <div style={{ height: logoHpx, minWidth: 40, background: '#f3f4f6', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, color: '#9ca3af', padding: '0 4px' }}>{item.label}</div>}
                {item.sub && <div style={{ fontSize: 7, color: '#6b7280', fontWeight: 600 }}>{item.sub}</div>}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ background: config.primary_color, color: '#fff', padding: '5px 10px', textAlign: 'center', fontSize: 9 }}>
        <div style={{ fontWeight: 'bold' }}>{config.event_dates_display} · {config.event_location}</div>
        <div style={{ opacity: 0.7 }}>{config.event_location_detail}</div>
      </div>
    </>
  );
}

async function loadBadgeConfig(
  setConfig: React.Dispatch<React.SetStateAction<BadgeConfig>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  errorMsg: string,
): Promise<void> {
  setLoading(true);
  try {
    const { data } = await supabase.from('app_settings').select('value').eq('key', DB_KEY).maybeSingle();
    if (data?.value) {
      const parsed = JSON.parse(data.value) as Partial<BadgeConfig>;
      setConfig(prev => ({
        ...prev, ...parsed,
        program_days: (parsed.program_days ?? DEFAULT_DAYS).map(d => ({ ...d, open: false })),
      }));
    }
  } catch {
    toast.error(errorMsg);
  } finally {
    setLoading(false);
  }
}

async function saveBadgeConfig(
  config: BadgeConfig,
  setSaving: React.Dispatch<React.SetStateAction<boolean>>,
  successMsg: string,
  errorMsg: string,
): Promise<void> {
  setSaving(true);
  try {
    const toSave = { ...config, program_days: config.program_days.map(d => ({ ...d, open: undefined })) };
    await supabase.from('app_settings').upsert({ key: DB_KEY, value: JSON.stringify(toSave) }, { onConflict: 'key' });
    toast.success(successMsg);
  } catch {
    toast.error(errorMsg);
  } finally {
    setSaving(false);
  }
}

// ─── FaceDetailSection — config pour n'importe quelle face ──────────────────
function FaceDetailSection({ faceLabel, faceContent, config, set, setConfig, onNavigate }: Readonly<{
  faceLabel: string;
  faceContent: FaceContent;
  config: BadgeConfig;
  set: (field: keyof BadgeConfig) => (v: string) => void;
  setConfig: React.Dispatch<React.SetStateAction<BadgeConfig>>;
  onNavigate: (section: string) => void;
}>) {
  const navBanner = (icon: React.ReactNode, title: string, desc: string, section: string, btnLabel: string) => (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
      <div className="w-9 h-9 rounded-xl bg-white border border-indigo-100 flex items-center justify-center shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-indigo-700">{title}</p>
        <p className="text-xs text-indigo-400 mt-0.5">{desc}</p>
      </div>
      <button type="button" onClick={() => onNavigate(section)}
        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold whitespace-nowrap hover:bg-indigo-700 transition-colors">
        {btnLabel} →
      </button>
    </div>
  );

  if (faceContent === 'carte_de_visite') return (
    <SectionCard title={`${faceLabel} — Carte de visite`} icon={Tag}>
      <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
        <Info className="h-5 w-5 text-gray-400 shrink-0" />
        <div>
          <p className="text-sm font-medium text-gray-600">Zone d'insertion physique</p>
          <p className="text-xs text-gray-400 mt-0.5">Cette face est réservée pour glisser une carte de visite. Aucune configuration numérique requise.</p>
        </div>
      </div>
    </SectionCard>
  );

  if (faceContent === 'programme') return (
    <SectionCard title={`${faceLabel} — Programme`} icon={Calendar}>
      {navBanner(<Calendar className="h-4 w-4 text-indigo-500" />, 'Configuration du programme', 'Configurez les jours et sessions dans l\'onglet Programme.', 'programme', 'Aller au Programme')}
    </SectionCard>
  );

  if (faceContent === 'identite_participant') return (
    <SectionCard title={`${faceLabel} — Identité participant`} icon={Type}>
      {navBanner(<Type className="h-4 w-4 text-indigo-500" />, 'Identité participant', 'Les données (nom, société, photo, QR) sont générées automatiquement depuis l\'inscription. Configurez les textes dans Identité.', 'identite', 'Aller à Identité')}
    </SectionCard>
  );

  if (faceContent === 'partenaires') return (
    <div className="space-y-4">
      <SectionCard title={`${faceLabel} — Texte & Sélection sponsors`} icon={Layout}>
        <Field label="Texte patronage (titre de section)">
          <TextInput value={config.partners_section_title} onChange={set('partners_section_title')} />
        </Field>
        <Field label="Sponsors à afficher sur le badge" hint="Sélectionnez les partenaires et définissez leur rôle. Ordre = ordre d'affichage.">
          <SponsorPicker selected={config.featured_sponsors} onChange={sponsors => setConfig(prev => ({ ...prev, featured_sponsors: sponsors }))} />
        </Field>
        <Field label="Disposition des logos par ligne" hint="Chaque ligne peut avoir un nombre différent de logos. Exemple : Ligne 1 → 2, Ligne 2 → 3, Ligne 3 → 4.">
          <div className="space-y-2">
            {(config.partners_rows_config ?? [3, 3]).map((count, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-16 shrink-0">Ligne {idx + 1}</span>
                <div className="flex items-center gap-0 border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <button
                    type="button"
                    className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors"
                    onClick={() => {
                      const next = [...(config.partners_rows_config ?? [3, 3])];
                      next[idx] = Math.max(1, count - 1);
                      setConfig(prev => ({ ...prev, partners_rows_config: next }));
                    }}
                  >−</button>
                  <span className="w-8 text-center text-sm font-semibold text-gray-700 select-none">{count}</span>
                  <button
                    type="button"
                    className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors"
                    onClick={() => {
                      const next = [...(config.partners_rows_config ?? [3, 3])];
                      next[idx] = Math.min(8, count + 1);
                      setConfig(prev => ({ ...prev, partners_rows_config: next }));
                    }}
                  >+</button>
                </div>
                <span className="text-xs text-gray-400 flex-1">{count} logo{count > 1 ? 's' : ''}</span>
                {(config.partners_rows_config ?? [3, 3]).length > 1 && (
                  <button
                    type="button"
                    className="text-xs text-red-400 hover:text-red-600 transition-colors px-1"
                    onClick={() => {
                      const next = (config.partners_rows_config ?? [3, 3]).filter((_, i) => i !== idx);
                      setConfig(prev => ({ ...prev, partners_rows_config: next }));
                    }}
                  >✕</button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors mt-1"
              onClick={() => setConfig(prev => ({ ...prev, partners_rows_config: [...(prev.partners_rows_config ?? [3, 3]), 3] }))}
            >+ Ajouter une ligne</button>
          </div>
        </Field>
        <Field label="Hauteur des logos (mm)">
          <div className="flex items-center gap-3">
            <input
              type="range" min={6} max={25}
              value={config.partners_logo_height ?? 13}
              onChange={e => setConfig(prev => ({ ...prev, partners_logo_height: Number(e.target.value) }))}
              className="flex-1 accent-indigo-600"
            />
            <span className="text-sm font-semibold text-gray-700 w-14 text-right">{config.partners_logo_height ?? 13} mm</span>
          </div>
        </Field>
      </SectionCard>

      <SectionCard title="Logos institutionnels" icon={ImageIcon} defaultOpen={false}>
        <div className="space-y-3">
          {([
            { label: "Sous l'égide de", urlKey: 'logo_aegis_url' as const, labelKey: 'logo_aegis_label' as const },
            { label: 'Organisateur', urlKey: 'logo_organizer_url' as const, labelKey: 'logo_organizer_label' as const },
            { label: 'Organisateur délégué', urlKey: 'logo_delegate_url' as const, labelKey: 'logo_delegate_label' as const },
          ].map(({ label, urlKey, labelKey }) => (
            <div key={urlKey} className="space-y-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <Field label={`${label} — Label`}><TextInput value={config[labelKey]} onChange={set(labelKey)} placeholder={label} /></Field>
              <ImageUploadField label={`${label} — Logo`} value={config[urlKey]} onChange={set(urlKey)} bucket="media" folder="badge-assets/logos" />
            </div>
          )))}
        </div>
      </SectionCard>

      <SectionCard title="Co-Organisateurs & Partenaires officiels" icon={ImageIcon} defaultOpen={false}>
        <div className="space-y-3">
          {([1, 2, 3] as const).map(n => (
            <div key={n} className="space-y-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <Field label={`Partenaire ${n} — Label`}><TextInput value={config[`logo_sponsor_${n}_label` as keyof BadgeConfig] as string} onChange={set(`logo_sponsor_${n}_label` as keyof BadgeConfig)} placeholder="Partenaire Officiel" /></Field>
              <ImageUploadField label={`Partenaire ${n} — Logo`} value={config[`logo_sponsor_${n}_url` as keyof BadgeConfig] as string} onChange={set(`logo_sponsor_${n}_url` as keyof BadgeConfig)} bucket="media" folder="badge-assets/logos" />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Partenaires spécialisés" icon={ImageIcon} defaultOpen={false}>
        <div className="space-y-3">
          {(['badging', 'digital', 'media'] as const).map(type => {
            const LABELS: Record<string, string> = { badging: 'Badging', digital: 'Digital', media: 'Médias' };
            return (
              <div key={type} className="space-y-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <Field label={`${LABELS[type]} — Label`}><TextInput value={config[`logo_${type}_label` as keyof BadgeConfig] as string} onChange={set(`logo_${type}_label` as keyof BadgeConfig)} /></Field>
                <ImageUploadField label={`${LABELS[type]} — Logo`} value={config[`logo_${type}_url` as keyof BadgeConfig] as string} onChange={set(`logo_${type}_url` as keyof BadgeConfig)} bucket="media" folder="badge-assets/logos" />
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );

  if (faceContent === 'infos_pratiques') return (
    <SectionCard title={`${faceLabel} — Infos pratiques`} icon={Tag}>
      <Field label="Label dates du salon"><TextInput value={config.dates_label} onChange={set('dates_label')} placeholder="du 25 au 29 Novembre 2026" /></Field>
      <Field label="Horaires d'ouverture"><TextInput value={config.opening_hours} onChange={set('opening_hours')} placeholder="de 9h30 à 18h30" /></Field>
      <Field label="Adresse du lieu"><TextInput value={config.location_address} onChange={set('location_address')} placeholder="El Jadida – Parc d'Exposition Mohammed VI" /></Field>
      <Field label="Comment venir"><TextInput value={config.how_to_get_there} onChange={set('how_to_get_there')} placeholder="Accessible depuis l'autoroute A5" /></Field>
      <Field label="URL géolocalisation" hint="Un QR code sera généré automatiquement">
        <TextInput value={config.location_qr_url} onChange={set('location_qr_url')} placeholder="https://maps.google.com/..." />
        <QRPreview url={config.location_qr_url} label="QR Code Géolocalisation" />
      </Field>
      <div className="border-t border-gray-100 pt-3">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Contact</p>
        <Field label="Téléphone"><TextInput value={config.contact_phone} onChange={set('contact_phone')} placeholder="+212 5 22 86 41 41" /></Field>
        <Field label="E-mail"><TextInput value={config.contact_email} onChange={set('contact_email')} placeholder="contact@sib2026.ma" type="email" /></Field>
        <Field label="Site web"><TextInput value={config.contact_website} onChange={set('contact_website')} placeholder="www.sib2026.ma" /></Field>
      </div>
    </SectionCard>
  );

  if (faceContent === 'app_promo' || faceContent === 'image_pleine') return (
    <SectionCard title={`${faceLabel} — ${faceContent === 'app_promo' ? 'Application URBAEVENT' : 'Image pleine page'}`} icon={ImageIcon}>
      {faceContent === 'app_promo' && (
        <>
          <Field label="Slogan principal"><TextInput value={config.app_promo_title} onChange={set('app_promo_title')} /></Field>
          <Field label="Sous-titre"><TextInput value={config.app_promo_subtitle} onChange={set('app_promo_subtitle')} /></Field>
          <Field label="URL App Store" hint="QR code généré automatiquement">
            <TextInput value={config.app_store_url} onChange={set('app_store_url')} placeholder="https://apps.apple.com/..." />
            <QRPreview url={config.app_store_url} label="QR Code App Store" />
          </Field>
          <Field label="URL Google Play" hint="QR code généré automatiquement">
            <TextInput value={config.google_play_url} onChange={set('google_play_url')} placeholder="https://play.google.com/..." />
            <QRPreview url={config.google_play_url} label="QR Code Google Play" />
          </Field>
        </>
      )}
      <ImageUploadField label={faceContent === 'app_promo' ? 'Image illustration' : 'Image pleine page'} hint="Uploadez depuis votre PC ou collez une URL. Recommandé : ratio A6 portrait." value={config.app_promo_image_url} onChange={set('app_promo_image_url')} bucket="media" folder="badge-assets/phone-illustrations" />
    </SectionCard>
  );

  return null;
}

export default function AdminBadgeConfigPage() {
  const { t } = useTranslation();
  const [config, setConfig] = useState<BadgeConfig>(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewVisible, setPreviewVisible] = useState(true);
  const [previewFace, setPreviewFace] = useState<1 | 2 | 3 | 4>(2);
  const [previewAll, setPreviewAll] = useState(false);
  const [previewBadgeType, setPreviewBadgeType] = useState<'visitor' | 'exhibitor'>('visitor');
  const [activeSection, setActiveSection] = useState<string>('faces');
  const [selectedFace, setSelectedFace] = useState<1 | 2 | 3 | 4 | null>(null);

  const previewBadge = previewBadgeType === 'exhibitor' ? EXHIBITOR_PREVIEW_BADGE : PREVIEW_BADGE;

  // ── Chargement depuis app_settings ──
  const loadConfig = useCallback(() => loadBadgeConfig(setConfig, setLoading, t('admin.badge_load_error')), [t]);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  // ── Sauvegarde ──
  const handleSave = () => saveBadgeConfig(config, setSaving, t('admin.badge_saved'), t('admin.badge_save_error'));

  // ── Helpers ──
  const set = (field: keyof BadgeConfig) => (v: string) =>
    setConfig(prev => ({ ...prev, [field]: v }));

  // ── Programme : jours ──
  const toggleDay = (id: string) =>
    setConfig(prev => ({ ...prev, program_days: patchToggleDay(prev.program_days, id) }));

  // ── Auto-switch preview face selon la section active ──
  useEffect(() => {
    // Mapping section → quel type de contenu on édite
    const SECTION_CONTENT_MAP: Record<string, FaceContent | null> = {
      faces:      null,
      identite:   'identite_participant',
      validite:   'identite_participant',
      couleurs:   null,
      logos:      'partenaires',
      programme:  'programme',
      face1:      config.face1_content,
      face2:      config.face2_content,
      face3:      config.face3_content,
      face4:      'partenaires',
    };
    const targetContent = SECTION_CONTENT_MAP[activeSection];
    if (targetContent === null || targetContent === undefined) {
      // Pour 'faces' et 'couleurs', afficher la vue A4 complète
      if (activeSection === 'faces' || activeSection === 'couleurs') {
        setPreviewAll(true);
      }
      return;
    }
    setPreviewAll(false);
    // Chercher quelle face contient ce contenu
    const faceWithContent = ([1, 2, 3, 4] as const).find(
      n => config[`face${n}_content` as keyof BadgeConfig] === targetContent,
    );
    if (faceWithContent) {
      setPreviewFace(faceWithContent);
    }
  }, [activeSection, config.face1_content, config.face2_content, config.face3_content, config.face4_content]);

  const updateDay = (id: string, field: keyof Omit<BadgeDayProgram, 'sessions' | 'open' | 'id'>, value: string) =>
    setConfig(prev => ({ ...prev, program_days: patchUpdateDay(prev.program_days, id, field, value) }));

  const updateSession = (dayId: string, sIdx: number, field: keyof BadgeSession, value: string) =>
    setConfig(prev => ({ ...prev, program_days: patchUpdateSession(prev.program_days, dayId, sIdx, field, value) }));

  const addSession = (dayId: string) =>
    setConfig(prev => ({ ...prev, program_days: patchAddSession(prev.program_days, dayId) }));

  const removeSession = (dayId: string, sIdx: number) =>
    setConfig(prev => ({ ...prev, program_days: patchRemoveSession(prev.program_days, dayId, sIdx) }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  const NAV_ITEMS = [
    { id: 'faces',      Icon: Layout,    label: 'Faces',     color: '#6366f1' },
    { id: 'identite',   Icon: Type,      label: 'Identité',  color: '#60a5fa' },
    { id: 'validite',   Icon: FileText,  label: 'Validité',  color: '#c084fc' },
    { id: 'couleurs',   Icon: Palette,   label: 'Couleurs',  color: '#f472b6' },
    { id: 'logos',      Icon: ImageIcon, label: 'Logos',     color: '#34d399' },
    { id: 'programme',  Icon: Calendar,  label: 'Prog.',     color: '#fb923c' },
    { id: 'face1',      Icon: Tag,       label: 'Face 1',    color: '#67e8f9' },
    { id: 'face2',      Icon: Layers,    label: 'Face 2',    color: '#a78bfa' },
    { id: 'face3',      Icon: Tag,       label: 'Face 3',    color: '#f9a8d4' },
    { id: 'face4',      Icon: Eye,       label: 'Sponsors',  color: '#fbbf24' },
  ] as const;

  const ALL_FACE_OPTS = [
    { v: 'identite_participant' as FaceContent, icon: '🪪', label: 'Identité',        desc: 'Photo · Nom · Société · QR badge' },
    { v: 'carte_de_visite'      as FaceContent, icon: '💳', label: 'Carte de visite', desc: "Zone d'insertion carte de visite" },
    { v: 'programme'            as FaceContent, icon: '📅', label: 'Programme',        desc: 'Planning des 5 jours du salon' },
    { v: 'infos_pratiques'      as FaceContent, icon: '📋', label: 'Infos pratiques',  desc: 'Dates · Horaires · Lieu · Contact · QR' },
    { v: 'app_promo'            as FaceContent, icon: '📱', label: 'App URBAEVENT',    desc: 'Slogan + QR App Store & Play Store' },
    { v: 'image_pleine'         as FaceContent, icon: '🖼️', label: 'Image pleine',     desc: "Image d'illustration full bleed" },
    { v: 'partenaires'          as FaceContent, icon: '🏆', label: 'Partenaires',      desc: 'Sponsors sélectionnés depuis la DB' },
  ];

  const FACE_CELLS = [
    { face: 4 as const, pos: 'haut-gauche', field: 'face4_content' as const, opts: ALL_FACE_OPTS },
    { face: 1 as const, pos: 'haut-droite', field: 'face1_content' as const, opts: ALL_FACE_OPTS },
    { face: 2 as const, pos: 'bas-gauche',  field: 'face2_content' as const, opts: ALL_FACE_OPTS },
    { face: 3 as const, pos: 'bas-droite',  field: 'face3_content' as const, opts: ALL_FACE_OPTS },
  ] as const;

  return (
    <div className="flex flex-col bg-gray-50 h-[calc(100dvh-4rem)] sm:h-[calc(100dvh-5rem)] xl:h-[calc(100dvh-7rem)]">
      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <header className="shrink-0 flex items-center justify-between px-5 border-b bg-white" style={{ height: 52, borderColor: '#e5e7eb' }}>
        <div className="flex items-center gap-3">
          <Link to={ROUTES.ADMIN_DASHBOARD} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors text-xs">
            <ArrowLeft className="w-3.5 h-3.5" /> {t('common.back_to_dashboard')}
          </Link>
          <div className="h-3.5 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
              <Layout className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-gray-900">Badge A4</span>
              <span className="text-[11px] text-gray-400 ml-2">SIB 2026 · Bifold</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setPreviewVisible(v => !v)} className="flex items-center gap-1.5 px-3 h-7 rounded-lg text-xs border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-colors">
            {previewVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {previewVisible ? t('admin.badge_hide_preview') : t('admin.badge_show_preview')}
          </button>
          <button type="button" onClick={loadConfig} title="Réinitialiser" className="flex items-center justify-center w-7 h-7 rounded-lg border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 transition-colors">
            <RefreshCw className="h-3 w-3" />
          </button>
          <Button onClick={handleSave} disabled={saving} className="gap-1.5 text-xs font-bold h-7 px-4 bg-indigo-600 hover:bg-indigo-700 text-white border-0" style={{ boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}>
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            {t('common.save')}
          </Button>
        </div>
      </header>

      {/* ══ HERO STRIPE ══════════════════════════════════════════════════════ */}
      <div className="shrink-0 relative overflow-hidden border-b bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800" style={{ borderColor: '#4338ca' }}>
        <div className="relative flex items-center gap-6 px-5 py-2.5">
          <div>
            <h2 className="text-base font-black text-white tracking-tight">{config.event_name}</h2>
            <p className="text-[11px] text-indigo-200">{config.event_edition} · {config.event_dates_display} · {config.event_location}</p>
          </div>
          <div className="flex gap-1.5">
            {([
              { label: 'F4', content: config.face4_content },
              { label: 'F1', content: config.face1_content },
              { label: 'F2', content: config.face2_content },
              { label: 'F3', content: config.face3_content },
            ] as const).map(({ label, content }) => {
              const ICONS: Record<string, string> = { infos_pratiques: '📋', app_promo: '📱', image_pleine: '🖼️', carte_de_visite: '💳', programme: '📅', identite_participant: '🪪', partenaires: '🏆' };
              return (
                <div key={label} className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/20 border border-white/30 text-white">
                  <span>{ICONS[content] ?? '?'}</span>
                  <span>{label}</span>
                </div>
              );
            })}
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-[10px] text-indigo-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Live
          </div>
        </div>
      </div>

      {/* ══ 3-PANEL LAYOUT ═══════════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ──── SIDEBAR ──────────────────────────────────────────────────── */}
        <nav className="shrink-0 flex flex-col gap-1 py-3 px-2 border-r overflow-y-auto bg-white" style={{ width: 68, borderColor: '#e5e7eb' }}>
          {NAV_ITEMS.map(({ id, Icon, label, color }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSection(id)}
              title={label}
              className="flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all duration-150"
              style={{
                background: activeSection === id ? '#eef2ff' : 'transparent',
                border: activeSection === id ? '1px solid #c7d2fe' : '1px solid transparent',
              }}
            >
              <Icon className="h-4 w-4" style={{ color: activeSection === id ? '#6366f1' : '#9ca3af' }} />
              <span className="text-[9px] font-semibold leading-none" style={{ color: activeSection === id ? '#6366f1' : '#9ca3af' }}>{label}</span>
            </button>
          ))}
        </nav>

        {/* ──── CENTER PANEL ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">

            {/* ══ FACES ═════════════════════════════════════════════════════ */}
            {activeSection === 'faces' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">Configuration des 4 faces</h3>
                  <p className="text-xs text-gray-400">Cliquez sur une face pour choisir son contenu. Le badge A4 se plie en 2 — 4 faces visibles.</p>
                </div>
                <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                  {/* A4 label */}
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded flex items-center justify-center bg-indigo-100 border border-indigo-200">
                        <span className="text-[8px] font-black text-indigo-600">A4</span>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">Badge bifold — vue déplié</span>
                    </div>
                    <span className="text-[10px] text-gray-400">210 × 297 mm</span>
                  </div>
                  {/* 2×2 face grid */}
                  <div className="grid grid-cols-2 gap-px bg-gray-100">
                    {FACE_CELLS.map(({ face, pos, field, opts }) => {
                      const currentVal = config[field] as string;
                      const currentOpt = opts.find(o => o.v === currentVal) ?? opts[0];
                      const isSel = selectedFace === face;
                      return (
                        <button
                          key={face}
                          type="button"
                          onClick={() => setSelectedFace(isSel ? null : face)}
                          className="relative group flex flex-col p-4 text-left transition-all duration-200 bg-white hover:bg-gray-50"
                          style={{ minHeight: 96, background: isSel ? '#eef2ff' : undefined }}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 transition-all" style={{ background: isSel ? '#6366f1' : '#e0e7ff', color: isSel ? '#fff' : '#6366f1' }}>
                              {face}
                            </div>
                            <span className="text-[10px] text-gray-400">{pos}</span>
                            {isSel && <span className="ml-auto text-[10px] font-semibold text-indigo-500">modifier ↓</span>}
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl leading-none">{currentOpt.icon}</span>
                            <span className="text-xs font-bold text-gray-700">{currentOpt.label}</span>
                          </div>
                          {isSel && <div className="absolute inset-0 border-2 border-indigo-400 rounded-sm pointer-events-none" />}
                        </button>
                      );
                    })}
                  </div>
                  {/* Options for selected face */}
                  {selectedFace !== null && (() => {
                    const cell = FACE_CELLS.find(c => c.face === selectedFace);
                    if (!cell) return null;
                    const currentVal = config[cell.field] as string;
                    return (
                      <div className="border-t border-indigo-100 px-4 py-4 bg-indigo-50">
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3">Face {selectedFace} — contenu</p>
                        <div className="grid grid-cols-2 gap-2">
                          {cell.opts.map(opt => {
                            const isAct = currentVal === opt.v;
                            return (
                              <button
                                key={opt.v}
                                type="button"
                                onClick={() => setConfig(prev => ({ ...prev, [cell.field]: opt.v }))}
                                className="flex items-start gap-2.5 p-3 rounded-xl text-left transition-all border"
                                style={{ background: isAct ? '#eef2ff' : '#fff', borderColor: isAct ? '#818cf8' : '#e5e7eb' }}
                              >
                                <span className="text-xl mt-0.5 shrink-0 leading-none">{opt.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold truncate" style={{ color: isAct ? '#6366f1' : '#374151' }}>{opt.label}</div>
                                  <div className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{opt.desc}</div>
                                </div>
                                {isAct && <div className="w-4 h-4 rounded-full shrink-0 mt-0.5 flex items-center justify-center bg-indigo-500"><span className="text-[9px] font-black text-white">✓</span></div>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* ══ IDENTITÉ ══════════════════════════════════════════════════ */}
            {activeSection === 'identite' && (
              <SectionCard title="Identité de l'événement" icon={Type}>
                <Field label="Nom du salon"><TextInput value={config.event_name} onChange={set('event_name')} placeholder="SIB 2026" /></Field>
                <Field label="Édition"><TextInput value={config.event_edition} onChange={set('event_edition')} placeholder="1ère édition" /></Field>
                <Field label="Dates affichées sur le badge"><TextInput value={config.event_dates_display} onChange={set('event_dates_display')} placeholder="25 – 29 Novembre 2026" /></Field>
                <Field label="Ville / Pays"><TextInput value={config.event_location} onChange={set('event_location')} placeholder="El Jadida, Maroc" /></Field>
                <Field label="Lieu détaillé"><TextInput value={config.event_location_detail} onChange={set('event_location_detail')} placeholder="Parc d'Exposition Mohammed VI" /></Field>
              </SectionCard>
            )}

            {/* ══ VALIDITÉ ══════════════════════════════════════════════════ */}
            {activeSection === 'validite' && (
              <SectionCard title="Texte de validité du badge" icon={FileText}>
                <Field label="Texte français" hint="Apparaît en bandeau noir sur le badge">
                  <textarea value={config.badge_validity_text_fr} onChange={e => set('badge_validity_text_fr')(e.target.value)} rows={2} className="w-full rounded-lg px-3 py-2 text-sm text-gray-800 bg-white border border-gray-200 focus:outline-none focus:border-indigo-400 resize-none" />
                </Field>
                <Field label="Texte anglais">
                  <textarea value={config.badge_validity_text_en} onChange={e => set('badge_validity_text_en')(e.target.value)} rows={2} className="w-full rounded-lg px-3 py-2 text-sm text-gray-800 bg-white border border-gray-200 focus:outline-none focus:border-indigo-400 resize-none" />
                </Field>
              </SectionCard>
            )}

            {/* ══ COULEURS ══════════════════════════════════════════════════ */}
            {activeSection === 'couleurs' && (
              <SectionCard title="Palette de couleurs" icon={Palette}>
                <div className="flex gap-2 mb-4 p-3 rounded-xl border border-gray-100 bg-gray-50">
                  {[
                    { c: config.primary_color, l: 'Principal' },
                    { c: config.secondary_color, l: 'Secondaire' },
                    { c: config.header_bg, l: 'Header' },
                    { c: config.accent_color, l: 'Accent' },
                    { c: config.text_dark, l: 'Texte' },
                  ].map(({ c, l }) => (
                    <div key={l} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full h-7 rounded-lg border border-gray-200 shadow-inner" style={{ background: c }} />
                      <span className="text-[9px] text-gray-400">{l}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <ColorInput label="Couleur primaire (navy)" value={config.primary_color} onChange={set('primary_color')} />
                  <ColorInput label="Couleur secondaire (or)" value={config.secondary_color} onChange={set('secondary_color')} />
                  <ColorInput label="Fond en-tête" value={config.header_bg} onChange={set('header_bg')} />
                  <ColorInput label="Couleur accent (vert)" value={config.accent_color} onChange={set('accent_color')} />
                  <ColorInput label="Texte foncé" value={config.text_dark} onChange={set('text_dark')} />
                </div>
              </SectionCard>
            )}

            {/* ══ LOGOS ═════════════════════════════════════════════════════ */}
            {activeSection === 'logos' && (
              <SectionCard title="Logos & Images" icon={ImageIcon}>
                <ImageUploadField label="Logo principal" hint="ex: /logo-sib2026.png ou URL Supabase Storage" value={config.logo_main_url} onChange={set('logo_main_url')} bucket="media" folder="badge-assets/logos" />
                <ImageUploadField label="Logo Ministère" value={config.logo_ministry_url} onChange={set('logo_ministry_url')} bucket="media" folder="badge-assets/logos" />
                <div className="border-t border-gray-100 pt-3 space-y-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Organisateurs (face 4)</p>
                  {[
                    { label: "Sous l'égide de", urlKey: 'logo_aegis_url' as const, labelKey: 'logo_aegis_label' as const },
                    { label: 'Organisateur', urlKey: 'logo_organizer_url' as const, labelKey: 'logo_organizer_label' as const },
                    { label: 'Organisateur délégué', urlKey: 'logo_delegate_url' as const, labelKey: 'logo_delegate_label' as const },
                  ].map(({ label, urlKey, labelKey }) => (
                    <div key={urlKey} className="space-y-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <Field label={`${label} — Label`}><TextInput value={config[labelKey]} onChange={set(labelKey)} placeholder={label} /></Field>
                      <ImageUploadField label={`${label} — Logo`} value={config[urlKey]} onChange={set(urlKey)} bucket="media" folder="badge-assets/logos" />
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-3 space-y-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Co-Organisateurs & Sponsors</p>
                  {([1, 2, 3] as const).map(n => (
                    <div key={n} className="space-y-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <Field label={`Partenaire ${n} — Label`}><TextInput value={config[`logo_sponsor_${n}_label` as keyof BadgeConfig] as string} onChange={set(`logo_sponsor_${n}_label` as keyof BadgeConfig)} placeholder="Partenaire Officiel" /></Field>
                      <ImageUploadField label={`Partenaire ${n} — Logo`} value={config[`logo_sponsor_${n}_url` as keyof BadgeConfig] as string} onChange={set(`logo_sponsor_${n}_url` as keyof BadgeConfig)} bucket="media" folder="badge-assets/logos" />
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-3 space-y-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Partenaires spécialisés</p>
                  {(['badging', 'digital', 'media'] as const).map(type => (
                    <div key={type} className="space-y-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <Field label={`${TYPE_LABELS[type]} — Label`}><TextInput value={config[`logo_${type}_label` as keyof BadgeConfig] as string} onChange={set(`logo_${type}_label` as keyof BadgeConfig)} /></Field>
                      <ImageUploadField label={`${TYPE_LABELS[type]} — Logo`} value={config[`logo_${type}_url` as keyof BadgeConfig] as string} onChange={set(`logo_${type}_url` as keyof BadgeConfig)} bucket="media" folder="badge-assets/logos" />
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* ══ PROGRAMME ═════════════════════════════════════════════════ */}
            {activeSection === 'programme' && (
              <SectionCard title="Programme — 5 jours du salon" icon={Calendar}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-600">Afficher le programme sur le badge</span>
                  <button type="button" onClick={() => set('show_program_on_badge')(config.show_program_on_badge === 'true' ? 'false' : 'true')} aria-label="Toggle programme" className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${config.show_program_on_badge === 'true' ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${config.show_program_on_badge === 'true' ? 'translate-x-4' : 'translate-x-1'}`} />
                  </button>
                </div>
                {/* Mode de densité du programme */}
                <div className="mb-4 p-3 rounded-xl border border-gray-200 bg-gray-50">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">Densité d'affichage sur le badge</p>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { v: 'false', label: 'Normal',  desc: '3 sessions/jour · texte 2.8mm',  icon: '📄' },
                      { v: 'small', label: 'Compact',  desc: 'Toutes sessions · texte 2.3mm', icon: '📃' },
                      { v: 'mini',  label: 'Mini',     desc: 'Toutes sessions · texte 1.9mm', icon: '🔬' },
                    ] as const).map(({ v, label, desc, icon }) => {
                      const isAct = config.program_compact_mode === v;
                      return (
                        <button key={v} type="button" onClick={() => set('program_compact_mode')(v)}
                          className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all border text-center"
                          style={{ background: isAct ? '#eef2ff' : '#fff', borderColor: isAct ? '#818cf8' : '#e5e7eb' }}>
                          <span className="text-base leading-none">{icon}</span>
                          <span className="text-[11px] font-bold" style={{ color: isAct ? '#6366f1' : '#374151' }}>{label}</span>
                          <span className="text-[9px] text-gray-400 leading-tight">{desc}</span>
                          {isAct && <span className="text-[8px] font-black text-indigo-500">✓ actif</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {config.program_days.map((day) => (
                  <div key={day.id} className="rounded-xl overflow-hidden border border-gray-200">
                    <button type="button" onClick={() => toggleDay(day.id)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors bg-white">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                        <span className="text-sm font-semibold text-gray-800">{day.label}</span>
                        <span className="text-xs text-gray-400">({day.sessions.length} sessions)</span>
                      </div>
                      {day.open ? <ChevronUp className="h-3.5 w-3.5 text-gray-400" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400" />}
                    </button>
                    {day.open && (
                      <div className="px-4 pb-4 space-y-3 bg-gray-50 border-t border-gray-100">
                        <Field label="Intitulé du jour"><TextInput value={day.label} onChange={v => updateDay(day.id, 'label', v)} placeholder="Mardi 25 Novembre 2026" /></Field>
                        <div className="space-y-2">
                          {day.sessions.map((session, sIdx) => (
                            <div key={`${day.id}-s${sIdx}`} className="p-3 rounded-lg bg-white border border-gray-100 space-y-2">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-gray-400 shrink-0" />
                                <input type="text" value={session.time} onChange={e => updateSession(day.id, sIdx, 'time', e.target.value)} placeholder="09:00 – 10:30" className="w-36 rounded px-2 py-1 text-xs text-gray-800 bg-white border border-gray-200 focus:outline-none focus:border-indigo-400 font-mono" />
                                <select value={session.type} onChange={e => updateSession(day.id, sIdx, 'type', e.target.value)} className="rounded px-2 py-1 text-xs bg-white border border-gray-200 text-gray-700 focus:outline-none">
                                  {SESSION_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                                <button type="button" onClick={() => removeSession(day.id, sIdx)} className="ml-auto p-1 rounded text-red-400 hover:bg-red-50 transition-colors" title="Supprimer"><Trash2 className="h-3.5 w-3.5" /></button>
                              </div>
                              <input type="text" value={session.title} onChange={e => updateSession(day.id, sIdx, 'title', e.target.value)} placeholder="Titre de la session" className="w-full rounded px-2 py-1.5 text-xs text-gray-800 bg-white border border-gray-200 focus:outline-none focus:border-indigo-400" />
                            </div>
                          ))}
                        </div>
                        <button type="button" onClick={() => addSession(day.id)} className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 transition-colors py-1"><Plus className="h-3.5 w-3.5" />Ajouter une session</button>
                      </div>
                    )}
                  </div>
                ))}
              </SectionCard>
            )}

            {/* ══ FACE 1 DÉTAIL ═════════════════════════════════════════════ */}
            {activeSection === 'face1' && (
              <FaceDetailSection faceLabel="Face 1" faceContent={config.face1_content} config={config} set={set} setConfig={setConfig} onNavigate={setActiveSection} />
            )}

            {/* ══ FACE 2 DÉTAIL ═════════════════════════════════════════════ */}
            {activeSection === 'face2' && (
              <FaceDetailSection faceLabel="Face 2" faceContent={config.face2_content} config={config} set={set} setConfig={setConfig} onNavigate={setActiveSection} />
            )}

            {/* ══ FACE 3 DÉTAIL ═════════════════════════════════════════════ */}
            {activeSection === 'face3' && (
              <FaceDetailSection faceLabel="Face 3" faceContent={config.face3_content} config={config} set={set} setConfig={setConfig} onNavigate={setActiveSection} />
            )}

            {/* ══ FACE 4 SPONSORS ═══════════════════════════════════════════ */}
            {activeSection === 'face4' && (
              <FaceDetailSection faceLabel="Face 4" faceContent={config.face4_content} config={config} set={set} setConfig={setConfig} onNavigate={setActiveSection} />
            )}

          </div>
        </div>

        {/* ──── RIGHT PANEL : PREVIEW ─────────────────────────────────────── */}
        {previewVisible && (
          <aside className="shrink-0 border-l flex flex-col overflow-hidden bg-white" style={{ width: 720, borderColor: '#e5e7eb' }}>
            <div className="px-4 py-3 border-b shrink-0 space-y-2" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex items-center gap-2">
                <Eye className="h-3.5 w-3.5 text-indigo-500" />
                <span className="text-xs font-bold text-gray-700">{t('admin.badge_preview_realtime')}</span>
                <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  LIVE
                </div>
              </div>
              {/* Toggle visiteur / exposant */}
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewBadgeType('visitor')}
                  className="flex-1 py-1 text-[11px] font-bold rounded-lg transition-all"
                  style={{ background: previewBadgeType === 'visitor' ? '#1e3a5f' : '#f3f4f6', color: previewBadgeType === 'visitor' ? '#fff' : '#6b7280' }}
                >
                  👤 Visiteur
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBadgeType('exhibitor')}
                  className="flex-1 py-1 text-[11px] font-bold rounded-lg transition-all"
                  style={{ background: previewBadgeType === 'exhibitor' ? '#16a34a' : '#f3f4f6', color: previewBadgeType === 'exhibitor' ? '#fff' : '#6b7280' }}
                >
                  🏢 Exposant
                </button>
              </div>
              <div className="flex gap-1">
                {([1, 2, 3, 4] as const).map(f => (
                  <button key={f} type="button" onClick={() => { setPreviewFace(f); setPreviewAll(false); }} className="flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all" style={{ background: !previewAll && previewFace === f ? '#6366f1' : '#f3f4f6', color: !previewAll && previewFace === f ? '#fff' : '#6b7280' }}>
                    F{f}
                  </button>
                ))}
                <button type="button" onClick={() => setPreviewAll(v => !v)} className="px-2.5 py-1.5 text-[11px] font-black rounded-lg transition-all" style={{ background: previewAll ? '#6366f1' : '#f3f4f6', color: previewAll ? '#fff' : '#6b7280' }}>
                  A4
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <BadgePreviewContent config={config} previewAll={previewAll} previewFace={previewFace} badge={previewBadge} />
            </div>
            <div className="shrink-0 border-t p-3 bg-white" style={{ borderColor: '#e5e7eb' }}>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { l: 'Salon', v: config.event_name },
                  { l: 'Édition', v: config.event_edition },
                  { l: 'Sessions', v: `${config.program_days.reduce((a, d) => a + d.sessions.length, 0)}` },
                  { l: 'Sponsors', v: `${config.featured_sponsors?.length ?? 0}` },
                ].map(({ l, v }) => (
                  <div key={l} className="px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="text-[9px] text-gray-400 uppercase tracking-wider">{l}</div>
                    <div className="text-xs font-semibold text-gray-700 mt-0.5 truncate">{v || '—'}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
