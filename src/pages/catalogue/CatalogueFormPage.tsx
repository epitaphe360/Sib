import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, MapPin, Phone, Mail, Globe, User,
  ChevronLeft, ChevronRight, CheckCircle, Loader2,
  Facebook, Instagram, Linkedin, AlertCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import ImageUploader from '../../components/ui/upload/ImageUploader';
import { CatalogueFicheCard } from '../../components/catalogue/CatalogueFicheCard';
import type { CatalogueEntry } from '../../components/catalogue/CatalogueFicheCard';

const STEPS = [
  { id: 1, title: 'Identité', icon: Building2, description: 'Logo, raison sociale, stand' },
  { id: 2, title: 'Coordonnées', icon: MapPin, description: 'Adresse, téléphone, email, web' },
  { id: 3, title: 'Représentant', icon: User, description: 'Contact principal' },
  { id: 4, title: 'Description', icon: Building2, description: 'Activité, marques, produits' },
  { id: 5, title: 'Réseaux & Validation', icon: CheckCircle, description: 'Réseaux sociaux, aperçu' },
];

// Champs obligatoires par étape
const REQUIRED_FIELDS: Record<number, (keyof CatalogueEntry)[]> = {
  1: ['company_name'],
  2: ['phone', 'email'],
  3: ['contact_name', 'contact_title'],
  4: ['activity_description'],
  5: [],
};

function calcCompletion(data: Partial<CatalogueEntry>): number {
  const fields: (keyof CatalogueEntry)[] = [
    'company_name', 'logo_url', 'stand_number', 'hall', 'country_flag',
    'address', 'city', 'country', 'phone', 'email', 'website',
    'contact_name', 'contact_title',
    'activity_description', 'brands_represented', 'products_origin_country',
  ];
  const filled = fields.filter((f) => {
    const v = data[f];
    return v !== undefined && v !== null && String(v).trim() !== '';
  }).length;
  return Math.round((filled / fields.length) * 100);
}

const HALLS = ['A', 'B', 'C', 'D', 'Plein air'];
const CONTACT_TITLES = [
  'Directeur Général', 'PDG', 'DGA', 'Directeur Commercial',
  'Responsable Export', 'Chef de Projet', 'Manager', 'Autre',
];

