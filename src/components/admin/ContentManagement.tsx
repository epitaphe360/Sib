import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe, Zap, Layers, BookOpen, TrendingUp, Eye,
  Download, LayoutGrid, Info, Save, CheckCircle2,
  AlertCircle, Loader2, ExternalLink, ChevronRight,
  Clock, Edit3,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ROUTES } from '../../lib/routes';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'textarea';
  placeholder?: string;
}

interface PageDef {
  slug: string;
  title: string;
  Icon: React.FC<{ className?: string }>;
  route: string;
  fields: FieldDef[];
}

// ─── Définition des pages et de leurs champs éditables ────────────────────────
const PAGES: PageDef[] = [
  {
    slug: 'presentation',
    title: 'Présentation',
    Icon: Globe,
    route: ROUTES.PRESENTATION,
    fields: [
      { key: 'hero_title', label: 'Titre principal', type: 'text', placeholder: 'Salon International du Bâtiment' },
      { key: 'hero_subtitle', label: 'Sous-titre', type: 'textarea', placeholder: 'Depuis 1986, le SIB est le rendez-vous incontournable...' },
      { key: 'stat_exposants', label: 'Nombre d\'exposants', type: 'text', placeholder: '500' },
      { key: 'stat_visiteurs', label: 'Nombre de visiteurs', type: 'text', placeholder: '200 000' },
      { key: 'stat_pays', label: 'Nombre de pays', type: 'text', placeholder: '50' },
      { key: 'stat_surface', label: 'Surface d\'exposition', type: 'text', placeholder: '35 000 m²' },
      { key: 'about_text', label: 'Texte À propos (remplace les paragraphes de présentation)', type: 'textarea', placeholder: 'Le Salon International du Bâtiment – SIB revient pour sa 20ᵉ édition...' },
    ],
  },
  {
    slug: 'nouveautes',
    title: 'Nouveautés',
    Icon: Zap,
    route: ROUTES.NOUVEAUTES,
    fields: [
      { key: 'hero_title', label: 'Titre principal', type: 'text', placeholder: 'Nouveautés' },
      { key: 'hero_subtitle', label: 'Sous-titre', type: 'textarea', placeholder: 'Découvrez les innovations et les changements majeurs...' },
      { key: 'item_1_title', label: 'Nouveauté 1 — Titre', type: 'text' },
      { key: 'item_1_desc', label: 'Nouveauté 1 — Description', type: 'textarea' },
      { key: 'item_2_title', label: 'Nouveauté 2 — Titre', type: 'text' },
      { key: 'item_2_desc', label: 'Nouveauté 2 — Description', type: 'textarea' },
      { key: 'item_3_title', label: 'Nouveauté 3 — Titre', type: 'text' },
      { key: 'item_3_desc', label: 'Nouveauté 3 — Description', type: 'textarea' },
      { key: 'item_4_title', label: 'Nouveauté 4 — Titre', type: 'text' },
      { key: 'item_4_desc', label: 'Nouveauté 4 — Description', type: 'textarea' },
      { key: 'item_5_title', label: 'Nouveauté 5 — Titre', type: 'text' },
      { key: 'item_5_desc', label: 'Nouveauté 5 — Description', type: 'textarea' },
      { key: 'item_6_title', label: 'Nouveauté 6 — Titre', type: 'text' },
      { key: 'item_6_desc', label: 'Nouveauté 6 — Description', type: 'textarea' },
      { key: 'item_7_title', label: 'Nouveauté 7 — Titre', type: 'text' },
      { key: 'item_7_desc', label: 'Nouveauté 7 — Description', type: 'textarea' },
    ],
  },
  {
    slug: 'secteurs-activites',
    title: 'Secteurs d\'Activités',
    Icon: Layers,
    route: ROUTES.SECTEURS_ACTIVITES,
    fields: [
      { key: 'hero_title', label: 'Titre principal', type: 'text', placeholder: 'Secteurs d\'Activités' },
      { key: 'hero_subtitle', label: 'Sous-titre', type: 'textarea', placeholder: 'Le SIB couvre l\'ensemble de la chaîne de valeur du bâtiment...' },
    ],
  },
  {
    slug: 'editions',
    title: 'Éditions',
    Icon: BookOpen,
    route: ROUTES.EDITIONS,
    fields: [
      { key: 'hero_title', label: 'Titre principal', type: 'text', placeholder: 'Nos Éditions' },
      { key: 'hero_subtitle', label: 'Sous-titre', type: 'textarea', placeholder: 'Depuis 1986, le SIB accompagne l\'essor du secteur du bâtiment...' },
    ],
  },
  {
    slug: 'pourquoi-exposer',
    title: 'Pourquoi Exposer',
    Icon: TrendingUp,
    route: ROUTES.POURQUOI_EXPOSER,
    fields: [
      { key: 'hero_title', label: 'Titre principal', type: 'text', placeholder: 'Pourquoi Exposer au SIB ?' },
      { key: 'hero_subtitle', label: 'Sous-titre', type: 'textarea', placeholder: 'Rejoignez le plus grand salon du bâtiment au Maroc...' },
      { key: 'arg_1_title', label: 'Argument 1 — Titre', type: 'text' },
      { key: 'arg_1_desc', label: 'Argument 1 — Description', type: 'textarea' },
      { key: 'arg_2_title', label: 'Argument 2 — Titre', type: 'text' },
      { key: 'arg_2_desc', label: 'Argument 2 — Description', type: 'textarea' },
      { key: 'arg_3_title', label: 'Argument 3 — Titre', type: 'text' },
      { key: 'arg_3_desc', label: 'Argument 3 — Description', type: 'textarea' },
      { key: 'arg_4_title', label: 'Argument 4 — Titre', type: 'text' },
      { key: 'arg_4_desc', label: 'Argument 4 — Description', type: 'textarea' },
      { key: 'arg_5_title', label: 'Argument 5 — Titre', type: 'text' },
      { key: 'arg_5_desc', label: 'Argument 5 — Description', type: 'textarea' },
      { key: 'arg_6_title', label: 'Argument 6 — Titre', type: 'text' },
      { key: 'arg_6_desc', label: 'Argument 6 — Description', type: 'textarea' },
    ],
  },
  {
    slug: 'pourquoi-visiter',
    title: 'Pourquoi Visiter',
    Icon: Eye,
    route: ROUTES.POURQUOI_VISITER,
    fields: [
      { key: 'hero_title', label: 'Titre principal', type: 'text', placeholder: 'Pourquoi Visiter le SIB ?' },
      { key: 'hero_subtitle', label: 'Sous-titre', type: 'textarea', placeholder: '5 jours pour découvrir, apprendre et connecter...' },
      { key: 'arg_1_title', label: 'Raison 1 — Titre', type: 'text' },
      { key: 'arg_1_desc', label: 'Raison 1 — Description', type: 'textarea' },
      { key: 'arg_2_title', label: 'Raison 2 — Titre', type: 'text' },
      { key: 'arg_2_desc', label: 'Raison 2 — Description', type: 'textarea' },
      { key: 'arg_3_title', label: 'Raison 3 — Titre', type: 'text' },
      { key: 'arg_3_desc', label: 'Raison 3 — Description', type: 'textarea' },
      { key: 'arg_4_title', label: 'Raison 4 — Titre', type: 'text' },
      { key: 'arg_4_desc', label: 'Raison 4 — Description', type: 'textarea' },
      { key: 'arg_5_title', label: 'Raison 5 — Titre', type: 'text' },
      { key: 'arg_5_desc', label: 'Raison 5 — Description', type: 'textarea' },
      { key: 'arg_6_title', label: 'Raison 6 — Titre', type: 'text' },
      { key: 'arg_6_desc', label: 'Raison 6 — Description', type: 'textarea' },
    ],
  },
  {
    slug: 'telechargements',
    title: 'Téléchargements',
    Icon: Download,
    route: ROUTES.TELECHARGEMENTS,
    fields: [
      { key: 'hero_title', label: 'Titre principal', type: 'text', placeholder: 'Téléchargements' },
      { key: 'hero_subtitle', label: 'Sous-titre', type: 'textarea', placeholder: 'Documents officiels, catalogues et bilans des éditions passées.' },
    ],
  },
  {
    slug: 'espaces-sib',
    title: 'Espaces SIB',
    Icon: LayoutGrid,
    route: ROUTES.ESPACES_SIB,
    fields: [
      { key: 'hero_title', label: 'Titre principal', type: 'text', placeholder: 'Espaces SIB' },
      { key: 'hero_subtitle', label: 'Sous-titre', type: 'textarea', placeholder: 'Parce que le SIB ne se résume pas qu\'aux stands d\'exposition...' },
      { key: 'espace_1_title', label: 'Espace 1 — Titre', type: 'text' },
      { key: 'espace_1_desc', label: 'Espace 1 — Description', type: 'textarea' },
      { key: 'espace_2_title', label: 'Espace 2 — Titre', type: 'text' },
      { key: 'espace_2_desc', label: 'Espace 2 — Description', type: 'textarea' },
      { key: 'espace_3_title', label: 'Espace 3 — Titre', type: 'text' },
      { key: 'espace_3_desc', label: 'Espace 3 — Description', type: 'textarea' },
      { key: 'espace_4_title', label: 'Espace 4 — Titre', type: 'text' },
      { key: 'espace_4_desc', label: 'Espace 4 — Description', type: 'textarea' },
      { key: 'espace_5_title', label: 'Espace 5 — Titre', type: 'text' },
      { key: 'espace_5_desc', label: 'Espace 5 — Description', type: 'textarea' },
    ],
  },
  {
    slug: 'infos-pratiques',
    title: 'Infos Pratiques',
    Icon: Info,
    route: ROUTES.INFOS_PRATIQUES,
    fields: [
      { key: 'hero_title', label: 'Titre principal', type: 'text', placeholder: 'Infos Pratiques' },
      { key: 'hero_subtitle', label: 'Sous-titre', type: 'textarea', placeholder: 'Tout ce qu\'il faut savoir pour préparer votre visite...' },
      { key: 'lieu_adresse', label: 'Adresse du lieu', type: 'textarea', placeholder: 'Route Nationale 1 vers Azemmour, Région Casablanca - Settat, 24000 — EL JADIDA' },
      { key: 'tarifs_intro', label: 'Texte introduction tarifs', type: 'textarea', placeholder: 'L\'entrée est gratuite tout au long des 5 jours d\'exposition...' },
      { key: 'navette_exposants', label: 'Navettes exposants', type: 'text', placeholder: 'Départ 08h30, Retour 19h00' },
      { key: 'navette_visiteurs', label: 'Navettes visiteurs', type: 'text', placeholder: 'Départs 08h30 et 10h30 — Retours 17h30 et 18h30' },
      { key: 'hebergement_text', label: 'Texte hébergement', type: 'textarea', placeholder: 'Les hôtels recommandés à proximité...' },
    ],
  },
];

