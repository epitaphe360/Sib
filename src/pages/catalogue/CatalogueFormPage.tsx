import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2, MapPin, User, Tag, Globe,
  ChevronRight, ChevronLeft, CheckCircle, Loader2, AlertCircle,
  Facebook, Instagram, Linkedin, Twitter, Youtube, Send, Mail,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import ImageUploader from "../../components/ui/upload/ImageUploader";
import { CatalogueFicheCard } from "../../components/catalogue/CatalogueFicheCard";
import type { CatalogueEntry } from "../../components/catalogue/CatalogueFicheCard";

// ─── Config ───────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, title: "Identification", icon: Building2, desc: "Société, logo, stand" },
  { id: 2, title: "Coordonnées",    icon: MapPin,    desc: "Adresse & contacts"   },
  { id: 3, title: "Représentant",   icon: User,      desc: "Contact au SIB"       },
  { id: 4, title: "Activité",       icon: Tag,       desc: "Produits & services"  },
  { id: 5, title: "Réseaux",        icon: Globe,     desc: "Social & aperçu"      },
];

const HALLS   = ["A","B","C","D","E","Plein air"];
const SECTORS = [
  "Bâtiment & Gros Œuvre","Matériaux de Construction","Menuiserie & Boiserie",
  "Carrelage & Revêtements","Plomberie & Sanitaires","Climatisation & Ventilation",
  "Électricité & Domotique","Peintures & Finitions","Isolation & Étanchéité",
  "Équipements Industriels","Quincaillerie & Outillage","Architecture & Design",
  "Immobilier & Promotion","Services & Ingénierie","Autre",
];
const TITLES  = [
  "Directeur Général","PDG","DGA","Directeur Commercial","Directeur Technique",
  "Responsable Export","Chef de Projet","Manager","Autre",
];
const REQUIRED: Record<number, (keyof CatalogueEntry)[]> = {
  1: ["company_name"],
  2: ["phone","email"],
  3: ["contact_name","contact_title"],
  4: ["activity_description"],
  5: [],
};

// ─── Dynamic field config (loaded from DB) ────────────────────────────────────

interface FieldConfig { label: string; placeholder: string; required: boolean; visible: boolean; }
type FormConfig = Record<string, FieldConfig>;

const DEFAULT_CONFIG: FormConfig = {
  logo_url:               { label: "Logo de l'entreprise",             placeholder: "",                                 required: false, visible: true },
  company_name:           { label: "Raison sociale",                   placeholder: "Nom officiel de l'entreprise",    required: true,  visible: true },
  sector:                 { label: "Secteur d'activité",              placeholder: "",                                 required: false, visible: true },
  stand_number:           { label: "N° Stand",                         placeholder: "Ex : 17-A",                        required: false, visible: true },
  hall:                   { label: "Hall / Pavillon",                   placeholder: "",                                 required: false, visible: true },
  country_flag:           { label: "Nationalité (code ISO 2 lettres)",  placeholder: "MA  FR  IT…",                      required: false, visible: true },
  address:                { label: "Adresse",                           placeholder: "Zone Industrielle, Rue, N°…",     required: false, visible: true },
  zip_code:               { label: "Code postal",                       placeholder: "20000",                            required: false, visible: true },
  city:                   { label: "Ville",                             placeholder: "Casablanca",                       required: false, visible: true },
  country:                { label: "Pays",                              placeholder: "Maroc",                            required: false, visible: true },
  phone:                  { label: "Téléphone",                         placeholder: "+212 5 22 00 00 00",               required: true,  visible: true },
  fax:                    { label: "Fax",                               placeholder: "+212 5 22 00 00 01",               required: false, visible: true },
  gsm:                    { label: "GSM / Mobile",                      placeholder: "+212 6 00 00 00 00",               required: false, visible: true },
  email:                  { label: "Email",                             placeholder: "contact@entreprise.ma",            required: true,  visible: true },
  website:                { label: "Site web",                          placeholder: "https://www.entreprise.ma",        required: false, visible: true },
  contact_name:           { label: "Nom & Prénom",                      placeholder: "Mme / M. Prénom NOM",              required: true,  visible: true },
  contact_title:          { label: "Titre / Fonction",                   placeholder: "",                                 required: true,  visible: true },
  contact_direct_phone:   { label: "Tél. direct",                       placeholder: "+212 6 …",                         required: false, visible: true },
  contact_direct_email:   { label: "Email direct",                      placeholder: "nom@entreprise.ma",                required: false, visible: true },
  activity_description:   { label: "Description de l'activité",         placeholder: "Décrivez l'activité principale…", required: true,  visible: true },
  products_services:      { label: "Produits / Services exposés au SIB", placeholder: "Liste des produits ou services…",  required: false, visible: true },
  brands_represented:     { label: "Marques représentées",              placeholder: "MARQUE A, MARQUE B, MARQUE C",     required: false, visible: true },
  products_origin_country:{ label: "Pays d'origine des produits",       placeholder: "Maroc, France, Italie…",           required: false, visible: true },
  facebook_url:           { label: "Facebook",                          placeholder: "https://facebook.com/…",           required: false, visible: true },
  instagram_url:          { label: "Instagram",                         placeholder: "https://instagram.com/…",          required: false, visible: true },
  linkedin_url:           { label: "LinkedIn",                          placeholder: "https://linkedin.com/company/…",   required: false, visible: true },
  twitter_url:            { label: "X / Twitter",                       placeholder: "https://x.com/…",                  required: false, visible: true },
  youtube_url:            { label: "YouTube",                           placeholder: "https://youtube.com/@…",           required: false, visible: true },
};

