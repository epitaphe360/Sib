import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import {
  Save, Eye, EyeOff, Building2, MapPin, User, Tag, Globe,
  Loader2, RotateCcw, Settings2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormField {
  field_key:   string;
  step:        number;
  label:       string;
  placeholder: string;
  field_type:  string;
  required:    boolean;
  visible:     boolean;
  sort_order:  number;
  options:     string[] | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEP_META = [
  { id: 1, title: "Identification",  icon: Building2, color: "bg-[#0B1C3D]",   text: "text-white" },
  { id: 2, title: "Coordonnées",     icon: MapPin,    color: "bg-blue-700",    text: "text-white" },
  { id: 3, title: "Représentant",    icon: User,      color: "bg-purple-700",  text: "text-white" },
  { id: 4, title: "Activité",        icon: Tag,       color: "bg-amber-600",   text: "text-white" },
  { id: 5, title: "Réseaux sociaux", icon: Globe,     color: "bg-green-700",   text: "text-white" },
];

const TYPE_COLORS: Record<string, string> = {
  text:     "bg-slate-100 text-slate-600",
  email:    "bg-violet-100 text-violet-700",
  tel:      "bg-cyan-100 text-cyan-700",
  url:      "bg-sky-100 text-sky-700",
  textarea: "bg-green-100 text-green-700",
  select:   "bg-blue-100 text-blue-700",
  upload:   "bg-purple-100 text-purple-700",
};

const TYPE_LABELS: Record<string, string> = {
  text: "Texte", email: "Email", tel: "Tél.", url: "URL",
  textarea: "Texte long", select: "Liste déroulante", upload: "Image",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CatalogueFormConfigPage() {
  const [fields,   setFields]   = useState<FormField[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [dirty,    setDirty]    = useState(false);
  const [original, setOriginal] = useState<FormField[]>([]);

  useEffect(() => {
    (supabase as any)
      .from("catalogue_form_fields")
      .select("*")
      .order("step")
      .order("sort_order")
      .then(({ data, error }: { data: FormField[] | null; error: any }) => {
        if (data) { setFields(data); setOriginal(JSON.parse(JSON.stringify(data))); }
        if (error) toast.error("Erreur de chargement : " + error.message);
        setLoading(false);
      });
  }, []);

  const update = (field_key: string, changes: Partial<FormField>) => {
    setFields((prev) => prev.map((f) => f.field_key === field_key ? { ...f, ...changes } : f));
    setDirty(true);
  };

  const reset = () => {
    setFields(JSON.parse(JSON.stringify(original)));
    setDirty(false);
  };

  const save = async () => {
    setSaving(true);
    const { error } = await (supabase as any)
      .from("catalogue_form_fields")
      .upsert(fields, { onConflict: "field_key" });
    if (error) {
      toast.error("Erreur : " + error.message);
    } else {
      toast.success("Configuration sauvegardée !");
      setOriginal(JSON.parse(JSON.stringify(fields)));
      setDirty(false);
    }
    setSaving(false);
  };

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-[#F39200]" />
    </div>
  );

  const visibleCount = fields.filter((f) => f.visible).length;
  const requiredCount = fields.filter((f) => f.required).length;

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto pb-24">

      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings2 className="w-5 h-5 text-[#F39200]" />
            <h1 className="text-2xl font-black text-[#0B1C3D]">Configuration du formulaire</h1>
          </div>
          <p className="text-slate-500 text-sm">
            Modifiez les libellés, placeholders, champs obligatoires et visibilité sans toucher au code.
          </p>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded-lg">
              {visibleCount} visibles
            </span>
            <span className="text-xs bg-red-100 text-red-700 font-bold px-2.5 py-1 rounded-lg">
              {requiredCount} obligatoires
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {dirty && (
            <button onClick={reset}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-slate-600 border-2 border-slate-200 rounded-2xl hover:bg-slate-50 transition">
              <RotateCcw className="w-3.5 h-3.5" /> Annuler
            </button>
          )}
          <button onClick={save} disabled={saving || !dirty}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#F39200] text-[#0B1C3D] font-bold text-sm rounded-2xl disabled:opacity-40 hover:bg-[#b8973b] transition shadow-md shadow-[#F39200]/20">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Sauvegarder
          </button>
        </div>
      </div>

      {/* ─── Légende ─────────────────────────────────────────────────── */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-xs text-amber-800 mb-5 leading-relaxed">
        <strong>Note :</strong> Le type de champ et les options de liste ne sont pas éditables ici (nécessite une migration DB).
        Vous pouvez changer le <strong>libellé</strong>, le <strong>placeholder</strong>, rendre un champ <strong>obligatoire</strong> ou le <strong>masquer</strong>.
      </div>

      {/* ─── Steps ───────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {STEP_META.map((step) => {
          const stepFields = fields.filter((f) => f.step === step.id);
          const visible = stepFields.filter((f) => f.visible).length;

          return (
            <div key={step.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Step header */}
              <div className={`${step.color} px-5 py-3 flex items-center gap-2.5`}>
                <step.icon className="w-4 h-4 text-white/80" />
                <span className={`font-bold text-sm ${step.text}`}>
                  Étape {step.id} — {step.title}
                </span>
                <span className="ml-auto text-white/50 text-xs">
                  {visible}/{stepFields.length} champ(s) visible(s)
                </span>
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-[140px_1fr_1fr_120px] gap-3 px-4 py-2 bg-slate-50 border-b border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Champ</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Libellé *</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Placeholder</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Actions</span>
              </div>

              {/* Fields */}
              <div className="divide-y divide-slate-50">
                {stepFields.map((f) => (
                  <div key={f.field_key}
                    className={`grid grid-cols-[140px_1fr_1fr_120px] gap-3 items-center px-4 py-3 transition-colors ${
                      !f.visible ? "opacity-40 bg-slate-50/50" : "hover:bg-slate-50/30"
                    }`}>

                    {/* Field key + type */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md truncate">
                        {f.field_key}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md self-start ${TYPE_COLORS[f.field_type] || "bg-slate-100 text-slate-600"}`}>
                        {TYPE_LABELS[f.field_type] || f.field_type}
                      </span>
                    </div>

                    {/* Label edit */}
                    <input
                      type="text"
                      value={f.label}
                      onChange={(e) => update(f.field_key, { label: e.target.value })}
                      className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F39200] transition bg-white w-full"
                    />

                    {/* Placeholder edit */}
                    <input
                      type="text"
                      value={f.placeholder}
                      onChange={(e) => update(f.field_key, { placeholder: e.target.value })}
                      disabled={f.field_type === "upload" || f.field_type === "select"}
                      className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F39200] transition bg-white w-full disabled:opacity-40 disabled:cursor-not-allowed"
                    />

                    {/* Toggles */}
                    <div className="flex items-center justify-center gap-2">
                      {/* Required toggle */}
                      <button
                        onClick={() => update(f.field_key, { required: !f.required })}
                        title={f.required ? "Champ obligatoire (cliquer pour rendre optionnel)" : "Champ optionnel (cliquer pour rendre obligatoire)"}
                        className={`flex items-center justify-center w-8 h-8 rounded-xl transition text-sm font-black ${
                          f.required ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        }`}>
                        {f.required ? "★" : "☆"}
                      </button>

                      {/* Visible toggle */}
                      <button
                        onClick={() => update(f.field_key, { visible: !f.visible })}
                        title={f.visible ? "Champ visible (cliquer pour masquer)" : "Champ masqué (cliquer pour afficher)"}
                        className={`flex items-center justify-center w-8 h-8 rounded-xl transition ${
                          f.visible ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        }`}>
                        {f.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Floating save button ─────────────────────────────────────── */}
      {dirty && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2">
          <button onClick={reset}
            className="flex items-center gap-1.5 px-4 py-3 text-sm font-bold text-slate-600 bg-white border-2 border-slate-200 rounded-2xl shadow-lg hover:bg-slate-50 transition">
            <RotateCcw className="w-3.5 h-3.5" /> Annuler
          </button>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-[#F39200] text-[#0B1C3D] font-black text-sm rounded-2xl shadow-xl shadow-[#F39200]/30 hover:bg-[#b8973b] transition">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Sauvegarder les modifications
          </button>
        </div>
      )}
    </div>
  );
}