// ─── Composant principal ──────────────────────────────────────────────────────
export default function ContentManagement() {
  const [selectedPage, setSelectedPage] = useState<PageDef | null>(null);
  const [allContents, setAllContents] = useState<Record<string, Record<string, string>>>({});
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [updatedDates, setUpdatedDates] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Chargement initial de tous les contenus
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('page_contents')
          .select('page_slug, content, updated_at');
        if (data) {
          const contentMap: Record<string, Record<string, string>> = {};
          const dateMap: Record<string, string> = {};
          data.forEach((row: any) => {
            contentMap[row.page_slug] = row.content ?? {};
            dateMap[row.page_slug] = row.updated_at;
          });
          setAllContents(contentMap);
          setUpdatedDates(dateMap);
        }
      } catch { /* silently fail */ }
      setIsLoading(false);
    })();
  }, []);

  const handlePageSelect = useCallback((page: PageDef) => {
    setSelectedPage(page);
    setEditValues(allContents[page.slug] ?? {});
    setSaveStatus('idle');
  }, [allContents]);

  const handleFieldChange = useCallback((key: string, value: string) => {
    setEditValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = async () => {
    if (!selectedPage) return;
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('page_contents').upsert(
        { page_slug: selectedPage.slug, content: editValues, updated_by: user?.id ?? null },
        { onConflict: 'page_slug' }
      );
      if (error) throw error;
      setAllContents((prev) => ({ ...prev, [selectedPage.slug]: editValues }));
      setUpdatedDates((prev) => ({ ...prev, [selectedPage.slug]: new Date().toISOString() }));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (!selectedPage) return;
    setEditValues(allContents[selectedPage.slug] ?? {});
    setSaveStatus('idle');
  };

  const formatDate = (iso: string) =>
    iso
      ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
      : null;

  const hasCustomContent = (slug: string) =>
    Object.values(allContents[slug] ?? {}).some((v) => v?.trim() !== '');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestion du Contenu</h1>
        <p className="text-gray-500 mt-2 max-w-2xl">
          Modifiez le contenu des pages publiques du site SIB directement depuis l'interface
          d'administration. Les modifications sont visibles immédiatement après sauvegarde.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-40">
          <Loader2 className="w-8 h-8 text-sib-navy animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Panneau gauche — liste des pages */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Pages du site ({PAGES.length})
                </p>
              </div>
              <ul className="divide-y divide-gray-50">
                {PAGES.map((page) => {
                  const isSelected = selectedPage?.slug === page.slug;
                  const dated = updatedDates[page.slug];
                  const hasContent = hasCustomContent(page.slug);
                  return (
                    <li key={page.slug}>
                      <button
                        onClick={() => handlePageSelect(page)}
                        className={`w-full text-left px-5 py-4 flex items-center gap-4 transition-all hover:bg-gray-50 ${isSelected ? 'bg-blue-50 border-l-4 border-sib-navy' : 'border-l-4 border-transparent'}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-sib-navy' : 'bg-gray-100'}`}>
                          <page.Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm truncate ${isSelected ? 'text-sib-navy' : 'text-gray-800'}`}>
                            {page.title}
                          </p>
                          {dated ? (
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {formatDate(dated)}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-400 mt-0.5">Non personnalisé</p>
                          )}
                        </div>
                        {hasContent && (
                          <span
                            className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0"
                            title="Contenu personnalisé actif"
                          />
                        )}
                        <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-sib-navy' : 'text-gray-300'}`} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Panneau droit — éditeur */}
          <div className="lg:col-span-8">
            {!selectedPage ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full flex items-center justify-center py-40">
                <div className="text-center text-gray-400">
                  <Edit3 className="w-14 h-14 mx-auto mb-4 opacity-20" />
                  <p className="font-semibold text-gray-500">Sélectionnez une page à modifier</p>
                  <p className="text-sm mt-1 text-gray-400">Cliquez sur une page dans le panneau de gauche</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                {/* En-tête de l'éditeur */}
                <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sib-navy flex items-center justify-center flex-shrink-0">
                      <selectedPage.Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">{selectedPage.title}</h2>
                      <a
                        href={selectedPage.route}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-sib-gold hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Voir la page en direct
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-6 py-2 bg-sib-navy text-white text-sm font-bold rounded-xl hover:bg-sib-navy/90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                    >
                      {isSaving
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Save className="w-4 h-4" />}
                      Sauvegarder
                    </button>
                  </div>
                </div>

                {/* Messages de statut */}
                {saveStatus === 'success' && (
                  <div className="mx-8 mt-5 px-5 py-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-sm">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    Modifications sauvegardées. Les visiteurs voient le nouveau contenu immédiatement.
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div className="mx-8 mt-5 px-5 py-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    Erreur lors de la sauvegarde. Vérifiez votre connexion et vos droits d'administration.
                  </div>
                )}

                {/* Champs éditables */}
                <div className="px-8 py-6 space-y-6">
                  <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-xs">
                    <span className="text-base flex-shrink-0">💡</span>
                    <span>
                      Laissez un champ vide pour conserver la valeur par défaut codée dans l'application.
                      Remplissez un champ uniquement si vous souhaitez personnaliser ce contenu.
                    </span>
                  </div>

                  {selectedPage.fields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {field.label}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={editValues[field.key] ?? ''}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          placeholder={field.placeholder ?? ''}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-sib-navy/20 focus:border-sib-navy transition-colors placeholder:text-gray-300"
                        />
                      ) : (
                        <input
                          type="text"
                          value={editValues[field.key] ?? ''}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          placeholder={field.placeholder ?? ''}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-sib-navy/20 focus:border-sib-navy transition-colors placeholder:text-gray-300"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