const FIELD_STEPS: Record<string, number> = {
  logo_url: 1, company_name: 1, sector: 1, stand_number: 1, hall: 1, country_flag: 1,
  address: 2, zip_code: 2, city: 2, country: 2, phone: 2, fax: 2, gsm: 2, email: 2, website: 2,
  contact_name: 3, contact_title: 3, contact_direct_phone: 3, contact_direct_email: 3,
  activity_description: 4, products_services: 4, brands_represented: 4, products_origin_country: 4,
  facebook_url: 5, instagram_url: 5, linkedin_url: 5, twitter_url: 5, youtube_url: 5,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcPct(d: Partial<CatalogueEntry>): number {
  const keys: (keyof CatalogueEntry)[] = [
    "company_name","logo_url","sector","stand_number","hall",
    "address","city","country","phone","email",
    "contact_name","contact_title","activity_description","brands_represented",
  ];
  const n = keys.filter((k) => { const v = d[k]; return v != null && String(v).trim() !== ""; }).length;
  return Math.round((n / keys.length) * 100);
}

// ─── ProgressRing ─────────────────────────────────────────────────────────────

function ProgressRing({ pct }: { pct: number }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <circle cx="48" cy="48" r={r} fill="none" stroke="#C9A84C" strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct / 100)}
          style={{ transition: "stroke-dashoffset 0.7s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-white leading-none">{pct}</span>
        <span className="text-[10px] text-[#C9A84C] font-bold tracking-wider mt-0.5">%</span>
      </div>
    </div>
  );
}

// ─── Field sub-components ─────────────────────────────────────────────────────

const I  = "w-full px-4 py-3 border-2 border-slate-100 rounded-2xl text-sm bg-white text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#C9A84C] hover:border-slate-200 transition-all";
const L  = "block text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-1.5";