export default function CatalogueFormPage() {
  const { token } = useParams<{ token: string }>();
  const [entry, setEntry] = useState<CatalogueEntry | null>(null);
  const [form, setForm] = useState<Partial<CatalogueEntry>>({});
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenInvalid, setTokenInvalid] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Charger la fiche par token
  useEffect(() => {
    if (!token) { setTokenInvalid(true); setIsLoading(false); return; }

    supabase
      .from('catalogue_entries')
      .select('*')
      .eq('token', token)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) { setTokenInvalid(true); }
        else {
          setEntry(data as CatalogueEntry);
          setForm(data as Partial<CatalogueEntry>);
          if (data.status === 'completed' || data.status === 'validated') setSubmitted(true);
        }
        setIsLoading(false);
      });
  }, [token]);

  // Sauvegarde automatique (debounced)
  const saveProgress = useCallback(async (updatedForm: Partial<CatalogueEntry>) => {
    if (!entry?.id) return;
    setIsSaving(true);
    const completion = calcCompletion(updatedForm);
    const statusUpdate = completion >= 100 ? 'completed'
      : completion > 0 ? 'in_progress'
      : 'invited';

    await supabase
      .from('catalogue_entries')
      .update({
        ...updatedForm,
        completion_percent: completion,
        status: statusUpdate,
        ...(completion >= 100 && !entry.completed_at ? { completed_at: new Date().toISOString() } : {}),
      })
      .eq('id', entry.id);
    setIsSaving(false);
  }, [entry]);

  const handleChange = (field: keyof CatalogueEntry, value: string) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
  };

  const handleBlurSave = () => {
    saveProgress(form);
  };

  const canProceed = (): boolean => {
    const required = REQUIRED_FIELDS[step] || [];
    return required.every((f) => {
      const v = form[f];
      return v !== undefined && v !== null && String(v).trim() !== '';
    });
  };

  const handleNext = async () => {
    await saveProgress(form);
    if (step < STEPS.length) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await saveProgress({ ...form, status: 'completed' as CatalogueEntry['status'], completed_at: new Date().toISOString() });
    await supabase
      .from('catalogue_entries')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', entry!.id);
    toast.success('Votre fiche catalogue a été envoyée avec succès !');
    setSubmitted(true);
    setIsSubmitting(false);
  };

  const completion = calcCompletion(form);

  // ─── ÉTATS SPÉCIAUX ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  if (tokenInvalid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Lien invalide ou expiré</h1>
          <p className="text-gray-500 text-sm">
            Ce lien de formulaire est invalide ou a expiré. Contactez l'équipe SIB 2026 pour obtenir un nouveau lien.
          </p>
          <a
            href="mailto:Sib2026@urbacom.net"
            className="mt-6 inline-block bg-[#0B1C3D] text-white px-6 py-2 rounded-lg text-sm font-semibold"
          >
            Contacter l'équipe
          </a>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Fiche envoyée !</h1>
          <p className="text-gray-500 text-sm mb-4">
            Votre fiche catalogue pour <strong>{form.company_name}</strong> a été reçue et sera intégrée au catalogue officiel SIB 2026.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            Notre équipe validera votre fiche dans les meilleurs délais. Vous recevrez une confirmation par email.
          </div>
        </div>
      </div>
    );
  }

  // ─── FORMULAIRE PRINCIPAL ─────────────────────────────────────────
  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ─── HEADER ───────────────────────────────────────────────── */}
      <div className="bg-[#0B1C3D] text-white">
        <div className="max-w-2xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <div className="text-xs tracking-widest text-[#C9A84C] uppercase mb-0.5">SIB 2026</div>
            <div className="font-bold text-lg">Fiche Catalogue Officiel</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#C9A84C]">{completion}%</div>
            <div className="text-xs text-slate-400">complété</div>
          </div>
        </div>
        {/* Barre de progression globale */}
        <div className="h-1 bg-slate-700">
          <div
            className="h-full bg-[#C9A84C] transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      {/* ─── STEPS ────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center gap-1">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex items-center flex-1">
              <button
                onClick={() => idx < step - 1 && setStep(s.id)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all flex-shrink-0 ${
                  step > s.id
                    ? 'bg-green-500 text-white cursor-pointer'
                    : step === s.id
                    ? 'bg-[#C9A84C] text-[#0B1C3D]'
                    : 'bg-gray-200 text-gray-400 cursor-default'
                }`}
              >
                {step > s.id ? <CheckCircle className="w-4 h-4" /> : s.id}
              </button>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 ${step > s.id ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2">
          <span className="text-sm font-semibold text-gray-800">{STEPS[step - 1].title}</span>
          <span className="text-xs text-gray-400 ml-2">{STEPS[step - 1].description}</span>
        </div>
      </div>

      {/* ─── CONTENU ──────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 pb-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <AnimatePresence mode="wait" custom={1}>
            <motion.div
              key={step}
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22 }}
              className="p-6 space-y-5"
            >

              {/* ── ÉTAPE 1 : Identité ────────────────────────────── */}
              {step === 1 && (
                <>
                  <h2 className="text-lg font-bold text-gray-900">Identité de l'entreprise</h2>

                  {/* Logo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo *</label>
                    <ImageUploader
                      currentImage={form.logo_url}
                      onUpload={(url) => { handleChange('logo_url', url); saveProgress({ ...form, logo_url: url }); }}
                      bucket="catalogue-logos"
                      label="Télécharger le logo"
                    />
                  </div>

                  {/* Raison sociale */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Raison sociale *</label>
                    <input
                      type="text"
                      value={form.company_name || ''}
                      onChange={(e) => handleChange('company_name', e.target.value)}
                      onBlur={handleBlurSave}
                      placeholder="Nom officiel de l'entreprise"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A84C] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* N° Stand */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">N° Stand</label>
                      <input
                        type="text"
                        value={form.stand_number || ''}
                        onChange={(e) => handleChange('stand_number', e.target.value)}
                        onBlur={handleBlurSave}
                        placeholder="Ex: 17a"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A84C] focus:outline-none"
                      />
                    </div>

                    {/* Hall */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hall</label>
                      <select
                        value={form.hall || ''}
                        onChange={(e) => { handleChange('hall', e.target.value); handleBlurSave(); }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A84C] focus:outline-none"
                      >
                        <option value="">Sélectionner</option>
                        {HALLS.map((h) => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Drapeau pays */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pays (code ISO)</label>
                    <input
                      type="text"
                      value={form.country_flag || ''}
                      onChange={(e) => handleChange('country_flag', e.target.value.toUpperCase().slice(0, 2))}
                      onBlur={handleBlurSave}
                      placeholder="Ex: MA, FR, DE…"
                      maxLength={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-[#C9A84C] focus:outline-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">Code ISO 2 lettres pour afficher le drapeau</p>
                  </div>
                </>
              )}

              {/* ── ÉTAPE 2 : Coordonnées ─────────────────────────── */}
              {step === 2 && (
                <>
                  <h2 className="text-lg font-bold text-gray-900">Coordonnées</h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <MapPin className="inline h-3.5 w-3.5 mr-1" />Adresse
                    </label>
                    <input
                      type="text"
                      value={form.address || ''}
                      onChange={(e) => handleChange('address', e.target.value)}
                      onBlur={handleBlurSave}
                      placeholder="Z.I., Rue, N°…"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A84C] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                      <input
                        type="text"
                        value={form.city || ''}
                        onChange={(e) => handleChange('city', e.target.value)}
                        onBlur={handleBlurSave}
                        placeholder="Casablanca"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A84C] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                      <input
                        type="text"
                        value={form.country || ''}
                        onChange={(e) => handleChange('country', e.target.value)}
                        onBlur={handleBlurSave}
                        placeholder="Maroc"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A84C] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Phone className="inline h-3.5 w-3.5 mr-1" />Téléphone *
                      </label>
                      <input
                        type="tel"
                        value={form.phone || ''}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        onBlur={handleBlurSave}
                        placeholder="+212 5 22 000 000"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A84C] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tél. 2 (optionnel)</label>
                      <input
                        type="tel"
                        value={form.phone2 || ''}
                        onChange={(e) => handleChange('phone2', e.target.value)}
                        onBlur={handleBlurSave}
                        placeholder="+212 6 00 000 000"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A84C] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail className="inline h-3.5 w-3.5 mr-1" />Email *
                    </label>
                    <input
                      type="email"
                      value={form.email || ''}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={handleBlurSave}
                      placeholder="contact@entreprise.com"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A84C] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Globe className="inline h-3.5 w-3.5 mr-1" />Site web
                    </label>
                    <input
                      type="url"
                      value={form.website || ''}
                      onChange={(e) => handleChange('website', e.target.value)}
                      onBlur={handleBlurSave}
                      placeholder="https://www.entreprise.com"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A84C] focus:outline-none"
                    />
                  </div>
                </>
              )}

              {/* ── ÉTAPE 3 : Représentant ────────────────────────── */}
              {step === 3 && (
                <>
                  <h2 className="text-lg font-bold text-gray-900">Représentant</h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <User className="inline h-3.5 w-3.5 mr-1" />Nom complet *
                    </label>
                    <input
                      type="text"
                      value={form.contact_name || ''}
                      onChange={(e) => handleChange('contact_name', e.target.value)}
                      onBlur={handleBlurSave}
                      placeholder="M. Prénom NOM"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A84C] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Titre / Fonction *</label>
                    <select
                      value={form.contact_title || ''}
                      onChange={(e) => { handleChange('contact_title', e.target.value); handleBlurSave(); }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A84C] focus:outline-none"
                    >
                      <option value="">Sélectionner un titre</option>
                      {CONTACT_TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </>
              )}

              {/* ── ÉTAPE 4 : Description ─────────────────────────── */}
              {step === 4 && (
                <>
                  <h2 className="text-lg font-bold text-gray-900">Description commerciale</h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Activité détaillée *
                    </label>
                    <textarea
                      value={form.activity_description || ''}
                      onChange={(e) => handleChange('activity_description', e.target.value)}
                      onBlur={handleBlurSave}
                      rows={4}
                      placeholder="Fabrication et commercialisation de…"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A84C] focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marque(s) représentée(s)</label>
                    <input
                      type="text"
                      value={form.brands_represented || ''}
                      onChange={(e) => handleChange('brands_represented', e.target.value)}
                      onBlur={handleBlurSave}
                      placeholder="MARQUE1, MARQUE2, MARQUE3"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A84C] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pays d'origine des produits</label>
                    <input
                      type="text"
                      value={form.products_origin_country || ''}
                      onChange={(e) => handleChange('products_origin_country', e.target.value)}
                      onBlur={handleBlurSave}
                      placeholder="Ex: Multinationale Suisse, Maroc, France…"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A84C] focus:outline-none"
                    />
                  </div>
                </>
              )}

              {/* ── ÉTAPE 5 : Réseaux + Aperçu ───────────────────── */}
              {step === 5 && (
                <>
                  <h2 className="text-lg font-bold text-gray-900">Réseaux sociaux</h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Facebook className="inline h-3.5 w-3.5 mr-1 text-blue-600" />Facebook
                    </label>
                    <input
                      type="text"
                      value={form.facebook_url || ''}
                      onChange={(e) => handleChange('facebook_url', e.target.value)}
                      onBlur={handleBlurSave}
                      placeholder="https://facebook.com/votrepage ou NomPage"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A84C] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Instagram className="inline h-3.5 w-3.5 mr-1 text-pink-500" />Instagram
                    </label>
                    <input
                      type="text"
                      value={form.instagram_url || ''}
                      onChange={(e) => handleChange('instagram_url', e.target.value)}
                      onBlur={handleBlurSave}
                      placeholder="https://instagram.com/votrepage"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A84C] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Linkedin className="inline h-3.5 w-3.5 mr-1 text-blue-700" />LinkedIn
                    </label>
                    <input
                      type="text"
                      value={form.linkedin_url || ''}
                      onChange={(e) => handleChange('linkedin_url', e.target.value)}
                      onBlur={handleBlurSave}
                      placeholder="https://linkedin.com/company/votrepage"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C9A84C] focus:outline-none"
                    />
                  </div>

                  {/* Aperçu de la fiche */}
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Aperçu de votre fiche catalogue</h3>
                    <CatalogueFicheCard
                      entry={{ ...entry!, ...form } as CatalogueEntry}
                      printMode={false}
                    />
                  </div>
                </>
              )}

            </motion.div>
          </AnimatePresence>

          {/* ─── NAVIGATION ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 bg-gray-50">
            <button
              onClick={handlePrev}
              disabled={step === 1}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 rounded-lg disabled:opacity-30 hover:bg-gray-200 transition"
            >
              <ChevronLeft className="h-4 w-4" /> Précédent
            </button>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              {isSaving && <><Loader2 className="h-3 w-3 animate-spin" /> Sauvegarde…</>}
              {!isSaving && <span>{completion}% complété</span>}
            </div>

            {step < STEPS.length ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-1 px-5 py-2 text-sm font-bold bg-[#0B1C3D] text-white rounded-lg disabled:opacity-40 hover:bg-[#1a3060] transition"
              >
                Suivant <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || completion < 40}
                className="flex items-center gap-2 px-6 py-2 text-sm font-bold bg-[#C9A84C] text-[#0B1C3D] rounded-lg disabled:opacity-40 hover:bg-[#e6c06b] transition"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Envoyer ma fiche
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