function Inp({ label, req, ...p }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; req?: boolean }) {
  return (
    <div>
      <label className={L}>{label}{req && <span className="text-[#C9A84C] ml-0.5">*</span>}</label>
      <input {...p} className={I} />
    </div>
  );
}
function Sel({ label, req, children, ...p }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; req?: boolean }) {
  return (
    <div>
      <label className={L}>{label}{req && <span className="text-[#C9A84C] ml-0.5">*</span>}</label>
      <select {...p} className={I + " cursor-pointer"}>{children}</select>
    </div>
  );
}
function Txt({ label, req, ...p }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; req?: boolean }) {
  return (
    <div>
      <label className={L}>{label}{req && <span className="text-[#C9A84C] ml-0.5">*</span>}</label>
      <textarea {...p} className={I + " resize-none"} />
    </div>
  );
}
function SocialField({ icon: Icon, bg, label, field, value, onChange, onBlur }: {
  icon: React.ComponentType<{className?: string}>;
  bg: string; label: string; field: keyof CatalogueEntry;
  value: string; onChange: (f: keyof CatalogueEntry, v: string) => void; onBlur: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${bg} shadow-md`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <label className={L}>{label}</label>
        <input type="text" className={I} value={value} placeholder="https://..."
          onChange={(e) => onChange(field, e.target.value)} onBlur={onBlur} />
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function CatalogueFormPage() {
  const { token } = useParams<{ token: string }>();
  const [entry,     setEntry]     = useState<CatalogueEntry | null>(null);
  const [form,      setForm]      = useState<Partial<CatalogueEntry>>({});
  const [step,      setStep]      = useState(1);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [submitting,setSubmitting]= useState(false);
  const [invalid,   setInvalid]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [config,    setConfig]    = useState<FormConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    if (!token) { setInvalid(true); setLoading(false); return; }
    supabase.from("catalogue_entries").select("*").eq("token", token).maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) setInvalid(true);
        else {
          setEntry(data as CatalogueEntry);
          setForm(data as Partial<CatalogueEntry>);
          if (data.status === "completed" || data.status === "validated") setSubmitted(true);
        }
        setLoading(false);
      });
  }, [token]);

  // Charger la config des champs depuis la DB (labels, required, visible)
  useEffect(() => {
    (supabase as any).from("catalogue_form_fields")
      .select("field_key,label,placeholder,required,visible")
      .then(({ data }: { data: Array<{ field_key: string; label: string; placeholder: string; required: boolean; visible: boolean }> | null }) => {
        if (data) {
          setConfig((prev) => {
            const c = { ...prev };
            data.forEach((f) => { c[f.field_key] = { label: f.label, placeholder: f.placeholder, required: f.required, visible: f.visible }; });
            return c;
          });
        }
      });
  }, []);

  const save = useCallback(async (f: Partial<CatalogueEntry>) => {
    if (!entry?.id) return;
    setSaving(true);
    const pct = calcPct(f);
    const status = pct >= 100 ? "completed" : pct > 0 ? "in_progress" : "invited";
    await supabase.from("catalogue_entries").update({
      ...f, completion_percent: pct, status,
      ...(pct >= 100 && !entry.completed_at ? { completed_at: new Date().toISOString() } : {}),
    }).eq("id", entry.id);
    setSaving(false);
  }, [entry]);

  const set  = (k: keyof CatalogueEntry, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const blur = () => save(form);
  const fc = (key: string) => config[key] ?? DEFAULT_CONFIG[key] ?? { label: key, placeholder: "", required: false, visible: true };
  const canNext = () => Object.entries(config)
    .filter(([key, c]) => c.required && c.visible && FIELD_STEPS[key] === step)
    .every(([key]) => { const v = (form as any)[key]; return v != null && String(v).trim() !== ""; });
  const next = async () => { await save(form); if (step < 5) setStep((s) => s + 1); };
  const prev = () => { if (step > 1) setStep((s) => s - 1); };
  const submit = async () => {
    setSubmitting(true);
    await supabase.from("catalogue_entries").update({
      ...form, status: "completed",
      completed_at: new Date().toISOString(),
      completion_percent: calcPct(form),
    }).eq("id", entry!.id);
    toast.success("Fiche envoyée avec succès !");
    setSubmitted(true);
    setSubmitting(false);
  };

  const pct     = calcPct(form);
  const CurIcon = STEPS[step - 1].icon;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#0B1C3D] flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-white/10 border-t-[#C9A84C] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/40 text-sm">Chargement…</p>
      </div>
    </div>
  );

  // ── Token invalide ────────────────────────────────────────────────────────
  if (invalid) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center border border-slate-100">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="h-8 w-8 text-red-400" />
        </div>
        <h1 className="text-xl font-black text-slate-900 mb-2">Lien invalide</h1>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">Ce lien est invalide ou a expiré. Contactez l'équipe SIB 2026 pour en obtenir un nouveau.</p>
        <a href="mailto:Sib2026@urbacom.net"
          className="inline-flex items-center gap-2 bg-[#0B1C3D] text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-[#162d5e] transition">
          <Mail className="w-4 h-4" /> Contacter l'équipe
        </a>
      </div>
    </div>
  );

  // ── Fiche déjà soumise ────────────────────────────────────────────────────
  if (submitted) return (
    <div className="min-h-screen bg-[#0B1C3D] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <div className="inline-block bg-[#C9A84C]/10 text-[#C9A84C] text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-wider uppercase">SIB 2026</div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Fiche envoyée !</h1>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          La fiche catalogue de <strong className="text-[#0B1C3D]">{form.company_name}</strong> a bien été transmise à l'équipe SIB 2026.
        </p>
        <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-4 text-sm text-amber-800 text-left leading-relaxed">
          <strong>Prochaine étape :</strong> Notre équipe validera votre fiche et vous contactera par email pour confirmation.
        </div>
        <p className="mt-5 text-xs text-slate-300">
          Questions ? <a href="mailto:Sib2026@urbacom.net" className="text-[#C9A84C] hover:underline">Sib2026@urbacom.net</a>
        </p>
      </div>
    </div>
  );

  // ── Render principal ──────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen">

      {/* ═══════════════ SIDEBAR ═══════════════════════════════════════════ */}
      <aside className="hidden lg:flex w-[280px] flex-shrink-0 flex-col bg-[#0B1C3D] sticky top-0 h-screen overflow-y-auto">
        <div className="flex flex-col h-full p-6">

          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-[#C9A84C] rounded-xl flex items-center justify-center shadow-lg shadow-[#C9A84C]/20">
                <Building2 className="w-4.5 h-4.5 text-[#0B1C3D]" />
              </div>
              <div>
                <div className="text-[#C9A84C] text-[11px] font-black tracking-[0.2em] uppercase">SIB 2026</div>
                <div className="text-white/30 text-[9px] tracking-wider uppercase">Salon Int. du Bâtiment</div>
              </div>
            </div>
            <h1 className="text-white text-xl font-black leading-snug">
              Fiche<br /><span className="text-[#C9A84C]">Catalogue</span> Officiel
            </h1>
          </div>

          {/* Progress ring */}
          <div className="flex flex-col items-center py-6 border-y border-white/10 mb-6">
            <ProgressRing pct={pct} />
            <p className="mt-3 text-white/40 text-xs text-center">
              {pct < 30 ? "Commencez à remplir la fiche" : pct < 70 ? "Bonne progression !" : pct < 100 ? "Presque terminé !" : "Fiche complète ✓"}
            </p>
          </div>

          {/* Step list */}
          <nav className="space-y-1 flex-1">
            {STEPS.map((s) => {
              const done    = step > s.id;
              const current = step === s.id;
              return (
                <button key={s.id}
                  onClick={() => done && setStep(s.id)}
                  className={[
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all",
                    current ? "bg-white/10 ring-1 ring-white/20" :
                    done    ? "hover:bg-white/5 cursor-pointer" :
                              "opacity-25 cursor-default",
                  ].join(" ")}
                >
                  <div className={[
                    "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                    done    ? "bg-green-500 shadow-md shadow-green-500/30" :
                    current ? "bg-[#C9A84C] shadow-md shadow-[#C9A84C]/30" :
                              "bg-white/10",
                  ].join(" ")}>
                    {done ? <CheckCircle className="w-4 h-4 text-white" /> : <s.icon className="w-4 h-4 text-white" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white leading-tight">{s.id}. {s.title}</div>
                    <div className="text-[10px] text-white/35 truncate">{s.desc}</div>
                  </div>
                  {current && <ChevronRight className="w-3 h-3 text-[#C9A84C] flex-shrink-0" />}
                </button>
              );
            })}
          </nav>

          {/* Company footer */}
          {form.company_name && (
            <div className="mt-5 pt-4 border-t border-white/10">
              <div className="text-[9px] text-white/25 uppercase tracking-[0.15em] mb-1">Entreprise</div>
              <div className="text-white text-sm font-bold truncate">{form.company_name}</div>
            </div>
          )}
        </div>
      </aside>

      {/* ═══════════════ MAIN ══════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col bg-[#EEF2F7] min-h-screen">

        {/* Mobile top bar */}
        <div className="lg:hidden bg-[#0B1C3D] px-4 pt-3 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#C9A84C] rounded-lg flex items-center justify-center">
                <Building2 className="w-3 h-3 text-[#0B1C3D]" />
              </div>
              <span className="text-white text-sm font-bold">SIB 2026 · Fiche Catalogue</span>
            </div>
            <span className="text-[#C9A84C] text-sm font-black">{pct}%</span>
          </div>
          <div className="flex items-center gap-1 mb-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className={[
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  step > s.id  ? "bg-green-500 text-white" :
                  step === s.id ? "bg-[#C9A84C] text-[#0B1C3D]" :
                                  "bg-white/10 text-white/30",
                ].join(" ")}>{step > s.id ? "✓" : s.id}</div>
                {i < 4 && <div className={`flex-1 h-0.5 mx-0.5 rounded-full ${step > s.id ? "bg-green-500" : "bg-white/10"}`} />}
              </div>
            ))}
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#C9A84C] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center px-4 py-6 lg:py-10">
          <div className="w-full max-w-2xl">

            {/* Step header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 bg-[#C9A84C] rounded-2xl flex items-center justify-center shadow-lg shadow-[#C9A84C]/30 flex-shrink-0">
                <CurIcon className="w-5 h-5 text-[#0B1C3D]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Étape {step} sur 5</div>
                <div className="text-lg font-black text-[#0B1C3D] leading-tight">{STEPS[step - 1].title}</div>
              </div>
              {saving && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden sm:inline">Sauvegarde…</span>
                </div>
              )}
            </div>

            {/* Form card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div key={step}
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.2, ease: "easeOut" }}
                  className="p-6 lg:p-8 space-y-5">

                  {/* ── Étape 1 ─────────────────────────────────────── */}
                  {step === 1 && <>
                    {fc("logo_url").visible && (
                    <div>
                      <label className={L}>{fc("logo_url").label}</label>
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden hover:border-[#C9A84C]/40 transition-colors bg-slate-50/50">
                        <ImageUploader
                          currentImage={form.logo_url}
                          onUpload={(url) => { set("logo_url", url); save({ ...form, logo_url: url }); }}
                          bucket="catalogue-logos" label="Cliquez ou glissez le logo ici"
                        />
                      </div>
                    </div>
                    )}

                    {fc("company_name").visible && (
                    <Inp label={fc("company_name").label} req={fc("company_name").required} type="text"
                      value={form.company_name || ""} placeholder={fc("company_name").placeholder}
                      onChange={(e) => set("company_name", e.target.value)} onBlur={blur} />
                    )}

                    {fc("sector").visible && (
                    <Sel label={fc("sector").label}
                      value={form.sector || ""} onChange={(e) => { set("sector", e.target.value); blur(); }}>
                      <option value="">Sélectionner un secteur</option>
                      {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </Sel>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      {fc("stand_number").visible && (
                      <Inp label={fc("stand_number").label} type="text" value={form.stand_number || ""} placeholder={fc("stand_number").placeholder}
                        onChange={(e) => set("stand_number", e.target.value)} onBlur={blur} />
                      )}
                      {fc("hall").visible && (
                      <Sel label={fc("hall").label}
                        value={form.hall || ""} onChange={(e) => { set("hall", e.target.value); blur(); }}>
                        <option value="">Sélectionner</option>
                        {HALLS.map((h) => <option key={h} value={h}>{h}</option>)}
                      </Sel>
                      )}
                    </div>

                    {fc("country_flag").visible && (
                    <div>
                      <Inp label={fc("country_flag").label} type="text"
                        value={form.country_flag || ""} placeholder={fc("country_flag").placeholder}
                        maxLength={2}
                        onChange={(e) => set("country_flag", e.target.value.toUpperCase().slice(0, 2))} onBlur={blur} />
                      <p className="text-[11px] text-slate-400 mt-1.5 pl-1">Code 2 lettres — ex : MA = Maroc, FR = France</p>
                    </div>
                    )}
                  </>}

                  {/* ── Étape 2 ─────────────────────────────────────── */}
                  {step === 2 && <>
                    {fc("address").visible && (
                    <Inp label={fc("address").label} type="text" value={form.address || ""}
                      placeholder={fc("address").placeholder}
                      onChange={(e) => set("address", e.target.value)} onBlur={blur} />
                    )}

                    <div className="grid grid-cols-3 gap-3">
                      {fc("zip_code").visible && (
                      <Inp label={fc("zip_code").label} type="text" value={form.zip_code || ""} placeholder={fc("zip_code").placeholder}
                        onChange={(e) => set("zip_code", e.target.value)} onBlur={blur} />
                      )}
                      {fc("city").visible && (
                      <div className="col-span-2">
                        <Inp label={fc("city").label} type="text" value={form.city || ""} placeholder={fc("city").placeholder}
                          onChange={(e) => set("city", e.target.value)} onBlur={blur} />
                      </div>
                      )}
                    </div>

                    {fc("country").visible && (
                    <Inp label={fc("country").label} type="text" value={form.country || ""} placeholder={fc("country").placeholder}
                      onChange={(e) => set("country", e.target.value)} onBlur={blur} />
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      {fc("phone").visible && (
                      <Inp label={fc("phone").label} req={fc("phone").required} type="tel" value={form.phone || ""} placeholder={fc("phone").placeholder}
                        onChange={(e) => set("phone", e.target.value)} onBlur={blur} />
                      )}
                      {fc("fax").visible && (
                      <Inp label={fc("fax").label} type="tel" value={form.fax || ""} placeholder={fc("fax").placeholder}
                        onChange={(e) => set("fax", e.target.value)} onBlur={blur} />
                      )}
                    </div>

                    {fc("gsm").visible && (
                    <Inp label={fc("gsm").label} type="tel" value={form.gsm || ""} placeholder={fc("gsm").placeholder}
                      onChange={(e) => set("gsm", e.target.value)} onBlur={blur} />
                    )}

                    {fc("email").visible && (
                    <Inp label={fc("email").label} req={fc("email").required} type="email" value={form.email || ""} placeholder={fc("email").placeholder}
                      onChange={(e) => set("email", e.target.value)} onBlur={blur} />
                    )}

                    {fc("website").visible && (
                    <Inp label={fc("website").label} type="url" value={form.website || ""} placeholder={fc("website").placeholder}
                      onChange={(e) => set("website", e.target.value)} onBlur={blur} />
                    )}
                  </>}

                  {/* ── Étape 3 ─────────────────────────────────────── */}
                  {step === 3 && <>
                    <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl px-4 py-3 text-[13px] text-amber-800 leading-relaxed">
                      Représentant officiel de l'entreprise au SIB 2026 — personne à contacter sur le stand.
                    </div>

                    <Inp label="Nom & Prénom" req type="text" value={form.contact_name || ""}
                      placeholder="Mme / M. Prénom NOM"
                      onChange={(e) => set("contact_name", e.target.value)} onBlur={blur} />

                    <Sel label="Titre / Fonction" req value={form.contact_title || ""}
                      onChange={(e) => { set("contact_title", e.target.value); blur(); }}>
                      <option value="">Sélectionner un titre</option>
                      {TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </Sel>

                    <div className="grid grid-cols-2 gap-4">
                      <Inp label="Tél. direct" type="tel" value={form.contact_direct_phone || ""}
                        placeholder="+212 6 …"
                        onChange={(e) => set("contact_direct_phone", e.target.value)} onBlur={blur} />
                      <Inp label="Email direct" type="email" value={form.contact_direct_email || ""}
                        placeholder="nom@entreprise.ma"
                        onChange={(e) => set("contact_direct_email", e.target.value)} onBlur={blur} />
                    </div>
                  </>}

                  {/* ── Étape 4 ─────────────────────────────────────── */}
                  {step === 4 && <>
                    {fc("activity_description").visible && (
                    <Txt label={fc("activity_description").label} req={fc("activity_description").required} rows={4}
                      value={form.activity_description || ""}
                      placeholder={fc("activity_description").placeholder}
                      onChange={(e) => set("activity_description", e.target.value)} onBlur={blur} />
                    )}

                    {fc("products_services").visible && (
                    <Txt label={fc("products_services").label} rows={3}
                      value={form.products_services || ""}
                      placeholder={fc("products_services").placeholder}
                      onChange={(e) => set("products_services", e.target.value)} onBlur={blur} />
                    )}

                    {fc("brands_represented").visible && (
                    <div>
                      <Inp label={fc("brands_represented").label} type="text" value={form.brands_represented || ""}
                        placeholder={fc("brands_represented").placeholder}
                        onChange={(e) => set("brands_represented", e.target.value)} onBlur={blur} />
                      <p className="text-[11px] text-slate-400 mt-1.5 pl-1">Séparer les marques par des virgules</p>
                    </div>
                    )}

                    {fc("products_origin_country").visible && (
                    <Inp label={fc("products_origin_country").label} type="text" value={form.products_origin_country || ""}
                      placeholder={fc("products_origin_country").placeholder}
                      onChange={(e) => set("products_origin_country", e.target.value)} onBlur={blur} />
                    )}
                  </>}

                  {/* ── Étape 5 ─────────────────────────────────────── */}
                  {step === 5 && <>
                    <div className="space-y-4">
                      {fc("facebook_url").visible  && <SocialField icon={Facebook}  bg="bg-[#1877F2]"   label={fc("facebook_url").label}  field="facebook_url"  value={form.facebook_url  || ""} onChange={set} onBlur={blur} />}
                      {fc("instagram_url").visible && <SocialField icon={Instagram} bg="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600" label={fc("instagram_url").label} field="instagram_url" value={form.instagram_url || ""} onChange={set} onBlur={blur} />}
                      {fc("linkedin_url").visible  && <SocialField icon={Linkedin}  bg="bg-[#0A66C2]"   label={fc("linkedin_url").label}  field="linkedin_url"  value={form.linkedin_url  || ""} onChange={set} onBlur={blur} />}
                      {fc("twitter_url").visible   && <SocialField icon={Twitter}   bg="bg-black"        label={fc("twitter_url").label}   field="twitter_url"   value={form.twitter_url   || ""} onChange={set} onBlur={blur} />}
                      {fc("youtube_url").visible   && <SocialField icon={Youtube}   bg="bg-[#FF0000]"   label={fc("youtube_url").label}   field="youtube_url"   value={form.youtube_url   || ""} onChange={set} onBlur={blur} />}
                    </div>

                    {entry && (
                      <div className="mt-6 pt-6 border-t-2 border-dashed border-slate-100">
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle className="w-4 h-4 text-[#C9A84C]" />
                          <span className="text-sm font-black text-[#0B1C3D]">Aperçu de votre fiche catalogue</span>
                        </div>
                        <CatalogueFicheCard entry={{ ...entry, ...form } as CatalogueEntry} printMode={false} />
                      </div>
                    )}
                  </>}

                </motion.div>
              </AnimatePresence>

              {/* ─ Navigation ──────────────────────────────────────── */}
              <div className="flex items-center justify-between border-t-2 border-slate-50 px-6 lg:px-8 py-4 bg-slate-50/40">
                <button onClick={prev} disabled={step === 1}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-500 border-2 border-slate-200 rounded-2xl disabled:opacity-25 hover:border-slate-300 hover:text-slate-700 transition-all">
                  <ChevronLeft className="w-4 h-4" /> Précédent
                </button>

                {step < 5 ? (
                  <button onClick={next} disabled={!canNext()}
                    className="flex items-center gap-2 px-7 py-2.5 text-sm font-black bg-[#C9A84C] text-[#0B1C3D] rounded-2xl disabled:opacity-40 hover:bg-[#b8973b] active:scale-95 transition-all shadow-lg shadow-[#C9A84C]/25">
                    Suivant <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={submit} disabled={submitting}
                    className="flex items-center gap-2 px-7 py-2.5 text-sm font-black bg-[#0B1C3D] text-white rounded-2xl disabled:opacity-50 hover:bg-[#162d5e] active:scale-95 transition-all shadow-lg shadow-[#0B1C3D]/20">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Envoyer ma fiche
                  </button>
                )}
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-[11px] text-slate-400 mt-6">
              SIB 2026 · Salon International du Bâtiment ·{" "}
              <a href="mailto:Sib2026@urbacom.net" className="text-[#C9A84C] hover:underline">Sib2026@urbacom.net</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}